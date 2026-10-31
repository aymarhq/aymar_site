import { NextRequest, NextResponse } from 'next/server';
import { activateProductAccount, productAccessReady } from '../../../../lib/product-access';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!productAccessReady()) return NextResponse.json({ error: 'O acesso ainda está sendo configurado.' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  if (!token) return NextResponse.json({ error: 'Link de ativação inválido ou expirado.' }, { status: 400 });

  try {
    const result = await activateProductAccount(token);
    if (!result) return NextResponse.json({ error: 'Link de ativação inválido ou expirado.' }, { status: 403 });
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const response = NextResponse.json({ activated: true, products: result.account.products });
    response.cookies.set(result.cookie.name, result.cookie.value, result.cookie.options);
    // Se uma compra antiga de Formatos já tiver conta, não mantemos duas sessões ativas.
    response.cookies.set('aymar_formatos_access', '', { path: '/', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Não foi possível ativar o acesso. Tente novamente.' }, { status: 503 });
  }
}
