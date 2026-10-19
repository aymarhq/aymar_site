import { NextRequest, NextResponse } from 'next/server';
import { createFormatsAccessCookie, formatsAccountId, getFormatsAccount, verifyFormatsPassword } from '../../../../../lib/formats-access';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'O acesso ainda está sendo configurado.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) return NextResponse.json({ error: 'E-mail ou senha não conferem.' }, { status: 401 });

  try {
    const account = await getFormatsAccount(email);
    if (!account || !verifyFormatsPassword(account, password)) return NextResponse.json({ error: 'E-mail ou senha não conferem.' }, { status: 401 });
    const response = NextResponse.json({ authenticated: true });
    const cookie = createFormatsAccessCookie(formatsAccountId(account.email));
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch {
    return NextResponse.json({ error: 'Não foi possível entrar agora. Tente novamente.' }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set('aymar_formatos_access', '', { path: '/', maxAge: 0 });
  return response;
}
