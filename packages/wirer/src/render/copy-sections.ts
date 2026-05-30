/**
 * Copy section components + manifests into the generated app.
 *
 * Layout convention: ``<out>/frontend/src/sections/<sectionId>/<basename>``
 * for each section's componentFile, plus a sibling ``<id>.studio.json``
 * carrying the manifest minus deprecated/preview metadata so Studio's
 * scanBlocks can pick them up.
 *
 * Phase 5 ships every section in the catalog into every recipe — Studio
 * decides what to drag onto pages. Wave 2 adds opt-in via recipe.sections[]
 * so apps that don't need 100 sections aren't carrying their components.
 */
import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { LoadedSection } from '../load.js'

export type CopySectionsArgs = {
  sections: LoadedSection[]
  outputDir: string
}

export async function copySections(
  args: CopySectionsArgs,
): Promise<{ count: number }> {
  if (args.sections.length === 0) return { count: 0 }
  const root = path.join(args.outputDir, 'frontend', 'src', 'sections')
  await mkdir(root, { recursive: true })

  for (const s of args.sections) {
    const dest = path.join(root, s.id)
    await mkdir(dest, { recursive: true })

    // Copy the component file (+ any siblings the section ships, like
    // .css / image assets). We snapshot the source dir's file list so
    // sections can carry helper files alongside the main component.
    const sourceDir = path.dirname(s.manifestPath)
    for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      if (entry.name === path.basename(s.manifestPath)) continue
      await copyFile(
        path.join(sourceDir, entry.name),
        path.join(dest, entry.name),
      )
    }

    // Studio block manifest — the slim runtime view of section.yaml.
    // Only the bits Studio's Properties panel needs.
    const studioManifest = {
      id: s.id,
      displayName: s.manifest.displayName,
      category: s.manifest.category,
      componentPath: `sections/${s.id}/${path.basename(s.componentPath, path.extname(s.componentPath))}`,
      props: s.manifest.props,
      hasChildren: false,
      tags: s.manifest.tags,
    }
    await writeFile(
      path.join(dest, `${s.id}.studio.json`),
      JSON.stringify(studioManifest, null, 2) + '\n',
      'utf-8',
    )
  }
  return { count: args.sections.length }
}
