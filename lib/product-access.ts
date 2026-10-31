import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { get, put } from '@vercel/blob';
import { cookies } from 'next/headers';
import { getFormatsAccount } from './formats-access';

export type ProductAccessId = 'formatos' | 'promptsmotion' | 'legendas';

const ACCOUNT_PREFIX = 'aymar-private/access/products/accounts';
const ACTIVATION_PREFIX = 'aymar-private/access/products/activations';
const PURCHASE_PREFIX = `${ACTIVATION_PREFIX}/cakto-purchases`;
const MAGIC_LINK_PREFIX = 'aymar-private/access/products/magic-links';
const SESSION_COOKIE = 'aymar_product_access';
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const ACTIVATION_SECONDS = 48 * 60 * 60;
const MAGIC_LINK_SECONDS = 15 * 60;
const MAGIC_LINK_COOLDOWN_MS = 60 * 1000;

const products: Record<ProductAccessId, { label: string; productIdEnv: string; shortIdEnv: string; path: string }> = {
  formatos: { label: '50 Formatos de Criativos', productIdEnv: 'CAKTO_FORMATOS_PRODUCT_ID', shortIdEnv: 'CAKTO_FORMATOS_PRODUCT_SHORT_ID', path: '/ds' },
  promptsmotion: { label: 'Prompts Motion', productIdEnv: 'CAKTO_PROMPTSMOTION_PRODUCT_ID', shortIdEnv: 'CAKTO_PROMPTSMOTION_PRODUCT_SHORT_ID', path: '/promptsmotion' },
  legendas: { label: 'Legendas da Aymar Labs', productIdEnv: 'CAKTO_LEGENDAS_PRODUCT_ID', shortIdEnv: 'CAKTO_LEGENDAS_PRODUCT_SHORT_ID', path: '/legendas' },
};

type Entitlement = { products: ProductAccessId[]; status: 'paid' | 'refunded' | 'chargedback' };
type ProductAccount = {
  email: string;
  fullName: string;
  username: string;
  products: ProductAccessId[];
  sessionNonce: string;
  createdAt: string;
  updatedAt: string;
  legacyProducts?: ProductAccessId[];
  caktoPurchases?: Record<string, Entitlement>;
};
type ActivationTicket = {
  email: string;
  fullName: string;
  products: ProductAccessId[];
  sessionId: string;
  provider: 'cakto';
  tokenHash: string;
  expiresAt: number;
  consumedAt?: string;
};
type ActivationIndex = { token: string; tokenHash: string };
type ProductLoginTicket = { email: string; product: ProductAccessId; tokenHash: string; expiresAt: number };
type ProductLoginRequestStamp = { requestedAt: number };

export type VerifiedProductPurchase = {
  sessionId: string;
  email: string;
  fullName: string;
  products: ProductAccessId[];
  provider: 'cakto';
};
type CaktoPurchaseRecord = VerifiedProductPurchase & {
  status: 'paid' | 'refunded' | 'chargedback';
  notifiedAt?: string;
  updatedAt: string;
};

function blobToken() { return process.env.CAKTO_BLOB_READ_WRITE_TOKEN; }

function privateId(value: string) {
  const token = blobToken();
  if (!token) throw new Error('Armazenamento privado não configurado');
  return createHmac('sha256', token).update(value).digest('hex');
}

function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function normalizeEmail(email: string) { return email.trim().toLocaleLowerCase('en-US'); }

function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function usernameFrom(email: string) {
  const local = normalizeEmail(email).split('@')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_.-]/g, '-');
  const prefix = (local.length >= 3 ? local : `u-${local || 'buyer'}`).slice(0, 15);
  return `${prefix}-${privateId(email).slice(0, 8)}`;
}

function accountPath(email: string) { return `${ACCOUNT_PREFIX}/${privateId(normalizeEmail(email))}.json`; }
function activationPath(token: string) { return `${ACTIVATION_PREFIX}/${sha256(token)}.json`; }
function activationIndexPath(sessionId: string) { return `${ACTIVATION_PREFIX}/sessions/${sha256(sessionId)}.json`; }
function purchasePath(purchaseId: string) { return `${PURCHASE_PREFIX}/${sha256(purchaseId)}.json`; }

async function readPrivate<T>(pathname: string): Promise<T | null> {
  const token = blobToken();
  if (!token) return null;
  try {
    const result = await get(pathname, { access: 'private', token, useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return JSON.parse(await new Response(result.stream).text()) as T;
  } catch { return null; }
}

async function writePrivate(pathname: string, value: unknown, allowOverwrite = true) {
  const token = blobToken();
  if (!token) throw new Error('Armazenamento privado não configurado');
  return put(pathname, JSON.stringify(value), {
    access: 'private', addRandomSuffix: false, allowOverwrite,
    contentType: 'application/json', token,
  });
}

export function isProductAccessId(value: unknown): value is ProductAccessId {
  return value === 'formatos' || value === 'promptsmotion' || value === 'legendas';
}

export function productAccessReady() { return Boolean(blobToken()); }

export function productEmailReady() {
  return Boolean(
    blobToken()
    && process.env.CAKTO_WEBHOOK_SECRET
    && process.env.CAKTO_FORMATOS_PRODUCT_SHORT_ID
    && process.env.RESEND_API_KEY
    && process.env.RESEND_FROM_EMAIL
    && process.env.APP_URL,
  );
}

export function productMagicLinkReady() {
  return Boolean(blobToken() && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.APP_URL);
}

export function productsForCaktoProduct(productData: unknown): ProductAccessId[] {
  if (!productData || typeof productData !== 'object') return [];
  const product = productData as { id?: unknown; short_id?: unknown };
  const identifiers = [product.id, product.short_id].filter((value): value is string => typeof value === 'string' && value.length > 0);
  if (!identifiers.length) return [];
  return (Object.entries(products) as [ProductAccessId, typeof products[ProductAccessId]][])
    .filter(([, config]) => identifiers.some((identifier) => identifier === process.env[config.productIdEnv] || identifier === process.env[config.shortIdEnv]))
    .map(([productId]) => productId);
}

export async function getProductAccount(email: string) {
  return readPrivate<ProductAccount>(accountPath(email));
}

export async function getActivationForToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) return null;
  const ticket = await readPrivate<ActivationTicket>(activationPath(token));
  if (!ticket || !sameSecret(ticket.tokenHash, sha256(token)) || ticket.expiresAt <= Date.now() || ticket.consumedAt) return null;
  const purchase = await readPrivate<CaktoPurchaseRecord>(purchasePath(ticket.sessionId));
  if (!purchase || purchase.status !== 'paid') return null;
  return ticket;
}

export async function getProductLoginTicket(token: string) {
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) return null;
  const ticket = await readPrivate<ProductLoginTicket>(`${MAGIC_LINK_PREFIX}/tickets/${sha256(token)}.json`);
  const consumed = await readPrivate<{ consumedAt: string }>(`${MAGIC_LINK_PREFIX}/used/${sha256(token)}.json`);
  if (!ticket || consumed || !isProductAccessId(ticket.product) || !sameSecret(ticket.tokenHash, sha256(token)) || ticket.expiresAt <= Date.now()) return null;
  const account = await getProductAccount(ticket.email);
  if (!account?.products.includes(ticket.product)) return null;
  return ticket;
}

export function createProductSessionCookie(email: string, nonce: string) {
  const token = blobToken();
  if (!token) throw new Error('Armazenamento privado não configurado');
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  const id = privateId(normalizeEmail(email));
  const signature = createHmac('sha256', token).update(`products:${id}:${nonce}:${expires}`).digest('hex');
  return {
    name: SESSION_COOKIE,
    value: `${id}.${nonce}.${expires}.${signature}`,
    options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: SESSION_SECONDS },
  };
}

export async function productSession(product: ProductAccessId): Promise<{ email: string; fullName: string; username: string; products: ProductAccessId[] } | null> {
  const token = blobToken();
  if (!token) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const [id, nonce, expires, signature] = value.split('.');
  if (!id || !/^[a-f0-9]{64}$/.test(id) || !nonce || !expires || !/^\d+$/.test(expires) || Number(expires) <= Date.now() || !signature) return null;
  const expected = createHmac('sha256', token).update(`products:${id}:${nonce}:${expires}`).digest('hex');
  if (!sameSecret(signature, expected)) return null;
  const account = await readPrivate<ProductAccount>(`${ACCOUNT_PREFIX}/${id}.json`);
  if (!account || account.sessionNonce !== nonce || !account.products.includes(product)) return null;
  return { email: account.email, fullName: account.fullName, username: account.username, products: account.products };
}

function formatsAccessEmailAllowed(email: string) {
  const allowed = (process.env.FORMATOS_ACCESS_EMAILS || '').split(/[;,\s]+/).map(normalizeEmail).filter(Boolean);
  return allowed.includes(normalizeEmail(email));
}

async function getOrCreateFormatsAccount(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const allowlisted = formatsAccessEmailAllowed(normalizedEmail);
  const legacy = await getFormatsAccount(normalizedEmail);
  let account = await getProductAccount(normalizedEmail);

  if (account) {
    if (!account.products.includes('formatos')) {
      if (!allowlisted && !legacy) return null;
      account.legacyProducts = Array.from(new Set<ProductAccessId>([...(account.legacyProducts || account.products), 'formatos']));
      refreshProducts(account);
      account.updatedAt = new Date().toISOString();
      await writePrivate(accountPath(normalizedEmail), account);
    }
    return account;
  }
  if (!allowlisted && !legacy) return null;

  const now = new Date().toISOString();
  account = {
    email: normalizedEmail,
    fullName: legacy?.username || normalizedEmail,
    username: legacy?.username || usernameFrom(normalizedEmail),
    products: ['formatos'],
    legacyProducts: ['formatos'],
    sessionNonce: randomBytes(24).toString('base64url'),
    createdAt: legacy?.createdAt || now,
    updatedAt: now,
  };
  try {
    await writePrivate(accountPath(normalizedEmail), account, false);
  } catch {
    const concurrentlyCreated = await getProductAccount(normalizedEmail);
    if (!concurrentlyCreated) throw new Error('Não foi possível criar a conta de acesso.');
    account = concurrentlyCreated;
  }
  return account;
}

export async function requestProductMagicLink(email: string, product: ProductAccessId) {
  const normalizedEmail = normalizeEmail(email);
  if (!validEmail(normalizedEmail)) return false;
  const account = product === 'formatos' ? await getOrCreateFormatsAccount(normalizedEmail) : await getProductAccount(normalizedEmail);
  if (!account?.products.includes(product)) return false;

  const stampPath = `${MAGIC_LINK_PREFIX}/requests/${privateId(`${normalizedEmail}:${product}`)}.json`;
  const previous = await readPrivate<ProductLoginRequestStamp>(stampPath);
  const now = Date.now();
  if (previous && now - previous.requestedAt < MAGIC_LINK_COOLDOWN_MS) return false;
  await writePrivate(stampPath, { requestedAt: now } satisfies ProductLoginRequestStamp);

  const token = randomBytes(32).toString('base64url');
  const ticket: ProductLoginTicket = { email: normalizedEmail, product, tokenHash: sha256(token), expiresAt: now + MAGIC_LINK_SECONDS * 1000 };
  await writePrivate(`${MAGIC_LINK_PREFIX}/tickets/${sha256(token)}.json`, ticket, false);
  await sendProductMagicLinkEmail(normalizedEmail, token, product);
  return true;
}

export async function consumeProductMagicLink(token: string) {
  const ticket = await getProductLoginTicket(token);
  if (!ticket) return null;
  const account = await getProductAccount(ticket.email);
  if (!account?.products.includes(ticket.product)) return null;
  try {
    await writePrivate(`${MAGIC_LINK_PREFIX}/used/${sha256(token)}.json`, { consumedAt: new Date().toISOString() }, false);
  } catch { return null; }
  account.sessionNonce = randomBytes(24).toString('base64url');
  account.updatedAt = new Date().toISOString();
  await writePrivate(accountPath(account.email), account);
  return { account, product: ticket.product, cookie: createProductSessionCookie(account.email, account.sessionNonce) };
}

export async function createActivationTicket(purchase: VerifiedProductPurchase) {
  const existing = await readPrivate<ActivationIndex>(activationIndexPath(purchase.sessionId));
  if (existing) {
    const current = await getActivationForToken(existing.token);
    if (current) return { token: existing.token, ticket: current };
  }
  const token = randomBytes(32).toString('base64url');
  const ticket: ActivationTicket = { ...purchase, tokenHash: sha256(token), expiresAt: Date.now() + ACTIVATION_SECONDS * 1000 };
  await writePrivate(activationPath(token), ticket, false);
  await writePrivate(activationIndexPath(purchase.sessionId), { token, tokenHash: ticket.tokenHash } satisfies ActivationIndex);
  return { token, ticket };
}

export async function activateProductAccount(token: string) {
  const ticket = await getActivationForToken(token);
  if (!ticket) return null;
  let account = await getProductAccount(ticket.email);
  const now = new Date().toISOString();
  if (!account) {
    account = {
      email: ticket.email,
      fullName: ticket.fullName || ticket.email,
      username: usernameFrom(ticket.email),
      products: [],
      legacyProducts: [],
      caktoPurchases: {},
      sessionNonce: randomBytes(24).toString('base64url'),
      createdAt: now,
      updatedAt: now,
    };
  }
  registerCaktoGrant(account, ticket.sessionId, ticket.products);
  account.sessionNonce = randomBytes(24).toString('base64url');
  account.updatedAt = now;
  await writePrivate(accountPath(account.email), account);
  ticket.consumedAt = now;
  await writePrivate(activationPath(token), ticket);
  return { account, cookie: createProductSessionCookie(account.email, account.sessionNonce) };
}

export async function provisionPurchase(purchase: VerifiedProductPurchase) {
  const existingPurchase = await readPrivate<CaktoPurchaseRecord>(purchasePath(purchase.sessionId));
  if (existingPurchase && (existingPurchase.status !== 'paid' || existingPurchase.notifiedAt)) return;

  const record: CaktoPurchaseRecord = {
    ...purchase,
    status: 'paid',
    updatedAt: new Date().toISOString(),
    notifiedAt: existingPurchase?.notifiedAt,
  };
  await writePrivate(purchasePath(purchase.sessionId), record);

  let account = await getProductAccount(purchase.email);
  if (!account && purchase.products.includes('formatos')) {
    const legacy = await getFormatsAccount(purchase.email);
    if (legacy) {
      account = {
        email: normalizeEmail(legacy.email),
        fullName: purchase.fullName || legacy.username,
        username: legacy.username || usernameFrom(legacy.email),
        products: ['formatos'],
        legacyProducts: ['formatos'],
        sessionNonce: randomBytes(24).toString('base64url'),
        createdAt: legacy.createdAt,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  if (account) {
    registerCaktoGrant(account, purchase.sessionId, purchase.products);
    account.updatedAt = new Date().toISOString();
    await writePrivate(accountPath(account.email), account);
  }

  const { token } = await createActivationTicket(purchase);
  await sendProductAccessEmail(purchase, token, Boolean(account));
  record.notifiedAt = new Date().toISOString();
  record.updatedAt = record.notifiedAt;
  await writePrivate(purchasePath(purchase.sessionId), record);
}

function registerCaktoGrant(account: ProductAccount, purchaseId: string, grantedProducts: ProductAccessId[]) {
  account.legacyProducts ??= [...account.products];
  account.caktoPurchases ??= {};
  account.caktoPurchases[purchaseId] = { products: grantedProducts, status: 'paid' };
  refreshProducts(account);
}

function refreshProducts(account: ProductAccount) {
  const activePurchases = Object.values(account.caktoPurchases || {}).filter((purchase) => purchase.status === 'paid').flatMap((purchase) => purchase.products);
  account.products = Array.from(new Set([...(account.legacyProducts || []), ...activePurchases]));
}

export async function revokeCaktoPurchase(purchaseId: string, status: 'refunded' | 'chargedback') {
  const purchase = await readPrivate<CaktoPurchaseRecord>(purchasePath(purchaseId));
  if (!purchase || purchase.status !== 'paid') return;
  purchase.status = status;
  purchase.updatedAt = new Date().toISOString();
  await writePrivate(purchasePath(purchaseId), purchase);

  const account = await getProductAccount(purchase.email);
  if (!account) return;
  account.legacyProducts ??= [...account.products];
  account.caktoPurchases ??= {};
  account.caktoPurchases[purchaseId] = { products: purchase.products, status };
  refreshProducts(account);
  account.sessionNonce = randomBytes(24).toString('base64url');
  account.updatedAt = new Date().toISOString();
  await writePrivate(accountPath(account.email), account);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
}

export async function sendProductAccessEmail(purchase: VerifiedProductPurchase, token: string, existingAccount: boolean) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  if (!apiKey || !from || !appUrl) throw new Error('Envio de e-mail não configurado');
  const productNames = purchase.products.map((product) => products[product].label);
  const accessUrl = `${appUrl}/acesso/ativar?token=${encodeURIComponent(token)}`;
  const intro = existingAccount
    ? 'Sua compra foi confirmada e os produtos foram vinculados à sua conta. Confirme abaixo para entrar.'
    : 'Sua compra foi confirmada. Use o botão abaixo para liberar seu acesso individual.';
  const html = `<div style="font-family:Arial,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:32px"><p style="letter-spacing:.12em;font-size:12px;color:#176ff4">AYMAR LABS</p><h1 style="font-size:28px">Acesso confirmado</h1><p>Olá, ${escapeHtml(purchase.fullName || purchase.email)}.</p><p>${intro}</p><p><strong>Produtos liberados:</strong><br>${productNames.map(escapeHtml).join('<br>')}</p><p style="margin:32px 0"><a href="${escapeHtml(accessUrl)}" style="background:#176ff4;color:white;padding:14px 20px;text-decoration:none;display:inline-block">Ativar meu acesso</a></p><p style="font-size:13px;color:#666">Este link individual expira em 48 horas e só pode ser usado uma vez. Para os próximos acessos, informe seu e-mail e solicite um novo link.</p><p style="font-size:12px;color:#888">Se você não reconhece esta compra, fale com o suporte da Aymar Labs.</p></div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [purchase.email], subject: 'Seu acesso Aymar Labs está pronto', html }), cache: 'no-store',
  });
  if (!response.ok) throw new Error('Não foi possível enviar o e-mail de acesso');
}

async function sendProductMagicLinkEmail(email: string, token: string, product: ProductAccessId) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  if (!apiKey || !from || !appUrl) throw new Error('Envio de e-mail não configurado');
  const accessUrl = `${appUrl}/acesso/entrar?token=${encodeURIComponent(token)}`;
  const label = products[product].label;
  const html = `<div style="font-family:Arial,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:32px"><p style="letter-spacing:.12em;font-size:12px;color:#176ff4">AYMAR LABS</p><h1 style="font-size:28px">Seu link de acesso</h1><p>Use o botão abaixo para entrar em ${escapeHtml(label)}.</p><p style="margin:32px 0"><a href="${escapeHtml(accessUrl)}" style="background:#176ff4;color:white;padding:14px 20px;text-decoration:none;display:inline-block">Acessar ${escapeHtml(label)}</a></p><p style="font-size:13px;color:#666">Este link expira em 15 minutos e pode ser usado uma única vez. Se você não solicitou o acesso, ignore esta mensagem.</p></div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: 'Seu link de acesso | Aymar Labs', html }), cache: 'no-store',
  });
  if (!response.ok) throw new Error('Não foi possível enviar o link de acesso');
}

export const productAccessCookieName = SESSION_COOKIE;
export const productAccessProducts = products;
