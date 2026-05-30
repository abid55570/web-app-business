# notifications-push

Implements `notifications-push@v1`. Web Push (RFC 8030) adapter for
notifications-core. Stores browser PushSubscriptions per user and fans
out VAPID-signed payloads.

## Endpoints

All under `/api/notifications/push/*`.

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/vapid-public-key` | none | Returns `{ publicKey }` for `pushManager.subscribe`. |
| POST | `/subscriptions` | signed-in | Idempotent on `(userId, endpoint)`; updates keys on resubscribe. |
| DELETE | `/subscriptions?endpoint=…` | signed-in | Unsubscribe current user's row for that endpoint. |
| GET | `/subscriptions/my` | signed-in | Caller's active subscriptions. |
| POST | `/send` | admin | `{ userId, payload }` → fan out to every active sub for `userId`. Returns delivery counts. |

## Events emitted

- `notifications.push.subscribed`   `{ id, userId }`
- `notifications.push.unsubscribed` `{ id, userId }`
- `notifications.push.sent`         `{ id, userId, deliveredCount }`
- `notifications.push.expired`      `{ id, userId }` — after 410-Gone cleanup

## Env

- `VAPID_PUBLIC_KEY` — base64url-encoded, 88 chars.
- `VAPID_PRIVATE_KEY` — base64url-encoded, 43 chars.
- `VAPID_SUBJECT` — overrides `mailto:hello@example.com` default.

Generate locally:

```bash
npx web-push generate-vapid-keys
```

## Pairs with

- `notifications` (required) — channel registry.
- `audit-log` (optional) — record `notifications.push.sent` for compliance.
- `tenants` (optional) — wire per-tenant VAPID key sets via config knob.

## Browser pattern

```ts
const { publicKey } = await notificationsPushApi.vapidKey()
const reg = await navigator.serviceWorker.register('/sw.js')
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicKey),
})
await notificationsPushApi.subscribe({
  endpoint: sub.endpoint,
  p256dhKey: arrayBufferToBase64Url(sub.getKey('p256dh')!),
  authKey: arrayBufferToBase64Url(sub.getKey('auth')!),
})
```
