import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MEMBERS_COOKIE, validMembersSession } from './lib/members-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt';
  const headers = new Headers(request.headers);
  headers.set('x-aymar-lang', lang);
  if (pathname === '/') return NextResponse.rewrite(new URL('/pt', request.url), { request: { headers } });
  if (pathname === '/membros' || pathname.startsWith('/membros/')) {
    const authenticated = await validMembersSession(request.cookies.get(MEMBERS_COOKIE)?.value);
    if (pathname === '/membros/entrar') {
      if (authenticated) return NextResponse.redirect(new URL('/membros', request.url));
    } else if (!authenticated) {
      return NextResponse.redirect(new URL('/membros/entrar', request.url));
    }
  }
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/', '/en', '/en/:path*', '/pt', '/pt/:path*', '/membros', '/membros/:path*'] };
