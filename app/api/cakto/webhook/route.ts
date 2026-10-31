import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  productEmailReady,
  productsForCaktoProduct,
  provisionPurchase,
  revokeCaktoPurchase,
  type VerifiedProductPurchase,
} from '../../../../lib/product-access';

export const runtime = 'nodejs';

type CaktoCustomer = { email?: unknown; name?: unknown };
type CaktoProduct = { id?: unknown; short_id?: unknown };
type CaktoOrder = { id?: unknown; status?: unknown; customer?: CaktoCustomer; product?: CaktoProduct };
type CaktoPayload = { secret?: unknown; event?: unknown; data?: CaktoOrder | CaktoOrder[] };

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function validSignature(rawBody: string, timestamp: string, signatureHeader: string, secret: string) {
  if (!/^\d{10,13}$/.test(timestamp)) return false;
  const timestampSeconds = Number(timestamp.length === 13 ? timestamp.slice(0, 10) : timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const candidates = signatureHeader.split(',').map((part) => part.trim().replace(/^v1=/, '')).filter((part) => /^[a-f0-9]{64}$/i.test(part));
  return candidates.some((candidate) => safeEqual(candidate.toLowerCase(), expected));
}

function ordersFrom(data: CaktoPayload['data']): CaktoOrder[] {
  if (Array.isArray(data)) return data.filter((item): item is CaktoOrder => Boolean(item && typeof item === 'object'));
  return data && typeof data === 'object' ? [data] : [];
}

function validEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: NextRequest) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!secret || !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Webhook da Cakto não configurado.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const timestamp = request.headers.get('x-cakto-timestamp') || '';
  const signature = request.headers.get('x-cakto-signature') || '';
  if (!signature || !validSignature(rawBody, timestamp, signature, secret)) {
    return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 });
  }

  let payload: CaktoPayload;
  try { payload = JSON.parse(rawBody) as CaktoPayload; }
  catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }

  if (typeof payload.secret !== 'string' || !safeEqual(payload.secret, secret)) {
    return NextResponse.json({ error: 'Chave do webhook inválida.' }, { status: 401 });
  }

  const event = typeof payload.event === 'string' ? payload.event.toLowerCase() : '';
  const orders = ordersFrom(payload.data);
  try {
    if (['refund', 'purchase_refunded'].includes(event)) {
      for (const order of orders) {
        if (typeof order.id === 'string' && order.id) await revokeCaktoPurchase(order.id, 'refunded');
      }
    } else if (['chargeback', 'purchase_chargeback'].includes(event)) {
      for (const order of orders) {
        if (typeof order.id === 'string' && order.id) await revokeCaktoPurchase(order.id, 'chargedback');
      }
    } else if (event === 'purchase_approved') {
      if (!productEmailReady()) return NextResponse.json({ error: 'E-mail de acesso ou produto Cakto não configurado.' }, { status: 503 });
      for (const order of orders) {
        if (order.status !== 'paid' || typeof order.id !== 'string' || !order.id || !validEmail(order.customer?.email)) continue;
        const grantedProducts = productsForCaktoProduct(order.product);
        if (!grantedProducts.length) continue;
        const purchase: VerifiedProductPurchase = {
          sessionId: order.id,
          email: order.customer.email.trim().toLocaleLowerCase('en-US'),
          fullName: typeof order.customer.name === 'string' ? order.customer.name.trim() : '',
          products: grantedProducts,
          provider: 'cakto',
        };
        await provisionPurchase(purchase);
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível processar o evento da Cakto.' }, { status: 500 });
  }
}
