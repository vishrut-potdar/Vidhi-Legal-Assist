/**
 * Express app with all middleware and /api routes.
 * Used by server.ts (local dev / container) and api/index.ts (Vercel serverless function).
 */
import express from 'express';
import compression from 'compression';
import {
  executeAIPipeline,
  dedicatedLegalWordLibrary,
  generateAIExecutiveSummary,
  askLegalQuestionWithAI,
  analyzeClauseWithAI,
  handleChatWithAI,
  streamChatWithAI,
  analyzeUploadedDocument,
} from './aiPipeline.js';
import { analyzeDocumentStreaming, AnalysisEvent, DocumentAnalysisInput } from './documentAnalysis.js';
import { enforceHttps, rateLimit, securityHeaders } from './security.js';
import { hasGeminiKey, normalizeLanguage, normalizeReadingLevel } from './aiShared.js';
import { loginHandler, logoutHandler, requireSession, sessionHandler } from './auth.js';
import { answerGroundedQuestion } from './groundedQA.js';

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // decoded file size
const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/** Validates and normalises an upload request body. Returns an error message or the input. */
function parseDocumentInput(body: any): { error: string } | { input: DocumentAnalysisInput } {
  const { fileBase64, mimeType, fileName, rawText } = body || {};
  if (!fileBase64 && !rawText) return { error: 'Provide either a file or document text.' };
  if (rawText !== undefined && typeof rawText !== 'string') return { error: 'rawText must be a string.' };
  if (fileBase64 !== undefined) {
    if (typeof fileBase64 !== 'string') return { error: 'fileBase64 must be a string.' };
    if (fileBase64.length * 0.75 > MAX_UPLOAD_BYTES) return { error: 'File is larger than 12 MB.' };
    if (mimeType && !ALLOWED_UPLOAD_TYPES.includes(mimeType) && !/\.(pdf|docx|txt)$/i.test(fileName || '')) {
      return { error: `Unsupported file type: ${mimeType}` };
    }
  }
  return {
    input: {
      fileBase64,
      mimeType: typeof mimeType === 'string' ? mimeType : undefined,
      fileName: typeof fileName === 'string' ? fileName.slice(0, 200) : undefined,
      rawText,
      language: normalizeLanguage(body.language),
      readingLevel: normalizeReadingLevel(body.readingLevel),
    },
  };
}

/** Starts a newline-delimited JSON stream response. */
function startNdjson(res: express.Response) {
  res.status(200);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  return (obj: unknown) => {
    if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n');
  };
}

export function createApp() {
  const app = express();

  // Behind Cloud Run / a load balancer: trust the first proxy for req.ip and req.secure.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(enforceHttps);
  app.use(securityHeaders);
  app.use(
    compression({
      // Streaming endpoints must not be buffered by gzip.
      filter: (req, res) => !req.path.endsWith('/stream') && compression.filter(req, res),
    })
  );
  app.use(express.json({ limit: '17mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  const RATE_WINDOW = 60_000;
  const apiLimiter = rateLimit({ windowMs: RATE_WINDOW, max: Number(process.env.RATE_LIMIT_API) || 120, name: 'API requests' });
  const aiLimiter = rateLimit({ windowMs: RATE_WINDOW, max: Number(process.env.RATE_LIMIT_AI) || 30, name: 'AI questions' });
  const uploadLimiter = rateLimit({ windowMs: RATE_WINDOW, max: Number(process.env.RATE_LIMIT_UPLOAD) || 6, name: 'document analysis' });

  app.use('/api', apiLimiter);
  app.use(['/api/pipeline', '/api/chat', '/api/qa'], aiLimiter);
  app.use('/api/document', uploadLimiter);

  // Lets the client show whether real Gemini analysis or the offline rule engine is active.
  app.get('/api/status', (_req, res) => {
    res.json({ aiMode: hasGeminiKey() ? 'gemini' : 'offline' });
  });

  // Authentication (public). Login gets its own strict limit against guessing.
  const loginLimiter = rateLimit({ windowMs: RATE_WINDOW, max: 10, name: 'sign-in attempts' });
  app.post('/api/auth/login', loginLimiter, loginHandler);
  app.post('/api/auth/logout', logoutHandler);
  app.get('/api/auth/session', sessionHandler);

  // Every other API route requires a signed-in session.
  app.use('/api', requireSession);

  // Pipeline API: Process document according to architecture diagram
  app.post('/api/pipeline/process', async (req, res) => {
    try {
      const { text } = req.body;
      const docText =
        typeof text === 'string' && text.trim()
          ? text.slice(0, 50_000)
          : `DEED OF ABSOLUTE SALE. Between Shri Rajesh S. Verma (Vendor, PAN: ABCDE1234F, Aadhaar: 2345 6789 0123) and Rohan Sharma (Purchaser, Aadhaar: 9876 5432 1098). Property: Flat 402, Kalyani Nagar, Pune. Balance consideration ₹86,00,000 shall be paid irrespective of mortgage NOC from State Bank of India. Time is not of the essence for physical vacant key possession.`;

      const result = await executeAIPipeline(docText);
      res.json(result);
    } catch (err: any) {
      console.error('Pipeline processing error:', err?.message || err);
      res.status(500).json({
        success: false,
        isOutOfContext: false,
        errorMessage: 'Internal pipeline processing error',
      });
    }
  });

  // Pipeline API: Ask a question with Context Bifurcation & Legal Word Library
  app.post('/api/pipeline/ask', async (req, res) => {
    try {
      const { query, documentContext } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const result = await askLegalQuestionWithAI(
        query.slice(0, 2000),
        typeof documentContext === 'string' ? documentContext.slice(0, 8000) : undefined,
        normalizeLanguage(req.body.language),
        normalizeReadingLevel(req.body.readingLevel)
      );
      res.json(result);
    } catch (err: any) {
      console.error('Pipeline question error:', err?.message || err);
      res.status(500).json({ error: 'Failed to process question' });
    }
  });

  // Grounded Q&A: context → answer → verification → approved or rejected (NDJSON stages, then result)
  app.post('/api/qa/grounded', async (req, res) => {
    const { question, document } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    const send = startNdjson(res);
    try {
      const result = await answerGroundedQuestion(
        question,
        document && typeof document === 'object' ? document : undefined,
        normalizeLanguage(req.body.language),
        normalizeReadingLevel(req.body.readingLevel),
        (event) => send(event)
      );
      send({ type: 'result', result });
    } catch (err: any) {
      console.error('Grounded QA error:', err?.message || err);
      send({ type: 'error', message: 'Failed to answer the question. Please try again.' });
    } finally {
      res.end();
    }
  });

  // Pipeline API: Deep AI Clause Analysis
  app.post('/api/pipeline/analyze-clause', async (req, res) => {
    try {
      const { clauseNumber = 4, pageNumber = 7, originalLegalText } = req.body;
      if (!originalLegalText || typeof originalLegalText !== 'string') {
        return res.status(400).json({ error: 'originalLegalText is required' });
      }

      const result = await analyzeClauseWithAI(
        Number(clauseNumber) || 0,
        Number(pageNumber) || 1,
        originalLegalText.slice(0, 6000),
        normalizeLanguage(req.body.language),
        normalizeReadingLevel(req.body.readingLevel)
      );
      res.json(result);
    } catch (err: any) {
      console.error('Pipeline analyze-clause error:', err?.message || err);
      res.status(500).json({ error: 'Failed to analyze clause' });
    }
  });

  // Multi-turn Gemini AI Chatbot endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, documentContext, modelRole = 'general' } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const response = await handleChatWithAI(
        messages,
        typeof documentContext === 'string' ? documentContext : undefined,
        normalizeLanguage(req.body.language),
        ['general', 'deep', 'fast'].includes(modelRole) ? modelRole : 'general',
        normalizeReadingLevel(req.body.readingLevel)
      );
      res.json(response);
    } catch (err: any) {
      console.error('Chat endpoint error:', err?.message || err);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // Streaming chat: NDJSON events {type:'delta'|'done'|'error'}
  app.post('/api/chat/stream', async (req, res) => {
    const { messages, documentContext, modelRole = 'general' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    const send = startNdjson(res);
    try {
      const { modelUsed, offline, notice } = await streamChatWithAI(
        messages,
        typeof documentContext === 'string' ? documentContext : undefined,
        normalizeLanguage(req.body.language),
        ['general', 'deep', 'fast'].includes(modelRole) ? modelRole : 'general',
        normalizeReadingLevel(req.body.readingLevel),
        (text) => send({ type: 'delta', text })
      );
      send({ type: 'done', modelUsed, offline, notice, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error('Streaming chat error:', err?.message || err);
      send({ type: 'error', message: 'Failed to process chat message' });
    } finally {
      res.end();
    }
  });

  // Real AI Document Ingestion & Statutory Scrutiny Endpoint (single JSON response)
  app.post('/api/document/analyze', async (req, res) => {
    const parsed = parseDocumentInput(req.body);
    if ('error' in parsed) return res.status(400).json({ error: parsed.error });
    try {
      const analyzedDoc = await analyzeUploadedDocument(parsed.input);
      res.json(analyzedDoc);
    } catch (err: any) {
      console.error('Document analysis error:', err?.message || err);
      res.status(500).json({ error: 'Failed to analyze document' });
    } finally {
      // Release the uploaded payload reference as soon as the response is produced.
      req.body = undefined;
    }
  });

  // Streaming document analysis: NDJSON progress events, then {type:'result'}
  app.post('/api/document/analyze/stream', async (req, res) => {
    const parsed = parseDocumentInput(req.body);
    if ('error' in parsed) return res.status(400).json({ error: parsed.error });
    req.body = undefined;

    const send = startNdjson(res);
    let aborted = false;
    res.on('close', () => {
      aborted = !res.writableFinished;
    });

    try {
      const payload = await analyzeDocumentStreaming(parsed.input, (event: AnalysisEvent) => {
        if (!aborted) send(event);
      });
      send({ type: 'result', payload });
    } catch (err: any) {
      console.error('Streaming document analysis error:', err?.message || err);
      send({ type: 'error', message: 'Failed to analyze document. Please try again or paste the text.' });
    } finally {
      res.end();
    }
  });

  // Dedicated Library for Legal Word Definitions
  app.get('/api/pipeline/definitions', (_req, res) => {
    res.json(dedicatedLegalWordLibrary);
  });

  // Pipeline API: Generate high-level AI Executive Summary
  app.post('/api/pipeline/summary', async (req, res) => {
    try {
      const { text } = req.body;
      const summary = await generateAIExecutiveSummary(
        typeof text === 'string' ? text.slice(0, 20_000) : undefined,
        normalizeLanguage(req.body.language),
        normalizeReadingLevel(req.body.readingLevel)
      );
      res.json(summary);
    } catch (err: any) {
      console.error('Executive summary error:', err?.message || err);
      res.status(500).json({ error: 'Failed to generate executive summary' });
    }
  });

  // Demo trace route for instant inspection
  app.get('/api/pipeline/trace-demo', async (_req, res) => {
    const sampleText = `SALE DEED DRAFT. Vendor PAN: ABCDE1234F, Aadhaar: 2345 6789 0123, Phone: +91 98220 12345, Bank A/C: 10293847561, IFSC: SBIN0001234. Flat 402, Kalyani Nagar. Clause 4: Balance payment payable without SBI mortgage clearance. Clause 9: Possession time not of essence.`;
    const result = await executeAIPipeline(sampleText);
    res.json(result);
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
