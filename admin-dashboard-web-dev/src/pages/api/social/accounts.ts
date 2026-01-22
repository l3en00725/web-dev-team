import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/admin/social/accounts
 * Returns all social accounts accessible to the current user
 * - Org accounts visible to all admins
 * - Personal accounts visible only to owner
 */
export const GET: APIRoute = async (context) => {
  try {
    // Auth from Clerk middleware
    const { userId } = context.locals.auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user's role
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    const userRole = adminUser?.role || 'viewer';

    // Fetch accessible accounts
    // - Own personal accounts
    // - All org accounts (if admin)
    const { data: accounts, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('active', true)
      .or(`user_id.eq.${userId},ownership.eq.org`)
      .order('ownership', { ascending: false }) // org first
      .order('connected_at', { ascending: false });

    if (error) throw error;

    // Determine connection permissions based on role
    const permissions = {
      canConnectOrg: userRole === 'super_admin',
      canConnectPersonal: ['super_admin', 'content_manager'].includes(userRole),
    };

    return new Response(
      JSON.stringify({ 
        accounts: accounts || [],
        permissions,
        userRole,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching social accounts:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch accounts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/admin/social/accounts
 * Create a new social connection (for manual token-based connections like Medium)
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Require admin authentication
    const authCheck = await requireAdmin(cookies, request.url, request);
    if (authCheck.redirect) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = authCheck;
    const body = await request.json();
    const { platform, ownership, accessToken, platformUserId, platformUsername, uploadPostUser } = body;

    // Validate required fields
    if (!platform) {
      return new Response(
        JSON.stringify({ error: 'Platform is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('social_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('ownership', requestedOwnership)
      .maybeSingle();

    if (existing) {
      // Update existing connection
      const { data: updated, error } = await supabase
        .from('social_connections')
        .update({
          access_token: accessToken,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          upload_post_user: uploadPostUser,
          active: true,
          connected_at: new Date().toISOString(),
          last_error_message: null,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, account: updated, updated: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new connection
    const { data: created, error } = await supabase
      .from('social_connections')
      .insert({
        user_id: userId,
        platform,
        ownership: requestedOwnership,
        access_token: accessToken || '',
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        upload_post_user: uploadPostUser,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, account: created, created: true }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating social connection:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create connection' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
