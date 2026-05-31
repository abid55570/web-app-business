import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * `outputFileTracingRoot` pins Next's workspace root to THIS app's frontend
 * dir so Next does not climb upward and pick a parent lockfile (e.g. when
 * the generated app lives inside a larger pnpm monorepo's output/).
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
}

export default nextConfig
