/**
 * Emit a PRODUCTION.md + production-ready env templates so the user
 * knows exactly how to ship the generated app — swap SQLite for
 * Postgres, set Stripe/Resend keys, point the frontend's NEXT_PUBLIC_
 * API_URL at the deployed backend, deploy to Vercel/Render.
 *
 * Always emits PRODUCTION.md. Emits a `vercel.json` when the deploy
 * target wasn't already 'vercel' (derive-deploy handles that path) so
 * the user has a starting point even on docker-zip exports.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'

export type DeriveProductionDocsArgs = {
  plan: WirePlan
  outputDir: string
}

export async function deriveProductionDocs(args: DeriveProductionDocsArgs): Promise<void> {
  const recipe = args.plan.resolvedRecipe.recipe as {
    branding?: { name?: string }
    modules?: Array<{ id: string }>
    stack: { backend: string; deployTarget?: string }
  }
  const appName = recipe.branding?.name ?? 'My App'
  const hasBackend = recipe.stack.backend === 'fastapi'
  const hasDb = (recipe.modules ?? []).some((m) => /^(auth-core|orders|booking|tenants|posts)/.test(m.id))
  const hasStripe = (recipe.modules ?? []).some((m) => m.id.startsWith('payment-stripe'))
  const hasResend = (recipe.modules ?? []).some((m) => m.id === 'notifications-resend')

  await writeFile(
    path.join(args.outputDir, 'PRODUCTION.md'),
    buildProductionMd(appName, { hasBackend, hasDb, hasStripe, hasResend }),
    'utf-8',
  )

  // Production env templates (separate from .env.example which is for dev)
  if (hasBackend) {
    await writeFile(
      path.join(args.outputDir, 'backend', '.env.production.example'),
      buildBackendProdEnv({ hasDb, hasStripe, hasResend }),
      'utf-8',
    )
  }
  await writeFile(
    path.join(args.outputDir, 'frontend', '.env.production.example'),
    buildFrontendProdEnv(),
    'utf-8',
  )
}

function buildProductionMd(
  appName: string,
  flags: { hasBackend: boolean; hasDb: boolean; hasStripe: boolean; hasResend: boolean },
): string {
  const { hasBackend, hasDb, hasStripe, hasResend } = flags

  return `# ${appName} — Production deployment

This is your **playbook** for taking ${appName} from local dev to a live URL
your users can hit. Pick a path:

| Path | Best for | Cost (start) |
|------|----------|--------------|
| **A. All-in-one Docker** (cheapest) | VPS deploy — Hetzner / DigitalOcean / Linode | $5/mo |
| **B. Vercel + Render** (easiest) | Frontend on Vercel, backend + Postgres on Render | $0 free tier |
| **C. Vercel + Railway** | Same shape, Railway has a generous free credit | $0 free tier |

---

## 1. Prerequisites

- Production-grade Postgres (NOT SQLite)
${hasStripe ? '- Stripe account with live API keys\n' : ''}${hasResend ? '- Resend account + verified sending domain\n' : ''}- A domain name (Cloudflare / Namecheap / Porkbun)
- This app's git repo pushed to GitHub / GitLab / Bitbucket

---

## 2. Swap SQLite for Postgres

The dev DB lives in \`backend/app.db\` — fine for local but lossy when the
container restarts. In production, point \`DATABASE_URL\` at a managed
Postgres:

\`\`\`bash
# Render: Dashboard → New → PostgreSQL → 'Free' tier
# Neon:   neon.tech → Create project → grab connection string
# Supabase: supabase.com → New project → Settings → Database

# Copy the **Internal Connection String** (postgresql://user:pass@host/db)
# Set it as DATABASE_URL in your backend environment.
\`\`\`

On first boot, the backend's lifespan hook runs \`init_db()\` which
auto-creates every table via SQLAlchemy metadata. No migration step
needed for the initial deploy.

---

## 3. Environment variables

### Backend

See \`backend/.env.production.example\` for the full list. Required:

\`\`\`bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
JWT_SECRET=<generate-with: openssl rand -hex 32>
CORS_ORIGINS=https://yourdomain.com
${hasStripe ? 'STRIPE_SECRET_KEY=sk_live_...\nSTRIPE_WEBHOOK_SECRET=whsec_...\n' : ''}${hasResend ? 'RESEND_API_KEY=re_...\nRESEND_FROM_EMAIL=hello@yourdomain.com\n' : ''}\`\`\`

### Frontend

\`\`\`bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
\`\`\`

---

## 4A. Deploy to Docker (cheapest)

Provision any Linux VPS, install Docker, then:

\`\`\`bash
git clone https://github.com/you/${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.git
cd ${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}

# Set prod env vars
cp backend/.env.production.example backend/.env
cp frontend/.env.production.example frontend/.env
# edit both — fill in DATABASE_URL, JWT_SECRET, etc.

# Boot everything
docker compose -f docker-compose.dev.yml up -d --build

# Point your domain's A record at the VPS IP
# Front it with Caddy / nginx / Traefik for TLS + HTTP/2
\`\`\`

For zero-config HTTPS use [Caddy](https://caddyserver.com):

\`\`\`Caddyfile
yourdomain.com {
  reverse_proxy localhost:3000
}
api.yourdomain.com {
  reverse_proxy localhost:8000
}
\`\`\`

---

## 4B. Deploy to Vercel + Render (easiest)

### Frontend → Vercel

1. Push the repo to GitHub
2. \`vercel.com\` → New Project → import your repo
3. Settings → Root Directory: \`frontend\`
4. Environment Variables → add \`NEXT_PUBLIC_API_URL=https://api.yourdomain.com\`
5. Deploy. Vercel auto-detects Next.js, builds in ~2 min.

### Backend → Render

1. \`render.com\` → New → **PostgreSQL** → Free plan → copy the Internal Connection String
2. \`render.com\` → New → **Web Service** → connect repo
3. Root Directory: \`backend\`
4. Build command: \`pip install -e ".[dev]"\`
5. Start command: \`uvicorn app.main:app --host 0.0.0.0 --port $PORT\`
6. Environment Variables → paste \`backend/.env.production.example\` values
7. Deploy.

### Connect them

- Buy a domain → Cloudflare nameservers (free, fast).
- DNS:
  - \`A @ → 76.76.21.21\` (Vercel) + \`CNAME www → cname.vercel-dns.com\`
  - \`CNAME api → your-backend.onrender.com\`
- Wait ~5 min for DNS propagation.

---

## 4C. Deploy to Vercel + Railway

Same as 4B but the backend lives on [Railway](https://railway.app):

1. New Project → Deploy from GitHub → root: \`backend\`
2. Add PostgreSQL plugin → copy \`DATABASE_URL\` into web service env
3. Same env vars as Render

Railway free tier gives you $5/mo of credit which is enough for a small SaaS.

---

## 5. Production hardening

- ${hasStripe ? '**Stripe webhooks**: in Stripe Dashboard → Webhooks → Add endpoint → `https://api.yourdomain.com/api/webhooks/stripe`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.\n- ' : ''}${hasResend ? '**Resend domain**: verify your sending domain in Resend dashboard. Add the 3 DNS records they show you. Without this, emails go to spam.\n- ' : ''}**Sentry**: bolt on the \`telemetry-sentry\` module (\`b-dash edit\` → toggle on) to catch prod errors.
- **Backups**: most managed Postgres providers (Neon, Supabase, Render) include daily backups. Verify it's on.
- **CORS**: set \`CORS_ORIGINS\` to exactly your prod domain — \`*\` works but is insecure.
- **HTTPS only**: in production, all cookies should be \`secure\`. The auth-core module does this when the request is HTTPS.

---

## 6. Smoke test the live deploy

After DNS is up:

\`\`\`bash
curl https://yourdomain.com         # → 200, your landing page
curl https://api.yourdomain.com/api/auth/me  # → 401 (correct: no token)
\`\`\`

Sign up via your live signup page, check the user lands in the database,
create a post, refresh — everything that worked locally works in prod.

---

## 7. Updates

\`\`\`bash
git pull
b-dash upgrade ${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}  # re-runs wirer, preserves overrides/
docker compose up -d --build      # Docker path
# OR: just push to GitHub — Vercel + Render auto-redeploy
\`\`\`

---

That's it. Your app is live, owned, and yours forever.
`
}

function buildBackendProdEnv(flags: { hasDb: boolean; hasStripe: boolean; hasResend: boolean }): string {
  const { hasStripe, hasResend } = flags
  return `# Production environment for the FastAPI backend.
# Copy to backend/.env on your prod server and fill in.

# === Database ===================================================
# Managed Postgres connection string. NO SQLite in production.
# Format: postgresql+asyncpg://user:password@host:5432/dbname
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# === Auth =======================================================
# Generate with: openssl rand -hex 32
# Rotating this invalidates every active session.
JWT_SECRET=CHANGE_ME_LONG_RANDOM_STRING
JWT_EXPIRATION_MINUTES=10080

# === CORS =======================================================
# Exact origin(s) allowed to call the API. Comma-separated.
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# === Logging ====================================================
LOG_LEVEL=INFO

${hasStripe ? `# === Stripe =====================================================
STRIPE_SECRET_KEY=sk_live_REPLACE_WITH_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_FROM_STRIPE_DASHBOARD
STRIPE_PUBLISHABLE_KEY=pk_live_REPLACE
` : ''}
${hasResend ? `# === Resend (transactional email) ===============================
RESEND_API_KEY=re_REPLACE
RESEND_FROM_EMAIL=hello@yourdomain.com
` : ''}
`
}

function buildFrontendProdEnv(): string {
  return `# Production environment for the Next.js frontend.
# Copy to frontend/.env in your build environment (Vercel: set in dashboard).

# Public URL of your backend API.
# Vercel/Render: https://api.yourdomain.com
# Docker on same host: usually http://backend:8000
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
`
}
