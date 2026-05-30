import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Vitest config for the generated frontend.
// - `.tsx` tests run in jsdom (need DOM for React render);
//   `.ts` tests run in node (faster, no DOM tax). Files can override per-file
//   with a `@vitest-environment jsdom|node` comment.
// - `tests/<module-id>/` holds per-module smoke tests; co-located tests
//   inside `src/` are also picked up so unit tests can sit next to the code.
export default defineConfig({
  // Use the React 19 automatic JSX runtime so .tsx tests don't need to
  // `import React from 'react'` themselves (matches Next.js + tsconfig).
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.tsx', 'jsdom'],
      ['**/components/**', 'jsdom'],
    ],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    // Playwright specs live under tests/e2e/ and must NOT run under vitest
    // (different runner, different lifecycle, different test() impl).
    exclude: ['node_modules/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
