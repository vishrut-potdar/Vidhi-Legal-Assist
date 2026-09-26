import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Server tests run in Node; component tests opt into jsdom with a file-level comment.
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      include: ['src/server/**/*.ts', 'src/utils/**/*.ts', 'src/hooks/**/*.ts', 'src/context/**/*.tsx', 'src/components/**/*.tsx'],
      reporter: ['text-summary', 'text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      // Fail the run if coverage drops below today's level (raise these as tests are added).
      thresholds: { lines: 60, statements: 60, branches: 50, functions: 45 },
    },
  },
});
