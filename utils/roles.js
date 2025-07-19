import { auth } from '@clerk/nextjs/server'

// utils/roles.js
export async function checkRole(auth, req, requiredRole) {
  const { userId, sessionClaims } = await auth();

  const userRole = sessionClaims?.metadata?.role || sessionClaims?.role;
  if (!userRole || userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    if (req.url.includes('/api/')) {
      return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 });
    }
    return Response.redirect(new URL('/', req.url));
  }

  // ✅ If role matches, do nothing!
}
