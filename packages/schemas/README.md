# @b-dash/schemas

Zod schemas + TypeScript types + file loaders for every persisted artifact in the B-Dash generator.

## Exported schemas

| Artifact | Schema | Mirrors PLAN.md |
|---|---|---|
| `recipe.json` | `RecipeSchema` | §8.1 |
| `module.yaml` | `ModuleSchema` | §9.1 |
| `theme.yaml` | `ThemeManifestSchema` | §10.1 |
| `tokens.json` | `TokensSchema` | §10.2 |
| `intent.yaml` | `IntentSchema` | §21.3.5 |

## Usage

```ts
import { RecipeSchema, loadAndValidate, SchemaValidationError } from '@b-dash/schemas'

// Validate an in-memory object
const recipe = RecipeSchema.parse(someJson)

// Load + parse + validate from disk
try {
  const recipe = await loadAndValidate(RecipeSchema, './recipe.json', 'recipe')
} catch (e) {
  if (e instanceof SchemaValidationError) {
    console.error(e.format()) // multi-line human-friendly errors
  }
}
```

## Test

```powershell
pnpm test                # all schema tests
pnpm test -- --coverage  # with coverage (90% thresholds enforced)
```

## Why these live in their own package

- The wirer reads recipes against this schema.
- The wizard produces recipes against this schema.
- The CLI's `validate` command uses these to give the user fast feedback.
- Studio mutates recipes against this schema before sending to the wirer.

A single source of truth prevents drift between what the wizard produces, what the wirer expects, and what Studio edits.
