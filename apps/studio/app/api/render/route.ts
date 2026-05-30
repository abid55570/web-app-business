/**
 * S4 — render-to-app endpoint.
 *
 * POSTs a starter recipe path (relative to project root) and invokes the
 * wirer's generate command via the @b-dash/cli binary. Returns generated
 * file count + output path.
 *
 * The Studio page-state itself is NOT yet wired to a recipe — Studio S5a
 * will add a Studio-page → recipe converter. For now this exists so the
 * "Render to app" button can demonstrate the end-to-end loop on a known
 * starter (defaults to observability-saas).
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')

export async function POST(req: Request) {
  let body: { starter?: string; outDir?: string } = {}
  try {
    body = await req.json()
  } catch {
    // ignore
  }
  const starter = body.starter ?? 'observability-saas'
  const outDir = body.outDir ?? resolve(PROJECT_ROOT, 'output', `studio-${Date.now()}`)
  const recipe = resolve(PROJECT_ROOT, 'starters', starter, 'recipe.json')

  const lines: string[] = []
  const exitCode = await new Promise<number>((res) => {
    const cli = resolve(PROJECT_ROOT, 'packages', 'cli', 'dist', 'index.js')
    const child = spawn('node', [cli, 'generate', recipe, '--out', outDir], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (d) => lines.push(String(d).trim()))
    child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
    child.on('close', (code) => res(code ?? 1))
  })

  return NextResponse.json({
    ok: exitCode === 0,
    exitCode,
    outDir,
    recipe,
    log: lines,
  })
}
