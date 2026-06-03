/**
 * Emit additional pages beyond the homepage when `recipe.extraPages`
 * is set by the wizard (e.g. /pricing, /about, /contact, /docs, /blog).
 *
 * Each page is a thin file that imports a curated section set + a
 * shared Header/Footer pair so the user gets a navigable multi-page
 * site from one wizard click. No new sections introduced — every page
 * composes from the same catalog the home page draws from.
 *
 * No-op when recipe.extraPages is missing or empty.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'

export type DeriveExtraPagesArgs = {
  plan: WirePlan
  outputDir: string
}

type Branding = { name: string; tagline?: string; primary?: string }

type PageSpec = {
  route: string
  fileName: string
  componentName: string
  emit: (b: Branding) => string
}

export async function deriveExtraPages(args: DeriveExtraPagesArgs): Promise<void> {
  const recipe = args.plan.resolvedRecipe.recipe as {
    branding: Branding
    extraPages?: string[]
  }
  const extras = recipe.extraPages
  if (!Array.isArray(extras) || extras.length === 0) return

  const b: Branding = {
    name: recipe.branding?.name || 'My App',
    tagline: recipe.branding?.tagline,
    primary: recipe.branding?.primary || '#6366f1',
  }

  const appDir = path.join(args.outputDir, 'frontend', 'src', 'app')

  for (const id of extras) {
    const spec = SPECS[id]
    if (!spec) continue
    const dir = path.join(appDir, spec.route)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'page.tsx'), spec.emit(b), 'utf-8')
  }
}

const SPECS: Record<string, PageSpec> = {
  pricing: {
    route: 'pricing',
    fileName: 'page.tsx',
    componentName: 'PricingPage',
    emit: (b) => `import { HeaderMinimal } from '@/sections/HeaderMinimal/HeaderMinimal'
import { PricingPremium } from '@/sections/PricingPremium/PricingPremium'
import { FaqAccordion } from '@/sections/FaqAccordion/FaqAccordion'
import { CtaMagnetic } from '@/sections/CtaMagnetic/CtaMagnetic'
import { FooterColumns } from '@/sections/FooterColumns/FooterColumns'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderMinimal brandName={brand} brandHref="/" links={[
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About', href: '/about' },
      ]} ctaLabel="Sign up" ctaHref="/signup" />
      <PricingPremium
        eyebrow="Pricing"
        headline="Pick a plan that fits"
        body="Start free. Upgrade when you outgrow the plan. Cancel any time."
        accentColor={color}
        tiers={[
          { name: 'Free', price: '$0', cadence: '/mo', tagline: 'For tinkerers',
            features: ['Up to 3 projects', 'Community support', 'Core features'],
            ctaLabel: 'Start free', ctaHref: '/signup' },
          { name: 'Pro', price: '$19', cadence: '/mo', tagline: 'For solo builders',
            features: ['Unlimited projects', 'Email support', 'Custom domain', 'Remove watermark'],
            ctaLabel: 'Start 14-day trial', ctaHref: '/signup', highlight: true },
          { name: 'Team', price: '$49', cadence: '/mo', tagline: 'For growing teams',
            features: ['Everything in Pro', 'SSO + SAML', 'Priority SLA', 'Audit log'],
            ctaLabel: 'Contact sales', ctaHref: '/contact' },
        ]}
      />
      <FaqAccordion
        eyebrow="FAQ"
        headline="Pricing questions"
        items={[
          { question: 'Can I change plans later?', answer: 'Yes — upgrade or downgrade any time from your dashboard.' },
          { question: 'Do you offer a free trial?', answer: 'Yes — 14 days on Pro, no credit card required.' },
          { question: 'Is there a yearly discount?', answer: 'Yes — annual billing saves about 17% (two months free).' },
          { question: 'What payment methods do you accept?', answer: 'All major cards via Stripe. Wire transfer available on Team.' },
        ]}
      />
      <CtaMagnetic
        headline="Ready to upgrade?"
        body="Try Pro free for 14 days. No card required."
        ctaLabel="Start free trial →"
        ctaHref="/signup"
        accentColor={color}
      />
      <FooterColumns brandName={brand} tagline="" columns={[
        { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Features', href: '/#features' }] },
        { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
        { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
      ]} legal={'© 2026 ' + brand} />
    </main>
  )
}
`,
  },

  about: {
    route: 'about',
    fileName: 'page.tsx',
    componentName: 'AboutPage',
    emit: (b) => `import { HeaderMinimal } from '@/sections/HeaderMinimal/HeaderMinimal'
import { FeaturesStagger } from '@/sections/FeaturesStagger/FeaturesStagger'
import { CtaMagnetic } from '@/sections/CtaMagnetic/CtaMagnetic'
import { FooterColumns } from '@/sections/FooterColumns/FooterColumns'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderMinimal brandName={brand} brandHref="/" links={[
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About', href: '/about' },
      ]} ctaLabel="Sign up" ctaHref="/signup" />

      <section className="relative mx-auto max-w-4xl px-6 py-32 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>About us</p>
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl" style={{
          background: \`linear-gradient(135deg, #fff 0%, \${color} 50%, #ec4899 100%)\`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>
          Why we built {brand}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/70">
          We were tired of bloated stacks. Started from scratch with one rule:
          every line we ship has to earn its place. Now we&apos;re a small team
          making the tool we wished existed.
        </p>
      </section>

      <FeaturesStagger
        eyebrow="What we value"
        headline="Principles, not slogans"
        body="Real defaults that shape every decision."
        accentColor={color}
        features={[
          { icon: '🎯', title: 'Focus over features', body: 'We say no a lot. Every feature has a tax — we pay it deliberately.' },
          { icon: '🔓', title: 'You own the code', body: 'No vendor lock-in. Eject any time. The export is yours forever.' },
          { icon: '⚡', title: 'Speed is a feature', body: 'Slow tools train slow habits. We profile everything in milliseconds.' },
        ]}
      />

      <CtaMagnetic
        headline="Want to work with us?"
        body="We hire for craft. Reach out if you ship things you're proud of."
        ctaLabel="Get in touch →"
        ctaHref="/contact"
        accentColor={color}
      />

      <FooterColumns brandName={brand} tagline="" columns={[
        { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Features', href: '/#features' }] },
        { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
        { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
      ]} legal={'© 2026 ' + brand} />
    </main>
  )
}
`,
  },

  contact: {
    route: 'contact',
    fileName: 'page.tsx',
    componentName: 'ContactPage',
    emit: (b) => `'use client'
import { useState } from 'react'
import { HeaderMinimal } from '@/sections/HeaderMinimal/HeaderMinimal'
import { FooterColumns } from '@/sections/FooterColumns/FooterColumns'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // Demo: just simulate. Wire to your inbox via Resend / Sendgrid / FormSpark.
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderMinimal brandName={brand} brandHref="/" links={[
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About', href: '/about' },
      ]} ctaLabel="Sign up" ctaHref="/signup" />

      <section className="relative mx-auto max-w-2xl px-6 py-24">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>Contact</p>
        <h1 className="mb-4 text-center text-5xl font-bold tracking-tight md:text-6xl" style={{
          background: \`linear-gradient(135deg, #fff 0%, \${color} 50%, #ec4899 100%)\`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>
          Say hello
        </h1>
        <p className="mb-10 text-center text-white/60">Questions, ideas, problems — we want to hear from you.</p>

        {sent ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5 text-center">
            <p className="text-emerald-200">Thanks — we&apos;ll reply within a day.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Your email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 outline-none transition focus:border-white/40" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Message</span>
              <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What's on your mind?" className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 outline-none transition focus:border-white/40" />
            </label>
            <button type="submit" className="w-full rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-2xl transition-transform hover:scale-[1.01]" style={{ background: \`linear-gradient(135deg, \${color}, #ec4899)\` }}>
              Send message →
            </button>
          </form>
        )}
      </section>

      <FooterColumns brandName={brand} tagline="" columns={[
        { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Features', href: '/#features' }] },
        { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
        { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
      ]} legal={'© 2026 ' + brand} />
    </main>
  )
}
`,
  },

  docs: {
    route: 'docs',
    fileName: 'page.tsx',
    componentName: 'DocsPage',
    emit: (b) => `import { HeaderMinimal } from '@/sections/HeaderMinimal/HeaderMinimal'
import { FooterColumns } from '@/sections/FooterColumns/FooterColumns'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

const SECTIONS = [
  { id: 'quickstart', title: 'Quickstart', body: 'Sign up, grab your API key from the dashboard, and make your first call in three lines of code.' },
  { id: 'auth', title: 'Authentication', body: 'Pass your token via the Authorization header: \`Bearer <token>\`. Tokens are scoped to your workspace.' },
  { id: 'api', title: 'API reference', body: 'REST + JSON. All endpoints accept and return camelCase. Errors come back as { code, message } pairs.' },
  { id: 'webhooks', title: 'Webhooks', body: 'Subscribe to events from the dashboard. We sign every payload with HMAC-SHA256 using your webhook secret.' },
  { id: 'sdks', title: 'SDKs', body: 'Official clients for TypeScript, Python, and Go. Community-maintained for Ruby and Elixir.' },
]

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderMinimal brandName={brand} brandHref="/" links={[
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Docs', href: '/docs' },
      ]} ctaLabel="Sign up" ctaHref="/signup" />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-8 md:self-start">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color }}>Contents</p>
          <nav className="space-y-1.5 text-sm">
            {SECTIONS.map((s) => (
              <a key={s.id} href={'#' + s.id} className="block rounded-md px-3 py-1.5 text-white/60 transition hover:bg-white/[0.04] hover:text-white">
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="space-y-16">
          <header>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>Docs</p>
            <h1 className="mb-4 text-5xl font-bold tracking-tight" style={{
              background: \`linear-gradient(135deg, #fff 0%, \${color} 50%, #ec4899 100%)\`,
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              {brand} docs
            </h1>
            <p className="text-lg text-white/70">Everything you need to integrate, debug, and ship.</p>
          </header>

          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="border-t border-white/10 pt-12">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">{s.title}</h2>
              <p className="mb-6 text-base leading-relaxed text-white/70">{s.body}</p>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-white/80"><code>{'// example code here'}</code></pre>
            </section>
          ))}
        </article>
      </div>

      <FooterColumns brandName={brand} tagline="" columns={[
        { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Docs', href: '/docs' }] },
        { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
      ]} legal={'© 2026 ' + brand} />
    </main>
  )
}
`,
  },

  blog: {
    route: 'blog',
    fileName: 'page.tsx',
    componentName: 'BlogPage',
    emit: (b) => `'use client'
import { useEffect, useState } from 'react'
import { HeaderMinimal } from '@/sections/HeaderMinimal/HeaderMinimal'
import { FooterColumns } from '@/sections/FooterColumns/FooterColumns'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

type Post = { id: string; title: string; slug: string; excerpt: string | null; body: string; publishedAt: string | null; status: string }

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    // Public list — pulls from the posts module's /api/posts endpoint.
    fetch('/api/posts')
      .then((r) => r.json())
      .then((d) => setPosts((d.items as Post[]).filter((p) => p.status === 'published')))
      .catch(() => setPosts([]))
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderMinimal brandName={brand} brandHref="/" links={[
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Blog', href: '/blog' },
      ]} ctaLabel="Sign up" ctaHref="/signup" />

      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>Blog</p>
        <h1 className="mb-12 text-5xl font-bold tracking-tight md:text-6xl" style={{
          background: \`linear-gradient(135deg, #fff 0%, \${color} 50%, #ec4899 100%)\`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>
          Writing
        </h1>

        {posts === null ? (
          <p className="text-white/50">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/60">
            <p className="mb-4">No published posts yet.</p>
            <a href="/signup" className="text-sm font-semibold underline" style={{ color }}>Sign in to start writing →</a>
          </div>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
              <li key={p.id} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/30">
                <h2 className="mb-2 text-2xl font-bold tracking-tight transition group-hover:translate-x-1">{p.title}</h2>
                {p.excerpt ? <p className="mb-3 text-white/70">{p.excerpt}</p> : null}
                {p.publishedAt ? <p className="text-xs text-white/40">{new Date(p.publishedAt).toLocaleDateString()}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <FooterColumns brandName={brand} tagline="" columns={[
        { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Blog', href: '/blog' }] },
        { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
      ]} legal={'© 2026 ' + brand} />
    </main>
  )
}
`,
  },
}
