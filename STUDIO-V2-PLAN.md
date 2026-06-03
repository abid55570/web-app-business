# Studio v2 — Application Editor Plan

**Vision:** Canva for applications. Non-tech user opens any wizard-generated app and can View → Set → Analyze → Edit → Change → Save → Export without touching code.

**Cadence:** Sprint-by-sprint. Wait for user "next" approval between sprints.

**Element model:** Element-level (full Canva). Every button / text / image / icon inside every section is independently selectable + editable.

**Thumbnails:** Real screenshots via Playwright, generated on-demand + cached. Ships in Sprint 1.

---

## Sprint 1 — Foundation + visual library (10–12 hours)

**Ships:**
- `/edit/[id]` redesigned to "App Editor" mode
- Top: tabs per page (Home, /pricing, /about, /docs, /blog, /signup, /login, /dashboard)
- Center: live iframe of the actual app running on localhost:3000
- Left rail: visual section palette grouped by category — **real screenshots** of each of 547 sections
- Right rail: properties panel — shows props of currently-selected section
- Bottom: status bar (dev server health, last save, unsaved indicator)
- Save button → patches recipe + reruns wirer + reloads iframe
- "Sections in this page" list (drag-reorder + remove + add)

**Foundation laid for Sprint 2:**
- `data-bd-element="<sectionId>:<elementPath>"` attribute injected into every renderable HTML node by a new wirer pass — gives every button/text/image a unique selector
- Postmessage protocol between Studio (parent) and app iframe (child) — `{ type: 'select', elementId }`, `{ type: 'update', elementId, patch }`, `{ type: 'requestSelection' }`
- Studio injects a small `<script>` into the iframe via a Next middleware OR a dev-only `_studio.tsx` wrapper that listens for messages

**Backend additions:**
- New wirer step: `derive-element-ids.ts` — post-processes section TSX files to inject `data-bd-element` attrs on rendered tags
- New API: `GET /api/sections/thumbnail/[id]` — returns cached PNG screenshot, generates on miss via Playwright (~1.5s first time, cached after)
- New script: `pnpm thumbnails` to pre-generate all 547 thumbnails in batch (one-time job, ~12 min)

**Dependencies added:**
- `playwright` (~200MB) in dev dependencies of `apps/studio`

**Sprint 1 acceptance:**
- Open `/edit/<wizard-id>` shows pages tabs + iframe + visual palette
- Click a section card in palette → adds it to current page
- Edit props in right panel → saves to recipe → iframe reloads → see change
- 547 section thumbnails visible (rolling generation if not pre-baked)

---

## Sprint 2 — Element-level Canva editing (15–20 hours)

**Ships:**
- Click any button/text/image inside the iframe → outlined with handles
- Right panel populates with element-specific editors:
  - **Text element**: contenteditable inline + font/size/weight/color
  - **Image**: asset picker (upload / URL / Unsplash) + alt + fit
  - **Button**: text + link + color + size + variant
  - **Container**: padding / margin / background
- Color picker with brand palette + custom
- Undo/redo (Cmd+Z / Cmd+Shift+Z) — keeps a 50-step history
- Breadcrumb: Page > Section > SubElement
- Multi-select (Cmd+click)
- Element delete with backspace
- Inline edits write back to a new `studio-overrides.json` keyed by `data-bd-element` selectors
- Wirer reads `studio-overrides.json` at render time and patches the generated HTML/JSX

**Architectural foundation:**
- Sections need to be REWRITTEN to use element-ID injection helpers — large catalog refactor (547 files)
- OR: wirer post-processes built sections with an AST pass adding `data-bd-element` attrs automatically — less invasive but more complex
- Decision: try AST post-process first; fallback to manual injection on sections where AST fails

**Sprint 2 acceptance:**
- Click a button on /dashboard → it highlights → right panel lets you change text + color → live updates
- Refresh page → change persists (saved to studio-overrides.json)
- Regenerate via wizard → change still there (overrides applied)

---

## Sprint 3 — Structural + theme + library polish (8–10 hours)

**Ships:**
- Drag pages in tabs to reorder
- Drag sections in left panel to reorder within a page
- Drop new section from palette into the iframe directly (with drop-zones highlighted)
- Duplicate selected section (Cmd+D)
- Theme switcher in toolbar: preview 60+ theme packs as you click — re-skins iframe live
- Brand color picker in toolbar: drag → all sections re-render with new accent
- Sprint 1 thumbnails refresh: regenerate on demand if section file changed
- Recently-used + favorites in section palette
- Search in palette with fuzzy match

**Sprint 3 acceptance:**
- Reorder /pricing before /about by dragging tabs → recipe.extraPages reordered → next regen reflects it
- Click "aurora" theme pack → iframe re-renders entire site with new colors instantly
- Save → recipe.theme.pack updates

---

## Sprint 4 — Module code editor + export + deploy (14–18 hours)

**Ships:**
- Bottom "Modules" tab: tree view of every installed module
- Click module → file list → click file → opens in **Monaco editor** with Python/TypeScript syntax highlight
- Edit + save (Cmd+S) → writes to `overrides/backend/<module>/<file>` or `overrides/frontend/...`
- Lint warnings inline (Python: pyright via lsp, TS: tsserver)
- "Pending changes" panel: git-style diff before save
- Version history: every save stamped + revertable
- Module config knobs (from module.yaml) editable as form (not raw code) — friendly for non-tech
- Module dependency graph viewer (DAG of what depends on what)

**Export menu:**
- 📦 Download ZIP — bundles `output/<wizard-id>/` as zip
- 🐳 Docker compose up — runs `docker compose -f docker-compose.dev.yml up --build` in a terminal
- ▲ Deploy to Vercel — OAuth → import project → deploy (Vercel API)
- 🎨 Deploy to Render — OAuth → blueprint → deploy
- 🚂 Deploy to Railway — token-based deploy
- Status panel: build logs, deploy URL, "your app is live at https://..."

**Sprint 4 acceptance:**
- Edit router.py in Monaco → save → overrides written → regen preserves edit
- Click "Deploy to Vercel" → OAuth flow → ~30s later live URL shown
- Click "Download ZIP" → browser downloads zip of generated app

---

## Effort summary

| Sprint | Hours | Risk | What you can do after |
|--------|-------|------|------------------------|
| **S1** | 10–12 | Med (Playwright integration) | See your app, browse 547 sections visually, add/remove/edit props |
| **S2** | 15–20 | **High** (element-level is the hardest part of any visual editor) | Edit text/color/image inline like Canva |
| **S3** | 8–10 | Low | Drag reorder, theme switcher |
| **S4** | 14–18 | High (Vercel/Render APIs + Monaco) | Edit module code, deploy with one click |
| **Total** | **47–60 hours** | | Full Canva-for-apps |

---

## Key trade-offs locked in

1. **Element-level editing** chosen over section-level. ~4x more work but matches the vision.
2. **Real Playwright thumbnails** chosen over color cards. +6h to Sprint 1, +200MB devDep, much better visual fidelity.
3. **Sprint-by-sprint** cadence. Each sprint ends with a commit, push, and "next?" approval before continuing.

---

## What this DOESN'T include (deliberately deferred)

- AI assist ("rewrite this hero in a more playful tone" — model call)
- Collaboration (multi-cursor editing — requires WebSockets + CRDT)
- A/B testing UI
- Analytics dashboard inside Studio
- Custom domain wizard (covered partly in deploy)
- Mobile app target (only web)

These are real and important. They're Phase 5+ — separate plan.

---

## Status

**Waiting for "next" → start Sprint 1.**
