/** Per-session block clipboard. Survives across canvas selections, not reloads. */
import type { CanvasBlock } from './types'

let _clip: CanvasBlock | null = null

export function setClip(b: CanvasBlock | null) { _clip = b }
export function getClip(): CanvasBlock | null { return _clip }
