# @b-dash/studio

Phase 4 Studio v1 **foundation**. Turns a workspace's section catalog
into Puck-shaped block manifests + a top-level `StudioConfig` JSON
the editor frontend loads at boot.

The actual Puck UI shell (Layers · Properties · Theme · Pages panels)
lives in the customer-facing studio app — this package gives it the
data it needs.

## What's shipped (v1)

- `buildBlockManifest(section)` — converts one `Section` to a
  Puck `BlockManifest` (`{ id, displayName, category, fields, defaultProps }`).
- `buildAllBlockManifests(sections)` — pipeline for the wirer's
  `scanSections` output. Accepts raw `Section` or `{ manifest: Section }`.
- `buildStudioConfig({ blocks, themeTokens?, pages?, renderVersion })`
  — assembles the top-level JSON the editor loads.
- Type → field mapping:

  | SectionSchema `PropDef.type` | Puck field |
  | --- | --- |
  | `string` (multiline=false) | `text` |
  | `string` (multiline=true)  | `textarea` |
  | `number` | `number` |
  | `enum` | `select` (with `options[]`) |
  | `boolean` | `radio` |
  | `array` | `array` |
  | `json` | `object` |
  | `color`, `image` | `text` (URL field today; asset picker in wave 2) |

## What's NOT shipped (deferred to wave 2)

- The actual Puck UI shell (Next.js dev server, panels, drag/drop palette).
- `studio-state.json` persistence layer (Studio session → recipe round-trip).
- Wizard live-preview iframe at :3002.
- Visual data binding + conditional visibility (Phase 6 features).
- Yjs multi-user concurrent editing (Phase 6).

## Use

```ts
import { scanSections } from '@b-dash/wirer'
import { buildAllBlockManifests, buildStudioConfig } from '@b-dash/studio'

const loaded = await scanSections('./sections')
const blocks = buildAllBlockManifests(loaded)
const config = buildStudioConfig({
  blocks,
  themeTokens: theme.tokens,
  pages: [{ path: '/', layout: 'public' }],
  renderVersion: '0.1.0',
})
// → write to <out>/studio.config.json for the editor to load
```
