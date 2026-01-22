import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

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

    const { connectionId } = await context.request.json();

    if (!connectionId) {
      return new Response(
        JSON.stringify({ error: 'Connection ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get connection details
    const { data: connection } = await supabase
      .from('social_connections')
      .select('id, user_id, ownership')
      .eq('id', connectionId)
      .single();

    if (!connection) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user role for permission check
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', authCheck.userId)
      .single();

    const userRole = adminUser?.role || 'viewer';

    // Permission check:
    // - Personal accounts: owner can disconnect
    // - Org accounts: only super_admin can disconnect
    const canDisconnect = 
      (connection.ownership === 'org' && userRole === 'super_admin') ||
      (connection.ownership !== 'org' && connection.user_id === authCheck.userId);

    if (!canDisconnect) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to disconnect this account' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate connection (soft delete)
    const { error } = await supabase
      .from('social_connections')
      .update({ active: false })
      .eq('id', connectionId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error disconnecting social:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to disconnect' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
