import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { writeFile } from 'node:fs/promises'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const STATE_FILE = resolve(PROJECT_ROOT, 'studio-state.json')

export async function POST(req: Request) {
  const body = await req.json()
  await writeFile(STATE_FILE, JSON.stringify(body, null, 2), 'utf8')
  return NextResponse.json({ ok: true, path: STATE_FILE })
}
