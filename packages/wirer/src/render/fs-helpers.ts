/**
 * Tiny fs helpers shared across render steps. Keeps node:fs/promises
 * imports out of business logic files.
 */
import { access } from 'node:fs/promises'


export async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}
