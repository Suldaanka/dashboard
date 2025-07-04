import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pagePathMap } from './utils/permissions';

/* ---------- 1. PUBLIC ROUTES ---------- */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
]);

/* ---------- 2. ORIGIN WHITELIST ---------- */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',      // dev
  'https://iftinhotel.com',     // prod
];

/* ---------- 3. BUILD CORS HEADERS ---------- */
function buildCorsHeaders(origin) {
  const headers = new Headers();

  // credentials → you MUST echo back the exact origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');               // make CDNs behave
  }

  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

/* ---------- 4. MIDDLEWARE ---------- */
export default clerkMiddleware(async (auth, req) => {
  const origin = req.headers.get('origin') ?? '';
  const corsHeaders = buildCorsHeaders(origin);

  /* ---- 4a. Pre‑flight ---- */
  if (req.method === 'OPTIONS') {
    // Reject pre‑flights from disallowed origins early
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(null, { status: 403, headers: corsHeaders });
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  /* ---- 4b. Non‑CORS or same‑origin requests just continue ---- */
  const res = NextResponse.next({ headers: corsHeaders });

  /* ---- 4c. Enforce origin check for cross‑site calls ---- */
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403, headers: corsHeaders });
  }

  /* ---- 4d. Public routes bypass auth ---- */
  if (isPublicRoute(req)) return res;

  /* ---- 4e. Auth-protected routes ---- */
  try {
    await auth.protect();        // throws if unauthenticated
  } catch {
    return NextResponse.redirect(new URL('/sign-in', req.url), { headers: corsHeaders });
  }

  return res;
});

/* ---------- 5. MATCHER (unchanged) ---------- */
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api/:path*',
  ],
};
