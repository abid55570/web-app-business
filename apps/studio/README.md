# @b-dash/studio-app — Visual builder

Next.js shell for the b-dash visual builder.

## What's here (Studio S0 + S1)

- 3-pane layout: **palette** (left) · **canvas** (center) · **properties** (right)
- Loads the section catalog from disk via `@b-dash/wirer`'s `scanSections`
- Generates Puck-shaped block manifests via `@b-dash/studio`'s `buildBlockManifest`
- In-memory page state — click palette items to append; click canvas items to edit
- Save → POST to `/api/save` which writes `studio-state.json` to the project root
- Reset → reload from disk

**S1 additions** (this iteration):
- **Palette fuzzy search** — `/` focuses search input · prefix/substring/char-order ranking
- **Recent blocks** pinned to top of palette (localStorage-backed, last 6)
- **Per-category color thumbnails** in palette · emoji hints (44 category styles)
- **Schematic canvas preview** — category-coded wireframe templates per block (hero / grid / list / band / card / inline / media); pulls real heading/body/title props into the schematic so changes show immediately on the canvas
- **Real rich pickers** replacing JSON textareas:
  - **ColorPicker** — 12 theme swatches + native `<input type=color>` + hex/var fallback
  - **ImagePicker** — URL input + built-in Unsplash starter gallery (mountain/office/people/tech/product/abstract)
  - **ArrayRepeater** — add/move/delete rows for arrays; primitive vs object detection; in-place key editing
- **Smart-type heuristics** — prop names matching `color|tint|bg|fill|stroke` auto-upgrade to ColorPicker; `image|photo|avatar|logo|poster|cover|thumbnail` auto-upgrade to ImagePicker — even when the underlying type is `text`
- **Keyboard shortcuts** — `/` focus search · `Esc` deselect block

## Run

```bash
pnpm --filter @b-dash/studio-app dev   # → http://localhost:3001
```

## Why "schematic" preview, not real TSX?

The catalog has 513 section component files. Bundling them all into
the Studio's Next.js dev build would explode compile time. Studio
**S5a** swaps the schematic preview for **real Puck** rendering
(Puck handles bundling natively + lazy-loads component modules per
drop).

## Roadmap

- **S2** — HTML5 drag-and-drop (palette → canvas, reorder); inline text
  editing on schematic; 200-action undo/redo with named entries; full
  keyboard shortcuts (⌫ delete, ⌘D duplicate, ⌘↑/↓ move, ⌘Z, ⌘⇧Z)
- **S3** — multi-page with Pages panel; theme switcher (live token
  swap); viewport switcher (sm/md/lg + custom slider); shared layout
  slots; per-page SEO
- **S4** — Render-to-app button calling wirer; diff preview;
  `studio.config.json` round-trip; `StudioStateSchema` validation
- **S5a** — Real Puck integration (replaces schematic with live
  component renders); asset library backed by S3/CDN; image cropping;
  Unsplash search
- **S5b** — Auth + workspaces + RBAC (viewer / editor / owner)
- **S5c** — yjs CRDT real-time co-editing; presence cursors;
  Figma-style block comments
- **S5d** — Templates marketplace; version history with named
  snapshots; mobile-responsive editor with touch DnD
