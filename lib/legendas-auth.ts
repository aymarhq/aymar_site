import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { portfolioSession } from './portfolio-auth';

const COOKIE = 'aymar_deepgram_key';
const WEEK = 7 * 24 * 60 * 60;

function encryptionSecret() {
  return process.env.LEGENDAS_ENCRYPTION_SECRET
    || process.env.PORTFOLIO_ADMIN_PASSWORD
    || process.env.PORTFOLIO_STUDENT_PASSWORD
    || '';
}

function encryptionKey() {
  const secret = encryptionSecret();
  return secret ? createHash('sha256').update(`aymar:legendas:${secret}`).digest() : null;
}

function encrypt(value: string) {
  const key = encryptionKey();
  if (!key) throw new Error('A proteção das chaves ainda não foi configurada.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decrypt(value: string) {
  const key = encryptionKey();
  if (!key) return null;
  try {
    const [encodedIv, encodedTag, encodedData] = value.split('.');
    if (!encodedIv || !encodedTag || !encodedData) return null;
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(encodedIv, 'base64url'));
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encodedData, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

export async function deepgramKey() {
  const session = await portfolioSession();
  if (!session) return null;
  const personal = (await cookies()).get(COOKIE)?.value;
  return personal ? decrypt(personal) : null;
}

export async function deepgramStatus() {
  const session = await portfolioSession();
  if (!session) return { authenticated: false, configured: false };
  const personal = (await cookies()).get(COOKIE)?.value;
  return { authenticated: true, configured: Boolean(personal && decrypt(personal)) };
}

export function deepgramCookie(value: string) {
  return {
    name: COOKIE,
    value: encrypt(value),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: WEEK,
    },
  };
}

export const deepgramCookieName = COOKIE;

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}

export function isAllowedMediaUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (url.hostname.endsWith('.blob.vercel-storage.com') && url.pathname.includes('/legendas/')) return true;
    return url.hostname === 'drive.google.com' && url.pathname === '/uc' && url.searchParams.get('export') === 'download';
  } catch {
    return false;
  }
}
