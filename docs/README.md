# b-dash docs

Operational docs for the b-dash monorepo. The architectural / business docs live one level up (`../PLAN.md`, `../BUSINESS-PLAN.md`); these are the "how do I run it" guides.

## Index

| Doc | Audience | When to read it |
|---|---|---|
| [**USER-MANUAL.md**](./USER-MANUAL.md) | **End users** (designers, marketers, non-tech) | How to use the Studio — building pages, editing properties, themes, generating apps. No code required. |
| [**MONETIZATION-PLAN.md**](./MONETIZATION-PLAN.md) | **Founder / business** | Pricing tiers, hosted-Studio build path with effort estimates, Stripe integration, pre-launch decisions, 12-month launch sequence, KPIs. |
| [**LOCAL-SETUP.md**](./LOCAL-SETUP.md) | Developers | First time on a new machine. Installs, builds, runs the wirer and Studio. |
| [**PUSHING-CODE.md**](./PUSHING-CODE.md) | Developers | Repo strategy (monorepo vs split), git init + push, branching, CI templates, generated-app vs generator-repo workflows. |
| [**ENV-VARS.md**](./ENV-VARS.md) | Developers / DevOps | Every env var across the wirer, Studio, and every generation module. Module-by-module reference. |
| [**DOCKER-COMPOSE.md**](./DOCKER-COMPOSE.md) | DevOps | Ready-to-paste `docker-compose.yml` for generated apps, Studio, Studio + collab, and a full Traefik-fronted prod stack. |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | DevOps | Shipping a generated app (Vercel/Render/Fly/Docker) and shipping the Studio itself. |
| [spike-notes.md](./spike-notes.md) | Archaeologists | Historical R&D notes from the spike phase. Skip unless archaeology. |

## Quick triage

> **I'm a customer/designer/marketer — how do I use the Studio?**
> → [USER-MANUAL.md](./USER-MANUAL.md) §2–4

> **I want to try the project right now (as a developer)**
> → [LOCAL-SETUP.md](./LOCAL-SETUP.md) §1–4

> **I generated an app and want to run it locally**
> → [LOCAL-SETUP.md](./LOCAL-SETUP.md) §4

> **I want to ship a generated app to production**
> → [DEPLOYMENT.md](./DEPLOYMENT.md) §1

> **I want to ship the Studio to my customers**
> → [DEPLOYMENT.md](./DEPLOYMENT.md) §2

> **I want everything in Docker on a VPS**
> → [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) §4 (Traefik + TLS)

> **I need to know what env vars module X needs**
> → [ENV-VARS.md](./ENV-VARS.md) §2 (module-by-module)

> **I'm stuck on a build error**
> → [LOCAL-SETUP.md](./LOCAL-SETUP.md) "Troubleshooting"
