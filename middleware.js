import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow the root route (/) to bypass middleware
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Apply middleware to API routes
  if (pathname.startsWith('/api')) {
    // Add security headers or other logic here
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  // Log unmatched requests
  console.warn(`Unmatched request: ${pathname}`);
  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

// Apply middleware to specific routes
export const config = {
  matcher: ['/api/:path*'], // Only apply to /api routes
};