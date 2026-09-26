/**
 * Vercel serverless entry point. Vercel serves the Vite build from dist/ as static files,
 * and vercel.json rewrites every /api/* request to this function, which runs the same
 * Express app that server.ts uses locally.
 */
import { createApp } from '../src/server/app.js';

export default createApp();
