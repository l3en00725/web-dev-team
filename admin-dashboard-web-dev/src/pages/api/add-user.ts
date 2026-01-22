import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

/**
 * Admin User Invitation API
 * 
 * Role Hierarchy:
 * - super_admin: Full access, can invite any role (only ben@bluehomesgroup.com is permanent)
 * - admin: Can manage content, events, emails - cannot invite super_admins
 * - content_manager: Can create/edit content only
 * 
 * Flow:
 * 1. Super admin/admin calls this API with email, name, role
 * 2. This API creates a Clerk invitation with role in publicMetadata
 * 3. User receives email, clicks link, creates Clerk account
 * 4. Clerk fires user.created webhook
 * 5. Webhook copies invitation metadata to user's publicMetadata
 * 6. Webhook creates admin_users record in Supabase
 */

// The only hardcoded super admin - can never be removed
const PERMANENT_SUPER_ADMIN = 'ben@bluehomesgroup.com';

export const POST: APIRoute = async (context) => {
  try {
    // Get auth from Clerk middleware
    const { userId } = context.locals.auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get requesting user's role from Clerk publicMetadata
    const requestingUser = await context.locals.currentUser();
    const requestingEmail = requestingUser?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const requestingRole = requestingUser?.publicMetadata?.role as string | undefined;
    const requestingAdminRole = requestingUser?.publicMetadata?.adminRole as string | undefined;
    
    console.log('Add User API - Auth check:', { 
      userId, 
      requestingEmail, 
      requestingRole, 
      requestingAdminRole,
      PERMANENT_SUPER_ADMIN 
    });
    
    // Determine effective role
    const isPermanentSuperAdmin = requestingEmail === PERMANENT_SUPER_ADMIN;
    const isSuperAdmin = isPermanentSuperAdmin || requestingAdminRole === 'super_admin';
    const isAdmin = isSuperAdmin || requestingRole === 'admin' || requestingAdminRole === 'admin';
    
    console.log('Add User API - Role check:', { isPermanentSuperAdmin, isSuperAdmin, isAdmin });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: `Only admins can invite new users. Your email: ${requestingEmail}` }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, name, role } = await context.request.json();

    if (!email || !name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, role' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'content_manager'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only super_admins can create other super_admins
    if (role === 'super_admin' && !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only super admins can invite other super admins' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clerk = await clerkClient(context);

    // Check if user already exists in Clerk
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [normalizedEmail],
    });

    if (existingUsers.data.length > 0) {
      const existingUser = existingUsers.data[0];
      
      // User exists - check if they're already an admin
      const existingRole = existingUser.publicMetadata?.role as string | undefined;
      
      if (existingRole === 'admin') {
        return new Response(
          JSON.stringify({ error: 'This user is already an admin' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Update existing user to admin role
      await clerk.users.updateUser(existingUser.id, {
        publicMetadata: {
          ...existingUser.publicMetadata,
          role: 'admin',
          adminRole: role,
          invitedBy: requestingEmail,
          invitedAt: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${normalizedEmail} has been granted ${role.replace('_', ' ')} access. They can sign in with their existing account.`,
          isExistingUser: true,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for pending invitations
    const pendingInvitations = await clerk.invitations.getInvitationList();
    const existingInvite = pendingInvitations.data.find(
      inv => inv.emailAddress.toLowerCase() === normalizedEmail && inv.status === 'pending'
    );

    if (existingInvite) {
      return new Response(
        JSON.stringify({ error: 'An invitation has already been sent to this email and is pending' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get site URL for redirect
    const siteUrl = import.meta.env.SITE_URL || import.meta.env.PUBLIC_SITE_URL || 'https://thebluekids.com';

    // Create Clerk invitation with role in publicMetadata
    // IMPORTANT: The webhook will copy this metadata to the user when they accept
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: normalizedEmail,
      redirectUrl: `${siteUrl}/admin`,
      publicMetadata: {
        role: 'admin',
        adminRole: role,
        name: name.trim(),
        invitedBy: requestingEmail,
        invitedAt: new Date().toISOString(),
      },
    });

    console.log(`Clerk invitation created for ${normalizedEmail} as ${role}:`, invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${normalizedEmail} as ${role.replace('_', ' ')}. They will receive an email to create their account.`,
        invitationId: invitation.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error inviting admin user:', error);
    
    // Handle specific Clerk errors
    if (error.errors) {
      const clerkError = error.errors[0];
      return new Response(
        JSON.stringify({ error: clerkError.message || 'Failed to create invitation' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to invite user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
