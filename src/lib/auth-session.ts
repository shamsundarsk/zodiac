import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'zodiac-super-secret-key-2026-business-investigation';
const COOKIE_NAME = 'zodiac_session';

export interface AuthPayload {
  team_code: string;
  role: 'PARTICIPANT' | 'ADMIN';
  iat?: number;
  exp?: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function createSessionToken(payload: AuthPayload): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60 // 24 hours
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): AuthPayload | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function getAuthSession(request?: Request): Promise<AuthPayload | null> {
  // Check Authorization header first
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = verifySessionToken(token);
      if (session) return session;
    }
  }

  // Fall back to HTTP-only cookie
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie || !cookie.value) return null;

  return verifySessionToken(cookie.value);
}

export async function getAdminAuthSession(request?: Request): Promise<AuthPayload | null> {
  const session = await getAuthSession(request);
  if (session && session.role === 'ADMIN') {
    return session;
  }
  return null;
}

export function buildSessionCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 24 * 60 * 60;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`;
}

export function buildClearCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Lax; Max-Age=0`;
}
