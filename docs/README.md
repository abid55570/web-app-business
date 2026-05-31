# b-dash docs

Operational docs for the b-dash monorepo. The architectural / business docs live one level up (`../PLAN.md`, `../BUSINESS-PLAN.md`); these are the "how do I run it" guides.

## Index

| Doc | Audience | When to read it |
|---|---|---|
| [**STUDIO-TUTORIAL.md**](./STUDIO-TUTORIAL.md) | **End users · first time** | 20-min hands-on walkthrough — sign in, build a 5-block landing page, switch themes, render the real app. Start here. |
| [**DEV-TUTORIAL.md**](./DEV-TUTORIAL.md) | **Developers · first time** | 45-min end-to-end — clone, install, generate first app, run it locally, customize via Studio, add new section + module, push to repo. Start here as a dev. |
| [**USER-MANUAL.md**](./USER-MANUAL.md) | End users (reference) | Complete Studio reference — every panel, every shortcut, FAQ, glossary. |
| [**MONETIZATION-PLAN.md**](./MONETIZATION-PLAN.md) | Founder / business | Pricing tiers, hosted-Studio build path with effort estimates, Stripe integration, pre-launch decisions, 12-month launch sequence, KPIs. |
| [**LOCAL-SETUP.md**](./LOCAL-SETUP.md) | Developers (reference) | First-time setup details — prereqs, installs, builds, runs the wirer and Studio. |
| [**PUSHING-CODE.md**](./PUSHING-CODE.md) | Developers | Repo strategy (monorepo vs split), git init + push, branching, CI templates, generated-app vs generator-repo workflows. |
| [**ENV-VARS.md**](./ENV-VARS.md) | Developers / DevOps | Every env var across the wirer, Studio, and every generation module. Module-by-module reference. |
| [**DOCKER-COMPOSE.md**](./DOCKER-COMPOSE.md) | DevOps | Ready-to-paste `docker-compose.yml` for generated apps, Studio, Studio + collab, and a full Traefik-fronted prod stack. |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | DevOps | Shipping a generated app (Vercel/Render/Fly/Docker) and shipping the Studio itself. |
| [spike-notes.md](./spike-notes.md) | Archaeologists | Historical R&D notes from the spike phase. Skip unless archaeology. |

## Quick triage

> **I'm a customer/designer/marketer — first time using the Studio?**
> → [STUDIO-TUTORIAL.md](./STUDIO-TUTORIAL.md) (20-min walkthrough)

> **I'm a designer/marketer — Studio reference docs**
> → [USER-MANUAL.md](./USER-MANUAL.md)

> **I'm a developer — first time using b-dash?**
> → [DEV-TUTORIAL.md](./DEV-TUTORIAL.md) (45-min end-to-end)

> **I'm a developer — just need to set up my machine**
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
