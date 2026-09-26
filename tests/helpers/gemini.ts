import { vi } from 'vitest';
import { getGeminiClient } from '../../src/server/aiShared';

export type ScriptedReply = object | string | Error;

/**
 * Replaces the Gemini client's methods with a scripted fake so tests never hit the network.
 * Each call consumes the next reply: objects are returned as JSON text, strings as-is, Errors are thrown.
 */
export function mockGemini(replies: ScriptedReply[]) {
  process.env.GEMINI_API_KEY = 'test-key';
  const client: any = getGeminiClient();
  const queue = [...replies];
  const calls: any[] = [];

  const next = () => {
    const reply = queue.shift();
    if (reply === undefined) throw new Error('mockGemini: no scripted reply left');
    if (reply instanceof Error) throw reply;
    return typeof reply === 'string' ? reply : JSON.stringify(reply);
  };

  client.models.generateContent = vi.fn(async (params: any) => {
    calls.push(params);
    return { text: next() };
  });

  client.models.generateContentStream = vi.fn(async (params: any) => {
    calls.push(params);
    const text = next();
    return (async function* () {
      for (const piece of text.match(/.{1,20}/gs) || []) yield { text: piece };
    })();
  });

  /** All prompt text sent to the model, for asserting what left the server. */
  const sentText = () => JSON.stringify(calls);
  return { calls, sentText, remaining: () => queue.length };
}

export function geminiError(status: number, message = 'error') {
  return Object.assign(new Error(`{"error":{"code":${status},"message":"${message}"}}`), { status });
}

export function clearGeminiKey() {
  delete process.env.GEMINI_API_KEY;
}
