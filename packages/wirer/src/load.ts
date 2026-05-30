/**
 * Module + theme loaders — read manifests from disk, validate against the
 * shared @b-dash/schemas, return typed objects.
 */
import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  ModuleSchema,
  SchemaValidationError,
  SectionSchema,
  ThemeManifestSchema,
  TokensSchema,
  loadAndValidate,
  type Section,
} from '@b-dash/schemas'
import { WirerError } from './errors.js'
import type { LoadedModule, LoadedTheme } from './types.js'

const MODULE_FILE_NAMES = ['module.yaml', 'module.yml']
const THEME_FILE_NAMES = ['theme.yaml', 'theme.yml']
const SECTION_FILE_NAMES = ['section.yaml', 'section.yml']


/** A section discovered on disk + validated. */
export type LoadedSection = {
  id: string
  manifest: Section
  manifestPath: string
  /** Absolute path to the React component file the section ships. */
  componentPath: string
}

async function findExistingFile(
  dir: string,
  candidates: string[],
): Promise<string | null> {
  for (const name of candidates) {
    const p = path.join(dir, name)
    try {
      await access(p)
      return p
    } catch {
      // try next
    }
  }
  return null
}

/** Load a single module from a directory containing module.yaml. */
export async function loadModuleFromDir(dir: string): Promise<LoadedModule> {
  const manifestPath = await findExistingFile(dir, MODULE_FILE_NAMES)
  if (!manifestPath) {
    throw new WirerError(
      'WIRER_TEMPLATE_MISSING',
      `No module.yaml found in '${dir}'`,
      { dir },
    )
  }
  const manifest = await loadAndValidate(ModuleSchema, manifestPath, 'module')
  return { id: manifest.id, manifest, manifestPath }
}

/** Load a single theme pack: theme.yaml + tokens.json + optional tokens.dark.json. */
export async function loadThemeFromDir(dir: string): Promise<LoadedTheme> {
  const manifestPath = await findExistingFile(dir, THEME_FILE_NAMES)
  if (!manifestPath) {
    throw new WirerError(
      'WIRER_TEMPLATE_MISSING',
      `No theme.yaml found in '${dir}'`,
      { dir },
    )
  }
  const manifest = await loadAndValidate(
    ThemeManifestSchema,
    manifestPath,
    'theme',
  )

  const tokensPath = path.join(dir, 'tokens.json')
  const tokens = await loadAndValidate(TokensSchema, tokensPath, 'tokens')

  const darkTokensPath = path.join(dir, 'tokens.dark.json')
  let darkTokens = null
  try {
    await access(darkTokensPath)
    darkTokens = await loadAndValidate(TokensSchema, darkTokensPath, 'tokens')
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      // Dark tokens exist but are malformed — that's a real error, not a
      // missing-file fallback.
      throw e
    }
    // Otherwise (file missing): leave darkTokens null.
  }

  return {
    pack: manifest.id,
    manifest,
    manifestPath,
    tokens,
    darkTokens,
  }
}

/**
 * Scan a parent directory and load every subdirectory that contains a valid
 * module.yaml. Subdirectories without a manifest are silently skipped.
 */
export async function scanModules(modulesRoot: string): Promise<LoadedModule[]> {
  let entries
  try {
    entries = await readdir(modulesRoot, { withFileTypes: true })
  } catch {
    return []
  }
  const dirs = entries.filter((e) => e.isDirectory())
  const out: LoadedModule[] = []
  for (const d of dirs) {
    try {
      out.push(await loadModuleFromDir(path.join(modulesRoot, d.name)))
    } catch (e) {
      if (e instanceof SchemaValidationError) {
        // Surface bad manifests — silently skipping them would mask real bugs.
        throw e
      }
      // Otherwise (no manifest in dir): skip.
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id))
}

/** Load a single section from a directory containing section.yaml. */
export async function loadSectionFromDir(dir: string): Promise<LoadedSection> {
  const manifestPath = await findExistingFile(dir, SECTION_FILE_NAMES)
  if (!manifestPath) {
    throw new WirerError(
      'WIRER_TEMPLATE_MISSING',
      `No section.yaml found in '${dir}'`,
      { dir },
    )
  }
  const manifest = await loadAndValidate(SectionSchema, manifestPath, 'section')
  const componentPath = path.resolve(
    path.dirname(manifestPath),
    manifest.componentFile,
  )
  return {
    id: manifest.id,
    manifest,
    manifestPath,
    componentPath,
  }
}


/**
 * Recursively scan ``sectionsRoot`` for ``section.yaml`` files.
 * Sections live under ``<root>/<category>/<id>/section.yaml`` so we walk
 * one level deep before looking for manifests. Skips dirs without one.
 */
export async function scanSections(sectionsRoot: string): Promise<LoadedSection[]> {
  let categories
  try {
    categories = await readdir(sectionsRoot, { withFileTypes: true })
  } catch {
    return []
  }
  const out: LoadedSection[] = []
  for (const cat of categories.filter((e) => e.isDirectory())) {
    const catPath = path.join(sectionsRoot, cat.name)
    let sections
    try {
      sections = await readdir(catPath, { withFileTypes: true })
    } catch {
      continue
    }
    for (const s of sections.filter((e) => e.isDirectory())) {
      try {
        out.push(await loadSectionFromDir(path.join(catPath, s.name)))
      } catch (e) {
        if (e instanceof SchemaValidationError) throw e
        // Skip dirs without a section.yaml.
      }
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id))
}


/** Same as scanModules, but for theme packs. */
export async function scanThemes(themesRoot: string): Promise<LoadedTheme[]> {
  let entries
  try {
    entries = await readdir(themesRoot, { withFileTypes: true })
  } catch {
    return []
  }
  const dirs = entries.filter((e) => e.isDirectory())
  const out: LoadedTheme[] = []
  for (const d of dirs) {
    try {
      out.push(await loadThemeFromDir(path.join(themesRoot, d.name)))
    } catch (e) {
      if (e instanceof SchemaValidationError) throw e
      // Otherwise: skip dirs without manifests.
    }
  }
  return out.sort((a, b) => a.pack.localeCompare(b.pack))
}
