import type { PuckBlockManifest, PuckField } from '@b-dash/studio'

export type { PuckBlockManifest, PuckField }

/** One placed block on the canvas. */
export type CanvasBlock = {
  instanceId: string
  blockId: string
  props: Record<string, unknown>
}

/** Legacy single-page state (still read for backcompat). */
export type StudioPageState = {
  blocks: CanvasBlock[]
}

/** Per-page state. */
export type StudioPage = {
  id: string
  name: string
  route: string
  blocks: CanvasBlock[]
  seo?: {
    title?: string
    description?: string
    ogImage?: string
  }
}

/** Top-level workspace state — what /api/save persists. */
export type StudioMultiPageState = {
  pages: StudioPage[]
  activePageId: string
  theme?: string
}
