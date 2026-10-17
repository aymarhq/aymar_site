import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'aymar_portfolio_access';
const WEEK = 7 * 24 * 60 * 60;

function secret(role: 'admin' | 'viewer') {
  return role === 'admin' ? process.env.PORTFOLIO_ADMIN_PASSWORD : process.env.PORTFOLIO_STUDENT_PASSWORD;
}

function signature(role: string, expires: string, password: string) {
  return createHmac('sha256', password).update(`portfolio:${role}:${expires}`).digest('hex');
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function uploadIsConfigured() {
  return Boolean(secret('admin') && process.env.BLOB_READ_WRITE_TOKEN);
}

export function checkPassword(value: string): 'admin' | 'viewer' | null {
  if (secret('admin') && equal(value, secret('admin')!)) return 'admin';
  if (secret('viewer') && equal(value, secret('viewer')!)) return 'viewer';
  return null;
}

export async function portfolioRole(): Promise<'admin' | 'viewer' | null> {
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie) return null;
  const [role, expires, mac] = cookie.split('.');
  if ((role !== 'admin' && role !== 'viewer') || !expires || !mac || !/^\d+$/.test(expires) || Number(expires) <= Date.now()) return null;
  const configured = secret(role);
  return configured && equal(mac, signature(role, expires, configured)) ? role : null;
}

export async function isPortfolioAdmin() {
  return (await portfolioRole()) === 'admin';
}

export function makeSessionCookie(role: 'admin' | 'viewer') {
  const configured = secret(role);
  if (!configured) throw new Error('Upload não configurado');
  const expires = String(Date.now() + WEEK * 1000);
  return { name: COOKIE, value: `${role}.${expires}.${signature(role, expires, configured)}`, options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: WEEK } };
}

export const portfolioCookieName = COOKIE;
