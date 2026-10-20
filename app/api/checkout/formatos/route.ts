import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_FORMATOS_PRICE_ID;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  if (!secretKey || !priceId || priceId === 'price_...' || !appUrl || !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Checkout ainda não configurado.' }, { status: 503 });
  }

  if (!/^https?:\/\//i.test(appUrl)) {
    return NextResponse.json({ error: 'Endereço do site inválido.' }, { status: 503 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active || price.type !== 'one_time' || price.unit_amount !== 1990 || price.currency !== 'brl') {
      return NextResponse.json({ error: 'O preço da Stripe precisa ser avulso e corresponder a R$ 19,90.' }, { status: 503 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'hosted_page',
      success_url: `${appUrl}/50formatos/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/50formatos`,
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: 'auto',
      name_collection: {
        individual: {
          enabled: true,
          optional: true,
        },
      },
      allow_promotion_codes: false,
      consent_collection: { terms_of_service: 'required' },
      submit_type: 'auto',
      saved_payment_method_options: { payment_method_save: 'enabled' },
      integration_identifier: 'hosted_web_0001',
      origin_context: 'web',
    });

    if (!session.url) return NextResponse.json({ error: 'O Stripe não retornou o link de pagamento.' }, { status: 502 });
    return NextResponse.redirect(session.url, { status: 303 });
  } catch {
    return NextResponse.json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' }, { status: 502 });
  }
}
