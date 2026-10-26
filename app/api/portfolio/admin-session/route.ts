import { NextResponse } from 'next/server';
import { checkPassword, makeSessionCookie } from '../../../../lib/portfolio-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.PORTFOLIO_ADMIN_PASSWORD || !process.env.PORTFOLIO_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'O acesso administrativo ainda não foi configurado.' }, { status: 503 });
  }

  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { email?: unknown; username?: unknown; password?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) {
    return NextResponse.json({ error: 'Escolha um username de 3 a 24 caracteres, sem espaços.' }, { status: 400 });
  }

  if (checkPassword(email, password) !== 'admin') {
    return NextResponse.json({ error: 'Credenciais administrativas inválidas.' }, { status: 401 });
  }

  const session = makeSessionCookie('admin', username);
  const response = NextResponse.json({ authenticated: true, admin: true, username });
  response.cookies.set(session.name, session.value, session.options);
  return response;
}
