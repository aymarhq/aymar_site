import { NextRequest, NextResponse } from 'next/server';
import { createFormatsAdminSessionCookie, isFormatsAdminLoginEmail, isProductAccessId, productMagicLinkReady, requestProductMagicLink } from '../../../../lib/product-access';

export const runtime = 'nodejs';

function validOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}

export async function POST(request: NextRequest) {
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const body = await request.json().catch(() => null) as { email?: unknown; product?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const product = body?.product ?? 'formatos';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Digite um e-mail válido.' }, { status: 400 });
  }
  if (!isProductAccessId(product)) return NextResponse.json({ error: 'Produto inválido.' }, { status: 400 });

  if (product === 'formatos' && isFormatsAdminLoginEmail(email)) {
    const cookie = createFormatsAdminSessionCookie();
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  }

  if (!productMagicLinkReady()) return NextResponse.json({ error: 'O acesso por e-mail está indisponível no momento.' }, { status: 503 });

  try {
    // A resposta é a mesma para endereços autorizados e não autorizados.
    await requestProductMagicLink(email, product);
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível enviar o link agora. Tente novamente em instantes.' }, { status: 503 });
  }
}
