import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow websocket connections
  if (request.headers.get('upgrade') === 'websocket') {
    return NextResponse.next();
  }

  // Regular request handling
  return NextResponse.next();
}

// Match only API routes and socket routes
export const config = {
  matcher: ['/api/:path*'],
}; 