import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Default timeout bumped from 5s → 30s. As the section catalog
    // grows past 400+ entries, full-tree scans (scanSections,
    // scanThemes) take longer on cold disk than the vitest default.
    testTimeout: 30000,
    // Wirer's tests live in tests/. The scaffold/ tree contains template
    // files (Playwright specs, vitest configs) that ship to generated apps;
    // they MUST NOT run under wirer's own vitest.
    exclude: ['node_modules/**', 'scaffold/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts', 'src/index.ts', 'src/types.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
})
