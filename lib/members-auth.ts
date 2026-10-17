export const MEMBERS_COOKIE = 'aymar_members_session';
export const MEMBERS_SESSION_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

function credentials() {
  const username = process.env.MEMBERS_USERNAME || '';
  const password = process.env.MEMBERS_PASSWORD || '';
  const secret = process.env.MEMBERS_SESSION_SECRET || '';
  if (!username || password.length < 12 || secret.length < 32) return null;
  return { username, password, secret };
}

export function membersAccessConfigured() {
  return credentials() !== null;
}

export function sameOriginPost(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.slice(0, -1);
  return Boolean(origin && host && origin === `${protocol}://${host}`);
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function equalSecret(input: string, expected: string) {
  const [left, right] = await Promise.all([digest(input), digest(expected)]);
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function validMembersCredentials(username: string, password: string) {
  const configured = credentials();
  if (!configured || username.length > 256 || password.length > 256) return false;
  const [validUsername, validPassword] = await Promise.all([
    equalSecret(username, configured.username),
    equalSecret(password, configured.password)
  ]);
  return validUsername && validPassword;
}

async function signature(payload: string) {
  const configured = credentials();
  if (!configured) return null;
  // Rotating the password also invalidates existing sessions.
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(`${configured.secret}:${configured.password}`),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signed = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
  return Array.from(signed, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createMembersSession() {
  if (!credentials()) return null;
  const expires = Date.now() + MEMBERS_SESSION_SECONDS * 1000;
  const payload = `v1.${expires}.${crypto.randomUUID()}`;
  const signed = await signature(payload);
  return signed ? `${payload}.${signed}` : null;
}

export async function validMembersSession(token: string | undefined) {
  if (!token || token.length > 200) return false;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return false;
  const [version, expiry, nonce, received] = parts;
  if (!/^\d{13}$/.test(expiry) || !/^[\da-f-]{36}$/i.test(nonce) || !/^[\da-f]{64}$/.test(received)) return false;
  const expires = Number(expiry);
  if (!Number.isSafeInteger(expires) || expires <= Date.now() || expires > Date.now() + MEMBERS_SESSION_SECONDS * 1000) return false;
  const expected = await signature(`${version}.${expiry}.${nonce}`);
  if (!expected) return false;
  let difference = 0;
  for (let index = 0; index < 64; index++) difference |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
