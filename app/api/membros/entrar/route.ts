import { NextRequest, NextResponse } from 'next/server';
import { createMembersSession, MEMBERS_COOKIE, MEMBERS_SESSION_SECONDS, membersAccessConfigured, sameOriginPost, validMembersCredentials } from '../../../../lib/members-auth';

export async function POST(request: NextRequest) {
  if (!sameOriginPost(request)) {
    return new NextResponse(null, { status: 403 });
  }
  const origin = request.headers.get('origin')!;

  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');
  const valid = typeof username === 'string' && typeof password === 'string'
    && await validMembersCredentials(username, password);

  if (!valid) {
    const error = membersAccessConfigured() ? 'credenciais' : 'indisponivel';
    return NextResponse.redirect(new URL(`/membros/entrar?erro=${error}`, origin), 303);
  }

  const token = await createMembersSession();
  if (!token) return NextResponse.redirect(new URL('/membros/entrar?erro=indisponivel', origin), 303);

  const response = NextResponse.redirect(new URL('/membros', origin), 303);
  response.cookies.set(MEMBERS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/membros',
    maxAge: MEMBERS_SESSION_SECONDS
  });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
