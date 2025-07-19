// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'; // Import NextResponse for CORS
import { checkRole } from './utils/roles';

// Define public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
  '/(.*)',
  '/api/users',
  '/api/users/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Define protected routes (already defined for Clerk, no change needed here)
const isProtectedRoute = createRouteMatcher([
  '/api/menu/add(.*)',
  '/api/dashboard(.*)',
  '/api/orders/add(.*)',
  '/api/orders/update-status(.*)',
  '/api/expense/(.*)',
  '/api/expense/add(.*)',
  '/api/expense/category/add(.*)',
  '/api/expense/delete(.*)',
  '/api/expense/update(.*)',
  '/api/revesvation/add(.*)',
  '/api/reservation/delete(.*)',
  '/api/revesvation/update(.*)',
  '/api/revesvation/updateStatus(.*)',
  '/api/revenue/daily(.*)',
  '/api/revenue/monthly(.*)',
  '/api/revenue/monthly-bay-day(.*)',
  '/api/revenue/expenses(.*)',
  '/api/rooms/delete(.*)',
  '/api/table/delete(.*)',
  '/api/table/update(.*)',
  '/api/table/updateStatus(.*)',
  '/api/users/update(.*)',
  '/api/users/delete(.*)',
  '/api/orders(.*)'
]);

// Define your allowed frontend origins for CORS
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend dev server
  'https://your-frontend-app.com', // Your deployed frontend app
  // Add other allowed origins as needed
];

export default clerkMiddleware(async (auth, req) => {
  // Create a response object to add CORS headers to
  const response = NextResponse.next();

  // --- CORS Logic Start ---
  const origin = req.headers.get('origin');

  if (origin) {
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, be more permissive if origin isn't explicitly listed but exists
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
  } else {
    // For requests without an origin header (e.g., same-origin, Postman, server-side calls)
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true'); // If your client sends cookies/auth tokens
  response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight response for 24 hours

  // Handle preflight OPTIONS requests directly
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }
  // --- CORS Logic End ---


  // --- Clerk Logic (Your existing logic) ---
  // ✅ If it’s a public route, no auth/role check needed
  if (isPublicRoute(req)) {
    return response; // Return the response with CORS headers for public routes too
  }

  // 🔐 Enforce authentication
  await auth.protect();

  // 🔒 Role-based check for protected routes
  if (isProtectedRoute(req)) {
    const roleCheckResult = await checkRole(auth, req, 'Admin');

    // If checkRole returns a response (e.g., unauthorized), return it with CORS headers
    if (roleCheckResult) {
      // It's crucial to apply CORS headers to error/redirect responses from checkRole too
      roleCheckResult.headers.set('Access-Control-Allow-Origin', response.headers.get('Access-Control-Allow-Origin') || '*');
      roleCheckResult.headers.set('Access-Control-Allow-Methods', response.headers.get('Access-Control-Allow-Methods') || 'GET, POST, PUT, DELETE, OPTIONS');
      roleCheckResult.headers.set('Access-Control-Allow-Headers', response.headers.get('Access-Control-Allow-Headers') || 'Content-Type, Authorization');
      roleCheckResult.headers.set('Access-Control-Allow-Credentials', response.headers.get('Access-Control-Allow-Credentials') || 'true');
      return roleCheckResult;
    }
  }

  // If all checks pass, allow the request to proceed with the added CORS headers
  return response;
});

export const config = {
  matcher: [
    // This matcher covers all routes that should go through Clerk middleware
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Also explicitly match all API routes to ensure CORS is applied
    // This is important because your other matcher might skip some /api routes if they are assets
    '/api/:path*',
  ],
};