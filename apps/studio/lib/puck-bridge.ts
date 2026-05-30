/**
 * S5a — Puck integration bridge.
 *
 * The studio's home-grown schematic shell is the dev-mode default.
 * When `@measured/puck` is installed, this module exports a `toPuckConfig`
 * function that maps PuckBlockManifests to a real Puck `Config` object
 * — backed by lazy-imported section components.
 *
 * Status: SCAFFOLD. The `@measured/puck` dep is not yet installed in
 * apps/studio/package.json because that adds ~5 MB of editor + React
 * peerdeps to dev compile time. To activate:
 *
 *   pnpm --filter @b-dash/studio-app add @measured/puck
 *
 * Then swap `<Canvas>` in `app/page.tsx` for `<Puck config={cfg} data={state} />`
 * and remove the schematic preview path. The bridge below is ready.
 */
import type { PuckBlockManifest, PuckField } from './types'

/** Puck's runtime Config shape — declared locally so we don't import
 * Puck at build time while the dep is opt-in. */
export type PuckConfig = {
  components: Record<
    string,
    {
      fields: Record<string, PuckField>
      defaultProps?: Record<string, unknown>
      render: (props: Record<string, unknown>) => unknown
    }
  >
}

/** Convert our block-manifest list to a Puck Config. Each render is a
 * pure stub here — when Puck is installed, swap in real section
 * components lazy-loaded from `@b-dash/sections` (S5a wave 2). */
export function toPuckConfig(
  manifests: PuckBlockManifest[],
  renderFor: (id: string, props: Record<string, unknown>) => unknown,
): PuckConfig {
  const components: PuckConfig['components'] = {}
  for (const m of manifests) {
    components[m.id] = {
      fields: m.fields,
      defaultProps: m.defaultProps,
      render: (props) => renderFor(m.id, props),
    }
  }
  return { components }
}
