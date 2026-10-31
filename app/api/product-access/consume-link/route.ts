import { NextRequest, NextResponse } from 'next/server';
import { consumeProductMagicLink, productAccessReady } from '../../../../lib/product-access';

export const runtime = 'nodejs';

function validOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}

export async function POST(request: NextRequest) {
  if (!productAccessReady()) return NextResponse.json({ error: 'O acesso ainda está sendo configurado.' }, { status: 503 });
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  if (!token) return NextResponse.json({ error: 'Link inválido ou expirado. Solicite outro.' }, { status: 403 });

  try {
    const authenticated = await consumeProductMagicLink(token);
    if (!authenticated) return NextResponse.json({ error: 'Link inválido, expirado ou já utilizado. Solicite outro.' }, { status: 403 });
    const response = NextResponse.json({ authenticated: true, product: authenticated.product });
    response.cookies.set(authenticated.cookie.name, authenticated.cookie.value, authenticated.cookie.options);
    response.cookies.set('aymar_formatos_access', '', { path: '/', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Não foi possível confirmar o acesso. Tente novamente.' }, { status: 503 });
  }
}
