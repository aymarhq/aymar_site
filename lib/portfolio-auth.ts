import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'aymar_portfolio_access';
const WEEK = 7 * 24 * 60 * 60;

function secret(role: 'admin' | 'viewer') {
  return role === 'admin' ? process.env.PORTFOLIO_ADMIN_PASSWORD : process.env.PORTFOLIO_STUDENT_PASSWORD;
}

function signature(role: string, expires: string, username: string, password: string) {
  const adminEmail = role === 'admin' ? process.env.PORTFOLIO_ADMIN_EMAIL?.trim().toLocaleLowerCase('en-US') ?? '' : '';
  return createHmac('sha256', password).update(`portfolio:${role}:${expires}:${username}:${adminEmail}`).digest('hex');
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function uploadIsConfigured() {
  return Boolean(secret('admin') && process.env.PORTFOLIO_ADMIN_EMAIL && process.env.BLOB_READ_WRITE_TOKEN);
}

export function checkPassword(email: string, value: string): 'admin' | 'viewer' | null {
  const normalizedEmail = email.trim().toLocaleLowerCase('en-US');
  const adminEmail = process.env.PORTFOLIO_ADMIN_EMAIL?.trim().toLocaleLowerCase('en-US');
  if (adminEmail && normalizedEmail === adminEmail && secret('admin') && equal(value, secret('admin')!)) return 'admin';
  if (secret('viewer') && equal(value, secret('viewer')!)) return 'viewer';
  return null;
}

export async function portfolioSession(): Promise<{ role: 'admin' | 'viewer'; username: string } | null> {
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie) return null;
  const [role, expires, encodedUsername, mac] = cookie.split('.');
  if ((role !== 'admin' && role !== 'viewer') || !expires || !encodedUsername || !mac || !/^\d+$/.test(expires) || Number(expires) <= Date.now()) return null;
  let username: string;
  try { username = Buffer.from(encodedUsername, 'base64url').toString('utf8'); } catch { return null; }
  if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return null;
  const configured = secret(role);
  return configured && equal(mac, signature(role, expires, username, configured)) ? { role, username } : null;
}

export async function portfolioRole(): Promise<'admin' | 'viewer' | null> {
  return (await portfolioSession())?.role ?? null;
}

export async function isPortfolioAdmin() {
  return (await portfolioRole()) === 'admin';
}

export function makeSessionCookie(role: 'admin' | 'viewer', username: string) {
  const configured = secret(role);
  if (!configured) throw new Error('Upload não configurado');
  const expires = String(Date.now() + WEEK * 1000);
  const encodedUsername = Buffer.from(username, 'utf8').toString('base64url');
  return { name: COOKIE, value: `${role}.${expires}.${encodedUsername}.${signature(role, expires, username, configured)}`, options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: WEEK } };
}

export const portfolioCookieName = COOKIE;
