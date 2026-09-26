/**
 * Splits a legal document into clause / section segments and groups them into
 * size-bounded chunks, so each Gemini call only receives the clauses it analyses
 * instead of the whole file.
 */

export interface ClauseSegment {
  id: string; // stable id used to match AI output back to the segment, e.g. "S4"
  clauseNumber: number; // 0 = preamble / recitals
  heading: string;
  text: string;
  pageNumber: number;
}

export interface SegmentChunk {
  index: number;
  segments: ClauseSegment[];
  charCount: number;
}

const CLAUSE_START =
  /^\s*(?:(?:clause|article|section)\s+(\d{1,3})\b|(\d{1,3})\s*[.)]\s+(?=\S)|\((\d{1,3})\)\s+(?=\S))/i;
const SECTION_HEADING =
  /^\s*(?:WHEREAS|NOW\s+TH(?:IS|EREFORE)|SCHEDULE\b|THE\s+SCHEDULE|IN\s+WITNESS\s+WHEREOF|TERMS\s+AND\s+CONDITIONS|BETWEEN\b|ANNEXURE\b)/i;

const MAX_SEGMENT_CHARS = 3500;

/**
 * @param pageTexts optional per-page text (from PDF extraction) so segments keep their real page number
 */
export function splitIntoClauses(text: string, pageTexts?: string[]): ClauseSegment[] {
  const lines: Array<{ text: string; page: number }> = [];
  if (pageTexts && pageTexts.length > 0) {
    pageTexts.forEach((pt, idx) => {
      pt.split(/\r?\n/).forEach((l) => lines.push({ text: l, page: idx + 1 }));
    });
  } else {
    text.split(/\r?\n/).forEach((l, idx) => lines.push({ text: l, page: Math.floor(idx / 40) + 1 }));
  }

  const segments: ClauseSegment[] = [];
  let current: { clauseNumber: number; heading: string; lines: string[]; page: number } | null = null;

  const flush = () => {
    if (!current) return;
    const body = current.lines.join('\n').trim();
    if (body.length > 0) {
      for (const piece of splitOversized(body)) {
        segments.push({
          id: `S${segments.length + 1}`,
          clauseNumber: current.clauseNumber,
          heading: current.heading,
          text: piece,
          pageNumber: current.page,
        });
      }
    }
    current = null;
  };

  for (const line of lines) {
    const trimmed = line.text.trim();
    if (!trimmed) {
      current?.lines.push('');
      continue;
    }

    const clauseMatch = trimmed.match(CLAUSE_START);
    if (clauseMatch) {
      flush();
      const num = Number(clauseMatch[1] || clauseMatch[2] || clauseMatch[3]);
      current = { clauseNumber: num, heading: headingFrom(trimmed), lines: [trimmed], page: line.page };
      continue;
    }

    if (SECTION_HEADING.test(trimmed)) {
      flush();
      // Recitals, schedules and attestation blocks are not numbered clauses.
      current = { clauseNumber: 0, heading: headingFrom(trimmed), lines: [trimmed], page: line.page };
      continue;
    }

    if (!current) {
      current = { clauseNumber: 0, heading: 'Preamble & Parties', lines: [], page: line.page };
    }
    current.lines.push(trimmed);
  }
  flush();

  return segments;
}

function headingFrom(line: string): string {
  const withoutNumber = line.replace(CLAUSE_START, '').trim();
  const beforeColon = withoutNumber.split(/[:.—–-]\s/)[0];
  return (beforeColon || withoutNumber).slice(0, 60);
}

function splitOversized(body: string): string[] {
  if (body.length <= MAX_SEGMENT_CHARS) return [body];
  const pieces: string[] = [];
  let buffer = '';
  for (const para of body.split(/\n{2,}|(?<=[.;])\s+(?=[A-Z(])/)) {
    if ((buffer + ' ' + para).length > MAX_SEGMENT_CHARS && buffer) {
      pieces.push(buffer.trim());
      buffer = '';
    }
    buffer += (buffer ? ' ' : '') + para;
  }
  if (buffer.trim()) pieces.push(buffer.trim());
  return pieces;
}

/** Groups consecutive segments into chunks no larger than maxChars. */
export function groupIntoChunks(segments: ClauseSegment[], maxChars = 7000): SegmentChunk[] {
  const chunks: SegmentChunk[] = [];
  let current: ClauseSegment[] = [];
  let size = 0;

  for (const seg of segments) {
    if (size + seg.text.length > maxChars && current.length > 0) {
      chunks.push({ index: chunks.length, segments: current, charCount: size });
      current = [];
      size = 0;
    }
    current.push(seg);
    size += seg.text.length;
  }
  if (current.length > 0) chunks.push({ index: chunks.length, segments: current, charCount: size });
  return chunks;
}

/** Runs async work over items with bounded concurrency, preserving result order. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}
