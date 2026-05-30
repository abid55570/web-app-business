# User manual

Welcome to **b-dash Studio** — a visual builder for assembling complete web apps from pre-built sections. No code required.

This manual walks you through every feature of the Studio interface and how to turn what you build into a real, deployable app.

> **Looking for setup instructions?** Read [LOCAL-SETUP.md](./LOCAL-SETUP.md) first.
> **Looking for env-var reference?** See [ENV-VARS.md](./ENV-VARS.md).

---

## Table of contents

1. [What is b-dash?](#1-what-is-b-dash)
2. [First time opening the Studio](#2-first-time-opening-the-studio)
3. [The Studio interface](#3-the-studio-interface)
4. [Building your first page](#4-building-your-first-page)
5. [Working with sections](#5-working-with-sections)
6. [Editing properties](#6-editing-properties)
7. [Multiple pages](#7-multiple-pages)
8. [Themes](#8-themes)
9. [Viewport preview (mobile / tablet / desktop)](#9-viewport-preview)
10. [Saving · undo · snapshots](#10-saving--undo--snapshots)
11. [Asset library (images & uploads)](#11-asset-library)
12. [Sign in · workspaces · teammates](#12-sign-in--workspaces--teammates)
13. [Comments & collaboration](#13-comments--collaboration)
14. [Generating a real app from your design](#14-generating-a-real-app)
15. [Templates & reuse](#15-templates--reuse)
16. [Keyboard shortcuts](#16-keyboard-shortcuts)
17. [Frequently asked questions](#17-faq)
18. [Glossary](#18-glossary)

---

## 1 · What is b-dash?

b-dash gives you two things:

1. **A catalog** of 538 pre-built sections (hero blocks, pricing tables, FAQs, forms, etc.), 40 3D scenes, 8 illustration packs, 75 themes, 110 email templates, and 220 animation presets — everything a modern web app needs.
2. **A visual builder (the Studio)** where you drag those sections together into pages, edit them in plain English, then click one button to turn it into a **real, working web app** (Next.js frontend + FastAPI/Django backend + Postgres database).

You don't need to write any code. You don't need to think about deploys until you're ready. The Studio does the hard parts; you focus on the design.

---

## 2 · First time opening the Studio

Open **http://localhost:3001** in your browser (or whatever URL your team has set up).

You'll see three panels:

- **Left** — Sections palette (538 building blocks, grouped by category)
- **Centre** — Canvas (where you build your page)
- **Right** — Properties (edits the selected block)

Above all three: a **top bar** with theme picker, viewport switcher, undo/redo, and Save/Render buttons.

If you're not signed in yet, you'll see a black **Auth bar** at the top. Click **Sign up** to create your workspace. You only need an email + name (no password required for the demo build — your admin can upgrade to OAuth later).

---

## 3 · The Studio interface

### Top bar

```
[b-dash Studio · 3 blocks · saved 14:22]   [🎨 nordic ▾] [📱💻🖥⬛]   [↶ ↷] [Reset] [▶ Render] [Save (⌘S)]
```

| Item | What it does |
|---|---|
| Block count | How many sections you've placed across all pages |
| Saved timestamp | When you last hit Save (green = recent) |
| Last action chip | Shows what just happened ("Edit heading", "Add Hero", etc.) |
| 🎨 Theme | Switch between 75 themes — preview updates instantly |
| Viewport buttons | Resize the canvas to mobile (390 px), tablet (768 px), desktop (1100 px), or full width |
| ↶ ↷ | Undo and redo — keeps 200 actions of history |
| Reset | Discard unsaved changes and reload from last save |
| ▶ Render | Generate a real app from your current design |
| Save | Persist your work to `studio-state.json` |

### Pages bar (below top bar)

```
[ Home  3 ] [ About  1 ] [ Pricing  2 ]  [+ page]
```

Each tab is a separate page. The number is its block count. **Double-click** any tab to rename. Click the **×** to delete (only works when you have 2+ pages — you can't delete your only page).

### Left panel — Sections

```
┌────────────────────┐
│ 🔍 Search sections │ ← Press "/" to focus
│ 538 of 538         │
├────────────────────┤
│ RECENT             │
│ 🎯 Hero with stats │
│ ✨ Feature grid    │
├────────────────────┤
│ HERO (24)          │
│ 🎯 Hero split      │
│ 🎯 Hero centered   │
│ ...                │
└────────────────────┘
```

The palette is grouped by category. Within each group, sections are sorted alphabetically. Recently-used sections pin to the top automatically.

Every section has an **emoji icon** matching its category (🎯 hero, 💰 pricing, ❓ faq, etc.) — a quick visual hint of what kind of block it is.

### Right panel — Properties

When you select a block on the canvas, this panel fills with its editable properties. Each property is a real input — color swatches for colors, image gallery for images, row editor for lists. **No JSON. Ever.**

If no block is selected, this panel says "Click a block to edit its props."

---

## 4 · Building your first page

Let's build a landing page. Three sections: a hero, a feature grid, and a call-to-action.

### Step 1 · Add a hero

1. In the left palette, type "hero" in the search box.
2. Click **Hero with stats** (or any other hero you like).

A schematic block appears on the canvas. You'll see a coloured bar, a placeholder heading, and a button-shape. The block is automatically selected.

### Step 2 · Edit the heading

You have two ways:

- **On the canvas** — click directly on the heading text "— text —" and start typing. Press <kbd>Tab</kbd> or click elsewhere to confirm.
- **In the right panel** — find the "Heading" property and type into the text input.

Either way, the schematic updates immediately.

### Step 3 · Add a feature grid below

1. Search "feature" in the palette.
2. **Drag** "Feature grid 3-col" from the palette and drop it just below your hero. A purple ribbon shows where it will land.

   (Or just click — new sections always append to the end of the current page.)

### Step 4 · Add a CTA at the bottom

1. Search "cta".
2. Click "CTA gradient block".

Your page now has three blocks. Try this:

- Click the hero block, then in the right panel find a colour property and click one of the 12 theme swatches.
- Click any block on the canvas and press <kbd>⌘D</kbd> (or <kbd>Ctrl+D</kbd> on Windows) to duplicate.
- Drag a block by its grip handle (⋮⋮) and drop it in a different position.

### Step 5 · Save

Press <kbd>⌘S</kbd> (or click **Save** in the top bar). You'll see "saved 14:22" appear in green.

---

## 5 · Working with sections

### Inserting

Three ways:

1. **Click** a palette item → appends to the bottom of the current page
2. **Drag** a palette item → drop on a specific zone (you'll see purple ribbons between blocks)
3. **Press / first**, type a search term, click the result

### Selecting

Click anywhere on a block. Its border highlights in the category's colour and the right Properties panel fills with that block's editable props.

### Reordering

- Drag the **⋮⋮ grip** at the top of any block to a new position
- Or click the **↑ / ↓** arrows on the block header
- Or use <kbd>⌘↑</kbd> / <kbd>⌘↓</kbd> with the block selected

### Duplicating

- Click the **⎘** icon on the block header
- Or press <kbd>⌘D</kbd>

The duplicate appears right below the original with all properties copied.

### Copying between pages

1. Select a block on page A.
2. Press <kbd>⌘C</kbd>.
3. Switch to page B.
4. Press <kbd>⌘V</kbd>.

The block appends to the end of page B.

### Deleting

- Click the **×** icon
- Or select and press <kbd>⌫ Backspace</kbd> / <kbd>Delete</kbd>

Deletes are undoable — press <kbd>⌘Z</kbd> if you change your mind.

---

## 6 · Editing properties

The Properties panel auto-picks the right input for each property type.

### Text (`text` and `textarea`)

Just type. Multi-line for textareas.

### Numbers

Step buttons or arrow keys. Min/max limits enforced where set.

### Colors

```
┌─────────────────────────┐
│ ▪ ▪ ▪ ▪ ▪ ▪              │ ← 12 theme swatches, click to apply
│ ▪ ▪ ▪ ▪ ▪ +              │ ← + opens hex/custom
├─────────────────────────┤
│ 🎨 #6366f1               │ ← native colour picker + hex input
└─────────────────────────┘
```

Property names containing `color`, `bg`, `tint`, `fill`, or `stroke` automatically get the colour picker, even when their underlying type is plain text.

### Images

```
┌──────────────────────────────────┐
│ [📷 preview] [URL or paste here] │
│              [Gallery ▾]          │
├──────────────────────────────────┤
│ [mountain] [office] [people]    │ ← starter gallery (Unsplash)
│ [tech]     [product] [abstract] │
└──────────────────────────────────┘
```

Three ways to set an image:

1. **Paste a URL** in the text field
2. **Pick from gallery** — built-in Unsplash starter images
3. **Upload your own** — see [Asset library](#11-asset-library)

Property names containing `image`, `photo`, `avatar`, `logo`, `poster`, `cover`, or `thumbnail` get the image picker automatically.

### Selects / dropdowns

A native dropdown listing every allowed value. The currently-selected option shows by default.

### Lists / arrays

For props that take a list (e.g. "Tabs", "Features", "Posts"):

```
┌────────────────────────────────┐
│ #1                  [↑ ↓ ×]    │
│ [field 1: text input]          │
│ [field 2: text input]          │
│ [+ add key…]                   │
├────────────────────────────────┤
│ #2                  [↑ ↓ ×]    │
│ ...                            │
└────────────────────────────────┘
                       [+ Add row]
```

Click **+ Add row** to insert a new item. Within each item:

- Edit existing fields directly
- Type a key name in **+ add key…** and press <kbd>Enter</kbd> to add a new property
- Use **↑ ↓ ×** to reorder or remove rows

---

## 7 · Multiple pages

Click **+ page** in the pages bar to create a new page. You'll be prompted for a name. The page gets a slugified route (e.g. "About us" → `/about-us`).

**Double-click** any page tab to rename. Press <kbd>Enter</kbd> to confirm or <kbd>Esc</kbd> to cancel.

**Click ×** on a tab to delete (with confirmation). You always need at least one page.

Each page has its own independent block list. Switching pages preserves everything. The active page is shown by the blue tab.

---

## 8 · Themes

The Studio supports **75 built-in themes** ranging from minimal/professional to expressive/playful. Each theme is a complete colour + typography + spacing system.

Click the **🎨 nordic ▾** dropdown in the top bar to switch. Examples:

- **minimal**, **glass**, **soft** — clean SaaS / dashboard
- **brutalist**, **terminal**, **mono** — bold / developer-focused
- **candy**, **helio**, **sunset** — vibrant / marketing
- **editorial**, **paper**, **magnolia** — long-form content / blogs
- **cyberpunk**, **neon**, **midnight** — gaming / dark-mode
- **corporate-blue**, **navy**, **azure** — enterprise / finance

Every section's `bestWithThemes` tag suggests which themes pair well with which sections (visible in the section description on hover).

Theme changes apply instantly to the schematic preview. The generated app uses these themes verbatim.

---

## 9 · Viewport preview

The viewport buttons in the top bar let you preview how your page will look at different screen sizes:

| Button | Width | Use for |
|---|---|---|
| 📱 | 390 px | iPhone-class mobile |
| 💻 | 768 px | iPad-class tablet |
| 🖥 | 1100 px | Desktop |
| ⬛ | full | Use all available canvas width |

The canvas frame resizes immediately. Block layouts that change at breakpoints (responsive grids, hidden mobile-only blocks) will reflow.

> **Note** — the schematic preview is a visual approximation. For pixel-accurate responsive testing, generate the app and view it in a real browser.

---

## 10 · Saving · undo · snapshots

### Save

<kbd>⌘S</kbd> or click the **Save** button. Persists your full workspace state (all pages, all blocks, all properties) to `studio-state.json`.

The next time the Studio loads, it picks up from where you left off.

### Undo / redo

The Studio keeps the **last 200 actions** of history. Every action is named:

- "Add Hero"
- "Edit heading"
- "Move block down"
- "Delete block"
- "Add page Pricing"
- etc.

Press <kbd>⌘Z</kbd> to undo, <kbd>⌘⇧Z</kbd> (or <kbd>⌘Y</kbd>) to redo. The "Last action" chip in the top bar shows what the most recent action was.

### Snapshots (version history)

For longer-term backup or named milestones, use **snapshots**. Snapshots capture the full workspace state at a moment in time.

Open the History drawer (Studio menu → History) to:

- **Save a snapshot** with a label like "Pre-launch v1", "Q4 redesign", "Client review March 31"
- **List all snapshots** with timestamp + page count + block count
- **Restore** any snapshot (replaces current state — you'll be asked to confirm)
- **Delete** snapshots you no longer need

Snapshots are stored in `output/studio-snapshots.json` and survive across sessions.

---

## 11 · Asset library

For uploading and reusing your own images.

Open via the Asset library button (or any image picker → "Browse uploaded"):

```
┌────────────────────────────────┐
│ Asset library                  │
├────────────────────────────────┤
│ [+ Upload image]                │
├────────────────────────────────┤
│ [thumb] [thumb] [thumb]        │
│ hero.jpg cards.png logo.svg    │
│   ×        ×        ×          │
└────────────────────────────────┘
```

- **Upload**: click **+ Upload image** → pick a file. Stored in `output/studio-assets/`.
- **Use**: click any thumbnail to insert its URL into the active image property.
- **Delete**: click the **×** on the thumbnail (with confirmation).

**Note for production deployments**: your admin can swap the local-FS backend for S3/Cloudflare R2 via the `STUDIO_ASSETS_BACKEND=s3` env var. See [ENV-VARS.md](./ENV-VARS.md) §1.

---

## 12 · Sign in · workspaces · teammates

### Sign up / sign in

Top-bar **Sign up** asks for your name + email. No password — a session cookie is set automatically. The first user who signs up becomes the **owner** of a new workspace named "Your-name's workspace".

**Sign in** with an existing email reissues your session cookie.

> Your admin can swap the cookie-based auth for next-auth (email magic-link, Google, GitHub, Microsoft, Apple) via the `STUDIO_AUTH_PROVIDER=nextauth` env var.

### Workspaces

A **workspace** holds your pages, snapshots, comments, and uploaded assets. Each user belongs to one or more workspaces.

The Auth bar shows your current workspace + role:

```
👤 Sarah · Acme Cloud workspace · role: editor
```

### Roles

| Role | Can do |
|---|---|
| **owner** | Everything — invite/remove teammates, change roles, delete the workspace, edit pages, render, manage assets |
| **editor** | Edit pages, manage pages/snapshots/comments/assets, render to app |
| **viewer** | Read-only — can browse pages and comments but can't edit, save, render, or upload |

### Inviting teammates

(Owner only) Use the Members modal (or POST to `/api/workspaces/members` programmatically) with:

- **Email** — must match a user who's already signed up
- **Role** — `owner`, `editor`, or `viewer`

Removing a teammate cancels their access immediately. Removing the last owner is blocked.

---

## 13 · Comments & collaboration

### Comments

Leave Figma-style comments on any page or specific block. Useful for design reviews, "needs copy", "approve this", etc.

Open the Comments panel (right side, below the Properties pane). For each comment:

- See author + body + timestamp
- Reply (threaded under the original)
- **Resolve** — strikes through the comment so it's clear it's been addressed
- Delete (your own comments only, unless you're an owner)

### Real-time co-editing

When your admin enables it (via `YJS_WEBSOCKET_URL` + adding `yjs` deps — see [DEPLOYMENT.md](./DEPLOYMENT.md) §2), the Studio supports concurrent editing:

- Multiple users can edit the same workspace simultaneously
- Each user gets a coloured **presence cursor** showing what they're hovering / editing
- Changes merge automatically with CRDT conflict resolution
- No "save" wars — every keystroke is synchronised

Until your admin enables it, the Studio runs in single-user mode. Multiple users on the same workspace will overwrite each other's saves.

---

## 14 · Generating a real app

The whole point of the Studio is to produce a working, deployable web app. Click the **▶ Render** button in the top bar.

The Render modal opens:

```
┌─────────────────────────────────────────────┐
│ Render to app                          ×    │
├─────────────────────────────────────────────┤
│ DIFF VS LAST SAVE                           │
│ • home    [modified] · +2 added · -1 removed │
│ • about   [new-page] · +3 added              │
├─────────────────────────────────────────────┤
│ GENERATE                                    │
│ [Render now]                                │
└─────────────────────────────────────────────┘
```

**Diff** shows what changed since your last save: added/removed/edited blocks per page. Useful for sanity-checking before generation.

**Render now** triggers the wirer. You'll see progress lines stream live:

```
✓ 137 files written across 15 modules.
→ /tmp/studio-1234567890
```

The output path is shown — that's your complete app. You can:

- Open it in your editor: `code /tmp/studio-1234567890`
- Run it locally: `cd /tmp/studio-1234567890 && pnpm install && pnpm dev`
- Deploy it: see [DEPLOYMENT.md](./DEPLOYMENT.md)

Each render is a fresh generated copy — you don't lose any previous renders. Your design (the studio-state.json) is the source of truth; rendering is repeatable.

### What gets generated

For a typical starter:

- **Frontend** (Next.js 15) — all your pages as routes, all your sections as React components, theme tokens as Tailwind config, animation presets compiled in
- **Backend** (FastAPI or Django) — auth, payment, notification, telemetry, and other modules wired together
- **Database** — Postgres or SQLite schema with migrations
- **Email templates** — HTML files for transactional emails
- **Docker** — `Dockerfile` + `docker-compose.yml` if `deployTarget: docker-zip`
- **Deploy configs** — `vercel.json` / `render.yaml` / `fly.toml` per the chosen target

---

## 15 · Templates & reuse

### Saving a template

Built a great "Hero + features + testimonial + CTA" combo and want to reuse it on another page? Save it as a template:

1. Select a sequence of blocks (shift-click or via API)
2. Open the Templates modal → **Save current as template**
3. Give it a name + description

Templates are workspace-scoped and persist across sessions.

### Inserting a template

From the Templates modal:

1. Browse the gallery
2. Click any template → all its blocks insert at the cursor position
3. Each insertion creates fresh `instanceId`s so you can have multiple copies

Useful templates to save early:

- **Standard hero** — your brand's go-to top-of-page combo
- **Pricing combo** — pricing table + FAQ + CTA
- **Blog post layout** — blog hero + sticky share + content + related-posts
- **Footer + legal** — your standard footer + cookie banner

---

## 16 · Keyboard shortcuts

| Shortcut | Action |
|---|---|
| <kbd>/</kbd> | Focus the section search |
| <kbd>Esc</kbd> | Deselect current block |
| <kbd>⌘Z</kbd> / <kbd>Ctrl+Z</kbd> | Undo |
| <kbd>⌘⇧Z</kbd> / <kbd>⌘Y</kbd> / <kbd>Ctrl+Y</kbd> | Redo |
| <kbd>⌘S</kbd> / <kbd>Ctrl+S</kbd> | Save |
| <kbd>⌘D</kbd> / <kbd>Ctrl+D</kbd> | Duplicate selected block |
| <kbd>⌘C</kbd> / <kbd>Ctrl+C</kbd> | Copy selected block |
| <kbd>⌘V</kbd> / <kbd>Ctrl+V</kbd> | Paste block |
| <kbd>⌘↑</kbd> / <kbd>Ctrl+↑</kbd> | Move selected block up |
| <kbd>⌘↓</kbd> / <kbd>Ctrl+↓</kbd> | Move selected block down |
| <kbd>⌫</kbd> / <kbd>Delete</kbd> | Delete selected block |
| <kbd>Tab</kbd> (inside text) | Confirm edit + jump to next field |

Shortcuts don't fire when you're typing in an input/textarea/contenteditable, so you can use letter keys freely while editing.

---

## 17 · FAQ

### Why don't I see the actual rendered design — just rough boxes?

The canvas shows **schematic previews** (category-coded wireframes with your real text). True pixel-accurate rendering will come in a future update where the Studio bundles Puck for full component rendering. Until then, to see your design accurately:

1. Save your work.
2. Click **▶ Render** to generate the real app.
3. Run it locally (`pnpm dev` in the generated folder) and open it in a real browser.

The schematic is fast and lets you focus on structure; the real render gives you the pixel-truth.

### My save button says "saved" but my teammate doesn't see my changes

Are you on the same workspace? Check the Auth bar — both of you need to be members of the same workspace.

If real-time co-editing isn't enabled (default), your teammate needs to **Reset** to pull your latest changes. To enable real-time, ask your admin about `YJS_WEBSOCKET_URL`.

### Can I undo a save?

Yes — undo crosses save boundaries. Press <kbd>⌘Z</kbd> repeatedly to walk backwards through your last 200 actions, regardless of when you saved. Save again to persist the rewound state.

For longer-term undo (days/weeks back), use **Snapshots** (§10).

### I deleted a page by mistake

Press <kbd>⌘Z</kbd> immediately — page deletes are in the undo history.

If you've left the Studio since then, check **Snapshots** — if you saved one before the delete, restore it.

### What's the difference between "Reset" and undoing all the way?

- **Reset** — discards all unsaved changes and reloads from the last `studio-state.json` save. Cannot be undone.
- **Undo all** — walks back through every action one at a time, capping at your 200-action history limit. Can be redone with <kbd>⌘⇧Z</kbd>.

Use **Reset** when you've made a mess and want a clean slate from your last save. Use **Undo** for precise step-by-step rollback.

### Can I import an existing website's design?

Not yet. Currently you build from scratch using the section catalog. Auto-importing from a URL or Figma file is on the roadmap.

### How big is the section catalog?

- **538 sections** across 44 categories
- **40 3D scenes** (pure CSS, no three.js required)
- **8 illustration packs** (64 SVGs total)
- **75 themes**
- **220 animation presets**
- **110 email templates**

### Will adding new sections require redeployment?

The Studio reads sections from disk at request time. If your admin drops a new section into `sections/<category>/<id>/`, the Studio sees it on next page reload — no rebuild needed.

### Where is my data stored?

By default:

- **Page designs** — `studio-state.json` in the project root
- **Snapshots** — `output/studio-snapshots.json`
- **Uploaded assets** — `output/studio-assets/`
- **Templates** — `output/studio-templates.json`
- **Users/workspaces/sessions** — `output/studio-workspaces.json`
- **Comments** — `output/studio-comments.json`

In production deployments, your admin will typically move these to Postgres + S3. See [DEPLOYMENT.md](./DEPLOYMENT.md) §2.

### I get "Render failed" — what now?

Open the **Render** modal again — the log tail (last 12 lines) shows the wirer's error output. Common causes:

- Missing env vars — see [ENV-VARS.md](./ENV-VARS.md)
- A section's required prop is empty (the wirer validates Zod schemas at render time)
- The starter recipe references a module that's been removed

Fix the issue, save, render again.

---

## 18 · Glossary

| Term | Meaning |
|---|---|
| **Section** | A single visual block — a hero, a feature grid, a CTA, etc. Picked from the palette and placed on a page. |
| **Page** | A collection of sections in order. Each page becomes one route in the generated app (e.g. `/`, `/about`, `/pricing`). |
| **Workspace** | A team's shared space — its own pages, snapshots, assets, members. Auth scopes everything here. |
| **Block** (or **block instance**) | One specific placement of a section on a page, with its own property values. The same section type (e.g. "Hero split") can appear many times as different blocks. |
| **Property** | An editable field on a block — heading, color, image, list of items, etc. Defined per-section in the section manifest. |
| **Schematic preview** | The simplified visual representation of a block on the canvas. Not the final rendered design. |
| **Render** | The act of turning your Studio design into a real, deployable web app via the wirer. |
| **Wirer** | The library under the hood that does the rendering. You never interact with it directly via the Studio. |
| **Starter** | A pre-configured "recipe" for a kind of app (e.g. SaaS, marketplace, blog). Determines which modules get included on render. |
| **Module** | A piece of backend functionality (auth, payments, email, etc.). Bundled into starters by the recipe. |
| **Theme** | A complete colour + typography + spacing system. Affects every block uniformly. 75 ship by default. |
| **Snapshot** | A named, point-in-time backup of your full workspace state. For long-term version history. |
| **Template** (in this app) | A reusable composition of blocks you've saved for one-click re-insertion. Not to be confused with email templates or starter recipes. |

---

## Need more help?

- **For setup issues** → [LOCAL-SETUP.md](./LOCAL-SETUP.md) "Troubleshooting"
- **For env vars** → [ENV-VARS.md](./ENV-VARS.md)
- **For deployment** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **For Docker** → [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md)

Welcome to b-dash. Have fun building. 🚀
