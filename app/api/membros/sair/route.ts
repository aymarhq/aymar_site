import { NextRequest, NextResponse } from 'next/server';
import { MEMBERS_COOKIE, sameOriginPost } from '../../../../lib/members-auth';

export async function POST(request: NextRequest) {
  if (!sameOriginPost(request)) {
    return new NextResponse(null, { status: 403 });
  }

  const response = NextResponse.redirect(new URL('/membros/entrar', request.headers.get('origin')!), 303);
  response.cookies.set(MEMBERS_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/membros',
    maxAge: 0
  });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
