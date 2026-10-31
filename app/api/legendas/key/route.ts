import { NextResponse } from 'next/server';
import { deepgramCookie, deepgramCookieName, deepgramStatus, legendasIdentity, sameOrigin } from '../../../../lib/legendas-auth';

export const runtime = 'nodejs';

export async function GET() {
  const status = await deepgramStatus();
  return NextResponse.json(status, { status: status.authenticated ? 200 : 401 });
}

export async function POST(request: Request) {
  if (!(await legendasIdentity())) return NextResponse.json({ error: 'Entre na área exclusiva para continuar.' }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { apiKey?: unknown } | null;
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
  if (!/^[A-Za-z0-9_-]{20,240}$/.test(apiKey)) return NextResponse.json({ error: 'Informe uma chave Deepgram válida.' }, { status: 400 });

  const check = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { authorization: `Token ${apiKey}` },
    cache: 'no-store',
  }).catch(() => null);
  if (!check?.ok) return NextResponse.json({ error: 'A Deepgram recusou essa chave. Confira e tente novamente.' }, { status: 401 });

  const cookie = deepgramCookie(apiKey);
  const response = NextResponse.json({ configured: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const response = NextResponse.json({ configured: false });
  response.cookies.set(deepgramCookieName, '', { path: '/', maxAge: 0 });
  return response;
}
