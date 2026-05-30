/**
 * @b-dash/studio — Phase 4 Studio v1 foundation.
 *
 * v1 ships the integration seam: a converter that turns a workspace's
 * section catalog (each `sections/<category>/<id>/section.yaml`) into a
 * **Puck-shaped block manifest** the visual editor mounts. The actual
 * Puck UI shell (Layers / Properties / Theme / Pages panels) lives in
 * the customer-facing studio app — this package gives it the data.
 *
 * Wave 2 will add:
 *   - PuckConfig generator (server-side render fallbacks for SSR)
 *   - Studio dev server (Next.js shell mounted at :3001)
 *   - studio-state.json persistence layer
 *   - Wizard live-preview iframe at :3002
 */
export {
  buildBlockManifest,
  buildAllBlockManifests,
  type PuckBlockManifest,
  type PuckField,
  type PuckFieldType,
} from './blocks.js'

export {
  buildStudioConfig,
  type StudioConfig,
} from './config.js'
