/**
 * Studio block manifest — declares what props a section component exposes
 * to the visual builder, with type info + UI control hints. Lives at
 * ``modules/<id>/frontend/<fw>/blocks/<Block>.studio.ts`` and exports
 * ``manifest`` matching this schema.
 *
 * Phase 4 scope: enough metadata for the Properties panel to render
 * inputs (string → text, number → slider, enum → select, color → color
 * picker, image → asset picker, boolean → toggle). Visual binding +
 * conditional visibility land in Phase 6.
 */
import { z } from 'zod'

export const PropTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'color',
  'image',
  'enum',
  'json',
  'array',
])

export const PropDefSchema = z.object({
  type: PropTypeSchema,
  label: z.string().min(1),
  default: z.unknown().optional(),
  required: z.boolean().default(false),
  description: z.string().optional(),
  // For type=enum
  options: z.array(z.string()).optional(),
  // For type=number
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  // For type=string
  multiline: z.boolean().optional(),
  maxLength: z.number().optional(),
  // For type=array — element type
  itemType: PropTypeSchema.optional(),
})

export const StudioBlockManifestSchema = z.object({
  id: z
    .string()
    .regex(/^[A-Z][A-Za-z0-9]*$/, 'Block id must be PascalCase'),
  displayName: z.string().min(1),
  category: z.string().min(1),
  // Path to the React component, relative to <out>/frontend/src/.
  // e.g. "components/menu/MenuItemCard"
  componentPath: z.string().min(1),
  // Editable props the block exposes. Order = render order in panel.
  props: z.record(PropDefSchema),
  // Optional preview image (path under public/) for the block picker.
  preview: z.string().optional(),
  // Optional permissions — block hides from picker for users without them.
  requires: z.array(z.string()).optional(),
  // True for block-of-blocks (children render area). Rare.
  hasChildren: z.boolean().default(false),
})

export type PropType = z.infer<typeof PropTypeSchema>
export type PropDef = z.infer<typeof PropDefSchema>
export type StudioBlockManifest = z.infer<typeof StudioBlockManifestSchema>
