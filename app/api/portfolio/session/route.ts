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
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const role = typeof body?.password === 'string' ? checkPassword(body.password) : null;
  if (!role) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  }
  const session = makeSessionCookie(role);
  const response = NextResponse.json({ authenticated: true, admin: role === 'admin' });
  response.cookies.set(session.name, session.value, session.options);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(portfolioCookieName, '', { path: '/', maxAge: 0 });
  return response;
}
