/**
 * Shared error class for schema validation failures.
 *
 * The CLI catches `SchemaValidationError` and prints a friendly diagnostic;
 * the wirer rejects generation; the wizard shows form-level errors.
 */
import type { ZodError } from 'zod'

export class SchemaValidationError extends Error {
  public readonly code = 'SCHEMA_VALIDATION_ERROR' as const

  constructor(
    public readonly artifact:
      | 'recipe'
      | 'module'
      | 'theme'
      | 'starter'
      | 'intent'
      | 'tokens'
      | 'section',
    public readonly path: string | null,
    public readonly issues: ZodError['issues'],
  ) {
    const where = path ? ` at ${path}` : ''
    super(
      `${artifact} schema validation failed${where} (${issues.length} issue${issues.length === 1 ? '' : 's'})`,
    )
    this.name = 'SchemaValidationError'
  }

  /** Render a multi-line, human-friendly error message. */
  format(): string {
    const lines = [this.message, '']
    for (const issue of this.issues) {
      const at = issue.path.length > 0 ? issue.path.join('.') : '<root>'
      lines.push(`  • ${at}: ${issue.message}`)
    }
    return lines.join('\n')
  }
}
