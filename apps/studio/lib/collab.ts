/**
 * S5c — real-time co-editing primitives.
 *
 * SCAFFOLD. The yjs CRDT + y-websocket dep is opt-in (would add ~200 kB
 * to the studio bundle and require a sidecar `y-websocket` server).
 * To activate:
 *
 *   pnpm --filter @b-dash/studio-app add yjs y-websocket
 *
 * Then run a y-websocket server (port 1234 default) and wire
 * `getCollabProvider()` into the studio page state via a useY hook.
 *
 * Until then, the editor runs single-user (no presence cursors, no
 * concurrent edits). The interfaces below match the y-websocket API
 * so the swap is mechanical.
 */
export type Presence = {
  userId: string
  name: string
  color: string
  cursor?: { blockId: string; propName?: string }
}

export type CollabProvider = {
  /** Subscribe to remote state changes. */
  onChange: (cb: () => void) => () => void
  /** Subscribe to peer presence updates. */
  onPresence: (cb: (presences: Presence[]) => void) => () => void
  /** Broadcast our presence cursor. */
  setLocalCursor: (cursor: Presence['cursor']) => void
  /** Apply a local state mutation; CRDT-merged with peers. */
  applyLocalUpdate: (mutator: () => void) => void
  /** Disconnect cleanly. */
  destroy: () => void
}

/** No-op single-user provider used when yjs isn't installed. */
export function makeNoOpProvider(): CollabProvider {
  return {
    onChange: () => () => {},
    onPresence: () => () => {},
    setLocalCursor: () => {},
    applyLocalUpdate: (mut) => mut(),
    destroy: () => {},
  }
}

/** Replace with the real yjs provider when the dep is installed. */
export function getCollabProvider(_workspaceId: string): CollabProvider {
  return makeNoOpProvider()
}
