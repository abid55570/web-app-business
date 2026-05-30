/**
 * SectionSchema → Puck-shaped block manifest converter.
 *
 * Puck (the visual editor we target in v1) declares blocks via a config
 * object: `{ components: { <name>: { fields, defaultProps, render } } }`.
 * We build the `fields` half — the JSON description of editable props.
 * The `render` half stays in the generated frontend (Next.js sections
 * already exported by the wirer).
 *
 * SectionSchema's `props` is an indexed dict of `PropDef`:
 *
 *     props:
 *       headline:
 *         type: string
 *         label: "Headline"
 *         required: true
 *
 * → Puck field:
 *
 *     {
 *       type: 'text',
 *       label: 'Headline',
 *       contentEditable: false,
 *     }
 */
import type { Section, PropDef, PropType } from '@b-dash/schemas'


/** Subset of Puck field types we map onto. Real Puck has more
 * (object, array with field, select with custom render); v1 covers the
 * essentials. */
export type PuckFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'array'
  | 'object'


export type PuckField = {
  type: PuckFieldType
  label?: string
  /** Field-level placeholder hint surfaced in the editor. */
  description?: string
  /** Marks the field as `*` in the editor UI. */
  required?: boolean
  /** For `select` / `radio`. */
  options?: Array<{ label: string; value: string }>
  /** For `array`. Schema for each row. */
  arrayFields?: Record<string, PuckField>
  /** Min/max for `number` + `text` length. */
  min?: number
  max?: number
}


export type PuckBlockManifest = {
  /** PascalCase component name — matches SectionSchema.id. */
  id: string
  displayName: string
  /** Category label for the editor's component palette. */
  category: string
  /** Per-prop field schema. */
  fields: Record<string, PuckField>
  /** Default values; Puck uses these when a new block is inserted. */
  defaultProps: Record<string, unknown>
  /** Optional one-liner the editor surfaces on hover. */
  description?: string
}


export function buildBlockManifest(section: Section): PuckBlockManifest {
  const fields: Record<string, PuckField> = {}
  const defaults: Record<string, unknown> = {}

  for (const [name, propDef] of Object.entries(section.props ?? {})) {
    fields[name] = propDefToPuckField(propDef)
    if (propDef.default !== undefined) {
      defaults[name] = propDef.default
    }
  }

  return {
    id: section.id,
    displayName: section.displayName,
    category: section.category,
    fields,
    defaultProps: defaults,
    description: section.description,
  }
}


/**
 * Convenience: build manifests for every section in an iterable —
 * typically the output of `wirer.scanSections`.
 */
export function buildAllBlockManifests(
  sections: Array<{ manifest: Section } | Section>,
): PuckBlockManifest[] {
  return sections.map((s) =>
    'manifest' in s ? buildBlockManifest(s.manifest) : buildBlockManifest(s),
  )
}


function propDefToPuckField(propDef: PropDef): PuckField {
  const base: PuckField = {
    type: mapType(propDef.type, propDef),
    label: propDef.label,
    description: propDef.description,
    required: propDef.required,
  }

  if (propDef.type === 'enum' && propDef.options) {
    // Schema declares `options` as string[] — each value doubles as its label.
    base.options = propDef.options.map((v) => ({ label: v, value: v }))
  }

  if (propDef.min != null) base.min = propDef.min
  if (propDef.max != null) base.max = propDef.max
  if (propDef.maxLength != null) base.max = propDef.maxLength

  return base
}


function mapType(propType: PropType, propDef: PropDef): PuckFieldType {
  switch (propType) {
    case 'string':
      return propDef.multiline ? 'textarea' : 'text'
    case 'number':
      return 'number'
    case 'enum':
      return 'select'
    case 'boolean':
      return 'radio'
    case 'array':
      return 'array'
    case 'json':
      return 'object'
    case 'color':
    case 'image':
    default:
      return 'text'
  }
}
