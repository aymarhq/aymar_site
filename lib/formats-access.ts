import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { get } from '@vercel/blob';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'aymar_formatos_access';
const ACCESS_SECONDS = 30 * 24 * 60 * 60;
const ACCOUNT_PREFIX = 'aymar-private/access/formatos';

type FormatsAccount = {
  email: string;
  username: string;
  passwordSalt: string;
  passwordHash: string;
  checkoutSessionId: string;
  createdAt: string;
};

export function normalizeBuyerEmail(email: string) {
  return email.trim().toLocaleLowerCase('en-US');
}

export function formatsAccountId(email: string) {
  const mode = process.env.STRIPE_SECRET_KEY?.includes('_live_') ? 'live' : 'test';
  return createHash('sha256').update(`${mode}:${normalizeBuyerEmail(email)}`).digest('hex');
}

function accountPath(id: string) {
  return `${ACCOUNT_PREFIX}/${id}.json`;
}

export async function getFormatsAccountById(id: string): Promise<FormatsAccount | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !/^[a-f0-9]{64}$/.test(id)) return null;
  const result = await get(accountPath(id), { access: 'private', token, useCache: false });
  if (!result || result.statusCode !== 200) return null;
  try {
    return JSON.parse(await new Response(result.stream).text()) as FormatsAccount;
  } catch {
    return null;
  }
}

export async function getFormatsAccount(email: string) {
  return getFormatsAccountById(formatsAccountId(email));
}

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyFormatsPassword(account: FormatsAccount, password: string) {
  const candidate = scryptSync(password, Buffer.from(account.passwordSalt, 'hex'), 64).toString('hex');
  return sameSecret(candidate, account.passwordHash);
}

function passwordCredentials(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return { passwordSalt: salt.toString('hex'), passwordHash: hash.toString('hex') };
}

export function makeFormatsAccount(email: string, password: string, checkoutSessionId: string): FormatsAccount {
  const normalizedEmail = normalizeBuyerEmail(email);
  const local = normalizedEmail.split('@')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_.-]/g, '-');
  const username = (local.length >= 3 ? local : `u-${local || 'buyer'}`).slice(0, 24);
  return {
    email: normalizedEmail,
    username,
    ...passwordCredentials(password),
    checkoutSessionId,
    createdAt: new Date().toISOString(),
  };
}

export function createFormatsAccessCookie(accountId: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe não configurado');
  const expires = String(Date.now() + ACCESS_SECONDS * 1000);
  const signature = createHmac('sha256', key).update(`formatos:${accountId}:${expires}`).digest('hex');
  return {
    name: ACCESS_COOKIE,
    value: `${accountId}.${expires}.${signature}`,
    options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: ACCESS_SECONDS },
  };
}

export async function formatsSession(): Promise<{ username: string; email: string } | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const value = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!value) return null;
  const [accountId, expires, signature] = value.split('.');
  if (!accountId || !/^[a-f0-9]{64}$/.test(accountId) || !expires || !/^\d+$/.test(expires) || Number(expires) <= Date.now() || !signature) return null;
  const expected = createHmac('sha256', key).update(`formatos:${accountId}:${expires}`).digest('hex');
  if (!sameSecret(signature, expected)) return null;
  const account = await getFormatsAccountById(accountId);
  return account ? { username: account.username, email: account.email } : null;
}

export function formatsCheckoutReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_FORMATOS_PRICE_ID && process.env.STRIPE_FORMATOS_PRICE_ID !== 'price_...' && process.env.BLOB_READ_WRITE_TOKEN && process.env.APP_URL);
}

export async function getPaidFormatsCheckoutSession(sessionId: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_FORMATOS_PRICE_ID;
  if (!secretKey || !priceId || priceId === 'price_...' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return null;

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
  const items = session.line_items?.data ?? [];
  const purchasedItem = items[0];
  const purchasedPriceId = typeof purchasedItem?.price === 'string' ? purchasedItem.price : purchasedItem?.price?.id;
  const correctProduct = items.length === 1 && purchasedItem?.quantity === 1 && purchasedPriceId === priceId;
  const email = session.customer_details?.email ?? session.customer_email;
  if (session.mode !== 'payment' || !correctProduct || session.amount_total !== 1990 || session.currency !== 'brl' || !email) return null;

  return { id: session.id, email: normalizeBuyerEmail(email), paymentStatus: session.payment_status };
}

export function formatsAccountStoragePath(email: string) {
  return accountPath(formatsAccountId(email));
}

export function serializedFormatsAccount(account: FormatsAccount) {
  return JSON.stringify(account);
}

export { ACCESS_COOKIE, ACCESS_SECONDS };
