import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { readFile, readdir } from 'node:fs/promises'
import { scanSections } from '@b-dash/wirer'
import { buildBlockManifest } from '@b-dash/studio'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const SECTIONS_ROOT = resolve(PROJECT_ROOT, 'sections')
const THEMES_ROOT = resolve(PROJECT_ROOT, 'themes')
const STATE_FILE = resolve(PROJECT_ROOT, 'studio-state.json')

export async function GET() {
  const sections = await scanSections(SECTIONS_ROOT)
  const blocks = sections.map((s) => buildBlockManifest(s.manifest))

  let themes: string[] = []
  try {
    const entries = await readdir(THEMES_ROOT, { withFileTypes: true })
    themes = entries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
  } catch {
    // themes dir missing — ignore
  }

  let state: unknown = { pages: [{ id: 'home', name: 'Home', route: '/', blocks: [] }], activePageId: 'home' }
  try {
    const raw = await readFile(STATE_FILE, 'utf8')
    state = JSON.parse(raw)
  } catch {
    // state file may not exist yet
  }

  return NextResponse.json({ blocks, themes, state })
}
