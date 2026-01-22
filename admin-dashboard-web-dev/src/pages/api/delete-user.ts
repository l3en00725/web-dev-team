import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/astro/server';

// Create admin client with service role key for user management
const supabaseAdmin = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const POST: APIRoute = async (context) => {
  try {
    // Auth from Clerk middleware
    const { userId: requestingUserId } = context.locals.auth();
    if (!requestingUserId) {
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

    // Get the user being deleted
    const { data: userToDelete } = await supabaseAdmin
      .from('admin_users')
      .select('id, user_id, clerk_user_id, email, name')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!userToDelete) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent users from deleting themselves
    const clerkId = userToDelete.clerk_user_id || userToDelete.user_id;
    if (clerkId === requestingUserId) {
      return new Response(
        JSON.stringify({ error: 'You cannot delete your own account' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Delete from admin_users table
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', targetUserId);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user: ' + dbError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Delete from Clerk (if clerk_user_id exists)
    if (userToDelete.clerk_user_id) {
      try {
        const clerk = await clerkClient(context);
        await clerk.users.deleteUser(userToDelete.clerk_user_id);
        console.log('Successfully deleted user from Clerk:', userToDelete.clerk_user_id, userToDelete.email);
      } catch (clerkErr: any) {
        console.error('Error deleting from Clerk:', clerkErr);
        // Continue even if Clerk deletion fails - user is already removed from DB
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `User ${userToDelete.name || userToDelete.email} has been deleted` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Delete user error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
