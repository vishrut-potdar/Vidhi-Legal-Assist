import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app';
import { clearGeminiKey, mockGemini } from '../helpers/gemini';

const OWNER = 'vishrutedu@gmail.com';

/** A supertest agent that keeps cookies, already signed in as the owner. */
async function signedInAgent(app = createApp()) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email: OWNER, password: 'anything' });
  expect(res.status).toBe(200);
  return agent;
}

const parseNdjson = (text: string) =>
  text
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l));

afterEach(() => {
  clearGeminiKey();
  delete process.env.LOGIN_PASSWORD;
  delete process.env.ALLOWED_EMAILS;
});

describe('authentication', () => {
  it('keeps /api/status public but protects every other API route', async () => {
    const app = createApp();
    expect((await request(app).get('/api/status')).status).toBe(200);
    for (const [method, path] of [
      ['post', '/api/chat'],
      ['post', '/api/chat/stream'],
      ['post', '/api/document/analyze/stream'],
      ['post', '/api/qa/grounded'],
      ['get', '/api/pipeline/definitions'],
    ] as const) {
      const res = await (request(app) as any)[method](path).send({});
      expect(res.status, `${method.toUpperCase()} ${path}`).toBe(401);
    }
  });

  it('lets the owner sign in with any password (case-insensitive email)', async () => {
    const app = createApp();
    const res = await request(app).post('/api/auth/login').send({ email: 'VishrutEdu@Gmail.com', password: 'whatever-123' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true, email: OWNER });
    expect(res.headers['set-cookie'][0]).toMatch(/vidhi_session=.+HttpOnly; SameSite=Lax; Max-Age=604800/);
  });

  it('rejects other emails and empty passwords with the same generic message', async () => {
    const app = createApp();
    const wrong = await request(app).post('/api/auth/login').send({ email: 'someone@else.com', password: 'x' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error).toMatch(/not allowed/);
    const empty = await request(app).post('/api/auth/login').send({ email: OWNER, password: '' });
    expect(empty.status).toBe(400);
  });

  it('enforces LOGIN_PASSWORD when it is configured', async () => {
    process.env.LOGIN_PASSWORD = 'correct horse';
    const app = createApp();
    expect((await request(app).post('/api/auth/login').send({ email: OWNER, password: 'wrong' })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: OWNER, password: 'correct horse' })).status).toBe(200);
  });

  it('supports ALLOWED_EMAILS for extra users', async () => {
    process.env.ALLOWED_EMAILS = 'a@x.com, b@y.com';
    const app = createApp();
    expect((await request(app).post('/api/auth/login').send({ email: 'b@y.com', password: 'x' })).status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ email: OWNER, password: 'x' })).status).toBe(401);
  });

  it('accepts the session cookie, rejects a tampered one, and signs out', async () => {
    const app = createApp();
    const agent = await signedInAgent(app);
    expect((await agent.get('/api/auth/session')).body).toEqual({ authenticated: true, email: OWNER });
    expect((await agent.get('/api/pipeline/definitions')).status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email: OWNER, password: 'x' });
    const token = decodeURIComponent(login.headers['set-cookie'][0].split(';')[0].split('=')[1]);
    const [payload, sig] = token.split('.');
    const forgedPayload = Buffer.from(JSON.stringify({ email: 'attacker@evil.com', exp: 9999999999 })).toString('base64url');
    for (const forged of [`${forgedPayload}.${sig}`, `${payload}.${sig.slice(0, -2)}xx`]) {
      const res = await request(app).get('/api/pipeline/definitions').set('Cookie', `vidhi_session=${forged}`);
      expect(res.status).toBe(401);
    }

    await agent.post('/api/auth/logout');
    expect((await agent.get('/api/pipeline/definitions')).status).toBe(401);
  });

  it('limits sign-in attempts', async () => {
    const app = createApp();
    const codes: number[] = [];
    for (let i = 0; i < 11; i++) codes.push((await request(app).post('/api/auth/login').send({ email: 'x@y.z', password: 'p' })).status);
    expect(codes.slice(0, 10).every((c) => c === 401)).toBe(true);
    expect(codes[10]).toBe(429);
  });
});

describe('document analysis API', () => {
  it('validates the upload body', async () => {
    const agent = await signedInAgent();
    expect((await agent.post('/api/document/analyze').send({})).status).toBe(400);
    expect((await agent.post('/api/document/analyze').send({ rawText: 42 })).status).toBe(400);
    const bad = await agent.post('/api/document/analyze').send({ fileBase64: 'AAAA', mimeType: 'application/x-msdownload', fileName: 'x.exe' });
    expect(bad.status).toBe(400);
    expect(bad.body.error).toMatch(/Unsupported file type/);
  });

  it('streams NDJSON progress events followed by the result', async () => {
    const agent = await signedInAgent();
    const res = await agent
      .post('/api/document/analyze/stream')
      .send({ rawText: '1. Possession shall be given in due course after registration.\n2. Vendor PAN ABCDE1234F.', language: 'EN' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/x-ndjson/);
    expect(res.headers['cache-control']).toBe('no-store');

    const events = parseNdjson(res.text);
    expect(events[0]).toMatchObject({ type: 'stage', stage: 'parsing' });
    const result = events.at(-1);
    expect(result.type).toBe('result');
    expect(result.payload.findings[0].shortTitle).toBe('No fixed possession date');
    expect(res.text).not.toContain('ABCDE1234F');
  });

  it('rate-limits document analysis per client', async () => {
    const agent = await signedInAgent();
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) codes.push((await agent.post('/api/document/analyze').send({ rawText: '1. A clause.' })).status);
    expect(codes.slice(0, 6)).toEqual([200, 200, 200, 200, 200, 200]);
    expect(codes[6]).toBe(429);
  });
});

describe('chat and grounded Q&A API', () => {
  beforeEach(() => clearGeminiKey());

  it('streams chat and says clearly when the answer is not from AI', async () => {
    const agent = await signedInAgent();
    const res = await agent.post('/api/chat/stream').send({ messages: [{ role: 'user', content: 'What is an encumbrance certificate?' }] });
    const events = parseNdjson(res.text);
    expect(events[0].type).toBe('delta');
    expect(events.at(-1)).toMatchObject({ type: 'done', offline: true });
    expect(events.at(-1).notice).toMatch(/not AI/);
  });

  it('streams a real model answer when Gemini responds', async () => {
    const gemini = mockGemini(['An EC lists registered charges on a property.']);
    const agent = await signedInAgent();
    const res = await agent.post('/api/chat/stream').send({ messages: [{ role: 'user', content: 'My Aadhaar 2345 6789 0123 — what is an EC?' }] });
    const events = parseNdjson(res.text);
    const text = events.filter((e) => e.type === 'delta').map((e) => e.text).join('');
    expect(text).toBe('An EC lists registered charges on a property.');
    expect(events.at(-1)).toMatchObject({ type: 'done', offline: false, modelUsed: 'gemini-3.8-flash' });
    expect(gemini.sentText()).not.toContain('2345 6789 0123');
  });

  it('requires a question for grounded Q&A and returns stages then a result', async () => {
    const agent = await signedInAgent();
    expect((await agent.post('/api/qa/grounded').send({})).status).toBe(400);
    const res = await agent.post('/api/qa/grounded').send({ question: 'When is possession?' });
    const events = parseNdjson(res.text);
    expect(events[0]).toMatchObject({ type: 'stage', stage: 'context' });
    expect(events.at(-1)).toMatchObject({ type: 'result', result: { status: 'rejected', rejection: { kind: 'no_document' } } });
  });
});

describe('security headers', () => {
  it('adds hardening headers and hides the framework', async () => {
    const res = await request(createApp()).get('/api/status');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('returns JSON 404 for unknown API routes once signed in', async () => {
    const agent = await signedInAgent();
    const res = await agent.get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
