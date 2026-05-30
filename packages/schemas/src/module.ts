/**
 * Zod schema for module.yaml — the manifest every feature module ships.
 *
 * Mirrors PLAN.md §9.1. Modules declare what contracts they implement, what
 * config knobs the wizard should ask about, what events they emit/subscribe to,
 * what UI contributions they make to dashboards, and what permissions they
 * introduce.
 */
import { z } from 'zod'

const SemverString = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'must be a semver MAJOR.MINOR.PATCH string')

const ContractRefString = z
  .string()
  .regex(/^[a-z][a-z0-9_-]*@v\d+$/, 'must look like "<contract>@v<N>" (e.g. auth@v1)')

const ModuleIdString = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, 'must be kebab-case alphanumeric')

const PermissionString = z
  .string()
  .regex(
    /^[a-z][a-z0-9-]*\.[a-z][a-z0-9_-]*$/,
    'must be "<module-id>.<verb>" (e.g. orders.refund)',
  )

const EventIdString = z
  .string()
  .regex(
    /^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)?$/,
    'must be "<module>.<verb>" (e.g. orders.placed)',
  )

const ConfigKnobSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_-]*$/, 'config knob id must be snake_case alphanumeric'),
  type: z.enum(['bool', 'enum', 'list', 'string', 'number', 'json']),
  default: z.unknown().optional(),
  options: z.array(z.unknown()).optional(),
  description: z.string().optional(),
  askInWizard: z.boolean().default(true),
  askInStudio: z.boolean().default(true),
  required: z.boolean().default(false),
  auto_true_for: z.array(z.string()).optional(),
})

const EventEmitSchema = z.object({
  id: EventIdString,
  payload: z.record(z.unknown()).optional(),
})

const EventSubscriptionSchema = z.union([
  // Short form (preferred): event ID with handler path
  z.object({
    id: EventIdString,
    handler: z.string().min(1),
  }),
  // Long form: per-event channel config (used by the notifications module)
  z.object({
    id: EventIdString,
    channels: z.array(z.string()).optional(),
    templates: z.record(z.string()).optional(),
    handler: z.string().optional(),
  }),
])

const NavItemSchema = z.object({
  label: z.string().min(1),
  icon: z.string().optional(),
  path: z.string().min(1),
  role: z.array(z.string()).optional(),
  shell: z.enum(['admin', 'customer', 'both']).default('admin'),
})

const DashboardWidgetSchema = z.object({
  id: z.string().min(1),
  size: z.enum(['small', 'medium', 'large', 'full']).default('medium'),
  source: z.string().optional(),
  component: z.string().optional(),
})

const PageContributionSchema = z.object({
  path: z.string().min(1),
  layout: z.enum(['admin', 'customer', 'public', 'auth']),
  requires: z.array(PermissionString).optional(),
  i18nKey: z.string().optional(),
})

const StudioBlockSchema = z.union([
  z.string(),
  z.object({
    id: z.string().min(1),
    displayName: z.string().optional(),
    category: z.string().optional(),
    defaultProps: z.record(z.unknown()).optional(),
  }),
])

const UiContributionsSchema = z
  .object({
    nav: z.array(NavItemSchema).default([]),
    dashboard_widgets: z.array(DashboardWidgetSchema).default([]),
    pages: z.array(PageContributionSchema).default([]),
    studio_blocks: z.array(StudioBlockSchema).default([]),
    studio_sections: z.array(StudioBlockSchema).default([]),
  })
  .default({
    nav: [],
    dashboard_widgets: [],
    pages: [],
    studio_blocks: [],
    studio_sections: [],
  })

const DbBlockSchema = z.object({
  schema: z.string().min(1),
  seed: z.string().optional(),
})

const EnvVarSchema = z.union([
  z.string(), // shorthand: just the name
  z.object({
    name: z.string().min(1),
    required: z.boolean().default(false),
    description: z.string().optional(),
    when: z.string().optional(),
  }),
])

const TestsBlockSchema = z
  .object({
    contract: z.array(ContractRefString).default([]),
    smoke: z.array(z.union([z.string(), z.object({ file: z.string() })])).default([]),
    fixtures: z.array(z.union([z.string(), z.object({ file: z.string() })])).default([]),
  })
  .default({ contract: [], smoke: [], fixtures: [] })

const BackendRouterSchema = z.object({
  exportName: z
    .string()
    .regex(/^[a-z_][a-z0-9_]*$/, 'must be a valid Python identifier'),
  prefix: z.string().startsWith('/', 'router prefix must start with /'),
  tag: z.string().min(1).optional(),
})

/**
 * Per-module dependency declarations. Wirer merges these into the scaffold's
 * `package.json` (frontend) and `pyproject.toml` (backend). Conflict policy:
 * the highest-precedence module wins on version mismatch; the wirer logs a
 * warning so the operator can pin in the recipe if needed.
 */
const ModuleDependenciesSchema = z.object({
  // npm-style: { "stripe": "^15.0.0" }
  frontend: z.record(z.string()).optional(),
  frontendDev: z.record(z.string()).optional(),
  // PEP 508 strings: ["stripe>=10.0.0", "twilio>=9.0.0"]
  backend: z.array(z.string()).optional(),
  backendDev: z.array(z.string()).optional(),
})

export const ModuleSchema = z.object({
  id: ModuleIdString,
  type: z.literal('module'),
  version: SemverString,
  displayName: z.string().min(1),
  description: z.string().optional(),

  implements: z.array(ContractRefString).min(1, 'a module must implement at least one contract'),
  depends_on: z.array(ContractRefString).default([]),
  optional_integrations: z.array(ContractRefString).default([]),
  incompatible_with: z.array(ModuleIdString).default([]),

  db: DbBlockSchema.optional(),

  config_knobs: z.array(ConfigKnobSchema).default([]),

  emits: z.array(EventEmitSchema).default([]),
  subscribes: z.array(EventSubscriptionSchema).default([]),

  // Optional dual/multi-router declaration. When omitted, the wirer assumes
  // a single `router` symbol mounted at /api/<id>. Modules with public+admin
  // splits (menu, orders) use this to declare both.
  backend_routers: z.array(BackendRouterSchema).optional(),

  // Optional per-module deps merged into the generated app's package.json /
  // pyproject.toml at render time. Keep light — most modules ride the scaffold.
  dependencies: ModuleDependenciesSchema.optional(),

  ui_contributions: UiContributionsSchema,

  permissions: z.array(PermissionString).default([]),

  locales: z.array(z.string()).default([]),

  env: z.array(EnvVarSchema).default([]),

  tests: TestsBlockSchema,

  // Lifecycle metadata
  deprecated: z.boolean().default(false),
  replacedBy: ModuleIdString.optional(),
})

export type Module = z.infer<typeof ModuleSchema>
export type ConfigKnob = z.infer<typeof ConfigKnobSchema>
