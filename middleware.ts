import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt';
  const headers = new Headers(request.headers);
  headers.set('x-aymar-lang', lang);
  if (pathname === '/') return NextResponse.rewrite(new URL('/pt', request.url), { request: { headers } });
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/', '/en', '/en/:path*', '/pt', '/pt/:path*'] };
