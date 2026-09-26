// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { analyzeDocumentStream, isDocxFile, isImageFile, isPdfFile, prepareUpload, readNdjson } from '../../src/utils/analyzeDocument';

/** A Response whose body arrives in awkward chunks, to test line reassembly. */
function chunkedResponse(chunks: string[], status = 200) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  });
  return new Response(body, { status });
}

describe('readNdjson', () => {
  it('reassembles JSON lines split across network chunks', async () => {
    const seen: any[] = [];
    await readNdjson(chunkedResponse(['{"a":', '1}\n{"b"', ':2}\n', '{"c":3}']), (o) => seen.push(o));
    expect(seen).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });
});

describe('analyzeDocumentStream', () => {
  const payload = { rawText: 'x', language: 'EN' as const, readingLevel: 'standard' as const };

  it('forwards progress events and resolves with the result', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      chunkedResponse([
        '{"type":"stage","stage":"parsing","message":"Reading","progress":5}\n',
        '{"type":"partial","clauseNumber":3,"title":"Risk","riskLevel":"HIGH"}\n',
        '{"type":"result","payload":{"id":"doc-1"}}\n',
      ])
    );
    const events: any[] = [];
    const result = await analyzeDocumentStream(payload, (e) => events.push(e));
    expect(result).toEqual({ id: 'doc-1' });
    expect(events.map((e) => e.type)).toEqual(['stage', 'partial']);
  });

  it.each([
    [413, /too large to upload/],
    [429, /Too many requests/],
    [404, /not available on this server/],
  ])('turns HTTP %s into a readable message', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>error</html>', { status }));
    await expect(analyzeDocumentStream(payload, () => {})).rejects.toThrow(message);
  });

  it('surfaces an error event from the stream', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(chunkedResponse(['{"type":"error","message":"Failed to analyze"}\n']));
    await expect(analyzeDocumentStream(payload, () => {})).rejects.toThrow('Failed to analyze');
  });
});

describe('prepareUpload', () => {
  it('detects file types by MIME type or extension', () => {
    expect(isPdfFile(new File([''], 'deed.PDF'))).toBe(true);
    expect(isDocxFile(new File([''], 'deed.docx'))).toBe(true);
    expect(isImageFile(new File([''], 'scan.jpg', { type: 'image/jpeg' }))).toBe(true);
    expect(isImageFile(new File([''], 'deed.txt'))).toBe(false);
  });

  it('sends text files as text and PDFs as base64', async () => {
    expect(await prepareUpload(new File(['1. A clause'], 'deed.txt', { type: 'text/plain' }))).toEqual({
      fileName: 'deed.txt',
      rawText: '1. A clause',
    });
    const pdf = await prepareUpload(new File(['%PDF-1.4'], 'deed.pdf', { type: 'application/pdf' }));
    expect(pdf).toMatchObject({ fileName: 'deed.pdf', mimeType: 'application/pdf' });
    expect(atob(pdf.fileBase64!)).toBe('%PDF-1.4');
  });

  it('refuses legacy .doc files with guidance', async () => {
    await expect(prepareUpload(new File(['x'], 'old.doc'))).rejects.toThrow(/save the file as .docx or PDF/);
  });
});
