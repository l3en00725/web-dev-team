import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

const UPLOAD_POST_API_URL = 'https://api.upload-post.com/api';
const UPLOAD_POST_API_KEY = import.meta.env.UPLOAD_POST_API_KEY;

/**
 * POST /api/admin/social/connect-start
 * 
 * Starts the Upload-Post OAuth flow:
 * 1. Creates/finds user profile in Upload-Post
 * 2. Generates a JWT connect URL
 * 3. Returns the URL for the frontend to redirect to
 * 
 * Based on Upload-Post docs:
 * - POST /api/uploadposts/users (create user)
 * - POST /api/uploadposts/users/generate-jwt (get OAuth URL)
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
        JSON.stringify({ error: 'Upload-Post API key not configured. Add UPLOAD_POST_API_KEY to your environment.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user email from Clerk
    const user = await context.locals.currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const body = await request.json();
    const { ownership, platforms } = body;

    // Get user's role to check permissions
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    const userRole = adminUser?.role || 'viewer';

    // Permission checks
    const requestedOwnership = ownership || 'personal';
    
    if (requestedOwnership === 'org' && userRole !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Only super admins can create org-level connections' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['super_admin', 'content_manager'].includes(userRole)) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to connect social accounts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a unique username for Upload-Post
    // Format: ownership_userId (e.g., "org_abc123" or "personal_abc123")
    const uploadPostUsername = `${requestedOwnership}_${userId}`;

    // Step 1: Create or update user profile in Upload-Post
    try {
      const createUserResponse = await fetch(`${UPLOAD_POST_API_URL}/uploadposts/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Apikey ${UPLOAD_POST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: uploadPostUsername,
        }),
      });

      // User may already exist, that's OK (we'll continue to generate JWT)
      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json().catch(() => ({}));
        // Only fail if it's not a "user already exists" error
        if (!errorData.message?.includes('already exists') && createUserResponse.status !== 409) {
          console.error('Upload-Post create user error:', errorData);
          // Continue anyway - user might already exist
        }
      }
    } catch (err) {
      console.error('Upload-Post create user network error:', err);
      // Continue anyway - user might already exist
    }

    // Step 2: Generate JWT connect URL
    // Build the redirect URL for after OAuth completes
    const baseUrl = new URL(request.url).origin;
    const redirectUrl = `${baseUrl}/admin/social/connections?connected=true&ownership=${requestedOwnership}`;

    // Prepare platforms list (default to all major platforms if not specified)
    const platformList = platforms && platforms.length > 0 
      ? platforms 
      : ['linkedin', 'instagram', 'facebook', 'x', 'tiktok', 'youtube', 'threads', 'pinterest', 'bluesky'];

    const jwtResponse = await fetch(`${UPLOAD_POST_API_URL}/uploadposts/users/generate-jwt`, {
      method: 'POST',
      headers: {
        'Authorization': `Apikey ${UPLOAD_POST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: uploadPostUsername,
        redirect_url: redirectUrl,
        redirect_button_text: 'Return to Blue Kids Admin',
        connect_title: 'Connect Your Social Accounts',
        connect_description: requestedOwnership === 'org' 
          ? 'Connect organization social media accounts for The Blue Kids'
          : 'Connect your personal social media accounts',
        platforms: platformList,
        logo_image: `${baseUrl}/logos/blue-kids-logo-dark.svg`,
        show_calendar: false,
      }),
    });

    if (!jwtResponse.ok) {
      const errorData = await jwtResponse.json().catch(() => ({}));
      console.error('Upload-Post generate-jwt error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: errorData.message || 'Failed to generate connect URL from Upload-Post',
          details: errorData,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jwtData = await jwtResponse.json();

    if (!jwtData.access_url) {
      return new Response(
        JSON.stringify({ error: 'Upload-Post did not return a connect URL' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store the pending connection info in the database for later sync
    // This helps us track which user initiated the connection
    await supabase
      .from('social_connections')
      .upsert({
        user_id: userId,
        platform: 'pending', // Placeholder - will be updated after sync
        ownership: requestedOwnership,
        upload_post_user: uploadPostUsername,
        active: false, // Not active until synced
        upload_post_profile_data: {
          jwt_generated_at: new Date().toISOString(),
          requested_platforms: platformList,
        },
      }, {
        onConflict: 'user_id,platform,ownership',
        ignoreDuplicates: false,
      });

    return new Response(
      JSON.stringify({
        success: true,
        connectUrl: jwtData.access_url,
        expiresIn: '48 hours',
        uploadPostUsername,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Connect start error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to start connection flow' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
