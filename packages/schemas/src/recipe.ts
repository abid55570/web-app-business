/**
 * Zod schema for recipe.json — the canonical spec of a generated app.
 *
 * Mirrors PLAN.md §8.1. The wirer reads recipes against this schema; the wizard
 * produces recipes against this schema; Studio mutates recipes against this schema.
 *
 * NEVER add fields that aren't in PLAN.md §8.1 without updating the plan.
 */
import { z } from 'zod'

export const ARCHETYPES = [
  'business',
  'productivity',
  'content',
  'social',
  'marketplace',
  'tools',
  'education',
  'dashboard',
  'creator',
  'tracker',
  'realtime',
  'game',
  'custom',
] as const

export const BACKEND_STACKS = ['fastapi', 'django', 'nodejs'] as const
export const FRONTEND_STACKS = ['nextjs'] as const
export const DATABASES = ['postgres', 'mysql', 'sqlite'] as const
export const DEPLOY_TARGETS = [
  'vercel',
  'render',
  'railway',
  'coolify-vps',
  'docker-zip',
] as const

export const AUTH_METHODS = [
  'email-password',
  'email-otp',
  'phone-otp',
  'magic-link',
  'google',
  'apple',
  'github',
  'facebook',
  'linkedin',
  'microsoft',
  'discord',
  'passkeys',
  'anonymous',
  'sso-saml',
] as const

export const NOTIFICATION_CHANNELS = [
  'email',
  'sms',
  'whatsapp',
  'push',
  'in-app',
] as const

export const DARK_MODE_OPTIONS = ['light', 'dark', 'auto'] as const

const SemverString = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'must be a semver MAJOR.MINOR.PATCH string')

const HexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'must be a hex colour like #1A2B3C')

const RecipeIdString = z
  .string()
  .regex(/^[a-z0-9-]{4,64}$/, 'must be 4–64 chars of [a-z0-9-]')

const ModuleEntrySchema = z.object({
  id: z.string().min(1),
  version: SemverString,
  config: z.record(z.unknown()),
})

const IntegrationsSchema = z
  .object({
    payment: z.array(z.string()).optional(),
    email: z.array(z.string()).optional(),
    sms: z.array(z.string()).optional(),
    whatsapp: z.array(z.string()).optional(),
    push: z.array(z.string()).optional(),
    voice: z.array(z.string()).optional(),
    ai: z.array(z.string()).optional(),
    analytics: z.array(z.string()).optional(),
    storage: z.array(z.string()).optional(),
    monitoring: z.array(z.string()).optional(),
  })
  .default({})

const AuthSchema = z.object({
  methods: z.array(z.enum(AUTH_METHODS)).min(1, 'pick at least one auth method'),
  twoFactor: z.boolean().optional(),
})

const NotificationsSchema = z
  .object({
    channels: z.array(z.enum(NOTIFICATION_CHANNELS)).optional(),
    perEventChannels: z
      .record(z.array(z.enum(NOTIFICATION_CHANNELS)))
      .optional(),
  })
  .optional()

const RbacRoleSchema = z.object({
  id: z.string().min(1),
  permissions: z.array(z.string()),
})

const RbacSchema = z
  .object({
    roles: z.array(RbacRoleSchema),
  })
  .optional()

const ThemeSelectionSchema = z.object({
  pack: z.string().min(1),
  darkMode: z.enum(DARK_MODE_OPTIONS).optional(),
  tokenOverrides: z.record(z.unknown()).optional(),
})

const BrandingSchema = z.object({
  name: z.string().min(1),
  /** One-line tagline rendered as hero body / footer subtext. */
  tagline: z.string().optional(),
  /** Alias of primaryColor — wizard writes this; either form accepted. */
  primary: HexColor.optional(),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  primaryColor: HexColor.optional(),
  fontPair: z.string().optional(),
  illustrationPack: z.string().nullable().optional(),
})

const I18nSchema = z
  .object({
    defaultLanguage: z.string().default('en'),
    supportedLanguages: z.array(z.string()).optional(),
    defaultCurrency: z.string().default('USD'),
    defaultTimezone: z.string().default('UTC'),
    defaultLocale: z.string().default('en-US'),
  })
  .optional()

const PageEntrySchema = z.object({
  path: z.string().min(1),
  layout: z.string().min(1),
  title: z.string().optional(),
  sections: z.array(z.record(z.unknown())).optional(),
  requires: z.array(z.string()).optional(),
})

const PendingQuestionSchema = z.object({
  questionId: z.string().min(1),
  deferredAt: z.string().datetime(),
  currentDefault: z.unknown().optional(),
})

export const RecipeSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  id: RecipeIdString,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),

  archetype: z.enum(ARCHETYPES),
  vertical: z.string().nullable().optional(),
  starter: z.string().nullable().optional(),

  stack: z.object({
    backend: z.enum(BACKEND_STACKS),
    frontend: z.enum(FRONTEND_STACKS),
    database: z.enum(DATABASES),
    deployTarget: z.enum(DEPLOY_TARGETS).optional(),
  }),

  modules: z.array(ModuleEntrySchema),
  /**
   * Optional allowlist of section ids to ship into the generated app.
   * When omitted, every section in the catalog is copied (legacy behaviour
   * needed for Studio's full drag palette). When present, ONLY listed
   * sections are copied — keeps wizard-generated apps small.
   */
  sections: z.array(z.string().min(1)).optional(),
  /**
   * Wizard-only extra pages to scaffold beyond /. One of: pricing, about,
   * contact, docs, blog. The wirer's derive-extra-pages step emits each
   * as src/app/<id>/page.tsx.
   */
  extraPages: z.array(z.enum(['pricing', 'about', 'contact', 'docs', 'blog'])).optional(),
  /**
   * Sprint 12b — user-defined blank pages (any URL-safe slug). For each
   * slug, the wirer's derive-blank-pages step writes a minimal page.tsx
   * at frontend/src/app/<slug>/page.tsx. Sections injected via
   * `pageExtras[<slug>]` get appended on top.
   *
   * Studio's AddPageMenu writes here when the user clicks "Custom route".
   */
  blankPages: z.array(z.string().regex(/^[a-z][a-z0-9-]{0,40}$/, 'slug must be lowercase + hyphens')).optional(),
  /**
   * Sprint 7b — per-page extra sections to inject into the hand-rendered
   * auth/extra pages. Keyed by pageId:
   *   'signup'    → sections appended below the signup form
   *   'login'     → sections appended below the login form
   *   'dashboard' → sections appended below the dashboard
   *   'pricing'   → sections appended below the pricing layout
   *   etc.
   *
   * Use top-level `sections` for the home page; this field is for non-home
   * pages only. The wirer's derive-page-extras step reads this map and
   * appends section JSX inside each target page's <main>. Empty/missing
   * entries leave the page hand-rendered as before.
   */
  pageExtras: z.record(z.string(), z.array(z.string().min(1))).optional(),
  integrations: IntegrationsSchema,
  auth: AuthSchema,
  notifications: NotificationsSchema,
  rbac: RbacSchema,
  theme: ThemeSelectionSchema,
  branding: BrandingSchema,
  i18n: I18nSchema,
  pages: z.array(PageEntrySchema).optional(),
  pendingQuestions: z.array(PendingQuestionSchema).optional(),
  customQuestions: z.array(z.record(z.unknown())).optional(),
})

export type Recipe = z.infer<typeof RecipeSchema>
export type RecipeArchetype = (typeof ARCHETYPES)[number]
export type AuthMethod = (typeof AUTH_METHODS)[number]
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]
