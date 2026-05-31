# Studio tutorial — build your first website in 20 minutes

This is for people who don't write code. By the end of this tutorial you'll have:

- ✅ Signed into the Studio
- ✅ Built a complete landing page with 5 sections
- ✅ Edited text, colors, and images visually
- ✅ Switched between themes to see your site in different styles
- ✅ Saved your work + generated a real, working app

Budget: **20 minutes** the first time.

> If you're a developer wanting to extend the catalog or generate apps from the CLI, see [DEV-TUTORIAL.md](./DEV-TUTORIAL.md) instead.

---

## What you'll be building

A simple landing page for an imaginary SaaS called "Bricklane Analytics":

```
┌─────────────────────────────────────────────┐
│  [Hero with heading + tagline + CTA button] │
├─────────────────────────────────────────────┤
│  [Logos of customers — trust strip]          │
├─────────────────────────────────────────────┤
│  [3 feature cards in a grid]                 │
├─────────────────────────────────────────────┤
│  [Customer testimonial quote]                │
├─────────────────────────────────────────────┤
│  [Final CTA — start free trial]              │
└─────────────────────────────────────────────┘
```

5 blocks. No code. About 20 minutes.

---

## Step 0 — Make sure the Studio is running

If a developer has set up the Studio for you, open the URL they gave you (probably `http://localhost:3001` for local, or `studio.your-company.com` for cloud).

You should see a 3-pane layout:

```
┌──────────────────────────────────────────────────────────────┐
│  b-dash Studio · 0 blocks    [🎨 nordic]  [↶ ↷] [Save]         │
├──────────────────────────────────────────────────────────────┤
│  [Home  0]  [+ page]                                         │
├──────────┬─────────────────────────────────┬──────────────────┤
│ Sections │ Empty canvas.                    │ Properties      │
│ (538)    │ Click or drag a section          │                 │
│          │ from the left palette.            │                 │
│ 🔍 ...   │                                  │                 │
│          │                                  │                 │
│ HERO     │                                  │                 │
│ 🎯 ...   │                                  │                 │
│          │                                  │                 │
└──────────┴─────────────────────────────────┴──────────────────┘
```

If you don't see this, ask whoever set it up. Or follow [LOCAL-SETUP.md](./LOCAL-SETUP.md) to start it yourself.

---

## Step 1 — Sign in (or skip if hosted on your laptop)

### Local dev mode

If running on your own laptop, there's no sign-in — you go straight to the Studio. Skip to Step 2.

### Hosted version

If running at a real URL like `studio.your-company.com`:

1. The top bar shows a black **Auth bar**: "Not signed in — Sign up / Sign in"
2. Click **Sign up**
3. Enter your **name** + **email**. No password (in dev MVP — your admin can swap to Google/GitHub OAuth later).
4. Click **Create account**
5. You're now signed in. The Auth bar shows: "👤 Your Name · Your-Name's workspace · role: owner"

You're now in your own workspace. Whatever you build stays in your workspace and your teammates (if you invite any) can see it.

---

## Step 2 — Add the hero section (3 min)

A "hero" is the big block at the top of any landing page — usually a headline, a tagline, and a call-to-action button.

1. In the **left palette**, find the search box at the top.
2. Type **"hero stats"** in the search box. The palette filters to ~5 matching sections.
3. Click **"Hero with stats"** (or any hero you like — try clicking different ones to see how each looks on the canvas).

The hero appears on the canvas. It's automatically selected (you'll see a blue border around it). The **right Properties pane** fills with editable fields.

### Edit the heading

Two ways — both work:

- **On the canvas** — click the heading text "— text —" right on the schematic. It becomes editable. Type **"Analytics that finally make sense"** and press <kbd>Tab</kbd>.
- **In the right pane** — find the **Heading** field and type the same text.

### Edit the subheading

In the right pane, find **Subheading** and type:

> Built for small teams. No setup. No SQL. Just answers.

### Change the button label

Find **Primary CTA label** in the right pane. Change it to **"Start free trial"**.

### See what you've got

Your canvas now shows a hero block with your real text. The font sizes and structure approximate the final design — the actual styling kicks in when you generate the app.

---

## Step 3 — Add a customer-logos trust strip (2 min)

This is the "as used by [logos]" band you see on every SaaS landing page. It builds trust.

1. Press <kbd>/</kbd> to focus the search again
2. Type **"logos trust"**
3. Click **"Features — icon row trust strip"** (or just "Logos cloud")

It appears below your hero on the canvas.

In the **right pane**, find **Items**. Click **+ Add row** to add a customer logo entry. For each row:

- **icon**: leave it as a default emoji like `🏢`
- **label**: company name (e.g. "Acme Inc.")

Add 4-6 rows. Real customer names look better than "Customer 1" placeholders.

---

## Step 4 — Add a 3-feature grid (3 min)

The classic "here's what makes us great" section.

1. Search **"feature grid"**
2. Click **"Feature grid 3-col"**

It appears below your trust strip.

In the right pane, find **Features**. Click **+ Add row** three times.

For each row, fill in:

| Row | icon | title | description |
|---|---|---|---|
| #1 | ⚡ | Lightning-fast | Reports in 200ms, not 20 seconds. |
| #2 | 📊 | Smart defaults | The right chart for every question, automatically. |
| #3 | 🔒 | Private by default | Your data never leaves your servers. SOC2-ready. |

---

## Step 5 — Add a customer testimonial (2 min)

1. Search **"quote"**
2. Click **"Quote with overlapping avatar stack"**

In the right pane:

- **Quote**: `"We replaced a 12-person analytics team with Bricklane. It just works."`
- **Context**: `Maya P. · Head of Growth at Acme`
- **Avatars**: Click + Add row, leave the fields default (the schematic will show placeholders)
- **Total user count**: `12000`

---

## Step 6 — Add the final call-to-action (1 min)

The bottom-of-page "what should they do next?" block.

1. Search **"cta gradient"**
2. Click **"CTA gradient block"**

In the right pane:

- **Eyebrow**: `Free 14-day trial`
- **Heading**: `Start in 60 seconds.`
- **Subheading**: `No credit card. No setup. Just answers.`
- **Primary CTA label**: `Get started →`

---

## Step 7 — Reorder, save, theme-switch (3 min)

You now have 5 blocks on the canvas: hero, logos, features, quote, CTA. Take a moment to admire.

### Reorder

If you want to swap blocks: drag any block by its **⋮⋮ grip handle** at the top of the block. Drop it where you want.

You can also use the **↑/↓ arrows** on each block header.

### Save

Press <kbd>⌘S</kbd> (Mac) or <kbd>Ctrl+S</kbd> (Windows). The top bar shows "saved 14:22" in green.

### Try a different theme

In the top bar, the theme dropdown shows "🎨 nordic" by default. Click it to switch:

- `nordic` — clean blue + grey, professional
- `aurora` — colorful gradients, fun
- `glass` — frosted glass, premium
- `editorial` — magazine-style typography
- `terminal` — dark mode, developer feel
- `candy` — bright pink + yellow, playful
- `brutalist` — bold, hard edges, no fluff

There are **75 themes**. Try 5-6 to see how dramatically the look changes — the underlying structure stays identical.

### Try a different viewport

In the top bar, click the **📱 (mobile)** button. The canvas resizes to phone width. Click 💻 for tablet, 🖥 for desktop. This previews how your layout reflows.

---

## Step 8 — Add a second page (2 min)

Real sites have multiple pages.

1. In the **pages bar** (below the top bar), click **+ page**
2. Type **"Pricing"** in the input that appears, press <kbd>Enter</kbd>

A new empty page tab appears. Click it to switch.

Add 3 blocks:

1. Search "pricing 3 tier" → click **Pricing table 3 tier**. In the right pane, add 3 rows under **Tiers** (e.g. "Free", "Pro $9", "Agency $49") with names + prices + a list of features per tier.
2. Search "faq" → click **FAQ — minimal vertical stack**. Add 3-4 common questions in **Items** rows.
3. Search "cta" → click **CTA trial banner**.

Save again with <kbd>⌘S</kbd>.

You now have a **Home** page (5 blocks) and a **Pricing** page (3 blocks). Click between the tabs to see them.

---

## Step 9 — Generate your real app (3 min)

What you've built so far is a design — a description of your site. To turn it into a real, runnable app, click the **▶ Render** button in the top bar.

A modal opens:

```
┌──────────────────────────────────────────────┐
│ Render to app                          ×     │
├──────────────────────────────────────────────┤
│ DIFF VS LAST SAVE                            │
│ • home    [modified]  +5 added · -0 removed │
│ • pricing [new-page]  +3 added              │
├──────────────────────────────────────────────┤
│ GENERATE                                     │
│ [Render now]                                 │
└──────────────────────────────────────────────┘
```

Click **Render now**. The wirer runs in the background. After ~30 seconds:

```
✓ Render succeeded
→ /tmp/studio-1234567890
```

That's your real app — Next.js frontend + FastAPI backend + Postgres schema + Docker config — at the path shown.

### To run it

If you have Docker:

```bash
cd /tmp/studio-1234567890
docker compose up -d --build
```

Then open http://localhost:3000 — your site is live with real styling, real responsive layouts, real backend APIs.

If you don't have Docker, ask a developer friend (or see [DEV-TUTORIAL.md](./DEV-TUTORIAL.md) §4).

---

## Step 10 — Common edits you'll do daily

### Change a colour everywhere at once

Open the **theme dropdown** in the top bar. Switch themes. Every section's colours update at the same time. This is much faster than editing per-block colours.

### Edit one specific block's colour

1. Click the block on canvas
2. In the right pane, find any property labelled "Color" or "Tint"
3. Click one of the **12 theme swatches**, or click the **+** to use a custom hex

### Add an image

1. Click a block with an image (hero, gallery, CTA with image)
2. In the right pane, find the image property
3. Either:
   - **Paste a URL** into the text box (any public image URL works — Unsplash, your own CDN)
   - **Click Gallery** for built-in starter images
   - **Click Upload** (if you have Pro tier) to upload your own

### Duplicate a block

Click the block → press <kbd>⌘D</kbd> (Mac) or <kbd>Ctrl+D</kbd> (Windows). A copy appears right below.

### Copy a block to another page

Click the block on Page A → <kbd>⌘C</kbd> → switch to Page B → <kbd>⌘V</kbd>.

### Undo a mistake

<kbd>⌘Z</kbd> walks back 1 step. Hold it down to walk back multiple. There's 200 steps of history.

### Save your work mid-session

<kbd>⌘S</kbd>. Or wait — every render also auto-saves first. But explicit saves are faster.

### Roll back to a known good version

Open the History drawer (Studio settings menu → History or similar). Save a **snapshot** before risky changes ("Before redesign · 2026-05-15"). To restore, click that snapshot → Restore.

---

## Step 11 — Invite a teammate (Hosted version only · 2 min)

If you're on the hosted Studio with a workspace:

1. Go to Settings → Members (or use the API directly)
2. Enter their email + pick a role:
   - **viewer** — can browse, can't edit (good for clients reviewing your work)
   - **editor** — can edit pages, render to app, manage assets (good for designers + content writers)
   - **owner** — full control including inviting more members (good for co-founders / agency leads)
3. They get an invite email (or you copy a link). They sign up with the same email and join your workspace.

When you both edit at the same time:
- If real-time collab is enabled, you'll see each other's cursors and changes sync live
- If not, last-saved wins. Coordinate via Slack who's editing what

---

## Step 12 — Most useful keyboard shortcuts

| Shortcut | What it does |
|---|---|
| <kbd>/</kbd> | Jump to the sections search bar |
| <kbd>⌘S</kbd> / <kbd>Ctrl+S</kbd> | Save your work |
| <kbd>⌘Z</kbd> / <kbd>Ctrl+Z</kbd> | Undo |
| <kbd>⌘⇧Z</kbd> / <kbd>Ctrl+Y</kbd> | Redo |
| <kbd>⌘D</kbd> / <kbd>Ctrl+D</kbd> | Duplicate the selected block |
| <kbd>⌘C</kbd> / <kbd>Ctrl+C</kbd> | Copy the selected block |
| <kbd>⌘V</kbd> / <kbd>Ctrl+V</kbd> | Paste a copied block |
| <kbd>⌘↑</kbd> / <kbd>Ctrl+↑</kbd> | Move selected block up |
| <kbd>⌘↓</kbd> / <kbd>Ctrl+↓</kbd> | Move selected block down |
| <kbd>⌫</kbd> / <kbd>Delete</kbd> | Delete the selected block |
| <kbd>Esc</kbd> | Deselect everything |

These speed you up dramatically once you've used them a few times.

---

## Common patterns to copy

### Landing page

Hero → trust logos → 3-feature grid → testimonial → final CTA

### Pricing page

Pricing 3-tier → comparison matrix → FAQ → trial banner

### Blog index page

Blog hero featured → blog post teaser list → blog tag cloud → newsletter signup

### Portfolio

Hero center → gallery masonry hover → about → contact form

### Coming-soon / pre-launch

Coming-soon countdown → roadmap → email capture → social links

### About page

Editorial hero → company milestones timeline → leadership team grid → values

---

## What to do when…

### …you want a new section that doesn't exist

The catalog has 538 sections. Search hard before deciding you need a new one. Try synonyms — "feature" "benefit" "advantage" "highlight" all describe similar blocks.

If you really need new, ask a developer to add one (it takes ~5 minutes for a simple block — see [DEV-TUTORIAL.md](./DEV-TUTORIAL.md) Step 8).

### …a block looks broken or misaligned

The Studio canvas is a **schematic** (wireframe approximation). The real visual rendering happens when you click ▶ Render and run the generated app. Don't trust the canvas for pixel-accuracy — generate + view to see the truth.

### …you accidentally deleted a page

Press <kbd>⌘Z</kbd> immediately. Page deletes are in the undo history.

If you've left the Studio since then, restore from a **snapshot** if you saved one.

### …your changes don't appear after Render

Are you running the right output folder? Each Render creates a fresh timestamped folder at `/tmp/studio-<timestamp>/`. Make sure you're running THAT one, not an older render.

```bash
ls -lt /tmp/studio-* | head -3        # newest first
```

### …Render fails

The Render modal shows the last 12 lines of the wirer's log on failure. Common causes:

- A required field on some block is empty (the wirer validates Zod schemas)
- An env var is missing in the recipe
- You're offline and the wirer can't download a dependency

Fix the issue (usually obvious from the log), save, render again.

### …you want to start over

Click **Reset** in the top bar. It discards all unsaved changes and reloads from the last save. Can't be undone, so save first if you want to keep current state.

---

## What you've learned

- The 3-pane Studio layout: palette · canvas · properties
- How to add, edit, reorder, and delete sections
- Multi-page support with the pages bar
- Theme switching across 75 themes
- Viewport preview for mobile/tablet/desktop
- Save · undo · snapshots
- Rendering to a real, deployable app
- Inviting teammates with roles

Total time invested: **20 minutes**. You now have a working landing page + pricing page + a deployable app.

---

## Where to go next

- 📖 [USER-MANUAL.md](./USER-MANUAL.md) — complete Studio reference (every panel, every feature)
- 💻 [DEV-TUTORIAL.md](./DEV-TUTORIAL.md) — for developers extending the catalog
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) — pushing your generated app to Vercel/Render/etc.
- 💰 [MONETIZATION-PLAN.md](./MONETIZATION-PLAN.md) — pricing tiers + premium content (Pro $9 / Agency $49)

Welcome to the Studio. 🚀
