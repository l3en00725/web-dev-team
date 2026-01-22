import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

export const DELETE: APIRoute = async (context) => {
  try {
    // Auth from Clerk middleware
    const { userId } = context.locals.auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin
    const user = await context.locals.currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const role = user?.publicMetadata?.role as string | undefined;
    const adminRole = user?.publicMetadata?.adminRole as string | undefined;
    
    const PERMANENT_SUPER_ADMIN = 'ben@bluehomesgroup.com';
    const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
    const isAdmin = role === 'admin' || isPermanentSuperAdmin || adminRole === 'admin' || adminRole === 'super_admin';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only admins can delete people' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get person ID from URL or request body
    const url = new URL(context.request.url);
    const personId = url.searchParams.get('id') || (await context.request.json()).id;

    if (!personId) {
      return new Response(
        JSON.stringify({ error: 'Person ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if person exists
    const { data: person, error: fetchError } = await supabase
      .from('people')
      .select('id, name, email, clerk_user_id')
      .eq('id', personId)
      .maybeSingle();

    if (fetchError || !person) {
      return new Response(
        JSON.stringify({ error: 'Person not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Don't allow deleting people who are admin users (they should be deactivated via admin users page)
    if (person.clerk_user_id) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('clerk_user_id', person.clerk_user_id)
        .maybeSingle();

      if (adminUser) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete admin users. Deactivate them from the Admin Users page instead.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete related records first (to avoid foreign key constraints)
    // Delete activities
    await supabase.from('activities').delete().eq('person_id', personId);
    
    // Delete donor details if exists
    await supabase.from('donor_details').delete().eq('person_id', personId);

    // Delete the person
    const { error: deleteError } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (deleteError) {
      console.error('Error deleting person:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message || 'Failed to delete person' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Person ${person.name} has been deleted` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting person:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete person' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
