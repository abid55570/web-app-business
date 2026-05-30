/**
 * Wirer error types — see PLAN.md §19.3.
 *
 * Every wirer failure surfaces as a `WirerError` with a stable `code` so the
 * CLI / Studio / wizard can display friendly messages and the test suite can
 * assert on specific failures.
 */

export type WirerErrorCode =
  | 'RECIPE_INVALID'
  | 'RECIPE_MISSING_PROVIDER'
  | 'RECIPE_INCOMPATIBLE'
  | 'WIRER_TEMPLATE_MISSING'
  | 'WIRER_TEMPLATE_BROKEN'
  | 'WIRER_FILE_CONFLICT'
  | 'WIRER_DEP_CONFLICT'
  | 'WIRER_DEP_INSTALL_FAILED'
  | 'WIRER_SMOKE_FAILED'
  | 'WIRER_PROMOTE_FAILED'
  | 'WIRER_CYCLE_DETECTED'

export class WirerError extends Error {
  public readonly code: WirerErrorCode

  constructor(
    code: WirerErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'WirerError'
    this.code = code
  }
}
