/**
 * Zod schema for intent.yaml — the humanized matcher input that every starter ships.
 *
 * Mirrors PLAN.md §21.3.5. Used by the deterministic intent matcher to convert
 * a customer's freeform sentence into a starter recipe candidate.
 */
import { z } from 'zod'

const NonEmptyString = z.string().min(1)

const PhrasePatternsSchema = z
  .object({
    intent_to_start: z.array(NonEmptyString).default([]),
    intent_to_modernize: z.array(NonEmptyString).default([]),
    features_implied: z.array(NonEmptyString).default([]),
  })
  .default({
    intent_to_start: [],
    intent_to_modernize: [],
    features_implied: [],
  })

const BoostRuleSchema = z.union([
  z.object({
    when: z.array(NonEmptyString).min(1),
    boost: z.number(),
  }),
  z.object({
    when_phrase: NonEmptyString,
    boost: z.number(),
  }),
])

export const IntentSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, 'starter id must be kebab-case alphanumeric'),
  canonical_name: NonEmptyString,
  oneliner: NonEmptyString,
  description: z.string().optional(),

  aliases: z.array(NonEmptyString).default([]),
  strong_signals: z.array(NonEmptyString).default([]),
  weak_signals: z.array(NonEmptyString).default([]),

  multilingual: z.record(z.array(NonEmptyString)).default({}),
  emojis: z.array(z.string()).default([]),

  phrases: PhrasePatternsSchema,
  exclusions: z.array(NonEmptyString).default([]),
  boost: z.array(BoostRuleSchema).default([]),

  // Example sentences — for tests and docs, not used at match time
  examples: z.array(NonEmptyString).default([]),
})

export type Intent = z.infer<typeof IntentSchema>
