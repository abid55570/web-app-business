# B-Dash App Generator — Plan & Specification

> Single source of truth for vision, architecture, schemas, and implementation constraints.
> **This document is self-contained**: an engineering team — or a future Claude session — can build the entire system from this document alone, without additional context.
> Last updated: 2026-05-09
> Folder: `B:\dash\app-generator\`

---

## How to use this document

- **Sections labeled with MUST / MUST NOT / SHOULD / MAY are normative.** Treat them as binding requirements.
- **Code blocks marked `(spec)` are pseudocode** clarifying behavior. They are NOT implementation; an engineer/LLM may translate them to TypeScript/Python freely so long as the behavior is preserved.
- **Code blocks marked `(example)` are illustrative.** They show typical content, not the only valid form.
- When in doubt, prefer the constraint over the example.
- When two constraints conflict, **PART III implementation specs win** over PART II architecture, which wins over PART I vision.

---

## Table of contents

**PART I — Vision & Customer Experience**
1. Vision & hard constraints
2. Mental model: contracts / implementations / recipes
3. Customer journey & entry surfaces
4. Dynamic Question Flow (Wizard)
5. Studio (visual builder)
6. Template Gallery

**PART II — Architecture & Schemas**
7. Repository structure (exact layout)
8. Recipe schema (`recipe.json`)
9. Module schema (`module.yaml`)
10. Theme schema (`theme.yaml` + `tokens.json`)
11. Contract schemas (auth, orders, payment, booking, notifications, events, rbac, storage, search)
12. Granularity layers
13. Hook / event system
14. Dashboard composition
15. Override system
16. Update / patch system

**PART III — Implementation Specifications**
17. Engineering conventions
18. Repository setup
19. Wirer algorithm
20. Generator CLI commands
21. Wizard engine
22. Studio architecture
23. Theme rendering pipeline
24. Database portability
25. Frontend ↔ backend wiring
26. Internationalization
27. Brand ingestion algorithm
28. RBAC enforcement
29. Rate limiting & spam protection
30. Demo / preview deployment
31. Test strategy
32. Performance budgets
33. Security requirements
34. Animation & 3D
35. Pattern & asset library spec
36. Notification channels
37. Payment gateways
38. Auth options
39. Optional AI customer module

**PART IV — Catalogs**
40. App archetypes
41. Module catalog (250+)
42. Theme pack catalog (60+)
43. Starter catalog (200+)
44. Animation presets (100+)
45. 3D scenes (40+)
46. Section/block library (500+)
47. Email templates (50+)
48. Form templates (30+)
49. Illustration packs (8+)
50. Background patterns (30+)
51. Languages (30+)

**PART V — Operating Plan**
52. Tech stack
53. Phased implementation order
54. Hard problems & mitigations
55. Operating principles
56. Open decisions

---

# PART I — Vision & Customer Experience

## 1. Vision & hard constraints

A meta-system that produces production-ready, customer-owned web applications by composing pre-built modules, themes, and integrations. Customers range from operators (technical) to non-technical end-users assembling apps through a visual builder.

### 1.1 Hard constraints (MUST)

- The generator MUST run fully offline. No external API calls during generation.
- The generator MUST NOT depend on any LLM/AI API. All "smart" behavior MUST be deterministic.
- Customers MUST own their generated code (zip + deploy anywhere).
- AI MUST only appear as an optional **customer-facing** module (BYO-key). It MUST NOT be a generator dependency.
- All shared assets (themes, components, sections) MUST be styled via tokens only — no hardcoded colors, fonts, or spacing.
- All shared assets MUST work in both light and dark mode.
- All shared assets MUST be accessible (WCAG AA minimum).
- All shared assets MUST be responsive (375px–1920px viewport range).
- Generated apps MUST be deployable as a self-contained zip with documented run instructions.
- The Wirer MUST never overwrite files in `overrides/` directories.

### 1.2 Differentiators (in order of importance)

1. Customer owns the code (vs. Webflow/Wix lock-in)
2. Zero variable cost per app (vs. Lovable / v0 / Bolt LLM bills)
3. Visual builder for non-tech users (vs. raw template generators)
4. Composability via stable contracts (vs. monolithic templates)
5. Vast pre-built inventory (60+ themes, 200+ starters, 250+ modules at year-1 target)

---

## 2. Mental model: contracts / implementations / recipes

Three layers MUST be kept strictly separate:

| Layer | Purpose | Where it lives |
|---|---|---|
| **Contracts** | Stack-agnostic interface specs (e.g. `auth@v1`, `orders@v1`) | `contracts/` |
| **Implementations** | Multiple backend, frontend, integration templates that satisfy each contract | `templates/` |
| **Recipes** | Customer-specific selection of implementations + config | `output/<customer>/recipe.json` |

This is what makes "any frontend with any backend" possible. Without this strict separation, you have N×M custom integrations.

### Rules

- A contract MUST be defined once and versioned (`auth@v1`, `auth@v2`).
- An implementation MUST declare which contract version(s) it satisfies.
- A recipe MUST be valid against the compatibility matrix derived from contracts.
- Two implementations of the same contract version MUST be interchangeable from the consumer's perspective.

---

## 3. Customer journey & entry surfaces

Three customer-facing entry surfaces, all converging to a single canonical `recipe.json`:

| Surface | Audience | Path |
|---|---|---|
| **Template Gallery** | "Like X" | Browse 200+ pre-built starters → preview → "Use this" → brand basics → generate |
| **Wizard** | "Walk me through" | Single-sentence intent → match → 10-phase guided questions → generate |
| **Studio (blank)** | "I'll build it myself" | Empty canvas + module palette + theme picker |

All three:
- MUST produce the same `recipe.json` schema
- MUST be runnable offline
- MUST allow returning later to refine

---

## 4. Dynamic Question Flow (Wizard)

Detailed in §21. Customer journey summary:

| Stage | What happens |
|---|---|
| 1. Intent | Single sentence (deterministic match → top starter) |
| 2. Confirm | Live preview, accept/swap |
| 3. Questions | 10 phases, 4 actions per question (Pick / Preview / Skip / Recommend) |
| 4. Live preview | Right-side pane updates in real time |
| 5. Generate | ~30s wirer → preview deploy + zip |
| 6. Setup Tasks | Skipped questions become todo cards in Studio |

---

## 5. Studio (visual builder)

Detailed in §22. Customer-facing summary:

- Drag-drop sections from a palette into pages
- Click-to-edit text inline
- Properties panel (right sidebar) for selected component's props
- Layers panel (left sidebar) for page tree
- Theme panel for global colors/fonts/spacing
- Pages manager (add/clone/delete, set routes)
- Responsive preview (desktop / tablet / mobile)
- Preview vs Edit toggle, undo/redo, keyboard shortcuts
- v2: visual data binding, conditional visibility, structural changes, multi-user collab (Yjs)

Tech: **Puck** (puckeditor.com — React, MIT) on dnd-kit. Yjs for v2 collaboration. Monaco for the optional code-escape hatch.

---

## 6. Template Gallery

200+ pre-built complete starter recipes (§43). Each starter is a full working app the customer can deploy as-is or customize via the Wizard / Studio.

Customer flow:
1. Browse gallery (visual cards, filterable by archetype, business type, features)
2. Live preview each (each starter has an always-running preview deployment)
3. "Use this" → brand basics (logo, colors, name) → generate
4. Open Studio for further customization

---

# PART II — Architecture & Schemas

## 7. Repository structure (exact layout)

The monorepo MUST be organized as follows. Folder names are exact; file extensions are mandatory unless marked `(any)`.

```
B:\dash\app-generator\
├── PLAN.md                          (this file)
├── BUSINESS-PLAN.md
├── README.md
├── package.json                     pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .editorconfig
├── .prettierrc.json
├── .eslintrc.cjs
├── .gitignore
├── .nvmrc                           Node version pin (>=20.11)
│
├── contracts/                       Stack-agnostic API/data interfaces (versioned)
│   ├── auth@v1.contract.yaml        OpenAPI 3.1 + JSON Schema for shared types
│   ├── orders@v1.contract.yaml
│   ├── payment@v1.contract.yaml
│   ├── booking@v1.contract.yaml
│   ├── appointments@v1.contract.yaml
│   ├── inventory@v1.contract.yaml
│   ├── notifications@v1.contract.yaml
│   ├── events@v1.contract.yaml
│   ├── rbac@v1.contract.yaml
│   ├── storage@v1.contract.yaml
│   ├── search@v1.contract.yaml
│   └── README.md                    Contract design rules
│
├── packages/                        Shared internal packages (pnpm workspace members)
│   ├── schemas/                     JSON Schemas + zod schemas for recipe, module, theme
│   ├── wirer/                       The generation engine
│   ├── wizard/                      Question flow engine
│   ├── studio/                      Visual builder (Puck-based)
│   ├── tester/                      Smoke + visual-regression test harness
│   ├── packager/                    Zip + deploy README generator
│   ├── cli/                         CLI entry point
│   ├── compatibility/               Compatibility matrix derivation
│   ├── tokens/                      Token → Tailwind config, CSS vars, motion
│   ├── intent-match/                Deterministic intent matcher
│   ├── brand-ingest/                Logo → palette extractor
│   └── shared-types/                TS types shared across packages
│
├── templates/                       Implementations (each with template.yaml)
│   ├── backend/
│   │   ├── django/{auth-email,auth-otp,auth-google-oauth,...}/
│   │   ├── fastapi/{auth-email,auth-magic-link,auth-passkeys,...}/
│   │   └── nodejs/{auth-email,auth-otp,...}/
│   ├── frontend/
│   │   └── nextjs/
│   │       ├── auth/{minimal,glass,saas,split-screen,...}/
│   │       ├── dashboard/{sidebar,topbar,bento,...}/
│   │       └── ...
│   └── integrations/
│       ├── payment/{stripe,razorpay,paypal,phonepe,cashfree,upi,cod,...}/
│       ├── email/{resend,sendgrid,ses,smtp,...}/
│       ├── sms/{twilio,msg91,aws-sns,...}/
│       ├── whatsapp/{meta-cloud,twilio,gupshup,...}/
│       ├── push/{fcm,onesignal,...}/
│       ├── voice/{twilio,exotel,...}/
│       ├── ai/{anthropic,openai,google,mistral,cohere,ollama-local}/
│       ├── analytics/{plausible,posthog,ga4,...}/
│       ├── storage/{s3,r2,local,...}/
│       └── monitoring/{sentry,...}/
│
├── themes/                          Theme packs (each with theme.yaml)
│   ├── minimal/
│   ├── glass/
│   ├── aurora/
│   ├── brutalist/
│   ├── soft/
│   └── ... (60+)
│
├── modules/                         Composable feature modules (each with module.yaml)
│   ├── auth/
│   ├── orders/
│   ├── menu/
│   ├── todo/
│   ├── kanban/
│   ├── notes/
│   └── ... (250+)
│
├── sections/                        Drag-into-Studio page sections (each with section.yaml)
│   ├── hero/{centered,split-screen,with-form,...}/
│   ├── pricing/{three-tier,toggle,calculator,...}/
│   ├── features/{three-up,alternating,bento,...}/
│   └── ... (500+)
│
├── blocks/                          Smaller reusable UI blocks
├── animations/                      Named animation presets (each with animation.yaml)
├── scenes-3d/                       R3F + Spline 3D scenes
├── patterns/                        SVG background patterns
├── illustrations/                   Illustration packs (each with pack.yaml)
├── email-templates/                 React Email / MJML templates (each with template.yaml)
├── form-templates/
├── onboarding-flows/
├── admin-layouts/
│
├── starters/                        Complete pre-built recipes (each with starter.yaml)
│   ├── pizza-shop/
│   ├── yoga-studio/
│   ├── todo-app/
│   ├── personal-portfolio/
│   └── ... (200+)
│
├── secrets/
│   ├── test-keys.env                Sandbox API keys for testing only (gitignored)
│   ├── test-keys.env.example
│   └── README.md
│
├── output/                          Generated apps land here
│   └── <customer>/                  One folder per generated app
│       ├── recipe.json              Canonical spec
│       ├── studio-state.json        Runtime config (cosmetic edits)
│       ├── overrides/               Customer customizations (wirer never touches)
│       ├── src/                     Generated code
│       ├── package.json
│       └── README.md                Per-customer deploy instructions
│
└── docs/
    ├── architecture.md
    ├── template-spec.md
    ├── module-spec.md
    ├── theme-spec.md
    ├── contracts.md
    └── conventions.md
```

### Folder rules (MUST)

- Every implementation folder MUST contain a `template.yaml` (manifest).
- Every module folder MUST contain a `module.yaml`.
- Every theme folder MUST contain a `theme.yaml` and `tokens.json`.
- Every section/block/animation/scene folder MUST contain its own manifest with the same naming convention.
- Folder names MUST be `kebab-case`.
- Version suffixes use `@vN` for contracts; semver in `template.yaml > version` for templates.
- The `secrets/` folder MUST NOT be committed (in `.gitignore`).

---

## 8. Recipe schema (`recipe.json`)

Canonical specification of a customer's app. **Single source of truth** for the wirer.

### 8.1 Full JSON Schema (spec)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://b-dash.dev/schemas/recipe.v1.json",
  "type": "object",
  "required": ["schemaVersion", "id", "createdAt", "archetype", "stack", "modules", "theme", "branding"],
  "properties": {
    "schemaVersion": { "const": "1.0.0" },
    "id": { "type": "string", "pattern": "^[a-z0-9-]{4,64}$" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "archetype": {
      "type": "string",
      "enum": ["business", "productivity", "content", "social", "marketplace", "tools", "education", "dashboard", "creator", "tracker", "realtime", "game", "custom"]
    },
    "vertical": { "type": ["string", "null"] },
    "starter": { "type": ["string", "null"], "description": "Starter ID if generated from a starter" },

    "stack": {
      "type": "object",
      "required": ["backend", "frontend", "database"],
      "properties": {
        "backend": { "type": "string", "enum": ["fastapi", "django", "nodejs"] },
        "frontend": { "type": "string", "enum": ["nextjs"] },
        "database": { "type": "string", "enum": ["postgres", "mysql", "sqlite"] },
        "deployTarget": { "type": "string", "enum": ["vercel", "render", "railway", "coolify-vps", "docker-zip"] }
      }
    },

    "modules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "version", "config"],
        "properties": {
          "id": { "type": "string" },
          "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
          "config": { "type": "object", "description": "Values for the module's config_knobs" }
        }
      }
    },

    "integrations": {
      "type": "object",
      "properties": {
        "payment":       { "type": "array", "items": { "type": "string" } },
        "email":         { "type": "array", "items": { "type": "string" } },
        "sms":           { "type": "array", "items": { "type": "string" } },
        "whatsapp":      { "type": "array", "items": { "type": "string" } },
        "push":          { "type": "array", "items": { "type": "string" } },
        "voice":         { "type": "array", "items": { "type": "string" } },
        "ai":            { "type": "array", "items": { "type": "string" } },
        "analytics":     { "type": "array", "items": { "type": "string" } },
        "storage":       { "type": "array", "items": { "type": "string" } },
        "monitoring":    { "type": "array", "items": { "type": "string" } }
      }
    },

    "auth": {
      "type": "object",
      "required": ["methods"],
      "properties": {
        "methods": { "type": "array", "items": { "type": "string", "enum": ["email-password", "email-otp", "phone-otp", "magic-link", "google", "apple", "github", "facebook", "linkedin", "microsoft", "discord", "passkeys", "anonymous", "sso-saml"] } },
        "twoFactor": { "type": "boolean" }
      }
    },

    "notifications": {
      "type": "object",
      "properties": {
        "channels": { "type": "array", "items": { "type": "string", "enum": ["email", "sms", "whatsapp", "push", "in-app"] } },
        "perEventChannels": {
          "type": "object",
          "description": "Map of event ID -> array of channels",
          "additionalProperties": { "type": "array", "items": { "type": "string" } }
        }
      }
    },

    "rbac": {
      "type": "object",
      "properties": {
        "roles": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "permissions"],
            "properties": {
              "id": { "type": "string" },
              "permissions": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    },

    "theme": {
      "type": "object",
      "required": ["pack"],
      "properties": {
        "pack": { "type": "string" },
        "darkMode": { "type": "string", "enum": ["light", "dark", "auto"] },
        "tokenOverrides": { "type": "object", "description": "Per-customer token overrides applied on top of pack tokens" }
      }
    },

    "branding": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": { "type": "string" },
        "logo": { "type": ["string", "null"], "description": "Path to logo asset relative to branding folder" },
        "favicon": { "type": ["string", "null"] },
        "primaryColor": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
        "fontPair": { "type": "string", "description": "Font pair ID from theme catalog" },
        "illustrationPack": { "type": ["string", "null"] }
      }
    },

    "i18n": {
      "type": "object",
      "properties": {
        "defaultLanguage": { "type": "string", "default": "en" },
        "supportedLanguages": { "type": "array", "items": { "type": "string" } },
        "defaultCurrency": { "type": "string", "default": "USD" },
        "defaultTimezone": { "type": "string", "default": "UTC" },
        "defaultLocale": { "type": "string", "default": "en-US" }
      }
    },

    "pages": {
      "type": "array",
      "description": "Pages explicitly added/customized via Studio",
      "items": {
        "type": "object",
        "required": ["path", "layout"],
        "properties": {
          "path": { "type": "string" },
          "layout": { "type": "string" },
          "title": { "type": "string" },
          "sections": { "type": "array", "items": { "type": "object" } },
          "requires": { "type": "array", "items": { "type": "string" }, "description": "Permissions required" }
        }
      }
    },

    "pendingQuestions": {
      "type": "array",
      "description": "Wizard questions deferred via 'Skip / Add Later'. Surface as Setup Tasks in Studio.",
      "items": {
        "type": "object",
        "required": ["questionId", "deferredAt"],
        "properties": {
          "questionId": { "type": "string" },
          "deferredAt": { "type": "string", "format": "date-time" },
          "currentDefault": { "description": "Default value being used in absence of customer answer" }
        }
      }
    },

    "customQuestions": {
      "type": "array",
      "description": "Customer-defined custom config knobs not part of any module",
      "items": { "type": "object" }
    }
  }
}
```

### 8.2 Recipe rules

- `recipe.json` MUST validate against the schema above before the wirer runs.
- `id` is the customer-app slug, used as the output directory name.
- `pendingQuestions` and `pages` are mutated by Studio; everything else is mutated by the Wizard.
- `tokenOverrides` are applied after the theme pack's `tokens.json` — last write wins.
- Per-event channel routing in `notifications.perEventChannels` MUST reference events emitted by enabled modules; the wirer rejects unknown event IDs.

### 8.3 Recipe lifecycle

1. **Created** by the Wizard, or copied from a Starter.
2. **Validated** by `packages/schemas` before generation.
3. **Resolved** by the Wirer (compatibility check, dependency graph).
4. **Materialized** into `output/<id>/` with code + `studio-state.json`.
5. **Mutated** by Studio (cosmetic → `studio-state.json`; structural → `recipe.json` + regen).
6. **Patched** by the Update System on template upgrades.

---

## 9. Module schema (`module.yaml`)

Every module MUST have a `module.yaml` matching the schema below.

### 9.1 Schema (spec)

```yaml
# REQUIRED
id: string                              # kebab-case, globally unique
type: module                            # always "module"
version: semver                         # e.g. "1.0.0"
displayName: string                     # for Wizard / Studio UI
description: string                     # one-line description
implements:                             # contracts this module satisfies
  - <contract>@<version>                # e.g. "orders@v1"

# OPTIONAL
depends_on:                             # contracts this module needs
  - <contract>@<version>
optional_integrations:                  # integration contracts the module can use
  - <contract>@<version>
incompatible_with:                      # module IDs that conflict
  - <module-id>

# DATABASE
db:
  schema: ./schema.prisma               # single source -> multi-stack migrations
  seed: ./seed.json                     # demo data for preview
  migrations:                           # auto-generated; manifest declares what's needed
    - tableName: orders
      indexes: [customer_id, created_at]

# CONFIGURATION
config_knobs:                           # asked in Wizard, no code branch
  - id: string                          # kebab-case
    type: bool|enum|list|string|number|json
    default: any
    options: [...]                      # for enum/list types
    description: string
    askInWizard: true|false             # surface in Wizard? (default: true)
    askInStudio: true|false             # surface in Studio settings? (default: true)
    required: true|false

# EVENTS
emits:                                  # events this module fires
  - id: <module>.<event>                # e.g. "orders.placed"
    payload: { field: type, ... }       # JSON Schema-style
subscribes:                             # events from other modules this consumes
  - id: <module>.<event>
    handler: file path or symbolic name

# UI CONTRIBUTIONS
ui_contributions:
  nav:                                  # nav items added to admin/customer shells
    - label: string
      icon: string                      # Lucide icon name
      path: string
      role: [array of role IDs]
      shell: admin|customer|both
  dashboard_widgets:                    # widgets contributed to dashboard layouts
    - id: string
      size: small|medium|large|full
      source: HTTP method + path        # e.g. "GET /api/admin/orders/stats/today"
      component: file path              # which component renders the widget
  pages:                                # pages this module provides
    - path: string                      # e.g. "/admin/orders"
      layout: admin|customer|public|auth
      requires: [permissions]
      i18nKey: string                   # for translated page title
  studio_blocks:                        # drag-into-Studio components
    - id: string
      displayName: string
      category: string
      defaultProps: { ... }
  studio_sections:                      # full sections (larger than blocks)
    - id: string
      displayName: string
      category: string
      preview: string                   # path to preview image

# PERMISSIONS
permissions:
  - id: <module>.<verb>                 # e.g. "orders.view"
    description: string

# I18N
locales:
  - en
  - es
  - fr
  # ... languages this module ships strings for

# ENVIRONMENT
env:
  - name: DATABASE_URL
    required: true
    description: string
  - name: STRIPE_SECRET_KEY
    required: false
    when: integrations.payment includes stripe

# TESTS
tests:
  contract:                             # which contract conformance tests must pass
    - orders@v1
  smoke:                                # smoke tests this module ships
    - file: tests/smoke/place-order.spec.ts
  fixtures:
    - file: tests/fixtures/sample-orders.json
```

### 9.2 Module rules

- `id` MUST be globally unique across all modules.
- `version` MUST follow semver. Breaking changes MUST bump major.
- `implements` and `depends_on` MUST reference existing contract files.
- `emits` event IDs MUST be prefixed by the module ID.
- `permissions` IDs MUST be prefixed by the module ID.
- All file paths MUST be relative to the module folder.
- The wirer MUST verify all required envs are set before completing generation.

---

## 10. Theme schema (`theme.yaml` + `tokens.json`)

### 10.1 `theme.yaml` (spec)

```yaml
id: string                              # kebab-case
displayName: string
description: string
version: semver
category: minimal|glass|brutalist|soft|3d|layout|vertical|special
darkModeSupport: true                   # MUST be true (constraint)
mobileOptimized: true                   # MUST be true (constraint)
accessibilityRating: "WCAG-AA"          # minimum
fontPair: <font-pair-id>                # default font pair (overridable per recipe)
componentVariants:                      # which component variants this pack uses
  Button: glass-magnetic
  Card: hover-lift
  Modal: sheet
  Toast: rich
motionPreset: subtle|standard|expressive|minimal
backgroundEffect: <effect-id>           # background pattern/effect ID, or "none"
sampleStarters:                         # starters that demo this theme well
  - pizza-shop
  - personal-portfolio
preview:
  light: ./preview/light.webp
  dark: ./preview/dark.webp
  mobile: ./preview/mobile.webp
  walkthrough: ./preview/walkthrough.mp4
intentTags:                             # for intent matching boost
  - clean
  - professional
  - minimal
```

### 10.2 `tokens.json` (spec)

```json
{
  "$schema": "https://b-dash.dev/schemas/tokens.v1.json",
  "colors": {
    "primary": { "50": "#...", "100": "#...", "...": "...", "950": "#..." },
    "accent":  { "50": "#...", "...": "...", "950": "#..." },
    "neutral": { "50": "#...", "...": "...", "950": "#..." },
    "surface": { "base": "#...", "raised": "#...", "overlay": "#...", "sunken": "#..." },
    "text":    { "primary": "#...", "secondary": "#...", "tertiary": "#...", "inverse": "#..." },
    "semantic": {
      "success": { "bg": "#...", "fg": "#...", "border": "#..." },
      "warning": { "bg": "#...", "fg": "#...", "border": "#..." },
      "error":   { "bg": "#...", "fg": "#...", "border": "#..." },
      "info":    { "bg": "#...", "fg": "#...", "border": "#..." }
    }
  },
  "typography": {
    "fontPair": "inter-inter-mono",
    "scale":   { "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem" },
    "weights": { "thin": 100, "light": 300, "regular": 400, "medium": 500, "semibold": 600, "bold": 700, "black": 900 },
    "lineHeight": { "tight": 1.2, "snug": 1.35, "normal": 1.5, "relaxed": 1.625, "loose": 2 }
  },
  "spacing": {
    "0": "0", "px": "1px", "0.5": "0.125rem", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem",
    "4": "1rem", "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem", "12": "3rem",
    "16": "4rem", "20": "5rem", "24": "6rem", "32": "8rem"
  },
  "radius":  { "none": "0", "sm": "0.125rem", "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "3xl": "1.5rem", "full": "9999px" },
  "shadows": {
    "sm":   "0 1px 2px rgba(0,0,0,0.05)",
    "md":   "0 4px 6px rgba(0,0,0,0.07)",
    "lg":   "0 10px 15px rgba(0,0,0,0.1)",
    "xl":   "0 20px 25px rgba(0,0,0,0.1)",
    "glow": "0 0 20px rgba(<primary-rgb>,0.3)",
    "inner":"inset 0 2px 4px rgba(0,0,0,0.06)"
  },
  "motion": {
    "duration": { "instant": "75ms", "fast": "150ms", "base": "300ms", "slow": "500ms", "slower": "750ms" },
    "easing":   { "linear": "linear", "easeIn": "cubic-bezier(0.4,0,1,1)", "easeOut": "cubic-bezier(0,0,0.2,1)", "easeInOut": "cubic-bezier(0.4,0,0.2,1)", "spring": "cubic-bezier(0.5,1.25,0.7,1.0)" },
    "spring":   { "gentle": { "stiffness": 100, "damping": 15 }, "snappy": { "stiffness": 300, "damping": 25 }, "bouncy": { "stiffness": 200, "damping": 10 } }
  },
  "effects": {
    "blur":     { "sm": "4px", "md": "8px", "lg": "16px", "xl": "24px" },
    "glass":    { "background": "rgba(255,255,255,0.1)", "backdrop": "blur(12px)", "border": "1px solid rgba(255,255,255,0.2)" },
    "noise":    "url('data:image/svg+xml,...')",
    "meshGradient": "conic-gradient(from 180deg at 50% 50%, ...)"
  }
}
```

### 10.3 Token rules

- A token file MUST contain ALL keys defined in the schema above.
- Theme packs MAY add additional keys but MUST NOT remove the standard ones.
- Tokens MUST be the only source of color/font/spacing values in shared assets.
- Sections, blocks, and components MUST NOT hardcode colors/fonts/spacing — they MUST reference tokens.
- Custom CSS in `overrides/` MAY hardcode values (escape hatch).

### 10.4 Dark mode

- Each theme pack MUST ship `tokens.json` AND `tokens.dark.json`.
- The wirer applies the appropriate token file based on the customer's `theme.darkMode` setting.
- For `auto` mode, both files are emitted with CSS-vars tied to a `[data-theme]` attribute.

---

## 11. Contract schemas

### 11.1 Contract format

Each contract is OpenAPI 3.1 + JSON Schema in YAML, file named `<contract>@v<N>.contract.yaml`.

```yaml
contract: <contract-id>                 # e.g. "auth"
version: v1
description: string
schemas:                                # JSON Schema for shared data types
  User: { ... }
  Session: { ... }
operations:                             # OpenAPI paths + methods
  /api/auth/login:
    post:
      summary: ...
      requestBody: { schema: ... }
      responses: { 200: { ... }, 401: { ... } }
events:                                 # events this contract defines (for events@v1 integration)
  - id: auth.user.signed-up
    payload: { ... }
errors:                                 # standard error responses for this contract
  AuthInvalidCredentials: { code: "AUTH_INVALID", status: 401, message: "..." }
```

Contracts MUST be versioned. Breaking changes MUST go to a new `@vN+1`. Both versions MAY coexist during transition.

### 11.2 `auth@v1` (spec excerpt)

```yaml
contract: auth
version: v1
schemas:
  User:
    required: [id, email]
    properties:
      id: { type: string, format: uuid }
      email: { type: string, format: email }
      phone: { type: string, nullable: true }
      name: { type: string, nullable: true }
      createdAt: { type: string, format: date-time }
      emailVerified: { type: boolean }
      mfaEnabled: { type: boolean }
  Session:
    required: [token, userId, expiresAt]
    properties:
      token: { type: string }
      userId: { type: string, format: uuid }
      expiresAt: { type: string, format: date-time }

operations:
  /api/auth/signup:
    post: { body: { email, password? }, response: { user, session } }
  /api/auth/login:
    post: { body: { email, password? } | { phone, otp }, response: { user, session } }
  /api/auth/logout:
    post: { auth: required, response: 204 }
  /api/auth/me:
    get:  { auth: required, response: { user } }
  /api/auth/verify-email:
    post: { body: { token }, response: 204 }
  /api/auth/forgot-password:
    post: { body: { email }, response: 204 }
  /api/auth/reset-password:
    post: { body: { token, newPassword }, response: 204 }
  /api/auth/oauth/{provider}/start:
    get: { response: { redirectUrl } }
  /api/auth/oauth/{provider}/callback:
    get: { query: { code, state }, response: { user, session } }

events:
  - id: auth.user.signed-up { user }
  - id: auth.user.signed-in { user, session }
  - id: auth.user.signed-out { userId }
  - id: auth.user.deleted { userId }
  - id: auth.password.reset-requested { userId }
```

### 11.3 `orders@v1` (spec excerpt)

```yaml
contract: orders
version: v1
schemas:
  Order:
    required: [id, customerId, items, total, status, createdAt]
    properties:
      id: { type: string, format: uuid }
      customerId: { type: string, format: uuid }
      items:
        type: array
        items:
          required: [sku, name, qty, unitPrice]
          properties:
            sku: { type: string }
            name: { type: string }
            qty: { type: number, minimum: 1 }
            unitPrice: { type: number, minimum: 0 }
            subtotal: { type: number }
            metadata: { type: object }
      subtotal: { type: number }
      tax: { type: number }
      shipping: { type: number }
      discount: { type: number }
      total: { type: number, minimum: 0 }
      currency: { type: string, pattern: "^[A-Z]{3}$" }
      status:
        type: string
        enum: [pending, confirmed, preparing, ready, out-for-delivery, delivered, completed, cancelled, refunded]
      paymentStatus: { type: string, enum: [unpaid, partial, paid, refunded] }
      shippingAddress: { $ref: '#/components/schemas/Address' }
      createdAt: { type: string, format: date-time }
      updatedAt: { type: string, format: date-time }

operations:
  /api/orders:
    get:  { auth: required, query: { status?, limit?, offset? }, response: { orders, total } }
    post: { auth: required, body: { items, shippingAddress?, couponCode? }, response: { order, paymentIntent? } }
  /api/orders/{id}:
    get:    { auth: required, response: { order } }
    patch:  { auth: admin,    body: { status? }, response: { order } }
  /api/orders/{id}/cancel:
    post: { auth: required, body: { reason? }, response: { order } }
  /api/orders/{id}/refund:
    post: { auth: admin, body: { amount?, reason? }, response: { order, refund } }
  /api/admin/orders:
    get: { auth: admin, query: { status?, customer?, dateFrom?, dateTo?, limit?, offset? }, response: { orders, total } }
  /api/admin/orders/stats/today:
    get: { auth: admin, response: { count, totalRevenue, byStatus } }

events:
  - id: orders.placed     { orderId, customerId, total, items }
  - id: orders.confirmed  { orderId }
  - id: orders.shipped    { orderId, trackingId? }
  - id: orders.delivered  { orderId }
  - id: orders.cancelled  { orderId, reason? }
  - id: orders.refunded   { orderId, amount }

permissions:
  - orders.view
  - orders.view-own
  - orders.create
  - orders.update-status
  - orders.refund
```

### 11.4 `payment@v1` (spec excerpt)

```yaml
contract: payment
version: v1
operations:
  /api/payment/create-intent:
    post: { auth: required, body: { amount, currency, gateway, metadata? }, response: { intentId, clientSecret? } }
  /api/payment/capture:
    post: { auth: required, body: { intentId }, response: { success, transactionId } }
  /api/payment/refund:
    post: { auth: admin, body: { transactionId, amount?, reason? }, response: { refundId, status } }
  /api/payment/webhook/{gateway}:
    post: { body: <gateway-specific>, response: 204 }     # signature MUST be verified per gateway

events:
  - id: payment.succeeded { intentId, amount, currency, gateway }
  - id: payment.failed    { intentId, reason }
  - id: payment.refunded  { transactionId, amount }
```

### 11.5 `notifications@v1` (spec excerpt)

```yaml
contract: notifications
version: v1
operations:
  /api/notifications/send:
    post:
      auth: server-only                 # called from event handlers, not user-triggered
      body:
        channel: email|sms|whatsapp|push|in-app
        recipient: string               # email/phone/userId/deviceToken
        template: string                # template ID
        data: object                    # template variables
      response: { id, status }

events:
  - id: notifications.sent      { id, channel, recipient }
  - id: notifications.failed    { id, channel, recipient, reason }
  - id: notifications.delivered { id, channel }                  # for providers that report delivery
  - id: notifications.opened    { id, channel }                  # email open / push open
  - id: notifications.clicked   { id, channel, link }
```

### 11.6 `events@v1` (spec — the event bus)

```yaml
contract: events
version: v1
description: |
  In-process event bus for MVP. Optional Redis-backed adapter for scale.
  All event names follow "<module>.<verb>" convention.
operations:
  emit:
    inProcessOnly: true
    args: [eventId, payload]
    behavior: |
      Synchronously calls all subscribers for the event ID.
      If a subscriber throws, log and continue (do NOT halt other subscribers).
      Persist event to events_log table with timestamp + payload.
  subscribe:
    inProcessOnly: true
    args: [eventId, handler]
behaviors:
  - Subscribers MUST be idempotent (an event MAY be replayed).
  - Payloads MUST be JSON-serializable.
  - Event names MUST be globally unique.
```

### 11.7 `rbac@v1` (spec excerpt)

```yaml
contract: rbac
version: v1
schemas:
  Role: { id: string, name: string, permissions: string[] }
  Permission: { id: string, description: string }
operations:
  /api/auth/me/permissions:
    get: { auth: required, response: { permissions: string[] } }
  /api/admin/roles:
    get:  { auth: admin, response: { roles } }
    post: { auth: owner, body: Role, response: { role } }
  /api/admin/roles/{id}:
    patch:  { auth: owner, body: Partial<Role> }
    delete: { auth: owner }
  /api/admin/users/{userId}/roles:
    put: { auth: admin, body: { roleIds: string[] } }

middleware:
  requirePermission(perm):
    pseudocode: |
      if not user.permissions.includes(perm): respond 403
```

### 11.8 Other contracts

- **`booking@v1`** — slot, calendar, recurring, capacity, no-show
- **`appointments@v1`** — booking + intake forms + reminders
- **`inventory@v1`** — sku, stock, reservations, low-stock alerts
- **`storage@v1`** — file upload, presigned URLs, delete
- **`search@v1`** — query, faceted filters, highlight

(See contract files in `contracts/` for full specs.)

---

## 12. Granularity layers

| Layer | Folder | Manifest | Purpose |
|---|---|---|---|
| Tokens | `themes/<t>/` | `theme.yaml` + `tokens.json` | Branding without changing UI |
| Atoms | `packages/ui/atoms/` (or per-theme overrides) | — | Button, Input, Card primitives |
| Molecules | `packages/ui/molecules/` | — | LoginForm, ProductCard composites |
| Blocks | `blocks/<b>/` | `block.yaml` | StatsCard, FeatureItem reusable mini-units |
| Sections | `sections/<category>/<s>/` | `section.yaml` | HeroSplit, PricingTable3 — Studio-draggable |
| Organisms | `packages/ui/organisms/` | — | Sidebar, DashboardLayout scaffolds |
| Pages | (declared in module) | — | LoginPage, OrdersPage |
| Modules | `modules/<m>/` | `module.yaml` | Full feature drop-ins |
| Flows | (composed of pages) | — | Multi-page journeys (checkout, onboarding) |
| Starters | `starters/<s>/` | `starter.yaml` (full recipe template) | Complete app recipes |

### Naming conventions (MUST)

- All folder + file names: `kebab-case`
- TypeScript types/interfaces/classes: `PascalCase`
- TypeScript variables/functions: `camelCase`
- TypeScript constants: `SCREAMING_SNAKE_CASE`
- React components: `PascalCase`
- CSS classes: `kebab-case` (or Tailwind utilities)
- File extensions: `.ts`, `.tsx`, `.json`, `.yaml`, `.md` (no `.yml`, no `.js` in source)

---

## 13. Hook / event system

### 13.1 Mechanics

- All cross-module communication MUST go through `events@v1`.
- Modules MUST NOT call other modules directly.
- The bus is in-process by default. The wirer auto-swaps to a Redis adapter if customer enables `optional_integrations: events-redis`.

### 13.2 Wirer behavior

When wiring:
1. Build event index from all enabled modules' `emits`.
2. Build subscriber index from all enabled modules' `subscribes`.
3. Validate that every subscriber's event ID exists in the emitter index. Fail generation if missing.
4. Validate `notifications.perEventChannels` keys exist in the event index.
5. Generate a typed `events.ts` file (TypeScript) listing all event IDs as a discriminated union.

### 13.3 Subscriber behavior (MUST)

- Subscribers MUST be idempotent.
- Subscribers MUST NOT throw uncaught — wrap in try/catch, log on error.
- Subscribers MUST complete in <1s for in-process bus (move heavy work to a queue).

---

## 14. Dashboard composition

The dashboard layout (chosen from §49 Admin Layout Library) is a shell. Modules contribute:
- Nav items (with role gating)
- Dashboard widgets (with size + data source)
- Settings panels

### 14.1 Wirer behavior

For each enabled module:
1. Read `ui_contributions.nav` → append to nav config
2. Read `ui_contributions.dashboard_widgets` → append to widget grid config
3. Read `ui_contributions.pages` → register routes
4. Read `permissions` → add to RBAC matrix
5. Filter all UI contributions by `role` → ensure customer roles see only what they're permitted

### 14.2 Output

The wirer generates `src/app/admin/dashboard/_config.ts` with the assembled nav + widget config. The dashboard page reads this at build time and renders accordingly.

---

## 15. Override system

### 15.1 Mechanism

Each generated app has an `overrides/` folder mirroring the `src/` tree. The wirer process:

```text
(spec) wire(recipe, outputDir):
    tempDir = outputDir + ".tmp"
    fresh-render templates -> tempDir/src/
    if exists outputDir/overrides/:
        for each file F in overrides/:
            copy F to tempDir/src/<same-relative-path> (overwrite)
            log "override applied: F"
    atomic-rename tempDir -> outputDir
    preserve outputDir/overrides/ across regenerations
```

### 15.2 Conflict detection

When the wirer applies an override:
1. Read the canonical file content (from the new generation).
2. Compare with the override content.
3. If override is from a previous template version that differs structurally, emit a warning.
4. Customer can accept the new template version (delete the override) or keep their override.

### 15.3 Studio override entry points

- "Custom CSS" panel writes to `overrides/styles/custom.css`
- "Custom code" (advanced) writes to `overrides/<file-path>` after confirmation
- Studio shows a badge on customized files

---

## 16. Update / patch system

### 16.1 Mechanism

```text
(spec) upgrade(customerId):
    recipe = read output/<id>/recipe.json
    for each module M in recipe.modules:
        latestVersion = read modules/<M.id>/module.yaml > version
        if latestVersion > M.version:
            changelog = read modules/<M.id>/CHANGELOG.md range (M.version, latestVersion]
            classify changelog entries as: safe | review | breaking
            if all safe: prompt "Apply N safe patches automatically? [y/n]"
            else: open interactive review UI
            on accept:
                update M.version in recipe
                run wirer (preserves overrides/)
                run smoke tests
                report success/failure
```

### 16.2 Changelog format (MUST)

Every module/template/theme MUST maintain `CHANGELOG.md`:

```markdown
## [1.2.0] - 2026-06-15
### safe
- Improved performance of orders list pagination
### review
- Added new optional `tax_mode` config knob (default: none)
### breaking
- (none)
```

The classifier reads section headings to categorize patches.

---

# PART III — Implementation Specifications

## 17. Engineering conventions

### 17.1 Languages and tooling

- All generator code MUST be TypeScript (Node.js 20+).
- All generated frontend code MUST be TypeScript + React + Next.js 15.
- Backend templates MAY be Python (FastAPI/Django) or TypeScript (Node.js).
- All persistent data MUST be validated at boundaries via zod (TS) or Pydantic (Python).
- All YAML files MUST validate against published JSON Schemas.

### 17.2 Code style

- Prettier for formatting (config: `.prettierrc.json`, single quotes, no semicolons except where required, trailing commas all, print width 100).
- ESLint with `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-import`, `eslint-config-next`.
- No `any` in TypeScript except in adapter boundaries with explicit `// eslint-disable-next-line` + comment explaining why.
- Functions SHOULD be <50 lines.
- Files SHOULD be <300 lines.
- One component per file in React code.
- Imports order: builtin → external → internal (`@/`) → relative → types → styles.

### 17.3 Error handling

- Throw typed errors at the boundary; convert to HTTP responses in middleware.
- Standard error shape:

```ts
// (spec) shared error shape
type AppError = {
  code: string                          // e.g. "ORDERS_NOT_FOUND"
  status: number                        // HTTP status
  message: string                       // human-readable
  details?: Record<string, unknown>     // structured detail
  cause?: unknown                       // chained error
}
```

- Generator NEVER throws on a user mistake; always reports diagnostics with file/line + suggestion.
- Use `Result<T, E>` (or equivalent) for fallible operations in core packages; throws are reserved for programmer errors.

### 17.4 Logging

- Use `pino` (Node) / `loguru` (Python) — structured JSON logs.
- Log levels: trace, debug, info, warn, error, fatal.
- Generator pipeline emits a structured log with stage markers: `wirer:start`, `wirer:resolve`, `wirer:write`, `wirer:test`, `wirer:done`.
- Generated apps MUST emit JSON logs in production.

### 17.5 Commit & branch conventions

- Conventional Commits: `feat(orders): add refund flow`, `fix(wirer): resolve symlink loop`, `docs:`, `chore:`, `refactor:`, `test:`.
- Branch names: `feat/<short-desc>`, `fix/<short-desc>`.
- PR title MUST follow Conventional Commits format.
- Squash-merge to main; no merge commits.

### 17.6 Testing conventions

- Unit tests next to source: `foo.ts` + `foo.test.ts`.
- Integration tests in `tests/integration/`.
- E2E (smoke) tests in `tests/e2e/`.
- Visual regression tests in `tests/visual/` using Playwright + screenshot diff.
- Test runner: Vitest for TS, pytest for Python.

---

## 18. Repository setup

### 18.1 Workspace layout

```text
package.json (root)
  workspaces: ["packages/*", "templates/**", "modules/*", "themes/*"]
pnpm-workspace.yaml
  packages: ["packages/*", "templates/**", "modules/*", "themes/*"]
turbo.json
  pipeline:
    build: { dependsOn: ["^build"], outputs: ["dist/**"] }
    test:  { dependsOn: ["build"] }
    lint:  {}
    dev:   { cache: false, persistent: true }
```

### 18.2 Scripts (root `package.json`)

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write '**/*.{ts,tsx,json,yaml,md}'",
    "schema:check": "tsx packages/schemas/scripts/validate-all.ts",
    "wizard": "tsx packages/cli/src/wizard.ts",
    "generate": "tsx packages/cli/src/generate.ts",
    "studio": "tsx packages/studio/src/server.ts",
    "regen": "tsx packages/cli/src/regen.ts"
  }
}
```

### 18.3 Required files at root

- `.editorconfig`, `.prettierrc.json`, `.eslintrc.cjs`, `.gitignore`
- `tsconfig.base.json` extended by all packages
- `.nvmrc` pinning Node version
- `LICENSE` (MIT recommended)

---

## 19. Wirer algorithm

The wirer is the heart of the generator. It transforms a `recipe.json` into a generated app.

### 19.1 Algorithm (spec)

```text
(spec) wire(recipePath, outputBaseDir):
  1. PARSE
     recipe = JSON.parse(read(recipePath))
     validate(recipe, schemas.recipe)        // throws on schema violation
     outputDir = outputBaseDir + "/" + recipe.id

  2. RESOLVE
     // Build a dependency graph of modules and their required contracts
     allModules = recipe.modules
     graph = new Graph()
     for each M in allModules:
         manifest = read modules/<M.id>/module.yaml
         graph.addNode(M.id)
         for each contract in manifest.depends_on:
             provider = findProvider(contract, allModules + integrations)
             if not provider: fail "Missing provider for <contract>"
             graph.addEdge(M.id -> provider.id)
     if graph.hasCycles(): fail "Module cycle detected"
     order = graph.topologicalSort()

  3. COMPATIBILITY CHECK
     for each pair (A, B) in allModules:
         if A.incompatible_with includes B.id: fail "A and B incompatible"
     // Check stack compatibility
     for each backend template T:
         if not T.supports(recipe.stack.backend): fail
     for each frontend template T:
         if not T.supports(recipe.stack.frontend): fail

  4. PREPARE TEMP DIR
     tempDir = outputDir + ".tmp." + timestamp
     mkdir tempDir
     copyBaseScaffold(tempDir, recipe.stack)        // Next.js + chosen backend skeleton

  5. APPLY THEME
     theme = read themes/<recipe.theme.pack>/
     emit tokens.json -> tempDir/src/tokens.json
     apply tokenOverrides from recipe -> overlay on emitted file
     compile tokens -> Tailwind config: tempDir/tailwind.config.ts
     compile tokens -> CSS variables: tempDir/src/styles/globals.css
     compile tokens -> motion presets: tempDir/src/lib/motion.ts

  6. APPLY MODULES (in topological order)
     for each M in order:
         backend impl = pick template implementing M's contract for recipe.stack.backend
         frontend impl = pick template implementing M's contract for recipe.stack.frontend
         copy backend files -> tempDir/<backend>/<module>/
         copy frontend files -> tempDir/src/app/<module>/
         apply config knobs from recipe.modules[*].config
         merge package.json deps
         merge requirements.txt / pyproject.toml deps
         append to events index
         append to nav config
         append to permissions matrix
         append schema.prisma chunks
         copy locales/* into tempDir/src/locales/

  7. APPLY INTEGRATIONS
     for each integration set in recipe.integrations:
         for each provider:
             copy integration files
             merge envs into .env.example
             register adapter in events bus
             register webhook routes (if any)

  8. APPLY PAGES (from recipe.pages, Studio-customized)
     for each page in recipe.pages:
         resolve sections -> render section components in page file
         set layout, route, requires
         emit src/app/<route>/page.tsx

  9. APPLY OVERRIDES
     if outputDir/overrides/ exists (i.e. previous generation):
         for each file F in overrides/:
             copy F to tempDir/src/<same-path>          // overwrite
             log "override applied: F"

  10. EMIT METADATA
      write tempDir/recipe.json (canonical copy)
      write tempDir/studio-state.json (cosmetic edits, preserved or initialized empty)
      write tempDir/.b-dash-version (generator version)
      write tempDir/README.md (per-customer deploy instructions)

  11. INSTALL & TEST
      cd tempDir
      pnpm install (or npm install)
      run smoke tests (packages/tester)
      if smoke fails: report failures, do NOT promote tempDir

  12. PROMOTE
      atomic-rename tempDir -> outputDir
      (Windows: rename via fs.renameSync; Unix: same)
      preserve outputDir/overrides/ (untouched throughout — was outside tempDir)

  13. REPORT
      print summary: stack, modules, theme, generation time, test results
      print preview deploy URL (if Phase 5+)
      exit 0
```

### 19.2 Wirer guarantees (MUST)

- Wirer MUST be idempotent (running on the same recipe twice produces identical output).
- Wirer MUST NOT modify input recipe.
- Wirer MUST NOT touch `outputDir/overrides/`.
- Wirer MUST roll back on any error (delete tempDir, leave outputDir intact).
- Wirer MUST validate recipe before doing any I/O.

### 19.3 Wirer error categories

| Code | Meaning | Recoverable? |
|---|---|---|
| `RECIPE_INVALID` | Schema validation failed | No — fix recipe |
| `RECIPE_MISSING_PROVIDER` | A required contract has no provider | No — fix recipe |
| `RECIPE_INCOMPATIBLE` | Two modules conflict | No — fix recipe |
| `WIRER_TEMPLATE_MISSING` | A template ID in recipe doesn't exist on disk | No — fix templates |
| `WIRER_TEMPLATE_BROKEN` | Template fails its own contract conformance | No — fix template |
| `WIRER_DEP_INSTALL_FAILED` | pnpm install failed in temp dir | Maybe — retry, check network |
| `WIRER_SMOKE_FAILED` | Smoke tests didn't pass | Maybe — investigate |
| `WIRER_PROMOTE_FAILED` | rename(tempDir, outputDir) failed | Maybe — check perms/disk |

---

## 20. Generator CLI commands

CLI entry: `packages/cli/src/index.ts`. Invocable as `b-dash <command>` after `pnpm install -g`.

```text
b-dash wizard                                Run the interactive wizard (terminal mode)
b-dash wizard --web                          Open the wizard in a browser tab (port 3001)
b-dash generate <recipe.json>                Run wirer on a recipe file
b-dash generate --starter <starter-id>       Generate from a starter recipe (with brand prompts)
b-dash regen <customer-id>                   Re-run wirer on existing recipe (preserves overrides)
b-dash studio <customer-id>                  Open Studio for a generated app (port 3001)
b-dash upgrade <customer-id>                 Run upgrade workflow for a generated app
b-dash list starters                         List available starters
b-dash list themes                           List available themes
b-dash list modules                          List available modules
b-dash validate <recipe.json>                Validate a recipe against schema (no generation)
b-dash diff <customer-id>                    Show what would change if regen ran now
b-dash export <customer-id>                  Zip the generated app for delivery
b-dash test <recipe.json>                    Generate to a temp dir and run tests, then discard
```

Common flags: `--verbose`, `--quiet`, `--json` (machine-readable output), `--no-install` (skip pnpm install), `--dry-run`.

---

## 21. Wizard engine

### 21.1 Question definition format

Questions live in `packages/wizard/questions/*.yaml`, one phase per file (e.g., `01-brand.yaml`, `02-look-and-feel.yaml`).

```yaml
# (example) packages/wizard/questions/02-look-and-feel.yaml
phase:
  id: look_and_feel
  displayName: "Look & Feel"
  order: 2

questions:
  - id: theme_pack
    q: "Pick a look"
    description: "Sets colors, fonts, motion, and component style globally."
    type: gallery_pick
    options: <derived from themes/>
    preview: { type: live_demo }
    skip_default: minimal
    add_later: true
    recommend_for:
      business.restaurant: restaurant-warm
      business.clinic: clinic-medical
      productivity.todo: minimal
    affects_preview: [home, login, dashboard]

  - id: dark_mode_default
    q: "Default to light or dark?"
    type: single
    options: [light, dark, auto]
    default: auto
```

### 21.2 Question types

| Type | Renderer |
|---|---|
| `single` | radio / segmented control |
| `multi` | checkbox group |
| `gallery_pick` | visual gallery (single select) |
| `gallery_multi` | visual gallery (multi select) |
| `matrix` | rows × columns checkbox grid (for per-event channels) |
| `upload` | file upload with preview |
| `color-pick` | color picker + palette suggestions |
| `palette` | curated palette gallery |
| `text` | single-line text input |
| `text-multi` | textarea |
| `form` | grouped fields (e.g., branding has multiple sub-fields) |

### 21.3 Intent matching algorithm (humanized, deterministic)

Real customers type messy, conversational, sometimes-typoed sentences. The matcher MUST be tolerant. Real-world examples it MUST handle:

- "yo i wanna start a pizza biz"
- "we run a small clinic in mumbai, need appointments thing"
- "looking to start a pizzeria with menu and online orders"
- "im a fitness trainer, want booking system for my classes"
- "need an app where customers can order from my bakery"
- "starting a small grocery shop, want stock tracking and online orders"
- "i sell handmade jewelry, want a portfolio + payment thing"
- "im opening a salon next month, need website with appointments"
- "got pizza place. need delivery."
- "🍕 + 🍅 + delivery"
- "हमारा pizza shop है, online ordering चाहिए"
- "thinking of doing something for my dad's small medical store"

The matcher MUST be tolerant to: casual / slang language, typos and misspellings (Levenshtein ≤ 2), multiple intents in one sentence, vague descriptions, Hinglish / Spanglish / mixed-language input, emojis as signals, future / present / past tense, question form, implicit requests.

#### 21.3.1 Input pipeline

```text
(spec) normalizeInput(rawInput):
  // 1. Unicode normalize + lowercase
  s = rawInput.normalize('NFC').toLowerCase()

  // 2. Extract emojis to a separate signal list (don't lose them)
  emojis = extractEmojis(s)
  s = removeEmojis(s)

  // 3. Expand contractions and casual forms
  // i'm -> i am, wanna -> want to, gonna -> going to, lemme -> let me,
  // gotta -> got to, kinda -> kind of, dunno -> do not know, tryna -> trying to
  s = expandContractions(s)

  // 4. Translate known non-English keywords to English equivalents
  // Built-in dictionary covers Hindi, Spanish, French, Italian, Arabic basics:
  // पिज़्ज़ा -> pizza, pizzería -> pizza, مطعم -> restaurant, médecin -> doctor
  s = translateKnownTerms(s, MULTILINGUAL_DICT)

  // 5. Strip punctuation EXCEPT '?' (signal of question form)
  // Keep word boundaries; replace punctuation with space
  s = s.replace(/[^\w\s?]/g, ' ').replace(/\s+/g, ' ').trim()

  // 6. Tokenize on whitespace
  tokens = s.split(/\s+/).filter(t => t.length > 0)

  // 7. Apply lightweight stemming (custom domain rules + Porter for English)
  // Custom rules first (preserve domain meaning):
  //   pizzas -> pizza, pizzerias -> pizzeria, restaurants -> restaurant,
  //   ordering -> order, deliveries -> delivery, appointments -> appointment,
  //   bookings -> booking, websites -> website, classes -> class, doctors -> doctor
  tokens = tokens.map(applyStemRules)

  // 8. Remove stopwords but PRESERVE intent verbs and modal words
  PRESERVE = new Set([
    'want', 'need', 'open', 'start', 'launch', 'build', 'make', 'create',
    'run', 'have', 'got', 'planning', 'thinking', 'looking', 'sell', 'serve',
    'my', 'our', 'small', 'big', 'new', 'help', 'do', 'doing'
  ])
  tokens = tokens.filter(t => !STOPWORDS.has(t) || PRESERVE.has(t))

  return {
    tokens,                // normalized token array
    emojis,                // detected emoji signals
    sentence: s,           // cleaned sentence (post-step-5)
    raw: rawInput,         // original for regex matching
    isQuestion: rawInput.includes('?'),
  }
```

#### 21.3.2 Per-starter scoring

```text
(spec) scoreStarter(normalized, intent):
  score = 0

  // (a) Strong signals (high-confidence nouns) -- weight 5
  for tok in normalized.tokens:
      if intent.strong_signals.includes(tok):
          score += 5
      else:
          // Fuzzy match for typos: edit distance <= 2 (only on words >= 5 chars)
          for s in intent.strong_signals:
              if s.length >= 5 and levenshtein(tok, s) <= 2:
                  score += 3
                  break

  // (b) Weak signals (supporting words) -- weight 1
  for tok in normalized.tokens:
      if intent.weak_signals.includes(tok): score += 1

  // (c) Alias substring match -- weight 3
  joined = normalized.tokens.join(' ')
  for alias in intent.aliases:
      if joined.includes(alias.toLowerCase()): score += 3

  // (d) Multilingual hits (raw forms before translation) -- weight 5
  for tok in normalized.tokens:
      for lang, words in intent.multilingual:
          if words.includes(tok): score += 5

  // (e) Emoji hits -- weight 4
  for e in normalized.emojis:
      if intent.emojis.includes(e): score += 4

  // (f) Phrase pattern hits -- weight 5
  for pattern in (intent.phrases.intent_to_start or []):
      if regex(pattern, 'i').test(normalized.raw): score += 5
  for pattern in (intent.phrases.intent_to_modernize or []):
      if regex(pattern, 'i').test(normalized.raw): score += 5

  // (g) Feature-implied phrase hits -- weight 1 (small bonus)
  for pattern in (intent.phrases.features_implied or []):
      if regex(pattern, 'i').test(normalized.raw): score += 1

  // (h) Exclusion penalty -- weight -10
  for excl in (intent.exclusions or []):
      if normalized.raw.toLowerCase().includes(excl.toLowerCase()): score -= 10

  // (i) Custom boost rules
  for rule in (intent.boost or []):
      if all rule.when conditions hold: score += rule.boost

  return score
```

#### 21.3.3 Selection logic with conversational fallback

```text
(spec) match(rawInput, allStarters):
  normalized = normalizeInput(rawInput)
  scored = allStarters.map(s => ({
    id: s.id,
    score: scoreStarter(normalized, loadIntent(s)),
    intent: loadIntent(s),
  }))
  ranked = scored.filter(x => x.score > 0).sort by score desc

  // No reasonable match -> show archetype picker
  if ranked.length === 0 or ranked[0].score < 5:
      return {
        kind: 'no-match',
        message: "Tell me a bit more — what kind of app or business is this?",
        suggestArchetypePicker: true,
      }

  // Strong winner: top is at least 2x the runner-up
  if ranked.length === 1 or ranked[0].score >= ranked[1].score * 2:
      return {
        kind: 'confident-match',
        primary: ranked[0],
        alternates: ranked.slice(1, 3),
        message: `Looks like ${ranked[0].intent.canonical_name}! Use this as your starting point?`,
      }

  // Ambiguous -> ask a single follow-up question
  topThree = ranked.slice(0, 3)
  return {
    kind: 'ambiguous',
    candidates: topThree,
    followUp: buildFollowUp(topThree),
  }

(spec) buildFollowUp(candidates):
  // If all share a parent archetype, ask which kind specifically
  parent = commonArchetype(candidates)
  if parent:
      return `Sounds like a ${parent.displayName.toLowerCase()}. Which fits best: ${candidates.map(c => c.intent.canonical_name).join(', ')}, or something else?`
  return `I see a few possibilities. Which is closest: ${candidates.map(c => c.intent.canonical_name).join(', ')}?`
```

#### 21.3.4 Feature signal extraction (parallel)

While starter matching runs, a separate extractor identifies feature mentions to pre-select wizard answers:

```text
(spec) extractFeatureSignals(normalized):
  signals = new Set()

  rules = [
    { pattern: /\bdeliver|takeout|takeaway|to.?go|drop.?off\b/, signal: 'delivery' },
    { pattern: /\bbook(ing)?|appoint(ment)?|schedul|reserv\b/, signal: 'booking' },
    { pattern: /\bpay(ment)?|checkout|stripe|razorpay|upi\b/, signal: 'payments' },
    { pattern: /\bmenu|catalog|listing|product list\b/, signal: 'catalog' },
    { pattern: /\bwhats.?app|wa\b/, signal: 'whatsapp' },
    { pattern: /\bsms|text message\b/, signal: 'sms' },
    { pattern: /\bmulti.?lang|translation|languages\b/, signal: 'i18n' },
    { pattern: /\bstock|inventory|out of stock|low.?stock\b/, signal: 'inventory' },
    { pattern: /\bonline ord(er|ering)\b/, signal: 'orders' },
    { pattern: /\baccount|login|sign.?up|register\b/, signal: 'auth' },
    { pattern: /\bdashboard|admin panel\b/, signal: 'dashboard' },
    { pattern: /\bnotif|alert|reminder\b/, signal: 'notifications' },
    { pattern: /\breview|rating\b/, signal: 'reviews' },
    { pattern: /\bsearch\b/, signal: 'search' },
    { pattern: /\bblog|article|post\b/, signal: 'blog' },
    { pattern: /\bgallery|photo album\b/, signal: 'gallery' },
    { pattern: /\bsubscription|recurring\b/, signal: 'subscriptions' },
    { pattern: /\bcoupon|discount|promo\b/, signal: 'coupons' },
    { pattern: /\bloyalty|reward\b/, signal: 'loyalty' },
    { pattern: /\bchat|message|inbox\b/, signal: 'chat' },
    { pattern: /\binvoice|bill\b/, signal: 'invoicing' },
    { pattern: /\btax|gst|vat\b/, signal: 'tax' },
  ]

  for r in rules:
      if r.pattern.test(normalized.raw): signals.add(r.signal)

  return Array.from(signals)
```

The wizard surfaces extracted signals after starter confirmation:

> "I noticed you mentioned **delivery** and **online payments** — pre-selected those. Adjust if needed."

#### 21.3.5 Updated `intent.yaml` schema (humanized)

Each starter MUST ship `intent.yaml` matching this schema:

```yaml
# starters/<starter-id>/intent.yaml
id: pizza-shop
canonical_name: "pizza shop"
oneliner: "Online pizza shop with menu, delivery, and payments."
description: |
  Multi-line human-readable description shown in the gallery.

# Names humans might use (substring-matched, lowercase compared)
aliases:
  - pizza shop
  - pizzeria
  - pizza place
  - pizza joint
  - pizza spot
  - pizza restaurant
  - italian restaurant
  - pizza counter
  - pizza by the slice

# Words that strongly indicate this starter (after stemming)
strong_signals:
  - pizza
  - pizzeria

# Words that weakly indicate this starter
weak_signals:
  - italian
  - slice
  - dough
  - pepperoni
  - mozzarella
  - cheese
  - oven

# Multilingual signals (raw forms before translation)
multilingual:
  hi: [पिज़्ज़ा, पिज्जा]
  es: [pizzería, pizza]
  it: [pizzeria]
  ar: [بيتزا]

# Emoji signals (single chars or sequences)
emojis: ["🍕"]

# Natural-language phrase patterns (case-insensitive regex)
phrases:
  intent_to_start:
    - "(want|wanna|need|gonna|planning to|thinking of|looking to|tryna) (open|start|launch|make|build|create|set up) (a |my |an )?(pizza|pizzeria)"
    - "(im|i am) (opening|starting|launching) (a |my |an )?(pizza|pizzeria)"
    - "(have|got|run|own) (a |my |our )?(pizza|pizzeria) (shop|place|spot|joint|biz|business|restaurant)?"
  intent_to_modernize:
    - "(my|our) (pizza|pizzeria) .{0,30}(needs|wants|looking for) .{0,30}(website|online|app|menu|ordering)"
    - "take (my|our) (pizza|pizzeria) online"
  features_implied:
    - "online ord(er|ering)"
    - "deliver(y|ies)?"
    - "takeaway|takeout"
    - "menu"
    - "dine.?in"
    - "table reserv"

# Words/phrases that disqualify (case-insensitive substring)
exclusions:
  - sushi only
  - chinese only
  - just coffee
  - just bakery
  - burger only

# Conditional boosts
boost:
  - { when: ['pizza', 'deliver'], boost: 5 }     # all listed tokens present
  - { when_phrase: 'wood.?fired pizza', boost: 3 }

# Example inputs (for testing & docs; not used at match time)
examples:
  - "I want to open a pizza shop"
  - "Starting a pizzeria with delivery"
  - "Need a website for my pizza joint"
  - "We make pizza, want online ordering"
  - "Pizza place with takeout"
  - "yo wanna start a pizza biz"
  - "thinking of opening pizza shop next month"
  - "got a pizzeria, need menu online"
  - "small pizza place, need delivery system"
  - "हमारा pizza shop है, online ordering चाहिए"
```

#### 21.3.6 Required built-in dictionaries

The matcher ships with bundled dictionaries (versioned, deterministic, no external lookups):

| Dictionary | Path | Contents |
|---|---|---|
| Stopwords (English) | `packages/intent-match/data/stopwords.en.txt` | ~150 common English stopwords |
| Stopwords (Hindi) | `packages/intent-match/data/stopwords.hi.txt` | ~80 common Hindi stopwords |
| Contractions | `packages/intent-match/data/contractions.json` | i'm/wanna/gonna/lemme/etc. (50+ entries) |
| Stemming rules | `packages/intent-match/data/stems.json` | custom domain stem rules (200+) |
| Multilingual map | `packages/intent-match/data/multilingual.json` | non-English → English equivalents for ~500 common business terms |
| Slang map | `packages/intent-match/data/slang.json` | joint→shop, biz→business, gig→business, spot→shop, etc. |
| Emoji index | `packages/intent-match/data/emojis.json` | emoji → semantic tags (🍕→pizza, 💇→salon, 🏥→clinic) |

Dictionaries MUST be updatable without code changes (data-driven).

#### 21.3.7 Confidence levels (UI hint)

| Score range | Confidence | UX |
|---|---|---|
| ≥ 20 | Very high | "Looks like X!" — auto-select, show preview immediately |
| 10–19 | High | "Sounds like X — use this?" |
| 5–9 | Medium | Show top 3 with previews, ask user to pick |
| < 5 | None | Show archetype picker + "describe more" prompt |

#### 21.3.8 Privacy

The matcher runs **fully offline**. Customer input MUST NOT be transmitted anywhere. The matcher MAY log inputs only with explicit opt-in (see §63).

### 21.4 Live preview pane

- Implemented as a sandboxed iframe pointing at a local preview server (port 3002).
- Preview server reads the in-progress recipe from a watch file (`/.preview-recipe.json`).
- On every wizard answer, recipe is updated and a partial regen runs (incremental).
- Updates that affect tokens.json apply via CSS variable swap (no rebuild).
- Updates that add/remove sections apply via React state hot-swap.
- Updates that change modules trigger a partial wirer pass on changed modules only.

### 21.5 Setup Tasks generation

```text
(spec) generateSetupTasks(recipe):
  tasks = []
  for each Q in allQuestions:
      if recipe.pendingQuestions.has(Q.id):
          tasks.push({
              id: Q.id,
              question: Q.q,
              description: Q.description,
              currentDefault: recipe.pendingQuestions[Q.id].currentDefault,
              configurePanel: Q.studioPanel,         // which Studio panel to open
              dismissible: not Q.required_for_generation
          })
  return tasks
```

Tasks are rendered in Studio's Setup Tasks panel as a checklist.

---

## 22. Studio architecture

### 22.1 Layers

| Layer | Tech |
|---|---|
| Canvas | Puck + dnd-kit |
| State | Zustand (or Jotai) |
| Persistence | `studio-state.json` (cosmetic) + `recipe.json` (structural) |
| Sync (v2) | Yjs + WebSocket server in `packages/studio` |
| Code escape (v2+) | Monaco editor in side panel |

### 22.2 Block registration

Each section / block / module in the catalog declares Studio components:

```yaml
# (example) sections/hero/centered/section.yaml
id: hero-centered
displayName: "Centered Hero"
category: hero
preview: ./preview.webp
puck_config:
  fields:
    headline: { type: text, default: "Welcome" }
    subheadline: { type: text, default: "..." }
    primaryCta: { type: object, fields: { label: text, href: text } }
    backgroundStyle: { type: select, options: [solid, gradient, mesh, image] }
  defaultProps: { headline: "Welcome", subheadline: "..." }
  render: ./component.tsx
```

The wirer compiles all section/block manifests into a Puck config object passed to Studio:

```ts
// (spec) packages/studio/src/loadBlocks.ts
function loadBlocks(): PuckConfig {
  const allManifests = readAll('sections/**/section.yaml', 'blocks/**/block.yaml')
  const components = {}
  for (const m of allManifests) {
    components[m.id] = {
      label: m.displayName,
      fields: m.puck_config.fields,
      defaultProps: m.puck_config.defaultProps,
      render: dynamicImport(m.puck_config.render),
    }
  }
  return { components, categories: groupByCategory(allManifests) }
}
```

### 22.3 Two-mode persistence

```text
(spec) onStudioChange(change):
  if change.kind === 'cosmetic':
      // text edits, color tweaks, layout reorder, prop changes
      patch studio-state.json
      hot-apply via React state (no rebuild)
  else if change.kind === 'structural':
      // add page, add module, change auth method, add integration
      show confirmation modal: "This requires regeneration (~30 sec). Continue?"
      on confirm:
          patch recipe.json
          run wirer
          redeploy preview
          notify user
```

### 22.4 Studio panels (left, right, top)

- Left: Layers (page tree, drag to reorder), Pages manager, Module palette
- Right: Properties (selected block's fields), Theme panel, Settings panel, Setup Tasks panel
- Top: Preview/Edit toggle, undo/redo, responsive breakpoint switcher, save/publish

### 22.5 Studio APIs (called by frontend)

```text
GET  /api/studio/state            -> studio-state.json
PATCH /api/studio/state           -> apply cosmetic patch
POST /api/studio/recipe-edit      -> apply structural patch + trigger regen
GET  /api/studio/setup-tasks      -> derived from pendingQuestions
POST /api/studio/setup-tasks/:id/configure -> opens panel route
POST /api/studio/setup-tasks/:id/dismiss   -> mark task as dismissed
```

---

## 23. Theme rendering pipeline

### 23.1 tokens → Tailwind config

```text
(spec) generateTailwindConfig(tokens):
  return {
    theme: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.radius,
      boxShadow: tokens.shadows,
      fontFamily: { sans: tokens.typography.fontPair.body, mono: tokens.typography.fontPair.mono },
      fontSize: tokens.typography.scale,
      fontWeight: tokens.typography.weights,
      lineHeight: tokens.typography.lineHeight,
      transitionDuration: tokens.motion.duration,
      transitionTimingFunction: tokens.motion.easing,
    },
    plugins: [tokens.effects ? customEffectsPlugin(tokens.effects) : null].filter(Boolean),
  }
```

### 23.2 tokens → CSS variables

```text
(spec) generateCssVariables(tokens):
  vars = []
  walk tokens recursively:
      for each leaf at path P with value V:
          vars.push(`--${kebab(P.join('-'))}: ${V};`)
  return `:root { ${vars.join(' ')} }`

  if tokens.dark provided:
      same walk, output as `[data-theme="dark"] { ... }`
```

### 23.3 tokens → motion presets (TS)

```text
(spec) generateMotionPresets(tokens):
  emit src/lib/motion.ts with:
    export const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: tokens.motion.duration.base } }
    export const slideUp = { ... }
    export const stagger = { ... }
    // etc, one export per preset in /animations/<preset>/animation.yaml
```

### 23.4 Animation presets (`animations/<id>/animation.yaml`)

```yaml
id: fade-in-up
displayName: "Fade in (up)"
category: entrance
implementation:
  framework: framer-motion
  variants:
    initial: { opacity: 0, y: 16 }
    animate: { opacity: 1, y: 0 }
  transition: { duration: tokens.motion.duration.base, ease: tokens.motion.easing.easeOut }
preview: ./preview.gif
```

The wirer reads all animation manifests and emits a single `motion.ts` exporting all presets.

---

## 24. Database portability

### 24.1 Single source: Prisma schema

Each module's `db.schema` is a Prisma schema fragment:

```prisma
// (example) modules/orders/schema.prisma
model Order {
  id           String   @id @default(cuid())
  customerId   String
  items        Json
  total        Decimal
  status       String
  createdAt    DateTime @default(now())
  customer     User     @relation(fields: [customerId], references: [id])
  @@index([customerId])
  @@index([createdAt])
}
```

### 24.2 Wirer behavior

- All modules' schema fragments are concatenated into `<output>/prisma/schema.prisma`.
- For Node backends: Prisma is the ORM. Migrations generated via `prisma migrate dev`.
- For FastAPI backends: schema is translated to SQLAlchemy models via the `prisma-client-py` toolchain or our own translator (`packages/wirer/src/db/prisma-to-sqlalchemy.ts`).
- For Django backends: schema is translated to Django models via our translator (`packages/wirer/src/db/prisma-to-django.ts`).

### 24.3 Translation rules (Prisma → other ORMs)

| Prisma | SQLAlchemy | Django |
|---|---|---|
| `String` | `String` | `CharField(max_length=255)` |
| `Int` | `Integer` | `IntegerField()` |
| `Decimal` | `Numeric(10,2)` | `DecimalField(max_digits=10, decimal_places=2)` |
| `DateTime` | `DateTime` | `DateTimeField()` |
| `Json` | `JSON` | `JSONField()` |
| `@id @default(cuid())` | `Column(String, primary_key=True, default=cuid)` | `models.CharField(max_length=25, primary_key=True, default=cuid)` |
| `@relation` | relationship() | `ForeignKey(...)` |
| `@@index` | `Index(...)` | `Meta.indexes` |

### 24.4 Migration generation

After translation, generate per-stack migration files:
- Prisma: `prisma migrate dev --name init`
- SQLAlchemy: `alembic revision --autogenerate`
- Django: `python manage.py makemigrations`

The wirer runs these in a sandbox container to verify migrations are valid before promoting.

---

## 25. Frontend ↔ backend wiring

### 25.1 Pattern: shared client lib

The wirer generates `<output>/src/lib/api/`:

```text
src/lib/api/
├── client.ts          base fetch client with auth token handling, error normalization
├── auth.ts            typed wrappers for /api/auth/*
├── orders.ts          typed wrappers for /api/orders/*
└── ...                one per contract
```

Generated from contract OpenAPI specs via `openapi-typescript` + custom emitter. The frontend imports these wrappers; never raw fetch.

```ts
// (example) generated src/lib/api/orders.ts
import { client } from './client'
import type { Order } from './types'

export const ordersApi = {
  list: (query?: { status?: OrderStatus }) =>
    client<{ orders: Order[]; total: number }>('GET', '/api/orders', { query }),
  create: (body: { items: OrderItem[]; ... }) =>
    client<{ order: Order; paymentIntent?: PaymentIntent }>('POST', '/api/orders', { body }),
  // ...
}
```

### 25.2 Auth token handling

- Backend issues HTTP-only cookies + a CSRF token in a header.
- Client lib reads CSRF from a meta tag; cookies are sent automatically.
- For mobile/PWA flows, fall back to `Authorization: Bearer <token>` from secure storage.

### 25.3 CORS

- Generator emits a CORS allowlist based on `recipe.stack.deployTarget` (e.g., Vercel → set `*.vercel.app` for preview deploys).
- Production CORS is locked to the customer's configured domain.

---

## 26. Internationalization

### 26.1 String files

```
src/locales/
├── en.json           default; MUST be complete
├── es.json           translations
├── fr.json
└── ...
```

Each module ships its own strings under `modules/<m>/locales/<lang>.json`. Wirer concatenates into the per-app `locales/`.

### 26.2 Library

- Frontend: `next-intl`
- Backend: `babel` (Python) for FastAPI/Django

### 26.3 RTL

- Tailwind's `dir-aware` utilities.
- All sections MUST use `start`/`end` instead of `left`/`right` for layout properties.

### 26.4 Number / date / currency formatting

- Use `Intl.NumberFormat`, `Intl.DateTimeFormat` everywhere.
- No hardcoded `$` or `,` separators.
- Per-user override stored in user profile.

---

## 27. Brand ingestion algorithm

```text
(spec) ingestBrand(logoFile, customerName):
  1. Save logoFile -> branding/logo.<ext>
  2. Generate favicon variants: 16x16, 32x32, 180x180 (apple-touch), 512x512 (PWA)
  3. Extract palette:
     img = load(logoFile)
     resize to 200x200 max
     pixels = sample 1000 pixels
     filter out near-white and near-black
     run k-means clustering with k=5 on Lab color space
     rank clusters by population × distance-from-neutral
     primary = top cluster
     accent = second cluster (most distant from primary in hue)
  4. Generate full color scale from primary using radix-colors algorithm:
     scale.50 = mix(primary, white, 95%)
     scale.100 = mix(primary, white, 90%)
     ...
     scale.500 = primary
     ...
     scale.950 = mix(primary, black, 5%)
  5. Run WCAG contrast check on every text-on-bg pair; if any fail, suggest tweaks
  6. Suggest font pairs from §10.3 ranked by:
     - "vibe" matching (extracted from logo style: serif logo -> serif suggestions, etc.)
  7. Return { palette, fontPair, favicons, logo } for customer confirmation
```

---

## 28. RBAC enforcement

### 28.1 Permission resolution

```text
(spec) resolvePermissions(user):
  perms = new Set()
  for each role in user.roles:
      for each perm in role.permissions:
          if perm === '*': return all known permissions
          if perm.endsWith('.*'): add all perms matching prefix
          else: perms.add(perm)
  return perms
```

### 28.2 Middleware (backend)

- Every API route requires explicit permission declaration (in route definition).
- Middleware checks `user.permissions.has(required)` before invoking handler.
- 403 with structured error if denied.

### 28.3 Frontend gating

- `<Can perm="orders.refund">...</Can>` component reads permissions from session context.
- Nav items + dashboard widgets filtered by permission at render time.

---

## 29. Rate limiting & spam protection

### 29.1 Rate limiting

- Token bucket per (IP + route) on every API endpoint.
- Defaults: 60 requests/minute per IP for read, 10/minute for write.
- Per-route override in `module.yaml > rate_limit: { ...overrides }`.
- Returns `429 Too Many Requests` with `Retry-After` header.

### 29.2 Spam protection

- Turnstile (Cloudflare) by default; optional reCAPTCHA / hCaptcha.
- Required on: signup, contact form, comment post, review submission.
- Frontend integrates challenge widget; backend verifies the token.

### 29.3 Audit log

- Every rate-limit hit + every denied permission writes to `audit_log` table.
- Audit log viewable in admin dashboard.

---

## 30. Demo / preview deployment

### 30.1 Preview deploy targets

| Target | Mechanism |
|---|---|
| Vercel | `vercel deploy --prebuilt` after Next.js build |
| Render | Trigger deploy via Render API |
| Local | Spin up via Docker Compose on port 3000 |

### 30.2 Preview lifecycle

- Each generation produces a unique preview URL.
- Preview URLs include a token (signed JWT) for `?studio=1` access.
- Previews TTL after 14 days unless extended.

### 30.3 Studio overlay mode

When customer opens preview with `?studio=1`:
- Authenticate via signed token.
- Inject Studio bundle as a script tag.
- Render Studio as an overlay with z-index 9999.
- All Studio APIs proxied through the preview server.

---

## 31. Test strategy

### 31.1 Per-layer tests

| Layer | Test type | Tool |
|---|---|---|
| Schemas | Validation against fixtures | Vitest + ajv |
| Wirer | Generate against sample recipe → diff actual vs expected | Vitest |
| Modules | Contract conformance (request/response shape) | Vitest + supertest |
| Integrations | Smoke test against sandbox | Vitest |
| Generated app | E2E user flows | Playwright |
| Themes | Visual regression (every section in every theme) | Playwright + screenshot diff |
| Studio | Component tests + interaction tests | Vitest + Testing Library |
| Wizard | Question flow simulation | Vitest |

### 31.2 Required tests per module (MUST)

- Contract conformance: every endpoint returns a response matching the contract schema.
- Smoke test: at least one happy-path E2E test (e.g., "place an order").
- Permission test: protected endpoints return 403 for unauthorized users.

### 31.3 Required tests per theme (MUST)

- Renders without console errors in every screen size (375, 768, 1280, 1920).
- Light + dark variants both pass WCAG AA contrast checks.
- All standard sections render visually correctly (screenshot diff against baseline).

### 31.4 CI pipeline

```text
on: pull_request
jobs:
  - lint
  - typecheck
  - schema-validate
  - unit-tests
  - integration-tests
  - generate-sample-app + smoke-test
  - visual-regression (only if themes/ or sections/ changed)
```

---

## 32. Performance budgets

Generated apps MUST meet these budgets in production builds:

| Metric | Budget |
|---|---|
| First Contentful Paint (FCP) | < 1.8s on 4G mobile |
| Largest Contentful Paint (LCP) | < 2.5s on 4G mobile |
| Total Blocking Time (TBT) | < 200ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Initial JS bundle | < 200 KB gzipped per route |
| Initial CSS | < 50 KB gzipped |
| Image (above-fold) | < 200 KB total |
| Lighthouse Performance score | ≥ 90 |
| Lighthouse Accessibility score | ≥ 95 |
| Lighthouse Best Practices score | ≥ 95 |
| Lighthouse SEO score | ≥ 90 |

CI fails the build if budgets exceeded.

### 32.1 Bundle hygiene

- Code-split per route (Next.js does this by default).
- Dynamic-import 3D scenes — never load R3F on routes that don't use it.
- Tree-shake icon libraries (import individually, not as a bundle).
- Defer animation libraries until after FCP.

---

## 33. Security requirements

### 33.1 Generator-side (MUST)

- Generator MUST NOT log secrets.
- Generator MUST NOT include test API keys in generated apps without explicit `--include-test-keys` flag.
- All template files MUST be loaded read-only.
- File operations MUST use safe path joins (no traversal).

### 33.2 Generated-app-side (MUST)

- All inputs MUST be validated at the boundary (zod / Pydantic).
- Auth tokens MUST be httpOnly cookies (not localStorage) by default.
- CSRF protection on all state-changing routes.
- SQL queries MUST use parameterized queries (Prisma / SQLAlchemy / Django ORM enforce this).
- Output MUST escape HTML (React does this by default; raw HTML insertion requires explicit `dangerouslySetInnerHTML` with a comment justifying it).
- Webhooks MUST verify signatures (Stripe, Razorpay, etc.).
- File uploads MUST validate MIME type AND extension AND magic bytes.
- Uploaded files MUST be served from a separate domain / via signed URLs (no inline images from user uploads on main domain).
- Rate limiting on all auth endpoints (default 5/min per IP for login).

### 33.3 Headers (default in generated apps)

- `Content-Security-Policy` (strict default; relaxed per integration as needed)
- `Strict-Transport-Security: max-age=31536000`
- `X-Frame-Options: DENY` (except where embeds are intentional)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 34. Animation & 3D

### 34.1 Framer Motion presets per theme
Each theme ships `themes/<t>/motion.ts` exporting standard presets (page transitions, hover, scroll, gesture, layout, modal/sheet, skeleton→content morph).

### 34.2 3D scene library — 40+ at year-1

**Hero scenes (12)**: rotating-product, particle-galaxy, floating-geometry, wave-animation, DNA-helix, morphing-blob, city-parallax, starfield, abstract-shapes, mesh-tunnel, liquid-surface, holographic-ring.

**Background scenes (10)**: aurora-shader, gradient-mesh-3d, subtle-particles, animated-globe, floating-dust, cloud-layers, wireframe-grid, plasma, fluid-simulation, low-poly-mountains.

**Interactive scenes (8)**: card-tilt-with-depth, scroll-driven-camera, cursor-followed-light, hoverable-3d-objects, draggable-3d-product-viewer, parallax-mouse-move, click-explosion, magnetic-elements.

**Spline scenes (10)**: pre-built `.splinecode` files — abstract-loader, 3d-mascot, animated-logo-stage, product-showcase, hero-character, parallax-scene-pack.

Every 3D component MUST ship a 2D `lite` fallback for mobile/perf.

### 34.3 Background effects (lightweight, 2D)
Aurora, mesh-gradient, dots, grid, lines, noise/grain, spotlight-cursor, beam, shooting-stars, glassmorphism layers, animated-blob (SVG), gradient-text.

### 34.4 Animation preset library — 100+ at year-1
Categories: Entrance (15), Hover (15), Scroll-triggered (12), Gesture (8), Loading/state (12), Layout (8), Text (12), Special (10), Spring presets (8). All defined as YAML manifests under `animations/<id>/animation.yaml`.

---

## 35. Pattern & asset library spec

### 35.1 Section manifest schema

```yaml
# (spec) sections/<category>/<id>/section.yaml
id: hero-centered
displayName: "Centered Hero"
category: hero
description: "Centered headline with subhead, primary + secondary CTA, optional background"
implements: section@v1
themes_compatible: ['*']                # which themes this works in (default: all)
darkModeReady: true
mobileResponsive: true
accessibilityTested: true
puck_config:
  fields: { ... }                       # see §22.2
  defaultProps: { ... }
  render: ./component.tsx
preview:
  desktop: ./preview/desktop.webp
  mobile: ./preview/mobile.webp
locales: [en, es, fr, ...]              # which languages have string files
```

### 35.2 Compatibility testing

CI generates a sample app with every (theme × section) combo and runs visual regression. Failures block merge.

### 35.3 Other catalogs (similar manifest structures)

- `blocks/<id>/block.yaml`
- `animations/<id>/animation.yaml`
- `scenes-3d/<id>/scene.yaml`
- `patterns/<id>/pattern.yaml` (SVG patterns)
- `illustrations/<pack>/pack.yaml`
- `email-templates/<id>/template.yaml`
- `form-templates/<id>/form.yaml`
- `onboarding-flows/<id>/flow.yaml`
- `admin-layouts/<id>/layout.yaml`

---

## 36. Notification channels

### 36.1 Channel adapter interface

```ts
// (spec) packages/notifications/types.ts
interface ChannelAdapter {
  channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app'
  send(args: {
    recipient: string                   // email/phone/userId/deviceToken
    template: string                    // template ID
    data: Record<string, unknown>       // template variables
    locale?: string
  }): Promise<{ id: string; status: 'queued' | 'sent' | 'failed'; error?: string }>
}
```

### 36.2 Routing matrix

The wirer compiles `recipe.notifications.perEventChannels` into a dispatch table:

```ts
// (generated) src/lib/notifications/dispatch.ts
export const dispatchTable = {
  'orders.placed': ['email', 'sms', 'whatsapp'],
  'orders.shipped': ['whatsapp'],
  // ...
}
```

A subscriber to each event reads the dispatch table and fans out to the configured channels.

---

## 37. Payment gateways

### 37.1 Gateway adapter interface

```ts
// (spec) packages/payment/types.ts
interface PaymentAdapter {
  gateway: string
  createIntent(args: { amount: number; currency: string; metadata?: Record<string, unknown> }): Promise<{ intentId: string; clientSecret?: string }>
  capture(intentId: string): Promise<{ success: boolean; transactionId: string }>
  refund(args: { transactionId: string; amount?: number; reason?: string }): Promise<{ refundId: string; status: string }>
  verifyWebhook(payload: unknown, signature: string): boolean
}
```

### 37.2 Multi-gateway checkout

- The wirer reads `recipe.integrations.payment` and emits a checkout component that renders a button per gateway.
- End-customer picks at checkout.
- Webhook routes are emitted per gateway (e.g., `/api/payment/webhook/stripe`, `/api/payment/webhook/razorpay`).

### 37.3 Supported gateways
Stripe, Razorpay, PayPal, Cashfree, PhonePe, UPI, COD, Bank-transfer, Square, Paytm, Instamojo, MobiKwik, Klarna, Afterpay, Apple Pay, Google Pay.

---

## 38. Auth options

Variants: email-password, email-otp, phone-otp, magic-link, google, apple, github, facebook, linkedin, microsoft, discord, passkeys, anonymous, sso-saml, plus 2FA (TOTP/SMS).

Multi-select supported. Password reset / email verification / account deletion covered for all variants.

Each auth template implements `auth@v1`. The wirer picks the appropriate template per recipe.

---

## 39. Optional AI customer module

### 39.1 Constraints (MUST)

- AI is a customer-facing module, never a generator dependency.
- Customer brings their own API key (via env var).
- Generator MUST NOT make any LLM API calls during generation.
- The AI module MUST be optional in every starter.

### 39.2 Providers

| Folder | Provider |
|---|---|
| `templates/integrations/ai/anthropic/` | Claude |
| `templates/integrations/ai/openai/` | GPT |
| `templates/integrations/ai/google/` | Gemini |
| `templates/integrations/ai/mistral/` | Mistral |
| `templates/integrations/ai/cohere/` | Cohere |
| `templates/integrations/ai/ollama-local/` | Self-hosted, no external calls |

### 39.3 Use cases (modules customers can enable)

ai-chatbot, ai-completions, ai-search (RAG), ai-image-gen, ai-text-summarization, ai-text-translation, ai-image-captioning, ai-auto-tagging, ai-spam-detection, ai-sentiment-analysis, ai-auto-reply, ai-knowledge-base-search, ai-form-filling-helper, ai-smart-suggestions, ai-moderation, voice-to-text-transcription, text-to-speech, ai-image-background-removal, ai-image-upscaling.

---

# PART IV — Catalogs

## 40. App archetypes

| Archetype | Examples |
|---|---|
| Business | Restaurant, clinic, retail, salon, services, gym |
| Productivity | Todo, notes, kanban, calendar, habit tracker, pomodoro |
| Content | Blog, portfolio, gallery, podcast, newsletter |
| Social | Chat, forum, comments, micro-blogging |
| Marketplace | Multi-vendor, freelancer board, rentals |
| Education | LMS, quiz, flashcards, course platform |
| Tools | Converter, calculator, AI wrapper, code playground |
| Dashboards | Analytics, monitoring, admin panels, internal tools |
| Creator | Drawing canvas, markdown editor, video player, audio player |
| Trackers | Finance, fitness, journal, mood, expense |
| Real-time | Collab whiteboard, presence apps, live events |
| Games | Trivia, puzzle, casual web games |
| Custom | À la carte module assembly |

## 41. Module catalog (250+ at year-1)

(Categories preserved from prior plan: Foundation 35, Auth variants 17, Commerce 45, Booking 18, Communication 30, Productivity 30, Content 35, Social 20, Education 22, Dashboard/Analytics 24, Real-time/Collaborative 13, Operational 24, Optional AI 18, plus Stock/Inventory — see §41.1.)

See module-by-module list in `docs/module-catalog.md` (auto-generated from `modules/*/module.yaml` + manual curation).

### 41.1 Featured module specification — Stock & Inventory Management

A universal stock-tracking module that adapts to any business: grocery, medical, clothing, electronics, restaurant, books, auto-parts, or generic. This is the canonical example of how a feature-rich module is specified end-to-end. Every other complex module SHOULD follow this pattern.

#### Scope

Single module covering: products, variants, batches, expiry, serial numbers, multi-location, low-stock alerts, barcode scanning, audit log, stock valuation (FIFO/LIFO/weighted), and field-specific behaviors. Pluggable via `business_field` config knob.

#### Module manifest

```yaml
# modules/stock-management/module.yaml
id: stock-management
type: module
version: 1.0.0
displayName: "Stock & Inventory"
description: "Universal stock tracking — products, variants, batches, expiry, multi-location, alerts. Adapts to grocery, medical, clothing, electronics, restaurant, books, auto-parts, or generic."

implements: [inventory@v1]
depends_on: [auth@v1, rbac@v1]
optional_integrations: [notifications@v1, analytics@v1, storage@v1]

config_knobs:
  - id: business_field
    type: enum
    options: [grocery, medical, clothing, electronics, restaurant, books, auto-parts, generic]
    default: generic
    description: "Pre-configures features for your industry. Sets sensible defaults for variants/batches/expiry."

  - id: track_variants
    type: bool
    default: true
    auto_true_for: [clothing, electronics]
    description: "Track size/color/material variants per product."

  - id: track_batches
    type: bool
    default: false
    auto_true_for: [grocery, medical]
    description: "Track batch numbers (for traceability and expiry)."

  - id: track_expiry
    type: bool
    default: false
    auto_true_for: [grocery, medical]
    description: "Track expiry dates and alert on items nearing expiry."

  - id: track_serial_numbers
    type: bool
    default: false
    auto_true_for: [electronics]
    description: "Each unit has a unique serial number (warranty tracking)."

  - id: multi_location
    type: bool
    default: false
    description: "Track stock across multiple warehouses/stores."

  - id: low_stock_threshold
    type: number
    default: 10
    description: "Default low-stock alert threshold per SKU. Override per product."

  - id: enable_barcode_scanner
    type: bool
    default: true
    description: "Camera-based barcode scanning for stock-in/stock-out flows."

  - id: enable_thermal_printer
    type: bool
    default: false
    auto_true_for: [retail, grocery]
    description: "Print barcode labels via thermal printer."

  - id: prescription_required_field
    type: bool
    default: false
    auto_true_for: [medical]
    description: "Mark items requiring prescription (medical only)."

  - id: regulated_substances
    type: bool
    default: false
    auto_true_for: [medical]
    description: "Track controlled/regulated substances with extra audit logging."

  - id: recipe_driven_consumption
    type: bool
    default: false
    auto_true_for: [restaurant]
    description: "Stock auto-decrements per recipe ingredients per order."

  - id: stock_valuation_method
    type: enum
    options: [FIFO, LIFO, weighted-average]
    default: FIFO
    description: "How stock value is computed for reports."

  - id: expiry_alert_days
    type: number
    default: 7
    description: "Days before expiry to trigger alert (when track_expiry=true)."

  - id: allow_negative_stock
    type: bool
    default: false
    description: "Permit overselling (creates backorder) vs. block at checkout."

emits:
  - stock.received     { sku, qty, batchNumber?, expiryDate?, location?, performedBy }
  - stock.consumed     { sku, qty, orderId?, reason, performedBy }
  - stock.adjusted     { sku, oldQty, newQty, reason, performedBy }
  - stock.low          { sku, currentQty, threshold }
  - stock.expiring     { sku, batchNumber, expiryDate, daysUntilExpiry }
  - stock.expired      { sku, batchNumber, expiryDate }
  - stock.transferred  { sku, qty, fromLocation, toLocation, performedBy }
  - stock.audited      { sku, expectedQty, actualQty, variance, performedBy }

subscribes:
  - orders.placed:
      handler: ./handlers/decrement-on-order.ts
  - orders.cancelled:
      handler: ./handlers/restore-on-cancel.ts
  - orders.refunded:
      handler: ./handlers/restore-on-refund.ts

ui_contributions:
  nav:
    - { label: "Stock", icon: package, path: /admin/stock, role: [owner, admin, staff], shell: admin }
    - { label: "Receive", icon: download, path: /admin/stock/receive, role: [owner, admin, staff], shell: admin }
    - { label: "Stock Alerts", icon: alert-triangle, path: /admin/stock/alerts, role: [owner, admin], shell: admin }
    - { label: "Audit", icon: clipboard-check, path: /admin/stock/audit, role: [owner, admin], shell: admin }
  dashboard_widgets:
    - { id: low_stock_count, size: small, source: "GET /api/admin/stock/stats/low" }
    - { id: expiring_soon, size: small, source: "GET /api/admin/stock/stats/expiring" }
    - { id: stock_value, size: medium, source: "GET /api/admin/stock/stats/value" }
    - { id: stock_movement, size: large, source: "GET /api/admin/stock/stats/movement?days=30" }
  pages:
    - { path: /admin/stock, layout: admin, requires: [stock.view] }
    - { path: /admin/stock/:sku, layout: admin, requires: [stock.view] }
    - { path: /admin/stock/receive, layout: admin, requires: [stock.receive] }
    - { path: /admin/stock/adjust, layout: admin, requires: [stock.adjust] }
    - { path: /admin/stock/transfer, layout: admin, requires: [stock.transfer] }
    - { path: /admin/stock/alerts, layout: admin, requires: [stock.view] }
    - { path: /admin/stock/audit, layout: admin, requires: [stock.audit] }
    - { path: /admin/stock/audit-log, layout: admin, requires: [stock.audit] }
  studio_blocks:
    - StockLevelBadge
    - LowStockTable
    - StockMovementChart
    - BarcodeScanner
  studio_sections:
    - StockOverviewSection
    - LowStockAlertsSection

permissions:
  - stock.view
  - stock.receive
  - stock.adjust
  - stock.transfer
  - stock.audit
  - stock.delete
  - stock.export

locales: [en, es, fr, hi, ar, zh-CN]

env: [DATABASE_URL]

tests:
  contract: [inventory@v1]
  smoke:
    - tests/smoke/receive-stock.spec.ts
    - tests/smoke/decrement-on-order.spec.ts
    - tests/smoke/expiry-alert.spec.ts
    - tests/smoke/multi-location-transfer.spec.ts
  fixtures:
    - tests/fixtures/sample-products.json
    - tests/fixtures/sample-batches.json
```

#### Database schema (Prisma — translates to SQLAlchemy/Django via §24)

```prisma
// modules/stock-management/schema.prisma

model Product {
  sku                  String           @id
  name                 String
  description          String?
  category             String?
  barcode              String?          @unique
  unit                 String           @default("piece") // piece, kg, liter, box, dozen
  costPrice            Decimal
  sellingPrice         Decimal
  taxRate              Decimal?         @default(0)
  reorderPoint         Int              @default(10)
  reorderQuantity      Int              @default(50)
  // Field-specific (nullable, used per business_field)
  prescriptionRequired Boolean?         @default(false)
  regulatedClass       String?          // e.g. "Schedule II"
  isPerishable         Boolean?         @default(false)
  warrantyMonths       Int?
  metadata             Json?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  variants             ProductVariant[]
  stockLevels          StockLevel[]
  movements            StockMovement[]
  batches              StockBatch[]
  serials              SerialNumber[]

  @@index([category])
  @@index([barcode])
}

model ProductVariant {
  id           String       @id @default(cuid())
  productSku   String
  name         String       // "Red - L"
  attributes   Json         // { color: "red", size: "L" }
  variantSku   String       @unique
  costPrice    Decimal?
  sellingPrice Decimal?
  product      Product      @relation(fields: [productSku], references: [sku])
  stockLevels  StockLevel[]
}

model StockLevel {
  id          String          @id @default(cuid())
  productSku  String
  variantId   String?
  locationId  String          @default("main")
  quantity    Int
  reserved    Int             @default(0)
  lastUpdated DateTime        @updatedAt
  product     Product         @relation(fields: [productSku], references: [sku])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  location    Location?       @relation(fields: [locationId], references: [id])

  @@unique([productSku, variantId, locationId])
  @@index([productSku])
}

model StockBatch {
  id               String   @id @default(cuid())
  productSku       String
  batchNumber      String
  quantity         Int
  manufacturedDate DateTime?
  expiryDate       DateTime?
  receivedAt       DateTime @default(now())
  cost             Decimal?
  metadata         Json?
  product          Product  @relation(fields: [productSku], references: [sku])

  @@unique([productSku, batchNumber])
  @@index([expiryDate])
}

model StockMovement {
  id           String   @id @default(cuid())
  productSku   String
  variantId    String?
  type         String   // received | sold | adjusted | transferred | expired | damaged | returned
  quantity     Int      // positive=inflow, negative=outflow
  fromLocation String?
  toLocation   String?
  batchId      String?
  orderId      String?
  reason       String?
  performedBy  String
  performedAt  DateTime @default(now())
  metadata     Json?
  product      Product  @relation(fields: [productSku], references: [sku])

  @@index([productSku])
  @@index([performedAt])
}

model SerialNumber {
  id             String    @id @default(cuid())
  productSku     String
  serial         String    @unique
  status         String    @default("in-stock") // in-stock | sold | returned | damaged
  soldTo         String?
  soldAt         DateTime?
  warrantyExpiry DateTime?
  product        Product   @relation(fields: [productSku], references: [sku])
}

model Location {
  id          String       @id @default(cuid())
  name        String
  type        String       @default("warehouse") // warehouse | store | counter
  address     String?
  isActive    Boolean      @default(true)
  stockLevels StockLevel[]
}

model StockAlert {
  id             String    @id @default(cuid())
  productSku     String
  type           String    // low-stock | expiring-soon | expired | overstock
  message        String
  acknowledged   Boolean   @default(false)
  createdAt      DateTime  @default(now())
  acknowledgedAt DateTime?
  acknowledgedBy String?
}

model StockAudit {
  id           String   @id @default(cuid())
  productSku   String
  expectedQty  Int
  actualQty    Int
  variance     Int
  reason       String?
  performedBy  String
  performedAt  DateTime @default(now())
}
```

#### Field-specific auto-configurations

The `business_field` knob auto-enables knobs and ships sample data:

| Field | Auto-enabled | Sample data | Special features |
|---|---|---|---|
| grocery | track_batches, track_expiry, thermal_printer | 30 grocery items with batches | Perishable badge, expiry alerts (3-day warning), FEFO picking suggestion |
| medical | track_batches, track_expiry, prescription_required, regulated_substances | 25 medicines with schedules | Prescription verification flow, regulated-substance audit log, expiry alerts (30-day warning), DEA-style record-keeping |
| clothing | track_variants | 20 clothing items with size/color matrix | Variant matrix UI, size-chart attachment, color swatches |
| electronics | track_serial_numbers, warranty tracking | 15 electronics items | Serial scanner, warranty expiry tracking, IMEI/MAC support |
| restaurant | recipe_driven_consumption | 40 ingredients with recipes | Ingredient deduction per dish, low-ingredient alerts, food cost calculator |
| books | barcode (ISBN) | 50 books with ISBN | ISBN auto-fetch (offline DB included), no expiry, no variants |
| auto-parts | compatibility tracking | 30 parts | Vehicle-compatibility matrix, OEM/aftermarket flag |
| generic | basic features only | 10 generic products | Minimal feature set; user enables what they need |

#### Stock-decrement behavior on `orders.placed`

```text
(spec) handlers/decrement-on-order.ts:
  on event orders.placed (payload):
    for item in payload.items:
        product = lookup product by sku=item.sku
        variantId = item.variantId or null
        locationId = item.locationId or 'main'

        if config.recipe_driven_consumption AND product is a dish:
            recipe = loadRecipe(item.sku)
            for ingredient in recipe.ingredients:
                requiredQty = ingredient.qtyPerServing × item.qty
                decrementStock(ingredient.sku, requiredQty, payload.orderId, 'sold-via-recipe')
        else:
            decrementStock(item.sku, item.qty, payload.orderId, 'sold')

  decrementStock(sku, qty, orderId, reason):
    level = StockLevel.find({ productSku: sku, locationId })
    if level.quantity - level.reserved < qty:
        emit stock.low { sku, currentQty: level.quantity, threshold }
        if config.allow_negative_stock == false:
            throw OrderRejectError('Insufficient stock')
    level.quantity -= qty
    level.save()
    StockMovement.create({ productSku: sku, type: 'sold', quantity: -qty, orderId, reason, performedBy: 'system' })

    // Trigger low-stock alert if threshold crossed
    if level.quantity <= product.reorderPoint:
        StockAlert.create({ productSku: sku, type: 'low-stock', message: `Stock for ${product.name} below ${product.reorderPoint}` })
        emit stock.low { sku, currentQty: level.quantity, threshold: product.reorderPoint }
```

#### API surface (implements `inventory@v1`)

```
GET    /api/admin/stock                     list with filters (category, low, expiring, location)
GET    /api/admin/stock/:sku                product detail with stock, batches, movements
POST   /api/admin/stock/receive             receive new stock (qty, batch, expiry, location)
POST   /api/admin/stock/adjust              manual adjustment with reason (audit logged)
POST   /api/admin/stock/transfer            move between locations
POST   /api/admin/stock/audit               start an audit (compares expected vs actual)
GET    /api/admin/stock/alerts              list current alerts (low/expiring/expired)
PATCH  /api/admin/stock/alerts/:id/ack      acknowledge an alert
GET    /api/admin/stock/movements           audit log of all stock movements
GET    /api/admin/stock/stats/low           count of low-stock items
GET    /api/admin/stock/stats/expiring      count of expiring items
GET    /api/admin/stock/stats/value         total stock value (per FIFO/LIFO/weighted)
GET    /api/admin/stock/stats/movement      stock-in vs stock-out chart data (?days=N)
GET    /api/admin/stock/export              CSV/Excel export
```

#### Why this is the canonical example

Stock management is one of the highest-value cross-vertical modules (retail, restaurants, medical, salons, clinics, e-commerce). Done right it serves dozens of starter recipes with no per-vertical reimplementation. The `business_field` knob model — universal core + field-specialized behavior — is the template for any future "universal but specializable" module (e.g., ratings, scheduling, comments, search).

## 42. Theme pack catalog (60+ at year-1)

8 categories: Minimal/Editorial/Pro (12), Glass/Gradient/Modern (10), Bold/Brutalist/Edgy (8), Soft/Playful (8), 3D/Heavy Animation (10), Layout-driven (8), Vertical-flavored (12), Special/Niche (6).

Auto-generated from `themes/*/theme.yaml`.

## 43. Starter catalog (200+ at year-1)

20 sub-categories including Food & Beverage (15), Retail (17), Health & Wellness (20), Beauty & Personal Care (10), Services (16), Real Estate & Hospitality (12), Professional (16), Education (10), Productivity & Personal (25), Content/Personal Site (25), Social (10), Marketplace (13), Education/Course (14), Tools/Generators (25), Dashboards/Internal Tools (15), Real-time/Interactive (11), Games (11), Health/Fitness (7), Finance/Business (9), Misc/Niche (12).

Auto-generated from `starters/*/starter.yaml`.

## 44. Animation presets (100+ at year-1)

See §34.4 for categories.

## 45. 3D scenes (40+ at year-1)

See §34.2 for catalog breakdown.

## 46. Section/block library (500+ at year-1)

Categories include: Heroes (50+), Pricing pages (15+), Feature sections (25), Testimonials (12), Team/about (10), FAQ (8), CTAs (15), Stats (8), Footers (12), Newsletter inline (6), Trust badges (5), Header/nav (10), Auth pages (10), Checkout flows (8), Dashboard sections (20), Empty states (10), Loading/skeleton (12), Product/commerce (15), Booking (8), Blog/content (10), Gallery (8), Form sections (10), Onboarding (8), Settings (10).

## 47. Email templates (50+)

Transactional (20), Marketing (15), Operational (10). Each available in 3 styles: minimal-text, branded-rich, plain-text-only. Built with React Email / MJML.

## 48. Form templates (30+)

Contact (4), Lead generation (4), Intake (5), Booking (4), Payment (3), Survey/feedback (4), Onboarding (3), Authentication (3).

## 49. Illustration packs (8+)

unDraw, Storyset, Open Doodles, Humaaans, Blush, Hand-drawn-custom, Isometric, Memphis-pattern.

## 50. Background patterns (30+)

SVG patterns: dots, grid, diagonal-lines, hexagons, triangles, waves, topographic, circuit-board, isometric-grid, plus-signs, crosshatch, herringbone, brick, bubbles, confetti, stars, snowflakes, polka-dots, scribbles, plus-cross, organic-blobs, stippled, floral, art-deco, etc.

## 51. Languages (30+)

English, Spanish, French, German, Italian, Portuguese, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Urdu, Arabic, Hebrew, Chinese (Simp/Trad), Japanese, Korean, Vietnamese, Thai, Indonesian, Malay, Russian, Polish, Dutch, Turkish, Greek, Swedish.

---

# PART V — Operating Plan

## 52. Tech stack

### Generator
Node.js 20+, pnpm workspaces, Turborepo, Hygen / custom templating, JSON Schema validators (ajv), Docker Compose for testing, Playwright for smoke + visual regression.

### Generated apps (default)
- Backend: FastAPI / Django / Node.js
- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- DB: Postgres (Prisma → multi-stack migrations)
- Components: shadcn/ui (copied) + Radix
- Animation: framer-motion (`motion`)
- 3D: @react-three/fiber + @react-three/drei + Spline
- Toasts: sonner • Drawers: vaul • Cmd palette: cmdk
- Icons: Lucide • Tabler / Phosphor / Heroicons / Iconoir alts
- Theme switch: next-themes
- Forms: react-hook-form + zod
- Charts: recharts + visx
- Drag-drop: dnd-kit
- Rich text: TipTap • Code editor: Monaco
- Email: React Email / MJML
- Onboarding: driver.js
- I18n: next-intl

### Studio
Puck (puckeditor.com), dnd-kit, Yjs (collab v2), Monaco (escape hatch v2+).

### Storage / deploy
S3 / R2 / local • Vercel / Render / Railway / Coolify VPS / plain Docker.

---

## 53. Phased implementation order

Each phase has a list of concrete tasks. Tasks within a phase MUST be completed before moving to the next phase unless explicitly marked as parallel.

### Phase 0 — Spike (1–2 days)

**Goal**: prove the architecture by hand-building one full restaurant app end-to-end.

Tasks:
1. Initialize repository (`pnpm init`, workspace config, Turborepo, Prettier, ESLint, TS).
2. Hand-write a single FastAPI + Next.js + Postgres restaurant app under `output/spike/` (auth, menu, orders, Stripe-test, WhatsApp-test).
3. Document every wiring decision in `docs/spike-notes.md` — these inform contract design.
4. Validate the app boots, login works, an order can be placed, payment processes (test mode).
5. Zip the output and confirm it deploys to Vercel + Render.

### Phase 1 — Generator MVP (~2 weeks)

**Goal**: turn the spike into the first generation pipeline.

Tasks:
1. Define `auth@v1`, `orders@v1`, `payment@v1` contracts based on spike learnings.
2. Implement `packages/schemas` (recipe, module, theme JSON schemas + zod versions).
3. Implement `packages/wirer` MVP: parse recipe → resolve modules → copy templates → merge configs → write output.
4. Convert the spike app into modular templates: `templates/backend/fastapi/auth-email/`, `templates/backend/fastapi/orders-basic/`, `templates/integrations/payment/stripe/`, etc.
5. Build 3 theme packs: Minimal, Glass, Aurora (with full token files + sample sections).
6. Build the Wizard MVP (CLI): 10 phases, deterministic, no preview pane yet.
7. Build `packages/cli` with `b-dash wizard`, `b-dash generate`, `b-dash list`.
8. Smoke test pipeline: Wizard → recipe → wirer → generated app → Playwright login + order test.
9. Package the output as a zip with deploy README.

### Phase 2 — Cross-match proof (~2 weeks)

**Goal**: prove templates compose by adding a second backend stack and a second UI variant.

Tasks:
1. Add `templates/backend/django/auth-email/` and `templates/backend/django/orders-basic/`.
2. Add a second theme pack (e.g., Brutalist).
3. Add a second auth UI variant (e.g., split-screen).
4. Verify all 4 combos (FastAPI×Minimal, FastAPI×Brutalist, Django×Minimal, Django×Brutalist) generate working apps.
5. Build Prisma → Django translator (`packages/wirer/src/db/prisma-to-django.ts`).
6. Visual regression CI: every section in every theme.

### Phase 3 — Module dynamics (~3 weeks)

**Goal**: add the granular feature systems.

Tasks:
1. Implement `events@v1` contract + in-process bus.
2. Implement `notifications@v1` contract + adapters: Resend (email), Twilio (SMS), Meta WhatsApp Cloud.
3. Implement multi-gateway payment: Razorpay + COD + Bank-transfer adapters.
4. Implement `rbac@v1` contract + middleware (FastAPI + Django + Node).
5. Add per-event channel routing matrix to wizard.
6. Update wirer to compile dispatch tables from recipe.

### Phase 4 — Studio v1 (~2–3 months)

**Goal**: ship the visual builder for cosmetic edits.

Tasks:
1. Set up Puck integration in `packages/studio`.
2. Write block manifests for every section in `sections/`.
3. Implement Studio panels: Layers, Properties, Theme, Pages.
4. Implement two-mode persistence: studio-state.json (cosmetic) vs recipe.json (structural).
5. Implement Setup Tasks panel reading from recipe.pendingQuestions.
6. Implement responsive preview (desktop/tablet/mobile).
7. Studio dev server: `b-dash studio <customer-id>` opens browser at port 3001.
8. Wizard live preview pane (port 3002, iframe in wizard UI).

### Phase 5 — Theme + asset library wave 1 (~2 months)

**Goal**: build the foundational catalog.

Tasks (parallel-able where noted):
1. Build 15 theme packs total (12 new). [parallel]
2. Build 100 sections covering all categories. [parallel]
3. Build 30 animation presets. [parallel]
4. Build 10 3D scenes. [parallel]
5. Build 3 illustration packs. [parallel]
6. Build 15 email templates (10 transactional + 5 marketing). [parallel]
7. Build 10 form templates. [parallel]
8. Build brand ingestion algorithm (logo → palette + favicon variants).
9. Build font pair library (30 pairs preloaded).
10. Visual regression CI: every section × every theme passes screenshot diff.

### Phase 6 — Studio v2 (~1–2 months)

**Goal**: customer can do structural changes from Studio.

Tasks:
1. Visual data binding (dropdowns to bind components to data sources).
2. Conditional visibility ("show only if logged in").
3. Add/remove modules from Studio (triggers recipe edit + regen).
4. Custom CSS escape hatch (writes to overrides/styles/custom.css).
5. Save-as-starter (publish customer's build to gallery).
6. Yjs-based multi-user concurrent editing.

### Phase 7 — Template Gallery (~6 weeks, parallel-able)

**Goal**: 50 starters covering all archetypes.

Tasks:
1. Build 50 starter recipes with sample data and intent.yaml files.
2. Live preview deploys for each starter.
3. Gallery UI (filterable by archetype, business type, features).
4. "Use this" flow: brand prompts → generate → deploy.

### Phase 8 — Module catalog wave 1 (~6 weeks, parallel-able)

**Goal**: 100 modules online.

Tasks:
1. Build productivity modules: todo, kanban, notes, calendar, habit-tracker, pomodoro.
2. Build content modules: blog, portfolio, gallery, newsletter, podcast.
3. Build social modules: chat, comments, forum.
4. Build tools modules: file-converter, qr-generator, url-shortener.
5. Each module ships with smoke tests + at least one starter that uses it.

### Phase 9 — Operational (~4 weeks)

**Goal**: production-ready operational layer.

Tasks:
1. Telemetry integrations: Sentry, PostHog, Plausible.
2. Backup module: scheduled DB dumps to S3.
3. Deploy target adapters: Vercel, Render, Railway, Coolify, plain Docker.
4. Multi-language polish: 30+ languages with foundation strings.
5. Demo deploy infrastructure: ephemeral preview URLs with TTL.
6. Optional AI customer modules: anthropic, openai, ollama-local templates.

### Phase 10 — Overrides + patch system (~3 weeks)

**Goal**: customizations survive regenerations; security patches flow through.

Tasks:
1. Implement overrides/ folder mechanism (wirer respects it).
2. Implement `b-dash upgrade <customer-id>` workflow.
3. Changelog parser (categorizes safe / review / breaking).
4. Conflict detection at regeneration time.

### Phase 11 — Catalog wave 2 (ongoing through year-1)

**Goal**: reach year-1 inventory targets.

Tasks (parallel, ongoing):
- Themes: 15 → 60+
- Starters: 50 → 200+
- Modules: 100 → 250+
- Sections: 100 → 500+
- Animations: 30 → 100+
- 3D scenes: 10 → 40+
- Email templates: 15 → 50+
- Form templates: 10 → 30+
- Illustration packs: 3 → 8+

---

## 54. Hard problems & mitigations

| Problem | Mitigation |
|---|---|
| Contract design is the hardest part | Spend disproportionate Phase 1 time on it. Version everything. Don't merge breaking contract changes. |
| DB schema portability | Single Prisma source → translators for SQLAlchemy + Django. Test all 3 stacks per migration. |
| Frontend ↔ backend wiring | Generated API client lib from contract OpenAPI. CORS allowlist baked in. |
| Dependency conflicts | Containerize every generated app (Docker). Version hell stays inside the box. |
| Studio is 2–3 months | Don't underestimate. Don't start before contracts and modules are stable. |
| Library curation cost | Curate aggressively. CI visual regression on every PR. 50 great > 500 mediocre. |
| 3D performance on mobile | Every R3F component MUST ship a 2D `lite` fallback. Performance budget enforced in CI. |
| Bundle size | Per-route splits by default. Tree-shake icons. Defer animation libs until after FCP. |
| Customization survival | Design overrides/ from Phase 1, even if not used until Phase 10. |
| Maintenance scales with surface area | Curate 50 great modules instead of 500 mediocre. Auto-generated docs cut manual writing. |
| Asset library quality consistency | Visual review checklist + CI screenshot diff + designer sign-off on every shared asset. |
| Section portability across themes | Tokens-only styling enforced via lint rule. Cartesian-product CI catches regressions. |

---

## 55. Operating principles

1. **Composition over generation.** Wire pre-built code; don't generate code.
2. **Contracts before implementations.** Always.
3. **Deterministic, not LLM.** No AI in the generator path.
4. **Customer owns the code.** Always shippable as a zip.
5. **Visual first, code second.** Studio is the primary surface for non-tech users.
6. **One canonical recipe.** All paths (gallery / wizard / Studio) converge to `recipe.json`.
7. **Overrides survive.** Never overwrite customer customizations.
8. **Test the output, not just the generator.** Smoke + visual regression on the generated app.
9. **Curate aggressively.** Less surface, higher quality.
10. **Free or cheap to customers, zero variable cost to us.** This is the wedge.
11. **Tokens-only styling in shared assets.** Sections, blocks, components reference tokens — never hardcoded colors/sizes.
12. **Every shared asset works in dark mode.**
13. **Mobile-first for shared assets.** All sections render great on 375px.
14. **Accessibility is not optional.** WCAG AA on every shared asset.
15. **Schema-validated at every boundary.** Recipes, modules, themes — validated via JSON Schema before use.
16. **Idempotent generators, atomic writes.** Wirer is a pure function modulo overrides.
17. **Fail loud, fail early.** Validation errors surface before any I/O.

---

## 56. Open decisions

These MUST be answered before scaffolding begins.

1. **Spike vertical**: restaurant / clinic / retail? *Recommend: restaurant.*
2. **Spike stack**: FastAPI + Next.js + Postgres + Tailwind + shadcn? *Recommend: yes.*
3. **Generator language**: Node? *Recommend: yes.*
4. **First 3 theme packs**: *Recommend: Minimal, Glass, Aurora.*
5. **Studio editor library**: *Recommend: Puck.*
6. **Monorepo**: pnpm + Turborepo? *Recommend: yes.*
7. **First 5 starters for the Gallery**: *Recommend: pizza-shop, doctor-clinic, personal-portfolio, todo-app, link-in-bio.*
8. **Section/block library track**: alongside themes (Phase 5) or parallel? *Recommend: parallel with shared visual review.*
9. **Default illustration packs**: *Recommend: unDraw, Storyset, hand-drawn.*
10. **License**: MIT? Apache-2? Custom? *Recommend: MIT for the generator; per-asset licensing for premium themes/starters.*

---

---

# PART VI — Operational Specifications (added in audit pass)

The earlier sections covered architecture and core implementation. This part covers the operational machinery any production system needs: contributor workflows, asset management, baselines for generated apps, compliance, backup, versioning, and migration.

---

## 57. Template / Module / Theme author guide

How a contributor adds a new asset to the catalog.

### 57.1 Adding a new module

1. `pnpm gen:module <name>` scaffolds `modules/<name>/` with template files.
2. Edit `module.yaml`: declare `implements`, `depends_on`, `config_knobs`, `emits`/`subscribes`, `ui_contributions`, `permissions`.
3. Write Prisma schema fragment in `schema.prisma`.
4. Implement backend handlers in `backend/<stack>/` (one folder per stack supported).
5. Implement frontend pages/components in `frontend/<framework>/`.
6. Write smoke tests in `tests/smoke/`.
7. Add seed data in `seed.json`.
8. Add locale strings in `locales/en.json` (other languages later).
9. Run `pnpm test:module <name>` (contract conformance + smoke).
10. Add to module catalog docs (auto-generated; verify presence).

### 57.2 Adding a new theme

1. `pnpm gen:theme <name>` scaffolds `themes/<name>/`.
2. Define `tokens.json` (light) and `tokens.dark.json` (dark variant). Both required.
3. Set `theme.yaml` with category, font pair, component variants, motion preset.
4. Add preview screenshots to `preview/` (desktop, mobile, walkthrough video).
5. Run `pnpm test:theme <name>` — visual regression across all sample sections.
6. Verify WCAG AA on all color combinations (lint enforced).

### 57.3 Adding a new starter

1. `pnpm gen:starter <name>` scaffolds `starters/<name>/`.
2. Define `starter.yaml` (a complete `recipe.json` as the base).
3. Define `intent.yaml` (see §21.3.5) with strong/weak signals, aliases, multilingual, emojis, phrase patterns.
4. Add at least 8 example phrases in `intent.yaml > examples` covering casual/formal/non-English variants.
5. Add sample data in `seed.json`.
6. Configure preview deploy URL in `preview.yaml`.
7. Run `pnpm test:starter <name>` — full generation + smoke + intent matcher tests against the examples.

### 57.4 Adding a new section/block

1. `pnpm gen:section <category>/<name>` scaffolds `sections/<category>/<name>/`.
2. Write `component.tsx` using only token-based styling (lint enforces — see §1.1).
3. Define `section.yaml` with Puck config (fields, defaultProps, render).
4. Add `preview/desktop.webp` and `preview/mobile.webp` (≤200 KB each).
5. Write a fixture in `fixtures/sample-props.json`.
6. Run `pnpm test:section <name>` — visual regression across all themes (cartesian).

### 57.5 Adding a new theme pack — gotchas

- ALL standard token keys (§10.2) MUST be present.
- Every section MUST render correctly in this theme. CI verifies via screenshot diff.
- Light AND dark tokens both required.

### 57.6 Quality gates (CI enforced)

- Linter rejects hardcoded colors / fonts / sizes in shared assets.
- Visual regression CI runs on every PR touching `themes/`, `sections/`, `blocks/`, `modules/`.
- Schema validators run on every PR.
- Contract conformance tests must pass for module changes.
- Performance budgets (§32) must hold.
- Accessibility checks (§61.4) must hold.

---

## 58. Naming, namespacing & file conflict resolution

### 58.1 Module file namespacing (MUST)

Every module's generated files MUST live under one of these namespaces:

| Type | Path pattern |
|---|---|
| Backend routes | `<backend>/routes/<module-id>/...` |
| Backend models | `<backend>/models/<module-id>/...` |
| Frontend pages | `src/app/<module-id>/...` (admin: `src/app/admin/<module-id>/...`) |
| Frontend API client | `src/lib/api/<module-id>.ts` |
| Frontend components | `src/components/<module-id>/...` |
| Locale strings | `src/locales/<lang>.json` under key `<module-id>.*` |
| DB tables | `<module_id>_<table>` (snake_case prefix) |
| Permissions | `<module-id>.<verb>` |
| Events | `<module-id>.<verb>` |
| Public assets | `public/modules/<module-id>/...` |

This namespacing makes file collisions structurally impossible.

### 58.2 Wirer conflict detection

If two modules attempt to write the same path (despite namespacing), the wirer:
1. Logs both contributions with their source modules.
2. Halts generation with `WIRER_FILE_CONFLICT` error.
3. Reports: `<path> contributed by both <module-a> and <module-b>; check namespacing rules.`

### 58.3 Shared file merging rules

Some files are intentionally merged from multiple sources:

| File | Merge strategy |
|---|---|
| `package.json` (deps) | Set union; conflict if same dep with incompatible versions |
| `requirements.txt` / `pyproject.toml` | Set union; conflict on incompatible versions |
| `.env.example` | Append unique keys; comment-prefix the source module |
| `tailwind.config.ts` | Plugins set-union; theme extension deep-merge |
| `prisma/schema.prisma` | Concatenation; conflict if same model name |
| `src/middleware.ts` | Compose middleware chain in declared order |
| `src/locales/<lang>.json` | Deep-merge under module-prefixed keys |
| `next.config.ts` | Deep-merge of plugin/option arrays |

### 58.4 Dependency version resolution

When two modules require different versions of the same npm/pip package:
1. If versions are semver-compatible (e.g., `^1.2.0` vs `^1.3.0`): pick the higher one.
2. If versions are incompatible: fail with `WIRER_DEP_CONFLICT` and log both modules + required versions.
3. The customer (or operator) MUST upgrade one module or pick compatible alternatives.

---

## 59. Asset handling

### 59.1 Asset categories

| Category | Source | Destination | Optimization |
|---|---|---|---|
| Theme images | `themes/<t>/assets/` | `public/themes/<t>/` | Sharp resize + WebP/AVIF |
| Module images | `modules/<m>/assets/` | `public/modules/<m>/` | Sharp resize + WebP |
| Section previews | `sections/<s>/preview/` | (Studio only, not shipped) | None |
| Customer logo | `branding/logo.<ext>` | `public/branding/logo.<ext>` + `favicon-{16,32,180,512}.png` | Multi-size |
| Sample seed images | `modules/<m>/seed/images/` | `public/seed/<m>/` | Sharp resize |
| Fonts | from Google Fonts via `next/font` | self-hosted in `public/fonts/` | woff2 only, subset |

### 59.2 Image budgets

- Above-fold images: < 200 KB (Sharp + AVIF/WebP).
- Other images: < 500 KB.
- All images served via `next/image` with explicit `width` / `height` / `priority` flags.

### 59.3 Icons & SVG

- Icons: `lucide-react` by default (tree-shaken). Alternates: Tabler, Phosphor, Heroicons, Iconoir.
- Decorative SVGs: inline (when < 5 KB) or via `next/image`.
- Logos: SVG preferred; PNG fallback for legacy email clients.

### 59.4 Customer-uploaded files

- MUST be stored on a separate domain or via signed URLs (see §33.2).
- MIME + extension + magic-byte validation at upload boundary.
- Image uploads pass through Sharp for re-encoding (strips EXIF, resamples).

---

## 60. Caching strategy

### 60.1 Wirer caching

- Module/template files: hashed by content; reused across regenerations if hash unchanged.
- `pnpm install`: cached via `pnpm store` (shared across customers).
- Generated `tokens.json` → CSS/Tailwind compiled output: cached per `(theme + tokenOverrides)` hash.
- Wirer cache stored under `.wirer-cache/` at workspace root; size-capped at 1 GB; LRU eviction.

### 60.2 Generated app caching

| Layer | Strategy |
|---|---|
| Static assets | Long-cache with content hash (Next.js default) |
| HTML pages | ISR for content; on-demand revalidate via webhook |
| API responses | `Cache-Control: private, max-age=0` by default; per-route override |
| Database queries | Short-lived in-memory cache (60s) for hot reads; explicit invalidation on mutation |
| Session | HTTP-only cookie; server reads only on protected routes |

### 60.3 CDN

- Default: Vercel/Render CDN (built-in).
- Self-hosted: Cloudflare in front (recommended); generated app emits proper `Cache-Control` and `ETag` headers.
- Stale-while-revalidate enabled for marketing pages by default.

---

## 61. Generated app baseline requirements

Every generated app MUST meet these baselines.

### 61.1 SEO

- `<title>` and `<meta name="description">` per page (configurable in module manifest).
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`, `og:url`).
- Twitter Card tags.
- `robots.txt` (default: allow all; override per recipe).
- `sitemap.xml` auto-generated from registered routes.
- `<link rel="canonical">` per page.
- Structured data (JSON-LD): Organization on home; Product on product pages; Article on blog; FAQ on FAQ pages; LocalBusiness for vertical=business.
- Lighthouse SEO score ≥ 90 (CI enforced).

### 61.2 PWA

- `manifest.webmanifest` with name, icons (192, 512), theme color, background color, start URL, display mode.
- `service-worker.js` (via Workbox): cache-first for static assets, network-first for API, stale-while-revalidate for content.
- "Add to Home Screen" prompt (configurable).
- Offline page (`/offline`) for routes the SW couldn't cache.
- iOS Safari support: `apple-touch-icon` 180x180.
- Updates: SW skipWaiting + clientsClaim with user prompt on new version.

### 61.3 Email deliverability

- All transactional email sent via configured provider (Resend/SendGrid/SES).
- DKIM signing required (provider-managed).
- SPF setup documented in per-customer README.
- DMARC `p=quarantine` recommended in README.
- Email templates use proper text + HTML alternates (multipart).
- Unsubscribe link in marketing emails (transactional exempt).
- `List-Unsubscribe` header on marketing.
- Bounce handling: parse provider webhooks, mark addresses as bounced.
- Suppression list to block re-sends to bounced/complained addresses.

### 61.4 Accessibility

- WCAG AA minimum: contrast ratios, focus indicators, keyboard nav, ARIA labels, semantic HTML.
- All interactive elements MUST be keyboard-reachable.
- All images MUST have `alt`.
- All forms MUST have associated labels.
- Skip-to-content link on every page.
- Focus trap in modals; ESC to dismiss.
- Lighthouse Accessibility score ≥ 95 (CI enforced).
- All themes pass automated axe-core checks on sample sections.

---

## 62. Compliance & privacy (generated apps)

### 62.1 GDPR / CCPA / India DPDP defaults

Generated apps include:
- **Cookie consent banner** (auto-detects EU IP via Cloudflare header; respects Do-Not-Track).
- **Privacy policy generator** based on enabled modules (Stripe → mention payment processor; GA → mention analytics; etc.).
- **Data export endpoint** (`GET /api/me/data-export` returns ZIP of user data within 30 days).
- **Account deletion endpoint** (`DELETE /api/me` with grace period of 30 days, then hard delete).
- **Audit log** of personal-data access by admins.
- **Consent log** of opt-in records (timestamp, IP-truncated, version of policy accepted).

### 62.2 Audit log (in-app)

Two audit logs:
- **App audit log** (in DB) — records significant user actions: login, role change, data export, account delete, refund, regulated-substance access (if medical), bulk operations.
- **Generator audit log** (local file) — records every wirer run: who, when, what recipe, outcome.

Format:
```json
{
  "ts": "2026-05-09T12:00:00Z",
  "actor": "userId|system",
  "action": "login|order.refund|...",
  "target": "...",
  "details": { "...": "..." },
  "ip": "192.168.1.0"
}
```

### 62.3 Data minimization

- Don't store data the app doesn't need.
- IP addresses in audit log are truncated (last octet zeroed) unless customer enables full IP logging.
- Default retention: 90 days for audit log; configurable.
- PII fields marked in DB schemas with `// @pii` comment for documentation.

### 62.4 Export & delete request flows

- Frontend page at `/settings/privacy` exposes:
  - "Download my data" → triggers async export job → emails ZIP link.
  - "Delete my account" → 30-day soft delete window with confirmation email.
- Anonymized data analytics retained (without PII) post-deletion.

---

## 63. Generator telemetry (opt-in, privacy-respecting)

- Generator telemetry is **OFF by default**.
- If enabled (`b-dash config set telemetry true`):
  - Anonymous, aggregate-only events: which templates picked, generation duration, errors (sanitized).
  - NO recipes, NO customer data, NO API keys, NO IPs.
  - Sent to a single endpoint operated by the maintainer (documented).
- Customer recipe content NEVER leaves the local machine.
- Opt-in is per-installation, not per-recipe.
- `b-dash config show` always displays the current telemetry state prominently.

---

## 64. Backup, rollback & generation history

### 64.1 Recipe history

- Every generation snapshots `recipe.json` to `output/<id>/.history/<timestamp>.json`.
- Last 30 snapshots retained (configurable).
- `b-dash rollback <id> --to <timestamp>` restores the chosen snapshot and re-runs the wirer.

### 64.2 Generation snapshots

- After successful generation, the wirer compresses `output/<id>/src/` into `output/<id>/.snapshots/<timestamp>.tar.gz`.
- Last 5 snapshots retained.
- `b-dash restore <id> --to <timestamp>` extracts the snapshot (preserves `overrides/`).

### 64.3 Database backups (in generated apps)

- Backup module (Phase 9) provides scheduled DB dumps to S3/R2.
- Restore CLI: `<app> restore --from s3://...`
- Default schedule: daily at 02:00 UTC; 30-day retention.

### 64.4 Disaster recovery

- Customer-deployed apps document a recovery runbook in their README:
  - Where backups are stored
  - How to restore a specific point in time
  - How to spin up a new instance from scratch + restore

---

## 65. Contract conformance test framework

### 65.1 Concept

Each contract `<contract>@v1.contract.yaml` ships a conformance test suite under `contracts/<contract>@v1/conformance/`. Any module implementing that contract MUST pass these tests.

### 65.2 Test format

```yaml
# contracts/auth@v1/conformance/login.test.yaml
- name: "Login with valid credentials returns user + session"
  setup:
    create_user: { email: "test@x.com", password: "secret" }
  request:
    method: POST
    path: /api/auth/login
    body: { email: "test@x.com", password: "secret" }
  assert:
    status: 200
    body:
      user: { id: '*', email: "test@x.com" }
      session: { token: '*', expiresAt: '*' }

- name: "Login with wrong password returns 401 with code AUTH_INVALID"
  request:
    method: POST
    path: /api/auth/login
    body: { email: "test@x.com", password: "wrong" }
  assert:
    status: 401
    body: { code: "AUTH_INVALID" }
```

### 65.3 Runner

```text
b-dash test:contract <module-id> --contract auth@v1
```

The runner:
1. Spins up the module's backend in Docker.
2. Runs each test against the running service.
3. Validates response against contract schema.
4. Reports pass/fail with diff.

CI runs `b-dash test:contract` on every module on every PR.

### 65.4 Required coverage

Every contract MUST ship conformance tests for:
- All defined operations (happy path)
- All defined error conditions
- All event emissions (verify event was emitted with correct payload)
- Pagination / filtering / sorting where defined

---

## 66. Versioning, deprecation & release policy

### 66.1 Semver

All versioned artifacts (templates, modules, themes, contracts) use semver `MAJOR.MINOR.PATCH`:
- **MAJOR**: breaking change (API/schema changes consumers MUST adapt to).
- **MINOR**: backward-compatible feature.
- **PATCH**: backward-compatible fix.

### 66.2 Contract versioning

- Contract breaking changes MUST go to a new `@vN+1`.
- Old version MUST coexist for at least 2 generator MAJOR releases.
- Deprecated contracts emit a console warning in the wirer.

### 66.3 Module deprecation

- Mark in `module.yaml` with `deprecated: true` and `replacedBy: <other-module-id>`.
- Generator surfaces deprecation in CLI output and Wizard.
- Deprecated modules MUST remain installable for 1 year after deprecation flag set.

### 66.4 Generator release cadence

- PATCH: weekly (bug fixes).
- MINOR: monthly (new features, new templates).
- MAJOR: quarterly (breaking changes, contract upgrades).
- Release notes auto-generated from Conventional Commits.
- `CHANGELOG.md` at root tracks all releases.

### 66.5 LTS policy

Every 4th MAJOR release is an LTS (Long-Term Support) release with security patches for 18 months.

---

## 67. Generator self-update mechanism

### 67.1 Update flow

```
b-dash self-update            checks npm registry for latest, prompts to install
b-dash self-update --check    just shows current vs latest
b-dash self-update --to 1.4.0 install specific version
```

### 67.2 Compatibility check

After self-update, the generator validates:
- All existing `output/<id>/recipe.json` files are still valid against the new schema.
- If any are not, prompts the user to migrate or pin to the previous version.

### 67.3 Pin version per project

A `b-dash.config.json` at workspace root pins the generator version for reproducibility:

```json
{
  "generatorVersion": "1.4.0",
  "telemetry": false,
  "outputDir": "./output",
  "secretsFile": "./secrets/test-keys.env"
}
```

`b-dash` commands MUST refuse to run if the installed version doesn't match the pin (with `--force` to override).

---

## 68. Custom domains & SSL automation

### 68.1 For generated apps

- Per-customer README documents how to point a domain at the deploy target.
- For Vercel/Render: customer adds domain in dashboard; SSL automatic.
- For Coolify/VPS: generator emits a `caddy.json` or `nginx.conf` snippet with Let's Encrypt config.

### 68.2 For preview deploys

- Default: subdomain on the preview platform (`<id>.vercel.app`, `<id>.onrender.com`).
- Optional: customer-provided custom domain via DNS verification token.

### 68.3 Domain verification flow

- Generator emits a `b-dash-verify-<token>` TXT record requirement.
- Customer adds TXT record at DNS provider.
- `b-dash verify-domain <id> <domain>` polls DNS; on success, configures the deploy.

---

## 69. Migration tooling

### 69.1 Cross-starter migration

```
b-dash migrate <id> --to-starter <new-starter-id>
```

- Compares old recipe modules with new starter modules.
- Modules common to both: kept (preserves data).
- Modules removed: data archived under `output/<id>/.archive/`, schema dropped (with confirmation).
- Modules added: schema migrated, sample data offered.
- Theme: optionally swap.

### 69.2 Module replacement

```
b-dash migrate-module <id> --replace <old-module-id> --with <new-module-id>
```

For deprecated → replacement scenarios. Automatic data migration if both modules implement the same contract version.

### 69.3 Stack migration (advanced)

```
b-dash migrate <id> --backend nodejs
```

Switches backend stack. Re-runs the wirer with the new stack. **Data migration is NOT automatic** — the customer must export from old, import to new (CLI helps with the mechanics but not data semantics).

### 69.4 Theme swap

```
b-dash migrate <id> --theme <new-theme-pack>
```

Swaps theme pack. Tokens regenerate; sections re-render. Customer-customized tokens (in recipe.theme.tokenOverrides) are preserved on top.

---

## 70. Webhook security & idempotency

### 70.1 Inbound webhook requirements (MUST)

- Verify signature header (provider-specific: `Stripe-Signature`, `X-Razorpay-Signature`, etc.) before processing.
- Reject if signature missing or invalid (return 401).
- Replay protection: track event IDs in `webhook_events` table; reject duplicates.
- Idempotency: handlers MUST be idempotent (safe to receive same event twice).
- Timeout: respond within 5 seconds (queue heavy work).

### 70.2 Outbound webhooks (if customer enables)

- Customer can register webhook endpoints for their own events.
- Generator emits HMAC-SHA256 signature on each payload (`X-B-Dash-Signature` header).
- Retry policy: exponential backoff, max 5 retries over 24 hours.
- Dead-letter queue for permanently failed deliveries; viewable in admin.
- Recipient endpoints SHOULD respond within 10 seconds.

### 70.3 Webhook replay tooling

- Admin UI: list received webhook events, filter by status, replay any event manually.
- Useful for debugging integration issues.

---

## 71. Module marketplace & plugin system (future)

### 71.1 Concept (Phase 12+)

Third-party authors can publish modules / themes / starters to a community marketplace. Customers install via:

```
b-dash install <author>/<package>@<version>
```

### 71.2 Constraints

- Published packages MUST pass contract conformance tests (CI-verified at publish time).
- Packages MUST be signed by author (cryptographic provenance).
- Marketplace ratings, security audits, manual review for top-listed packages.

### 71.3 Trust model

- **Official** packages: maintained by core team; reviewed.
- **Verified** packages: third-party but security-audited.
- **Community** packages: install at your own risk; customer warned in CLI.

### 71.4 Revenue share (if monetized)

- Free packages: no fee.
- Paid packages: 70/30 split (author/platform) — if platform offers payment processing.
- Self-hosted packages: no fee, no platform involvement.

---

## 72. Glossary & quick reference

| Term | Meaning |
|---|---|
| **Recipe** | The canonical spec for a customer's app (`recipe.json`) |
| **Wirer** | The engine that turns a recipe into a generated app |
| **Module** | A composable feature unit (e.g., orders, todo, stock-management) |
| **Template** | A backend or frontend implementation of a contract |
| **Theme** | A visual design system (tokens + variants) |
| **Section** | A page-level composable unit (e.g., hero, pricing) |
| **Block** | A smaller reusable UI unit (e.g., StatCard) |
| **Starter** | A complete pre-built recipe (e.g., pizza-shop) |
| **Studio** | The visual builder for non-tech customers |
| **Setup Tasks** | Skipped wizard questions surfaced as todos in Studio |
| **Override** | A customer customization that survives regeneration |
| **Contract** | A versioned interface specification (e.g., `auth@v1`) |
| **Hook/Event** | An emitted/subscribed event in the in-process bus |
| **Token** | A design value (color, spacing, etc.) referenced everywhere |
| **Archetype** | A high-level app category (business, productivity, content, etc.) |
| **Vertical** | A business sub-category (restaurant, clinic, retail, etc.) |
| **business_field** | The "universal but specializable" knob pattern (see §41.1) |
| **BYO key** | Bring-your-own API key (used for AI customer modules) |
| **Pipeline** | The wirer's stage sequence: parse → resolve → wire → test → promote |
| **Conformance test** | A test verifying a module satisfies its declared contract |
| **Intent matcher** | The deterministic algorithm matching a user sentence to a starter |
| **Setup Tasks panel** | Studio panel showing skipped questions as todo cards |

---

# AUDIT — completeness check

This audit was performed after writing PART VI to confirm the document is self-contained for build.

### Architecture coverage
- Vision, mental model, customer journey: ✓ (Part I)
- Repository structure: ✓ (§7)
- All major schemas: recipe, module, theme: ✓ (§8, §9, §10)
- Contract specs: ✓ (§11) — auth, orders, payment, notifications, events, rbac with full operation/event detail; booking/appointments/inventory/storage/search referenced
- Granularity layers: ✓ (§12)
- Hook/event system: ✓ (§13)
- Dashboard composition: ✓ (§14)
- Override system: ✓ (§15)
- Update/patch system: ✓ (§16)

### Implementation coverage
- Engineering conventions: ✓ (§17)
- Repository setup: ✓ (§18)
- Wirer algorithm: ✓ (§19)
- CLI commands: ✓ (§20)
- Wizard engine + intent matching: ✓ (§21, humanized in §21.3)
- Studio architecture: ✓ (§22)
- Theme rendering pipeline: ✓ (§23)
- DB portability: ✓ (§24)
- Frontend↔backend wiring: ✓ (§25)
- I18n: ✓ (§26)
- Brand ingestion: ✓ (§27)
- RBAC: ✓ (§28)
- Rate limiting: ✓ (§29)
- Demo/preview: ✓ (§30)
- Test strategy: ✓ (§31)
- Performance budgets: ✓ (§32)
- Security requirements: ✓ (§33)
- Animation & 3D: ✓ (§34)
- Asset library spec: ✓ (§35)
- Notifications: ✓ (§36)
- Payments: ✓ (§37)
- Auth options: ✓ (§38)
- AI as customer module: ✓ (§39)

### Catalog coverage
- All catalogs (archetypes, modules incl. featured stock-management, themes, starters, sections, animations, 3D, emails, forms, illustrations, patterns, languages): ✓ (§40–51)

### Operating plan coverage
- Tech stack: ✓ (§52)
- Phased implementation order with concrete tasks: ✓ (§53)
- Hard problems: ✓ (§54)
- Operating principles: ✓ (§55)
- Open decisions: ✓ (§56)

### Operational specifications coverage (added in audit)
- Template/module/theme/starter author guide: ✓ (§57)
- File namespacing & conflict resolution: ✓ (§58)
- Asset handling: ✓ (§59)
- Caching strategy: ✓ (§60)
- Generated app baseline (SEO, PWA, email deliverability, accessibility): ✓ (§61)
- Compliance & privacy (GDPR/CCPA/DPDP, audit log, data export/delete): ✓ (§62)
- Generator telemetry (opt-in): ✓ (§63)
- Backup, rollback & generation history: ✓ (§64)
- Contract conformance test framework: ✓ (§65)
- Versioning, deprecation & release policy: ✓ (§66)
- Generator self-update: ✓ (§67)
- Custom domains & SSL: ✓ (§68)
- Migration tooling: ✓ (§69)
- Webhook security & idempotency: ✓ (§70)
- Module marketplace (future): ✓ (§71)
- Glossary: ✓ (§72)

### Final audit verdict

A future engineer or AI session reading this document end-to-end SHOULD be able to:
1. Set up the repository correctly (§18, §57).
2. Implement the generator engine (§19–§22).
3. Add new templates, modules, themes, starters (§57).
4. Run the wirer to generate apps (§20).
5. Implement Studio (§22).
6. Make the system production-ready (§32–§33, §61–§62).
7. Operate it (§63–§70).

If something is unclear during build, the canonical resolution order is:
1. **Explicit MUST/MUST NOT in this document** wins.
2. **Existing code patterns** in the repo (once it exists).
3. **Operating principles (§55)** as tiebreakers.
4. Open a PR proposing a clarification to this document.

### Known gaps (acceptable for v1, defer to later)

These are intentionally not specified yet because they're either nice-to-have or depend on real-world feedback:
- Specific premium-theme licensing terms (§52 mentions but doesn't define).
- Marketplace UI/economics beyond §71 outline.
- Detailed per-language i18n string conventions (each language gets its own style guide later).
- Specific advertising / subscription billing mechanics for the platform itself.
- Federated/multi-tenant operation modes (single-tenant assumed for v1).

---

*End of plan & specification.*
