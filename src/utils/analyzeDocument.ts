/**
 * Client helpers for document upload and streaming analysis.
 * - Photos are downscaled + re-encoded before upload (large bandwidth saving on phones).
 * - Analysis progress arrives as newline-delimited JSON from /api/document/analyze/stream.
 */

import type { AnalyzedDocumentResult } from '../components/UploadModal';
import type { Language } from '../types';
import type { ReadingLevel } from '../context/PreferencesContext';

export type AnalysisStage = 'parsing' | 'masking' | 'analyzing' | 'flagging' | 'summarizing' | 'done';

export type AnalysisEvent =
  | { type: 'stage'; stage: AnalysisStage; message: string; progress: number }
  | { type: 'partial'; clauseNumber: number; title: string; riskLevel: string }
  | { type: 'result'; payload: AnalyzedDocumentResult }
  | { type: 'error'; message: string };

export interface UploadPayload {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  rawText?: string;
}

const MAX_IMAGE_EDGE = 2000;
const IMAGE_QUALITY = 0.8;

export const isImageFile = (file: File) => file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
export const isPdfFile = (file: File) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
export const isDocxFile = (file: File) =>
  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.docx$/i.test(file.name);

function readAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve(res.split(',')[1] || res);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Downscales a photo so OCR still works but the upload is a fraction of the size. Falls back to the original. */
async function compressImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function prepareUpload(file: File): Promise<UploadPayload> {
  if (isImageFile(file)) {
    const blob = await compressImage(file);
    return { fileName: file.name, mimeType: blob.type || file.type || 'image/jpeg', fileBase64: await readAsBase64(blob) };
  }
  if (isPdfFile(file) || isDocxFile(file)) {
    return {
      fileName: file.name,
      mimeType: isPdfFile(file) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileBase64: await readAsBase64(file),
    };
  }
  if (/\.doc$/i.test(file.name)) {
    throw new Error('Old .doc files are not supported. Please save the file as .docx or PDF.');
  }
  return { fileName: file.name, rawText: await file.text() };
}

/** Reads a newline-delimited JSON response body, calling onObject for each parsed line. */
export async function readNdjson(res: Response, onObject: (obj: any) => void): Promise<void> {
  if (!res.body) throw new Error('Streaming is not supported by this browser.');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onObject(JSON.parse(line));
    }
  }
  const rest = (buffer + decoder.decode()).trim();
  if (rest) onObject(JSON.parse(rest));
}

async function errorMessageFrom(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message || data.error || `Server returned ${res.status}`;
  } catch {
    return res.status === 429 ? 'Too many requests. Please wait a minute and try again.' : `Server returned ${res.status}`;
  }
}

export async function analyzeDocumentStream(
  payload: UploadPayload & { language: Language; readingLevel: ReadingLevel },
  onEvent: (event: AnalysisEvent) => void,
  signal?: AbortSignal
): Promise<AnalyzedDocumentResult> {
  const res = await fetch('/api/document/analyze/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(await errorMessageFrom(res));

  let result: AnalyzedDocumentResult | null = null;
  let streamError: string | null = null;
  await readNdjson(res, (event: AnalysisEvent) => {
    if (event.type === 'result') result = event.payload;
    else if (event.type === 'error') streamError = event.message;
    else onEvent(event);
  });

  if (streamError) throw new Error(streamError);
  if (!result) throw new Error('The analysis ended unexpectedly. Please try again.');
  return result;
}
