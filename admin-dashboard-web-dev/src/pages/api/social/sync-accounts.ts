import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

const UPLOAD_POST_API_URL = 'https://api.upload-post.com/api';
const UPLOAD_POST_API_KEY = import.meta.env.UPLOAD_POST_API_KEY;

/**
 * POST /api/admin/social/sync-accounts
 * 
 * Syncs connected accounts from Upload-Post to local database.
 * Called after user returns from OAuth flow or manually to refresh.
 * 
 * Uses Upload-Post endpoint to get user's connected platforms.
 */
export const POST: APIRoute = async (context) => {
  try {
    // Auth from Clerk middleware
    const { userId } = context.locals.auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!UPLOAD_POST_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Upload-Post API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await context.request.json().catch(() => ({}));
    const { ownership } = body;

    // Get user's role
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    const userRole = adminUser?.role || 'viewer';

    // Determine which Upload-Post usernames to sync
    const usernamesToSync: string[] = [];
    
    // Always sync personal accounts for this user
    usernamesToSync.push(`personal_${userId}`);
    
    // If super_admin, also sync org accounts
    if (userRole === 'super_admin') {
      usernamesToSync.push(`org_${userId}`);
    }

    // If specific ownership requested, filter to just that
    if (ownership) {
      usernamesToSync.length = 0;
      usernamesToSync.push(`${ownership}_${userId}`);
    }

    const syncResults: SyncResult[] = [];
    const errors: string[] = [];

    const rawResponses: Record<string, any> = {};

    for (const uploadPostUsername of usernamesToSync) {
      try {
        // Get user's connected accounts from Upload-Post
        // Using the users endpoint to get profile with connected platforms
        console.log(`Fetching Upload-Post user: ${uploadPostUsername}`);
        
        const userResponse = await fetch(`${UPLOAD_POST_API_URL}/uploadposts/users/${uploadPostUsername}`, {
          method: 'GET',
          headers: {
            'Authorization': `Apikey ${UPLOAD_POST_API_KEY}`,
          },
        });

        console.log(`Upload-Post response status: ${userResponse.status}`);

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            // User doesn't exist in Upload-Post yet - not an error
            errors.push(`User ${uploadPostUsername} not found in Upload-Post. Make sure you completed the OAuth flow.`);
            continue;
          }
          const errorData = await userResponse.json().catch(() => ({}));
          errors.push(`Failed to fetch ${uploadPostUsername}: ${errorData.message || userResponse.status}`);
          rawResponses[uploadPostUsername] = { error: errorData, status: userResponse.status };
          continue;
        }

        const userData = await userResponse.json();
        rawResponses[uploadPostUsername] = userData;
        
        // Extract connected platforms from the response
        // Upload-Post returns platforms as an array or object with connected accounts
        const connectedPlatforms = extractConnectedPlatforms(userData);
        
        if (connectedPlatforms.length === 0) {
          continue;
        }

        // Determine ownership from username
        const ownershipType = uploadPostUsername.startsWith('org_') ? 'org' : 'personal';

        // Sync each connected platform to our database
        for (const platform of connectedPlatforms) {
          console.log(`Syncing platform: ${platform.platform}`);
          
          // Check if connection exists
          const { data: existing, error: existingError } = await supabase
            .from('social_connections')
            .select('id')
            .eq('user_id', userId)
            .eq('platform', platform.platform)
            .eq('ownership', ownershipType)
            .maybeSingle();

          if (existingError) {
            console.error(`Error checking existing connection for ${platform.platform}:`, existingError);
            errors.push(`Error checking ${platform.platform}: ${existingError.message}`);
            continue;
          }

          // Prefer display_name over username for better display
          // Upload-Post often returns internal IDs as "username" but human-readable names as "display_name"
          const displayName = platform.displayName || platform.display_name || platform.name || platform.username || null;
          
          const connectionData = {
            user_id: userId,
            platform: platform.platform,
            ownership: ownershipType,
            upload_post_user: uploadPostUsername,
            platform_username: displayName,
            platform_user_id: platform.id || platform.platform_id || platform.username || null,
            active: true,
            connected_at: new Date().toISOString(),
            upload_post_profile_data: platform,
            last_error_message: null,
            access_token: '', // Upload-Post manages tokens, we don't need to store them
          };

          console.log(`Connection data for ${platform.platform}:`, JSON.stringify(connectionData, null, 2));

          if (existing) {
            // Update existing
            const { error: updateError } = await supabase
              .from('social_connections')
              .update(connectionData)
              .eq('id', existing.id);

            if (updateError) {
              console.error(`Error updating ${platform.platform}:`, updateError);
              errors.push(`Failed to update ${platform.platform}: ${updateError.message}`);
              continue;
            }

            console.log(`Updated ${platform.platform} successfully`);
            syncResults.push({
              platform: platform.platform,
              ownership: ownershipType,
              action: 'updated',
              username: displayName,
            });
          } else {
            // Create new
            const { error: insertError } = await supabase
              .from('social_connections')
              .insert(connectionData);

            if (insertError) {
              console.error(`Error inserting ${platform.platform}:`, insertError);
              errors.push(`Failed to create ${platform.platform}: ${insertError.message}`);
              continue;
            }

            console.log(`Created ${platform.platform} successfully`);
            syncResults.push({
              platform: platform.platform,
              ownership: ownershipType,
              action: 'created',
              username: displayName,
            });
          }
        }

        // Clean up any "pending" placeholder connections
        await supabase
          .from('social_connections')
          .delete()
          .eq('user_id', userId)
          .eq('platform', 'pending')
          .eq('ownership', ownershipType);

      } catch (err: any) {
        errors.push(`Error syncing ${uploadPostUsername}: ${err.message}`);
      }
    }

    // Also mark any connections that are no longer in Upload-Post as inactive
    // (We skip this for now to avoid accidentally deactivating accounts)

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncResults,
        errors: errors.length > 0 ? errors : undefined,
        debug: {
          usernamesToSync,
          rawResponses,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync accounts error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to sync accounts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET /api/admin/social/sync-accounts
 * Quick sync check - returns current Upload-Post connection status
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const authCheck = await requireAdmin(cookies, request.url, request);
    if (authCheck.redirect) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!UPLOAD_POST_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Upload-Post API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = authCheck;

    // Check both personal and org usernames
    const results: Record<string, any> = {};

    for (const ownership of ['personal', 'org']) {
      const uploadPostUsername = `${ownership}_${userId}`;
      
      try {
        const response = await fetch(`${UPLOAD_POST_API_URL}/uploadposts/users/${uploadPostUsername}`, {
          method: 'GET',
          headers: {
            'Authorization': `Apikey ${UPLOAD_POST_API_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          results[ownership] = {
            exists: true,
            platforms: extractConnectedPlatforms(data),
          };
        } else if (response.status === 404) {
          results[ownership] = { exists: false, platforms: [] };
        } else {
          results[ownership] = { error: `Status ${response.status}` };
        }
      } catch (err: any) {
        results[ownership] = { error: err.message };
      }
    }

    return new Response(
      JSON.stringify({ success: true, uploadPostStatus: results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync check error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to check sync status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Extract connected platforms from Upload-Post user data
 * 
 * Upload-Post API returns:
 * {
 *   "success": true,
 *   "profile": {
 *     "username": "...",
 *     "social_accounts": {
 *       "linkedin": { "username": "...", "display_name": "...", "social_images": "..." },
 *       "instagram": null,  // null means not connected
 *       "tiktok": ""        // empty string means not connected
 *     }
 *   }
 * }
 */
function extractConnectedPlatforms(userData: any): ConnectedPlatform[] {
  const platforms: ConnectedPlatform[] = [];

  console.log('Upload-Post userData:', JSON.stringify(userData, null, 2));

  // Handle the profile wrapper
  const profile = userData.profile || userData;
  
  // Primary format: social_accounts object
  const socialAccounts = profile.social_accounts || profile.socialAccounts || userData.social_accounts;
  
  if (socialAccounts && typeof socialAccounts === 'object') {
    for (const [platformKey, value] of Object.entries(socialAccounts)) {
      // Skip null, empty string, or false values (not connected)
      if (!value || value === '' || value === null) {
        continue;
      }
      
      // Handle both object and string formats
      if (typeof value === 'object') {
        const acc = value as any;
        // Prioritize display_name for human-readable names
        // username from Upload-Post is often an internal ID
        platforms.push({
          platform: normalizePlatformName(platformKey),
          username: acc.username,  // Keep the internal ID separate
          displayName: acc.display_name || acc.displayName || acc.name || acc.full_name,
          name: acc.name,
          id: acc.id || acc.user_id || acc.account_id,
          image: acc.social_images || acc.image || acc.avatar || acc.profile_image,
          ...acc,
        });
      } else if (typeof value === 'string' && value.length > 0) {
        // Sometimes it's just a username string
        platforms.push({
          platform: normalizePlatformName(platformKey),
          username: value,
          displayName: value, // Use the string as display name too
        });
      }
    }
  }

  // Fallback: Check for platforms array format
  if (platforms.length === 0 && userData.platforms && Array.isArray(userData.platforms)) {
    for (const p of userData.platforms) {
      if (p.platform && p.connected !== false) {
        platforms.push({
          platform: normalizePlatformName(p.platform),
          username: p.username || p.name || p.handle,
          id: p.id || p.platform_id || p.user_id,
          ...p,
        });
      }
    }
  }

  // Fallback: Check for connected_accounts array format
  if (platforms.length === 0 && userData.connected_accounts && Array.isArray(userData.connected_accounts)) {
    for (const acc of userData.connected_accounts) {
      platforms.push({
        platform: normalizePlatformName(acc.platform || acc.type),
        username: acc.username || acc.name,
        id: acc.id || acc.account_id,
        ...acc,
      });
    }
  }

  console.log('Extracted platforms:', platforms);

  // Deduplicate by platform
  const seen = new Set<string>();
  return platforms.filter(p => {
    if (seen.has(p.platform)) return false;
    seen.add(p.platform);
    return true;
  });
}

/**
 * Normalize platform names to our standard format
 */
function normalizePlatformName(name: string): string {
  const normalized = (name || '').toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    'twitter': 'x',
    'x': 'x',
    'linkedin': 'linkedin',
    'facebook': 'facebook',
    'instagram': 'instagram',
    'tiktok': 'tiktok',
    'youtube': 'youtube',
    'threads': 'threads',
    'pinterest': 'pinterest',
    'reddit': 'reddit',
    'bluesky': 'bluesky',
    'medium': 'medium',
  };

  return mapping[normalized] || normalized;
}

interface ConnectedPlatform {
  platform: string;
  username?: string;
  id?: string;
  [key: string]: any;
}

interface SyncResult {
  platform: string;
  ownership: string;
  action: 'created' | 'updated';
  username?: string;
}
