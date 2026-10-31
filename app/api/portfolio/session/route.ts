import { NextResponse } from 'next/server';
import { checkPassword, makeSessionCookie, portfolioCookieName, portfolioRole, uploadIsConfigured } from '../../../../lib/portfolio-auth';

export const runtime = 'nodejs';

export async function GET() {
  const role = await portfolioRole();
  return NextResponse.json({ uploadConfigured: uploadIsConfigured(), authenticated: Boolean(role), admin: role === 'admin' });
}

export async function POST(request: Request) {
  if (!process.env.PORTFOLIO_ADMIN_PASSWORD && !process.env.PORTFOLIO_STUDENT_PASSWORD) return NextResponse.json({ error: 'O acesso ainda não foi configurado.' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { email?: unknown; username?: unknown; password?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const suppliedUsername = typeof body?.username === 'string' ? body.username.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  const emailName = email.split('@')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_.-]/g, '-');
  const username = suppliedUsername || (emailName.length >= 3 ? emailName : `u-${emailName || 'user'}`).slice(0, 24);
  if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return NextResponse.json({ error: 'Nome de usuário inválido.' }, { status: 400 });
  const role = typeof body?.password === 'string' ? checkPassword(email, body.password) : null;
  if (!role) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  }
  const session = makeSessionCookie(role, username);
  const response = NextResponse.json({ authenticated: true, admin: role === 'admin', username });
  response.cookies.set(session.name, session.value, session.options);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(portfolioCookieName, '', { path: '/', maxAge: 0 });
  return response;
}
