/**
 * Minimal email-allowlist login with stateless signed session cookies (works on serverless).
 *
 * - ALLOWED_EMAILS: comma-separated emails allowed to sign in (defaults to the owner's email).
 * - LOGIN_PASSWORD: optional. When unset, ANY non-empty password is accepted for an allowed email.
 * - SESSION_SECRET: HMAC key for session cookies. Falls back to a key derived from GEMINI_API_KEY,
 *   then to a random per-process key (sessions then reset on restart / differ across instances).
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const COOKIE_NAME = 'vidhi_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_ALLOWED_EMAILS = ['vishrutedu@gmail.com'];

let cachedSecret: Buffer | null = null;
function sessionSecret(): Buffer {
  if (cachedSecret) return cachedSecret;
  if (process.env.SESSION_SECRET) {
    cachedSecret = Buffer.from(process.env.SESSION_SECRET);
  } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    cachedSecret = createHash('sha256').update('vidhi-session:' + process.env.GEMINI_API_KEY).digest();
  } else {
    console.warn('SESSION_SECRET is not set: using a random key, so sign-ins reset when the server restarts.');
    cachedSecret = randomBytes(32);
  }
  return cachedSecret;
}

export function allowedEmails(): string[] {
  const fromEnv = (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : DEFAULT_ALLOWED_EMAILS;
}

const b64url = (buf: Buffer) => buf.toString('base64url');
const sign = (payload: string) => b64url(createHmac('sha256', sessionSecret()).update(payload).digest());

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function createSessionToken(email: string): string {
  const payload = b64url(Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${sign(payload)}`;
}

function readSession(req: Request): { email: string } | null {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((kv) => kv.length === 2)
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.email !== 'string' || typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    // Removing an email from the allowlist revokes its existing sessions.
    if (!allowedEmails().includes(data.email)) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

function setSessionCookie(res: Response, value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`
  );
}

export function loginHandler(req: Request, res: Response) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }
  const requiredPassword = process.env.LOGIN_PASSWORD;
  const passwordOk = requiredPassword ? safeEqual(password, requiredPassword) : true;
  if (!allowedEmails().includes(email) || !passwordOk) {
    // Same message for unknown email and wrong password.
    return res.status(401).json({ error: 'That email and password combination is not allowed.' });
  }

  setSessionCookie(res, createSessionToken(email), SESSION_TTL_SECONDS);
  res.json({ authenticated: true, email });
}

export function logoutHandler(_req: Request, res: Response) {
  setSessionCookie(res, '', 0);
  res.json({ authenticated: false });
}

export function sessionHandler(req: Request, res: Response) {
  const session = readSession(req);
  res.json(session ? { authenticated: true, email: session.email } : { authenticated: false });
}

/** Blocks every /api route except auth and status for requests without a valid session. */
export function requireSession(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Please sign in.' });
  (req as any).userEmail = session.email;
  next();
}
