'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { markOnboardingComplete, saveBrand, resetOnboarding } from '../../lib/onboarding'
import { TEMPLATES, type OnboardingTemplate } from '../../lib/templates'
import { matchIntent } from '../../lib/intent-matcher'
import { summarizeAnswers, type WizardAnswers, type AuthMethod, type PaymentMethod, type NotifChannel } from '../../lib/wizard'

type Step = 'welcome' | 'intent' | 'brand' | 'auth' | 'payment' | 'notif' | 'modules' | 'deploy' | 'review' | 'building' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'intent', label: 'What' },
  { id: 'brand', label: 'Brand' },
  { id: 'auth', label: 'Sign-in' },
  { id: 'payment', label: 'Payments' },
  { id: 'notif', label: 'Notify' },
  { id: 'modules', label: 'Modules' },
  { id: 'deploy', label: 'Deploy' },
  { id: 'review', label: 'Review' },
]

type CatalogModule = { id: string; displayName: string; description: string; dependsOn: string[]; category: string }
type ModuleCategory = { key: string; label: string; modules: CatalogModule[] }

const AUTH_OPTIONS: { id: AuthMethod; icon: string; label: string; desc: string }[] = [
  { id: 'none', icon: '🚫', label: 'No sign-in', desc: 'Public-only app, no users' },
  { id: 'email-pass', icon: '📧', label: 'Email + password', desc: 'Classic — users register with email' },
  { id: 'magic-link', icon: '🪄', label: 'Magic link', desc: 'Passwordless — link sent to email' },
  { id: 'google', icon: 'G', label: 'Google sign-in', desc: 'One-click Google OAuth' },
  { id: 'github', icon: '🐙', label: 'GitHub sign-in', desc: 'One-click GitHub OAuth (devs)' },
]

const PAYMENT_OPTIONS: { id: PaymentMethod; icon: string; label: string; desc: string }[] = [
  { id: 'none', icon: '🆓', label: 'Free (no payments)', desc: 'Skip Stripe entirely' },
  { id: 'stripe-onetime', icon: '💳', label: 'One-time payments', desc: 'Stripe Checkout for single purchases' },
  { id: 'stripe-subs', icon: '🔁', label: 'Subscriptions', desc: 'Stripe recurring billing + customer portal' },
]

const NOTIF_OPTIONS: { id: NotifChannel; icon: string; label: string }[] = [
  { id: 'email', icon: '✉', label: 'Email (Resend)' },
  { id: 'sms', icon: '📱', label: 'SMS (Twilio)' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp (Twilio)' },
  { id: 'push', icon: '🔔', label: 'Web push' },
]

const DEPLOY_OPTIONS: { id: WizardAnswers['deployTarget']; icon: string; label: string; desc: string }[] = [
  { id: 'docker-zip', icon: '🐳', label: 'Docker', desc: 'Runs anywhere — Postgres + Redis + your app in one compose file' },
  { id: 'vercel', icon: '▲', label: 'Vercel', desc: 'Best for frontend-only or full-stack with serverless backend' },
  { id: 'render', icon: '🎨', label: 'Render', desc: 'Auto-deploys full stack from a render.yaml blueprint' },
  { id: 'fly', icon: '🪂', label: 'Fly.io', desc: 'Global edge deploy with persistent volumes' },
  { id: 'none', icon: '🧑‍💻', label: 'Local only for now', desc: 'No deploy config — pick later' },
]

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')

  // Answers
  const [intent, setIntent] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [appName, setAppName] = useState('')
  const [tagline, setTagline] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [auth, setAuth] = useState<AuthMethod>('email-pass')
  const [payment, setPayment] = useState<PaymentMethod>('none')
  const [notifications, setNotifications] = useState<NotifChannel[]>(['email'])
  const [deployTarget, setDeployTarget] = useState<WizardAnswers['deployTarget']>('docker-zip')

  // Module catalog + user picks (loaded lazily when entering the modules step).
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCategory[]>([])
  const [customModules, setCustomModules] = useState<string[]>([])
  const [modulesLoading, setModulesLoading] = useState(false)

  // Build result
  const [building, setBuilding] = useState(false)
  const [buildLog, setBuildLog] = useState<string[]>([])
  const [result, setResult] = useState<null | {
    ok: boolean
    outDir: string
    fileCount: number
    moduleCount: number
    baseStarter: string
    log: string[]
  }>(null)

  const answers: WizardAnswers = { intent, templateId, appName, tagline, brandColor, auth, payment, notifications, customModules, deployTarget }
  const intentMatches = intent ? matchIntent(intent) : []

  /** Smart preselect: derive modules from auth/payment/notif answers
   * the first time the user lands on the modules step. After that, the
   * user's explicit picks (customModules) take precedence. */
  function presetModulesFromAnswers(): string[] {
    const mods = new Set<string>(['events-bus'])
    if (auth === 'email-pass') { mods.add('auth-core'); mods.add('auth-jwt') }
    if (auth === 'magic-link') { mods.add('auth-core'); mods.add('auth-jwt'); mods.add('notifications-resend') }
    if (auth === 'google' || auth === 'github') { mods.add('auth-core'); mods.add('auth-jwt'); mods.add('auth-oauth') }
    if (payment === 'stripe-onetime') { mods.add('payment-core'); mods.add('payment-stripe') }
    if (payment === 'stripe-subs') { mods.add('payment-core'); mods.add('payment-stripe-subs') }
    if (notifications.length > 0) mods.add('notifications')
    for (const ch of notifications) {
      if (ch === 'email') mods.add('notifications-resend')
      if (ch === 'sms') mods.add('notifications-twilio')
      if (ch === 'whatsapp') mods.add('notifications-whatsapp')
      if (ch === 'push') mods.add('notifications-push')
    }
    return Array.from(mods)
  }

  /** Load module catalog on entering the modules step. */
  useEffect(() => {
    if (step !== 'modules') return
    if (moduleCatalog.length > 0) return
    setModulesLoading(true)
    fetch('/api/wizard/modules')
      .then((r) => r.json())
      .then((data) => {
        setModuleCatalog(data.categories ?? [])
        // Preselect from prior answers — user can then toggle freely.
        if (customModules.length === 0) setCustomModules(presetModulesFromAnswers())
      })
      .catch(() => setModuleCatalog([]))
      .finally(() => setModulesLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  function toggleModule(id: string) {
    setCustomModules((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
    )
  }

  function selectTemplate(t: OnboardingTemplate) {
    setTemplateId(t.id)
    setStep('brand')
  }

  function pickIntentMatch(m: { templateId: string }) {
    setTemplateId(m.templateId)
    const tpl = TEMPLATES.find((t) => t.id === m.templateId)
    if (tpl) setAppName(`My ${tpl.name}`)
    setStep('brand')
  }

  function nextStep() {
    const order: Step[] = ['intent', 'brand', 'auth', 'payment', 'notif', 'modules', 'deploy', 'review']
    const i = order.indexOf(step as Step)
    if (i >= 0 && i < order.length - 1) setStep(order[i + 1]!)
  }
  function prevStep() {
    const order: Step[] = ['intent', 'brand', 'auth', 'payment', 'notif', 'modules', 'deploy', 'review']
    const i = order.indexOf(step as Step)
    if (i > 0) setStep(order[i - 1]!)
  }

  async function build() {
    setStep('building')
    setBuilding(true)
    setBuildLog(['Synthesising your recipe…'])

    saveBrand({ appName, tagline, brandColor })
    markOnboardingComplete()

    try {
      setBuildLog((l) => [...l, 'Calling the wirer…'])
      const res = await fetch('/api/wizard/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      setResult(data)
      setBuildLog((l) => [...l, ...(data.log ?? []).slice(-10)])
      setStep('done')
    } catch (err) {
      setBuildLog((l) => [...l, 'ERROR: ' + (err as Error).message])
      setStep('done')
    } finally {
      setBuilding(false)
    }
  }

  const currentStepIdx = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="welcome-shell">
      {step !== 'welcome' && step !== 'building' && step !== 'done' ? (
        <div className="wiz-stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`wiz-step ${i === currentStepIdx ? 'on' : i < currentStepIdx ? 'done' : ''}`}>
              <span className="wiz-step-dot">{i < currentStepIdx ? '✓' : i + 1}</span>
              <span className="wiz-step-label">{s.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {step === 'welcome' ? (
        <section className="welcome-card welcome-intro">
          <p className="welcome-emoji">⚡</p>
          <h1>Build a real app in 3 minutes</h1>
          <p className="welcome-lede">
            Answer 6 short questions. We&apos;ll compose a real, deployable
            Next.js + FastAPI app from 539 pre-built sections. No code.
            You own everything.
          </p>
          <div className="welcome-features">
            <div><strong>3 min</strong><span>to build</span></div>
            <div><strong>0 code</strong><span>required</span></div>
            <div><strong>$0</strong><span>recurring fees</span></div>
          </div>
          <button type="button" className="btn-primary btn-lg" onClick={() => setStep('intent')}>
            Start the wizard →
          </button>
          <button type="button" className="btn-text" onClick={() => router.push('/apps')}>
            📦 Edit an existing app
          </button>
        </section>
      ) : null}

      {step === 'intent' ? (
        <section className="welcome-card">
          <header>
            <h2>What do you want to build?</h2>
            <p>Type one sentence — or pick from the templates below.</p>
          </header>
          <input
            type="text"
            autoFocus
            placeholder='e.g. "A todo app for my team" or "An online store for digital art"'
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="wiz-intent-input"
          />
          {intent && intentMatches.length > 0 ? (
            <div className="wiz-matches">
              <p className="wiz-matches-title">Best matches:</p>
              <div className="wiz-matches-row">
                {intentMatches.map((m) => {
                  const tpl = TEMPLATES.find((t) => t.id === m.templateId)
                  if (!tpl) return null
                  return (
                    <button key={m.templateId} type="button" className="wiz-match-card" onClick={() => pickIntentMatch(m)}>
                      <span className="template-icon">{tpl.icon}</span>
                      <strong>{tpl.name}</strong>
                      <span className="wiz-match-score">{m.matchedKeywords.join(', ')}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          <p className="wiz-or">— or pick a template —</p>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <button key={t.id} type="button" className="template-card" onClick={() => selectTemplate(t)}>
                <span className="template-icon">{t.icon}</span>
                <strong>{t.name}</strong>
                <span className="template-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 'brand' ? (
        <section className="welcome-card">
          <header>
            <h2>Tell us about your app</h2>
            <p>Used for headings + branding. You can change everything later.</p>
          </header>
          <label className="brand-field">
            <span>App name</span>
            <input type="text" autoFocus value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="My SaaS" maxLength={40} />
          </label>
          <label className="brand-field">
            <span>One-line tagline</span>
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Get things done faster" maxLength={80} />
          </label>
          <label className="brand-field">
            <span>Brand colour</span>
            <div className="brand-color-row">
              {['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#18181b'].map((c) => (
                <button key={c} type="button" className={`brand-swatch ${brandColor === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setBrandColor(c)} />
              ))}
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="brand-color-native" />
            </div>
          </label>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={() => setStep('intent')}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={nextStep} disabled={!appName.trim()}>
              Next →
            </button>
          </div>
        </section>
      ) : null}

      {step === 'auth' ? (
        <section className="welcome-card">
          <header>
            <h2>How will users sign in?</h2>
            <p>Pick one. You can add more later.</p>
          </header>
          <div className="wiz-options">
            {AUTH_OPTIONS.map((o) => (
              <button key={o.id} type="button" className={`wiz-option ${auth === o.id ? 'on' : ''}`} onClick={() => setAuth(o.id)}>
                <span className="wiz-option-icon">{o.icon}</span>
                <div>
                  <strong>{o.label}</strong>
                  <span>{o.desc}</span>
                </div>
                {auth === o.id ? <span className="wiz-option-check">✓</span> : null}
              </button>
            ))}
          </div>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={prevStep}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={nextStep}>Next →</button>
          </div>
        </section>
      ) : null}

      {step === 'payment' ? (
        <section className="welcome-card">
          <header>
            <h2>Do you charge money?</h2>
            <p>If yes, we&apos;ll wire up Stripe for you.</p>
          </header>
          <div className="wiz-options">
            {PAYMENT_OPTIONS.map((o) => (
              <button key={o.id} type="button" className={`wiz-option ${payment === o.id ? 'on' : ''}`} onClick={() => setPayment(o.id)}>
                <span className="wiz-option-icon">{o.icon}</span>
                <div>
                  <strong>{o.label}</strong>
                  <span>{o.desc}</span>
                </div>
                {payment === o.id ? <span className="wiz-option-check">✓</span> : null}
              </button>
            ))}
          </div>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={prevStep}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={nextStep}>Next →</button>
          </div>
        </section>
      ) : null}

      {step === 'notif' ? (
        <section className="welcome-card">
          <header>
            <h2>How do you reach users?</h2>
            <p>Pick all that apply. We&apos;ll wire each channel.</p>
          </header>
          <div className="wiz-options">
            {NOTIF_OPTIONS.map((o) => {
              const active = notifications.includes(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`wiz-option ${active ? 'on' : ''}`}
                  onClick={() => setNotifications((arr) => active ? arr.filter((x) => x !== o.id) : [...arr, o.id])}
                >
                  <span className="wiz-option-icon">{o.icon}</span>
                  <div><strong>{o.label}</strong></div>
                  <span className="wiz-option-check">{active ? '✓' : ''}</span>
                </button>
              )
            })}
          </div>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={prevStep}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={nextStep}>Next →</button>
          </div>
        </section>
      ) : null}

      {step === 'modules' ? (
        <section className="welcome-card welcome-templates">
          <header>
            <h2>Pick your modules</h2>
            <p>
              We pre-selected modules based on your earlier answers. Toggle any on
              or off — every module adds backend code + deps to your export.
              <strong> Fewer modules = leaner app.</strong>
            </p>
          </header>
          {modulesLoading ? (
            <p style={{textAlign:'center', padding:'40px 0', color:'#71717a'}}>Loading catalog…</p>
          ) : (
            <div className="wiz-modules">
              {moduleCatalog.map((cat) => (
                <div key={cat.key} className="wiz-mod-cat">
                  <h3 className="wiz-mod-cat-label">{cat.label}</h3>
                  <div className="wiz-mod-list">
                    {cat.modules.map((m) => {
                      const active = customModules.includes(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`wiz-mod-card ${active ? 'on' : ''}`}
                          onClick={() => toggleModule(m.id)}
                        >
                          <span className="wiz-mod-check">{active ? '✓' : ''}</span>
                          <div className="wiz-mod-body">
                            <strong>{m.displayName}</strong>
                            <span className="wiz-mod-id">{m.id}</span>
                            {m.description ? <p>{m.description}</p> : null}
                            {m.dependsOn.length > 0 ? (
                              <p className="wiz-mod-deps">↳ needs: {m.dependsOn.join(', ')}</p>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="wiz-modules-summary">
            <strong>{customModules.length}</strong> module{customModules.length === 1 ? '' : 's'} selected
            <button type="button" className="btn-link" onClick={() => setCustomModules([])}>Clear all</button>
            <button type="button" className="btn-link" onClick={() => setCustomModules(presetModulesFromAnswers())}>Reset to defaults</button>
          </div>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={prevStep}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={nextStep}>Next →</button>
          </div>
        </section>
      ) : null}

      {step === 'deploy' ? (
        <section className="welcome-card">
          <header>
            <h2>Where will you deploy?</h2>
            <p>Pick one. We&apos;ll write the right config files.</p>
          </header>
          <div className="wiz-options">
            {DEPLOY_OPTIONS.map((o) => (
              <button key={o.id} type="button" className={`wiz-option ${deployTarget === o.id ? 'on' : ''}`} onClick={() => setDeployTarget(o.id)}>
                <span className="wiz-option-icon">{o.icon}</span>
                <div>
                  <strong>{o.label}</strong>
                  <span>{o.desc}</span>
                </div>
                {deployTarget === o.id ? <span className="wiz-option-check">✓</span> : null}
              </button>
            ))}
          </div>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={prevStep}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={nextStep}>Review →</button>
          </div>
        </section>
      ) : null}

      {step === 'review' ? (
        <section className="welcome-card">
          <header>
            <h2>Ready to build?</h2>
            <p>Here&apos;s a summary of what we&apos;ll generate.</p>
          </header>
          <dl className="wiz-summary">
            {summarizeAnswers(answers).map((row) => (
              <div key={row.label} className="wiz-summary-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={prevStep}>← Back</button>
            <button type="button" className="btn-primary btn-lg" onClick={() => void build()}>
              ⚡ Build my app
            </button>
          </div>
        </section>
      ) : null}

      {step === 'building' ? (
        <section className="welcome-card welcome-finishing">
          <p className="welcome-emoji">⚡</p>
          <h2>Building your app…</h2>
          <div className="finishing-bar"><div className="finishing-bar-fill" /></div>
          <pre className="wiz-build-log">
            {buildLog.map((l, i) => <div key={i}>{l}</div>)}
          </pre>
        </section>
      ) : null}

      {step === 'done' ? (
        <section className="welcome-card">
          {result?.ok ? (
            <>
              <p className="welcome-emoji">🎉</p>
              <h2>Your app is ready</h2>
              <p className="welcome-lede">
                {result.fileCount} files generated across {result.moduleCount} modules.
                Based on the <code>{result.baseStarter}</code> starter.
              </p>
              <div className="wiz-done-path">
                <span>Output:</span>
                <code>{result.outDir}</code>
              </div>
              <h3 className="wiz-done-h3">Frontend — Windows</h3>
              <pre className="wiz-done-code">{`cd "${result.outDir}"
.\\run.bat
# → http://localhost:3000`}</pre>
              <h3 className="wiz-done-h3">Frontend — macOS / Linux</h3>
              <pre className="wiz-done-code">{`cd "${result.outDir}"
bash run.sh
# → http://localhost:3000`}</pre>
              <h3 className="wiz-done-h3">Backend (API) — Windows</h3>
              <pre className="wiz-done-code">{`cd "${result.outDir}"
.\\run-backend.bat
# → http://localhost:8000`}</pre>
              <h3 className="wiz-done-h3">Backend (API) — macOS / Linux</h3>
              <pre className="wiz-done-code">{`cd "${result.outDir}"
bash run-backend.sh
# → http://localhost:8000`}</pre>
              <p className="welcome-footnote">
                <strong>Easiest path on Windows:</strong> open the output folder in
                Explorer and double-click <code>run.bat</code>. First run installs
                deps (~1 min), then opens the dev server. For the API, double-click
                <code>run-backend.bat</code> in a second window. Both keep running
                until you close them — Ctrl+C to stop in the terminal.
              </p>
              <p className="welcome-footnote">
                Prereqs: <a href="https://nodejs.org" target="_blank" rel="noreferrer">Node.js 20+</a>,
                <a href="https://pnpm.io/installation" target="_blank" rel="noreferrer"> pnpm</a> (<code>npm install -g pnpm</code>),
                and <a href="https://python.org" target="_blank" rel="noreferrer">Python 3.11+</a> for the backend.
              </p>
              <div className="welcome-actions">
                <button type="button" className="btn-text" onClick={() => {
                  resetOnboarding()
                  setStep('welcome')
                  setResult(null)
                  setIntent('')
                  setTemplateId('')
                  setAppName('')
                  setTagline('')
                  setCustomModules([])
                }}>Build another app</button>
                <div style={{display:'flex', gap:8}}>
                  <button type="button" className="btn-text" onClick={() => router.push('/apps')}>📦 All my apps</button>
                  <button type="button" className="btn-primary btn-lg" onClick={() => {
                    // The wizard returns outDir like B:\dash\...\wizard-<ts>. Extract id.
                    const m = result.outDir.match(/(wizard-[a-z0-9-]+)/i)
                    if (m) router.push(`/edit/${m[1]}`)
                    else router.push('/apps')
                  }}>
                    ✎ Edit this app →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="welcome-emoji">⚠️</p>
              <h2>Build failed</h2>
              <p className="welcome-lede">Something went wrong. Log:</p>
              <pre className="wiz-build-log">{buildLog.join('\n')}</pre>
              <button type="button" className="btn-primary btn-lg" onClick={() => setStep('review')}>← Back to review</button>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
