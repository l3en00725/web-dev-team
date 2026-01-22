/**
 * Clerk Authentication Utilities
 * 
 * Functions for handling Clerk authentication in Astro pages.
 * Updated for @clerk/astro v2 - uses context.locals.auth() instead of getAuth
 * 
 * Role System:
 * - super_admin: Full access (only ben@bluehomesgroup.com is permanent)
 * - admin: Can manage content, events, emails
 * - content_manager: Can create/edit content only
 */

// The only hardcoded super admin
const PERMANENT_SUPER_ADMIN = 'ben@bluehomesgroup.com';

// Type for the auth object from Clerk
interface ClerkAuth {
  userId: string | null;
  sessionId: string | null;
  sessionClaims: Record<string, any> | null;
}

// Type for Astro locals with Clerk auth
interface AstroLocalsWithClerk {
  auth: () => ClerkAuth;
}

/**
 * Get authenticated user from Clerk
 * Use this in Astro page frontmatter to check authentication
 * 
 * @example
 * ```typescript
 * import { getAuth } from '../utils/clerk';
 * const { userId, email } = getAuth(Astro.locals);
 * if (!userId) return Astro.redirect('/sign-in');
 * ```
 */
export function getAuth(locals: AstroLocalsWithClerk) {
  try {
    const auth = locals.auth();
    const { userId, sessionClaims } = auth;
    
    if (!userId) {
      return {
        userId: null,
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        adminRole: null,
      };
    }

    // Get email from session claims
    const email = (
      sessionClaims?.email ||
      sessionClaims?.primary_email ||
      sessionClaims?.email_address ||
      (sessionClaims?.emails as string[] | undefined)?.[0] ||
      (sessionClaims as any)?.primaryEmailAddress?.emailAddress
    ) as string | undefined;
    
    // Get role info from session claims
    const role = (sessionClaims as any)?.publicMetadata?.role as string | undefined;
    const adminRole = (sessionClaims as any)?.publicMetadata?.adminRole as string | undefined;
    
    // Check admin status
    const normalizedEmail = email?.toLowerCase();
    const isPermanentSuperAdmin = normalizedEmail === PERMANENT_SUPER_ADMIN;
    const isAdmin = role === 'admin' || isPermanentSuperAdmin;
    const isSuperAdmin = isPermanentSuperAdmin || adminRole === 'super_admin';

    return {
      userId,
      email: email || null,
      isAuthenticated: true,
      isAdmin,
      isSuperAdmin,
      adminRole: isPermanentSuperAdmin ? 'super_admin' : adminRole || null,
    };
  } catch (error) {
    console.error('Clerk auth error:', error);
    return {
      userId: null,
      email: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperAdmin: false,
      adminRole: null,
    };
  }
}

/**
 * Require admin authentication - redirects to sign-in if not authenticated or not admin
 * Use this in admin pages
 * 
 * @returns Object with redirect info OR user data
 */
export function requireAdmin(locals: AstroLocalsWithClerk, requestUrl: string): 
  | { redirect: true; url: string }
  | { redirect: false; userId: string; email: string; isSuperAdmin: boolean; adminRole: string | null }
{
  const auth = getAuth(locals);
  
  if (!auth.isAuthenticated) {
    const url = new URL(requestUrl);
    return {
      redirect: true,
      url: '/sign-in?redirect_url=' + encodeURIComponent(url.pathname),
    };
  }

  if (!auth.isAdmin) {
    return {
      redirect: true,
      url: '/unauthorized',
    };
  }

  return {
    redirect: false,
    userId: auth.userId!,
    email: auth.email!,
    isSuperAdmin: auth.isSuperAdmin,
    adminRole: auth.adminRole,
  };
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Use this in donor portal pages
 * 
 * @returns User ID if authenticated, throws error if not
 */
export function requireAuth(locals: AstroLocalsWithClerk, requestUrl: string): string {
  const auth = getAuth(locals);
  
  if (!auth.isAuthenticated || !auth.userId) {
    const url = new URL(requestUrl);
    throw new Error(`AUTH_REQUIRED:${url.pathname}`);
  }
  
  return auth.userId;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === PERMANENT_SUPER_ADMIN;
}
