/**
 * @b-dash/schemas — Zod schemas + types + loaders for every persisted artifact.
 *
 * Public API:
 *   RecipeSchema, ModuleSchema, ThemeManifestSchema, TokensSchema, IntentSchema
 *   SchemaValidationError
 *   validate(), loadAndValidate()
 *
 * Plus the inferred TypeScript types: Recipe, Module, ThemeManifest, Tokens, Intent.
 */
export {
  RecipeSchema,
  ARCHETYPES,
  BACKEND_STACKS,
  FRONTEND_STACKS,
  DATABASES,
  DEPLOY_TARGETS,
  AUTH_METHODS,
  NOTIFICATION_CHANNELS,
  DARK_MODE_OPTIONS,
  type Recipe,
  type RecipeArchetype,
  type AuthMethod,
  type NotificationChannel,
} from './recipe.js'

export { ModuleSchema, type Module, type ConfigKnob } from './module.js'

export {
  ThemeManifestSchema,
  TokensSchema,
  THEME_CATEGORIES,
  MOTION_PRESETS,
  type ThemeManifest,
  type Tokens,
} from './theme.js'

export { IntentSchema, type Intent } from './intent.js'

export {
  PropTypeSchema,
  PropDefSchema,
  StudioBlockManifestSchema,
  type PropType,
  type PropDef,
  type StudioBlockManifest,
} from './studio-block.js'

export {
  BlockInstanceSchema,
  PageStateSchema,
  StudioStateSchema,
  type BlockInstance,
  type PageState,
  type StudioState,
} from './studio-state.js'

export {
  BrandSeedSchema,
  HEX_RE,
  FONT_PAIRS,
  generateScale,
  getFontPair,
  type BrandSeed,
  type ColorScale,
  type FontPairId,
} from './brand.js'

export {
  SectionSchema,
  SECTION_CATEGORIES,
  SECTION_DENSITIES,
  RESPONSIVE_VARIANTS,
  type Section,
  type SectionCategory,
  type SectionDensity,
  type ResponsiveVariant,
} from './section.js'

export {
  MotionPresetSchema,
  MOTION_PRESET_CATALOG,
  MOTION_INTENT,
  MOTION_KEY,
  getMotionPreset,
  listMotionPresets,
  type MotionPreset,
  type MotionIntent,
  type MotionKey,
} from './motion.js'

export {
  IllustrationPackSchema,
  IllustrationAssetSchema,
  ILLUSTRATION_PACK_STYLES,
  ILLUSTRATION_PACK_CATEGORIES,
  type IllustrationPack,
  type IllustrationAsset,
  type IllustrationStyle,
  type IllustrationCategory,
} from './illustration.js'

export { SchemaValidationError } from './errors.js'

export { validate, loadAndValidate } from './loaders.js'
