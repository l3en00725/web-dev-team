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

    const { userId: targetUserId } = await context.request.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Don't allow deactivating yourself
    const { data: user } = await supabase
      .from('admin_users')
      .select('user_id, clerk_user_id')
      .eq('id', targetUserId)
      .single();

    if (user && user.user_id === authCheck.userId) {
      return new Response(
        JSON.stringify({ error: 'You cannot deactivate yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate user
    const { error } = await supabase
      .from('admin_users')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to deactivate user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to deactivate user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
