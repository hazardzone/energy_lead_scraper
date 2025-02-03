import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter'; // Custom rate limiter
import { validateRequest } from '@/lib/request-validator'; // Request validation helper

// Define allowed HTTP methods for each route
const ALLOWED_METHODS = {
  '/api/scrape': ['POST'],
  '/api/leads': ['GET'],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Block disallowed HTTP methods
  if (ALLOWED_METHODS[pathname] && !ALLOWED_METHODS[pathname].includes(request.method)) {
    return NextResponse.json(
      { error: `Method ${request.method} not allowed for ${pathname}` },
      { status: 405 }
    );
  }

  // 2. Apply rate limiting to the /api/scrape endpoint
  if (pathname === '/api/scrape') {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const isRateLimited = await rateLimiter(ip);

    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // 3. Validate incoming requests for /api/scrape
  if (pathname === '/api/scrape' && request.method === 'POST') {
    const validationError = await validateRequest(request);
    if (validationError) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationError },
        { status: 400 }
      );
    }
  }

  // 4. Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Apply middleware to specific routes
export const config = {
  matcher: ['/api/scrape', '/api/leads'],
};