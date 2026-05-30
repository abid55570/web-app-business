# @b-dash/wirer

The B-Dash generation engine — pre-render stage.

## What this package does (Phase 1 Chunk B)

| Step | Function | Purpose |
|---|---|---|
| Load | `loadModuleFromDir`, `scanModules`, `loadThemeFromDir`, `scanThemes` | Read manifests off disk, validate via `@b-dash/schemas` |
| Resolve | `resolveRecipe` | Look up recipe.modules + theme against on-disk inventory |
| Sort | `topologicalSort` | Order modules so providers come before dependents (Kahn's) |
| Compatibility | `checkCompatibility` | Every `depends_on` has a provider; no mutual incompatibilities |
| Conflicts | `detectFileConflicts` | Flag pages two modules both want to own |
| Plan | `buildWirePlan` | Compose all of the above into one `WirePlan` |

## What's NOT in this chunk (coming next)

- File copying / template rendering
- Token compilation (tokens.json → Tailwind config + CSS vars + motion presets)
- `package.json` / `requirements.txt` merging
- `overrides/` application
- `pnpm install` + smoke tests
- Atomic promotion to `output/<id>/`

These come in the wirer's render step (Phase 1 Chunk C).

## Usage

```ts
import { loadAndValidate, RecipeSchema } from '@b-dash/schemas'
import { buildWirePlan, scanModules, scanThemes, WirerError } from '@b-dash/wirer'

const recipe = await loadAndValidate(RecipeSchema, 'recipe.json', 'recipe')
const modules = await scanModules('./modules')
const themes = await scanThemes('./themes')

try {
  const plan = buildWirePlan({ recipe, modules, themes })
  console.log(`Modules in wire order: ${plan.resolvedRecipe.modules.map(m => m.id).join(' -> ')}`)
  console.log(`Events: ${Object.keys(plan.emitters).length} emitted, ${Object.keys(plan.subscribers).length} subscribed`)
  if (plan.conflicts.length) {
    console.error(`File conflicts: ${plan.conflicts.length}`)
  }
} catch (e) {
  if (e instanceof WirerError) {
    console.error(`[${e.code}] ${e.message}`)
  } else throw e
}
```

## Try it via the CLI

```powershell
b-dash diff path/to/recipe.json
```

Prints the wire plan: stack, theme, modules in order, events, permissions, conflicts. Exit 1 on any conflict.

## Test

```powershell
pnpm test                # all 30+ tests
pnpm test --coverage     # with coverage (90% thresholds enforced)
```
