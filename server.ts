import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  executeAIPipeline,
  dedicatedLegalWordLibrary,
  generateAIExecutiveSummary,
  askLegalQuestionWithAI,
  analyzeClauseWithAI,
  handleChatWithAI,
  analyzeUploadedDocument,
} from './src/server/aiPipeline';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Pipeline API: Process document according to architecture diagram
  app.post('/api/pipeline/process', async (req, res) => {
    try {
      const { text } = req.body;
      const docText =
        text ||
        `DEED OF ABSOLUTE SALE. Between Shri Rajesh S. Verma (Vendor, PAN: ABCDE1234F, Aadhaar: 2345 6789 0123) and Rohan Sharma (Purchaser, Aadhaar: 9876 5432 1098). Property: Flat 402, Kalyani Nagar, Pune. Balance consideration ₹86,00,000 shall be paid irrespective of mortgage NOC from State Bank of India. Time is not of the essence for physical vacant key possession.`;

      const result = await executeAIPipeline(docText);
      res.json(result);
    } catch (err: any) {
      console.error('Pipeline processing error:', err);
      res.status(500).json({
        success: false,
        isOutOfContext: false,
        errorMessage: err.message || 'Internal pipeline processing error',
      });
    }
  });

  // Pipeline API: Ask a question with Context Bifurcation & Legal Word Library
  app.post('/api/pipeline/ask', async (req, res) => {
    try {
      const { query, documentContext, language = 'EN' } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Run AI QA engine with Gemini
      const result = await askLegalQuestionWithAI(query, documentContext, language);
      res.json(result);
    } catch (err: any) {
      console.error('Pipeline question error:', err);
      res.status(500).json({ error: 'Failed to process question' });
    }
  });

  // Pipeline API: Deep AI Clause Analysis
  app.post('/api/pipeline/analyze-clause', async (req, res) => {
    try {
      const { clauseNumber = 4, pageNumber = 7, originalLegalText, language = 'EN' } = req.body;
      if (!originalLegalText || typeof originalLegalText !== 'string') {
        return res.status(400).json({ error: 'originalLegalText is required' });
      }

      const result = await analyzeClauseWithAI(
        Number(clauseNumber),
        Number(pageNumber),
        originalLegalText,
        language
      );
      res.json(result);
    } catch (err: any) {
      console.error('Pipeline analyze-clause error:', err);
      res.status(500).json({ error: 'Failed to analyze clause' });
    }
  });

  // Multi-turn Gemini AI Chatbot endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, documentContext, language = 'EN', modelRole = 'general' } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const response = await handleChatWithAI(messages, documentContext, language, modelRole);
      res.json(response);
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // Real AI Document Ingestion & Statutory Scrutiny Endpoint
  app.post('/api/document/analyze', async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName, rawText, language } = req.body;
      const analyzedDoc = await analyzeUploadedDocument({
        fileBase64,
        mimeType,
        fileName,
        rawText,
        language: language || 'EN',
      });
      res.json(analyzedDoc);
    } catch (err: any) {
      console.error('Document analysis error:', err);
      res.status(500).json({ error: 'Failed to analyze document', details: err.message });
    }
  });

  // Dedicated Library for Legal Word Definitions
  app.get('/api/pipeline/definitions', (_req, res) => {
    res.json(dedicatedLegalWordLibrary);
  });

  // Pipeline API: Generate high-level AI Executive Summary
  app.post('/api/pipeline/summary', async (req, res) => {
    try {
      const { text, language = 'EN' } = req.body;
      const summary = await generateAIExecutiveSummary(text, language);
      res.json(summary);
    } catch (err: any) {
      console.error('Executive summary error:', err);
      res.status(500).json({ error: 'Failed to generate executive summary' });
    }
  });

  // Demo trace route for instant inspection
  app.get('/api/pipeline/trace-demo', async (_req, res) => {
    const sampleText = `SALE DEED DRAFT. Vendor PAN: ABCDE1234F, Aadhaar: 2345 6789 0123, Phone: +91 98220 12345, Bank A/C: 10293847561, IFSC: SBIN0001234. Flat 402, Kalyani Nagar. Clause 4: Balance payment payable without SBI mortgage clearance. Clause 9: Possession time not of essence.`;
    const result = await executeAIPipeline(sampleText);
    res.json(result);
  });

  // Mount Vite or serve static
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vidhi AI Processing Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
