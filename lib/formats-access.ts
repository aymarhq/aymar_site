import { createHash } from 'node:crypto';
import { get } from '@vercel/blob';

const ACCOUNT_PREFIX = 'aymar-private/access/formatos';

export type LegacyFormatsAccount = {
  email: string;
  username: string;
  createdAt: string;
};

function normalizeBuyerEmail(email: string) {
  return email.trim().toLocaleLowerCase('en-US');
}

function formatsAccountId(email: string) {
  // Keep the old storage path stable so existing buyers can move to email-link access.
  const mode = process.env.NODE_ENV === 'production' ? 'live' : 'test';
  return createHash('sha256').update(`${mode}:${normalizeBuyerEmail(email)}`).digest('hex');
}

function accountPath(id: string) {
  return `${ACCOUNT_PREFIX}/${id}.json`;
}

export async function getFormatsAccount(email: string): Promise<LegacyFormatsAccount | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  const id = formatsAccountId(email);
  const result = await get(accountPath(id), { access: 'private', token, useCache: false });
  if (!result || result.statusCode !== 200) return null;
  try {
    const account = JSON.parse(await new Response(result.stream).text()) as Partial<LegacyFormatsAccount>;
    if (typeof account.email !== 'string' || typeof account.username !== 'string' || typeof account.createdAt !== 'string') return null;
    return { email: account.email, username: account.username, createdAt: account.createdAt };
  } catch {
    return null;
  }
}
