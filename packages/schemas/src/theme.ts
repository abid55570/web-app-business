/**
 * Zod schemas for theme.yaml + tokens.json.
 *
 * Mirrors PLAN.md §10.1 (theme.yaml) and §10.2 (tokens.json). Tokens drive
 * Tailwind config + CSS variables + Framer Motion presets simultaneously.
 */
import { z } from 'zod'

const SemverString = z.string().regex(/^\d+\.\d+\.\d+$/)
const HexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/)
const CssDimension = z.string().min(1) // "1rem", "12px", etc.

// -----------------------------------------------------------
// theme.yaml
// -----------------------------------------------------------

export const THEME_CATEGORIES = [
  'minimal',
  'glass',
  'brutalist',
  'soft',
  '3d',
  'layout',
  'vertical',
  'special',
] as const

export const MOTION_PRESETS = ['subtle', 'standard', 'expressive', 'minimal'] as const

const ComponentVariantsSchema = z.record(z.string())

const ThemePreviewSchema = z
  .object({
    light: z.string().optional(),
    dark: z.string().optional(),
    mobile: z.string().optional(),
    walkthrough: z.string().optional(),
  })
  .partial()
  .default({})

export const ThemeManifestSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'theme id must be kebab-case'),
  displayName: z.string().min(1),
  description: z.string().optional(),
  version: SemverString,
  category: z.enum(THEME_CATEGORIES),
  darkModeSupport: z.literal(true, {
    errorMap: () => ({ message: 'every theme MUST support dark mode (PLAN §1.1)' }),
  }),
  mobileOptimized: z.literal(true, {
    errorMap: () => ({ message: 'every theme MUST be mobile responsive (PLAN §1.1)' }),
  }),
  accessibilityRating: z
    .enum(['WCAG-AA', 'WCAG-AAA'])
    .default('WCAG-AA'),
  fontPair: z.string().min(1),
  componentVariants: ComponentVariantsSchema.default({}),
  motionPreset: z.enum(MOTION_PRESETS).default('standard'),
  backgroundEffect: z.string().default('none'),
  sampleStarters: z.array(z.string()).default([]),
  preview: ThemePreviewSchema,
  intentTags: z.array(z.string()).default([]),
})

// -----------------------------------------------------------
// tokens.json
// -----------------------------------------------------------

const ColorScale = z.object({
  '50': HexColor,
  '100': HexColor,
  '200': HexColor,
  '300': HexColor,
  '400': HexColor,
  '500': HexColor,
  '600': HexColor,
  '700': HexColor,
  '800': HexColor,
  '900': HexColor,
  '950': HexColor,
})

const SemanticColor = z.object({
  bg: HexColor,
  fg: HexColor,
  border: HexColor,
})

const ColorsSchema = z.object({
  primary: ColorScale,
  accent: ColorScale,
  neutral: ColorScale,
  surface: z.object({
    base: HexColor,
    raised: HexColor,
    overlay: HexColor,
    sunken: HexColor,
  }),
  text: z.object({
    primary: HexColor,
    secondary: HexColor,
    tertiary: HexColor,
    inverse: HexColor,
  }),
  semantic: z.object({
    success: SemanticColor,
    warning: SemanticColor,
    error: SemanticColor,
    info: SemanticColor,
  }),
})

const TypographyScaleKeys = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
] as const

const TypographySchema = z.object({
  fontPair: z.string(),
  scale: z.object(
    Object.fromEntries(TypographyScaleKeys.map((k) => [k, CssDimension])) as Record<
      (typeof TypographyScaleKeys)[number],
      typeof CssDimension
    >,
  ),
  weights: z.object({
    thin: z.number(),
    light: z.number(),
    regular: z.number(),
    medium: z.number(),
    semibold: z.number(),
    bold: z.number(),
    black: z.number(),
  }),
  lineHeight: z.object({
    tight: z.number(),
    snug: z.number(),
    normal: z.number(),
    relaxed: z.number(),
    loose: z.number(),
  }),
})

const SpacingSchema = z.record(CssDimension)

const RadiusSchema = z.object({
  none: CssDimension,
  sm: CssDimension,
  md: CssDimension,
  lg: CssDimension,
  xl: CssDimension,
  '2xl': CssDimension,
  '3xl': CssDimension,
  full: CssDimension,
})

const ShadowsSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  glow: z.string(),
  inner: z.string(),
})

const SpringPresetSchema = z.object({
  stiffness: z.number(),
  damping: z.number(),
})

const MotionSchema = z.object({
  duration: z.object({
    instant: CssDimension,
    fast: CssDimension,
    base: CssDimension,
    slow: CssDimension,
    slower: CssDimension,
  }),
  easing: z.object({
    linear: z.string(),
    easeIn: z.string(),
    easeOut: z.string(),
    easeInOut: z.string(),
    spring: z.string(),
  }),
  spring: z.object({
    gentle: SpringPresetSchema,
    snappy: SpringPresetSchema,
    bouncy: SpringPresetSchema,
  }),
})

const EffectsSchema = z
  .object({
    blur: z.record(CssDimension).optional(),
    glass: z.record(z.string()).optional(),
    noise: z.string().optional(),
    meshGradient: z.string().optional(),
  })
  .partial()
  .default({})

export const TokensSchema = z.object({
  $schema: z.string().optional(),
  colors: ColorsSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  radius: RadiusSchema,
  shadows: ShadowsSchema,
  motion: MotionSchema,
  effects: EffectsSchema,
})

export type ThemeManifest = z.infer<typeof ThemeManifestSchema>
export type Tokens = z.infer<typeof TokensSchema>
