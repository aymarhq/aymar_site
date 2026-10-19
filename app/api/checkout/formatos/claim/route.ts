import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createFormatsAccessCookie, formatsAccountId, formatsAccountStoragePath, getFormatsAccount, getPaidFormatsCheckoutSession, makeFormatsAccount, serializedFormatsAccount } from '../../../../../lib/formats-access';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'O acesso ainda está sendo configurado.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { sessionId?: unknown; password?: unknown } | null;
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (password.length < 10 || password.length > 128) return NextResponse.json({ error: 'Crie uma senha com pelo menos 10 caracteres.' }, { status: 400 });

  try {
    const purchase = await getPaidFormatsCheckoutSession(sessionId);
    if (!purchase) return NextResponse.json({ error: 'Não foi possível confirmar este pagamento da Stripe.' }, { status: 403 });
    if (purchase.paymentStatus !== 'paid') return NextResponse.json({ error: 'O pagamento ainda está sendo confirmado. Tente novamente em instantes.' }, { status: 409 });
    if (await getFormatsAccount(purchase.email)) return NextResponse.json({ error: 'Este e-mail já tem um acesso. Entre com sua senha.' }, { status: 409 });

    const account = makeFormatsAccount(purchase.email, password, purchase.id);
    await put(formatsAccountStoragePath(purchase.email), serializedFormatsAccount(account), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const response = NextResponse.json({ created: true });
    const cookie = createFormatsAccessCookie(formatsAccountId(purchase.email));
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch {
    return NextResponse.json({ error: 'Não foi possível criar seu acesso agora. Tente entrar ou fale com o suporte.' }, { status: 503 });
  }
}
