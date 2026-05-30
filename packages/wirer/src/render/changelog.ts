/**
 * Module CHANGELOG.md parser — categorizes version bumps as
 * safe / review / breaking for the `b-dash upgrade` report.
 *
 * Convention: each module ships an optional `CHANGELOG.md` next to its
 * `module.yaml`. Entries follow Keep-a-Changelog with severity tags:
 *
 *   ## 1.2.0 — 2026-05-22
 *   ### safe
 *   - Added `posts.created` event payload
 *   ### review
 *   - Renamed `excerpt` column to `summary`
 *   ### breaking
 *   - Removed `/api/posts/legacy` endpoint
 *
 * The parser walks every (id, oldVersion → newVersion) pair and pulls
 * every entry strictly newer than oldVersion. Each bullet is classified
 * by its `### <severity>` heading.
 *
 * No CHANGELOG present? Module bumps are flagged `severity: "unknown"`
 * so reviewers know to read the diff manually.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { exists } from './fs-helpers.js'


export type Severity = 'safe' | 'review' | 'breaking' | 'unknown'


export type ChangelogEntry = {
  /** Module id this entry applies to. */
  moduleId: string
  /** Version this entry describes. */
  version: string
  /** Severity bucket the bullet was under. */
  severity: Severity
  /** Bullet text — markdown stripped of leading bullet character. */
  message: string
}


export type ModuleBump = {
  moduleId: string
  /** Version from the prior render's manifest, if known. */
  fromVersion: string | null
  /** Version selected by the current render. */
  toVersion: string
  /** Sorted list of entries — earliest version first. */
  entries: ChangelogEntry[]
}


export type UpgradeReport = {
  bumps: ModuleBump[]
  /** Pre-computed buckets for the human report. */
  safeCount: number
  reviewCount: number
  breakingCount: number
  unknownCount: number
}


/**
 * Compare two versions in semver-lite. We don't import a full semver
 * library because module versions are MAJOR.MINOR.PATCH only — no
 * pre-releases, no build metadata. Returns -1/0/1 (a<b/a==b/a>b).
 */
export function compareVersions(a: string, b: string): number {
  const ap = a.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const bp = b.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const len = Math.max(ap.length, bp.length)
  for (let i = 0; i < len; i++) {
    const av = ap[i] ?? 0
    const bv = bp[i] ?? 0
    if (av < bv) return -1
    if (av > bv) return 1
  }
  return 0
}


/**
 * Parse a single module's CHANGELOG.md into entries. Returns [] for
 * missing / unparseable files.
 */
export async function parseChangelog(
  moduleRoot: string,
  moduleId: string,
): Promise<ChangelogEntry[]> {
  const changelogPath = path.join(moduleRoot, 'CHANGELOG.md')
  if (!(await exists(changelogPath))) return []

  let raw: string
  try {
    raw = await readFile(changelogPath, 'utf-8')
  } catch {
    return []
  }

  const entries: ChangelogEntry[] = []
  let currentVersion: string | null = null
  let currentSeverity: Severity = 'unknown'

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    // Version heading: "## 1.2.0" or "## 1.2.0 — 2026-05-22"
    const versionMatch = /^##\s+([0-9]+\.[0-9]+\.[0-9]+)\b/.exec(line)
    if (versionMatch?.[1]) {
      currentVersion = versionMatch[1]
      currentSeverity = 'unknown'
      continue
    }
    // Severity heading: "### safe" / "### review" / "### breaking"
    const sevMatch = /^###\s+(safe|review|breaking)\b/i.exec(line)
    if (sevMatch?.[1]) {
      currentSeverity = sevMatch[1].toLowerCase() as Severity
      continue
    }
    // Bullet line
    const bulletMatch = /^[-*]\s+(.+)$/.exec(line.trimStart())
    if (bulletMatch?.[1] && currentVersion) {
      entries.push({
        moduleId,
        version: currentVersion,
        severity: currentSeverity,
        message: bulletMatch[1].trim(),
      })
    }
  }

  return entries
}


export type BuildArgs = {
  /** moduleId → version from the prior render (e.g. prior recipe.json).
   * Pass `{}` when nothing is known (first install). */
  priorVersions: Record<string, string>
  /** moduleId → version from the about-to-render plan. */
  currentVersions: Record<string, string>
  /** Absolute path to the workspace's modules/. */
  modulesRoot: string
}


/**
 * Build an upgrade report from prior + current module version maps.
 * Reads each module's CHANGELOG.md, classifies bullets into severity
 * buckets, returns the categorized totals + per-module bump list.
 */
export async function buildUpgradeReport(
  args: BuildArgs,
): Promise<UpgradeReport> {
  const { priorVersions, currentVersions, modulesRoot } = args
  const bumps: ModuleBump[] = []
  let safe = 0
  let review = 0
  let breaking = 0
  let unknown = 0

  for (const [moduleId, toVersion] of Object.entries(currentVersions)) {
    const fromVersion = priorVersions[moduleId] ?? null
    // Skip if version unchanged (no entries to show).
    if (fromVersion && compareVersions(fromVersion, toVersion) === 0) continue

    const allEntries = await parseChangelog(
      path.join(modulesRoot, moduleId),
      moduleId,
    )
    const newer = allEntries.filter((e) => {
      if (!fromVersion) return true // first-time install → show everything
      return compareVersions(fromVersion, e.version) < 0
    })

    if (newer.length === 0) {
      // No changelog or no entries above the threshold → unknown bucket
      bumps.push({
        moduleId,
        fromVersion,
        toVersion,
        entries: fromVersion ? [] : [],
      })
      unknown += fromVersion ? 1 : 0
      continue
    }

    bumps.push({ moduleId, fromVersion, toVersion, entries: newer })
    for (const e of newer) {
      if (e.severity === 'safe') safe += 1
      else if (e.severity === 'review') review += 1
      else if (e.severity === 'breaking') breaking += 1
      else unknown += 1
    }
  }

  return {
    bumps,
    safeCount: safe,
    reviewCount: review,
    breakingCount: breaking,
    unknownCount: unknown,
  }
}
