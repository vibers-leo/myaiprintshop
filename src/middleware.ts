import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

/**
 * CORS Middleware for Partner Integration
 *
 * Enables cross-origin requests for:
 * - Public API endpoints (/api/public/*)
 * - SDK endpoints (/api/sdk/*)
 * - Embed pages (/embed/*)
 *
 * Features:
 * - Origin whitelisting per API partner
 * - Preflight OPTIONS request handling
 * - API key validation
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply CORS to public API, SDK, and embed routes
  if (
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/sdk') ||
    pathname.startsWith('/embed')
  ) {
    const origin = request.headers.get('origin');
    const apiKey =
      request.headers.get('x-api-key') ||
      request.nextUrl.searchParams.get('apiKey');

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, x-api-key, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Validate API key and check origin whitelist
    if (apiKey) {
      try {
        const partner = await validateApiKey(apiKey);

        if (partner && origin) {
          const allowedOrigins = partner.allowedOrigins || ['*'];
          const isAllowed =
            allowedOrigins.includes('*') || allowedOrigins.includes(origin);

          if (!isAllowed) {
            return NextResponse.json(
              {
                success: false,
                error: 'Origin not allowed for this API key',
                hint: `Allowed origins: ${allowedOrigins.join(', ')}`,
              },
              { status: 403 }
            );
          }
        }
      } catch (error) {
        console.error('CORS middleware API key validation error:', error);
        // Continue with request even if validation fails
        // (endpoint-level validation will handle it)
      }
    }

    // Add CORS headers to response
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/public/:path*', '/api/sdk/:path*', '/embed/:path*'],
};
