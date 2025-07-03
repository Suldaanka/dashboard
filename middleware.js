import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pagePathMap } from './utils/permissions';

// 1. Define public routes that don't require auth
const isPublicRoute = createRouteMatcher([
  '/(api|trpc)(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
]);

// 2. CORS handling (optional, but good practice)
function buildCorsHeaders(origin) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

// 3. Middleware logic
export default clerkMiddleware(async (auth, req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Always return CORS headers
  const response = NextResponse.next({ headers: corsHeaders });

  // If it's a public route, allow access without authentication
  if (isPublicRoute(req)) {
    return response;
  }

  // Authenticate the user
  try {
    await auth.protect();
  } catch (err) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl, { headers: corsHeaders });
  }

  const { sessionClaims } = await auth();
  const userRole = sessionClaims?.metadata?.role || sessionClaims?.role;

  // Only guard non-static, non-API routes
  const isPageRoute =
    !req.url.includes('/api/') &&
    !req.url.includes('/_next/') &&
    !req.url.includes('/favicon.ico');

  // Removed permission check logic to allow all authenticated users access to all pages
  // The commented-out permission checking code has been removed for clarity
  // All authenticated users now have access to all pages

  return response;
});

// 4. Helper to redirect safely
function redirectToHome(url, corsHeaders) {
  const redirectUrl = new URL('/', url);
  redirectUrl.searchParams.set('access_denied', 'true');
  return NextResponse.redirect(redirectUrl, { headers: corsHeaders });
}

// 5. Apply to all relevant routes
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api/:path*',
  ],
};