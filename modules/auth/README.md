# auth — email + password authentication

The first real module extracted from the Phase 0 spike. Canonical layout for every other module.

## What this module ships

| Surface | Files |
|---|---|
| **Backend (FastAPI)** | `backend/fastapi/` — router, service, dependencies, utils, schemas, model |
| **Frontend (Next.js)** | `frontend/nextjs/` — components, lib, pages, api-routes |
| **DB schema** | `schema.prisma` (single source — wirer translates to per-stack ORM models) |
| **Locales** | `locales/<lang>.json` |
| **Tests** | `tests/contract/`, `tests/smoke/` |

## Wirer placement (Phase 1 Chunk C will implement this mapping)

| Source path in this module | Destination in generated app |
|---|---|
| `backend/fastapi/router.py` | `<output>/backend/app/auth/router.py` |
| `backend/fastapi/service.py` | `<output>/backend/app/auth/service.py` |
| `backend/fastapi/dependencies.py` | `<output>/backend/app/auth/dependencies.py` |
| `backend/fastapi/utils.py` | `<output>/backend/app/auth/utils.py` |
| `backend/fastapi/schemas.py` | `<output>/backend/app/schemas/auth.py` |
| `backend/fastapi/model.py` | `<output>/backend/app/models/user.py` |
| `frontend/nextjs/components/*.tsx` | `<output>/frontend/src/components/auth/*.tsx` |
| `frontend/nextjs/lib/api/auth.ts` | `<output>/frontend/src/lib/api/auth.ts` |
| `frontend/nextjs/lib/session.ts` | `<output>/frontend/src/lib/auth/session.ts` |
| `frontend/nextjs/lib/constants.ts` | `<output>/frontend/src/lib/auth/constants.ts` |
| `frontend/nextjs/lib/server.ts` | `<output>/frontend/src/lib/auth/server.ts` |
| `frontend/nextjs/pages/login.tsx` | `<output>/frontend/src/app/(auth)/login/page.tsx` |
| `frontend/nextjs/pages/signup.tsx` | `<output>/frontend/src/app/(auth)/signup/page.tsx` |
| `frontend/nextjs/api-routes/login.ts` | `<output>/frontend/src/app/api/auth/login/route.ts` |
| `frontend/nextjs/api-routes/signup.ts` | `<output>/frontend/src/app/api/auth/signup/route.ts` |
| `frontend/nextjs/api-routes/logout.ts` | `<output>/frontend/src/app/api/auth/logout/route.ts` |
| `frontend/nextjs/api-routes/me.ts` | `<output>/frontend/src/app/api/auth/me/route.ts` |

The wirer will also:
- Append routers to `<output>/backend/app/main.py` (auth_router + prefix `/api/auth`)
- Add `User` model to `<output>/backend/app/models/__init__.py`
- Add types to `<output>/frontend/src/lib/types.ts`
- Set `JWT_SECRET` in `<output>/.env.example`

## Contract conformance

This module satisfies every operation + event + error code in `contracts/auth@v1.contract.yaml`:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Events: `auth.user.signed-up`, `auth.user.signed-in`, `auth.user.signed-out`
- Errors: `AUTH_INVALID`, `AUTH_EMAIL_TAKEN`, `AUTH_USER_INACTIVE`, `AUTH_MISSING_TOKEN`, `AUTH_INVALID_TOKEN`

## Variants planned (each is a separate module)

| Module ID | What it adds |
|---|---|
| `auth-otp` | Email + OTP login (no password) |
| `auth-phone-otp` | SMS-based OTP |
| `auth-magic-link` | Passwordless magic link |
| `auth-google-oauth` | Google sign-in (OAuth 2.0) |
| `auth-passkeys` | WebAuthn / FIDO2 |
| `auth-sso-saml` | Enterprise SSO |

All implement `auth@v1` and can be installed alongside this module (`auth.methods` in the recipe drives which surface in the UI).
