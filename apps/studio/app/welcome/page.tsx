'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markOnboardingComplete, saveBrand, resetOnboarding } from '../../lib/onboarding'
import { TEMPLATES, type OnboardingTemplate } from '../../lib/templates'

type Step = 'welcome' | 'template' | 'brand' | 'finishing'

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null)
  const [appName, setAppName] = useState('My App')
  const [tagline, setTagline] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')

  function skipToEditor() {
    markOnboardingComplete()
    router.push('/?fresh=1')
  }

  function selectTemplate(t: OnboardingTemplate) {
    setTemplate(t)
    if (t.id === 'blank') {
      // Skip brand step for blank
      markOnboardingComplete()
      saveBrand({ appName: '', tagline: '', brandColor: '' })
      router.push('/?template=blank')
    } else {
      setStep('brand')
    }
  }

  function finishOnboarding() {
    saveBrand({ appName, tagline, brandColor })
    markOnboardingComplete()
    setStep('finishing')
    setTimeout(() => {
      router.push(`/?template=${template!.id}`)
    }, 600)
  }

  return (
    <div className="welcome-shell">
      <div className="welcome-progress">
        <span className={step === 'welcome' ? 'on' : 'off'}>1</span>
        <span className={step === 'template' ? 'on' : 'off'}>2</span>
        <span className={step === 'brand' || step === 'finishing' ? 'on' : 'off'}>3</span>
      </div>

      {step === 'welcome' ? (
        <section className="welcome-card welcome-intro">
          <p className="welcome-emoji">👋</p>
          <h1>Welcome to b-dash</h1>
          <p className="welcome-lede">
            Build a real, deployable website in 20 minutes. No code. No
            monthly platform fees. You own the code at the end.
          </p>
          <div className="welcome-features">
            <div>
              <strong>538</strong>
              <span>ready-made sections</span>
            </div>
            <div>
              <strong>75</strong>
              <span>visual themes</span>
            </div>
            <div>
              <strong>58</strong>
              <span>starter templates</span>
            </div>
          </div>
          <button type="button" className="btn-primary btn-lg" onClick={() => setStep('template')}>
            Pick a template →
          </button>
          <button type="button" className="btn-text" onClick={skipToEditor}>
            Skip — open the empty editor
          </button>
        </section>
      ) : null}

      {step === 'template' ? (
        <section className="welcome-card welcome-templates">
          <header>
            <h2>What do you want to build?</h2>
            <p>Pick a starting point. You can change everything later.</p>
          </header>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="template-card"
                onClick={() => selectTemplate(t)}
              >
                <span className="template-icon">{t.icon}</span>
                <strong>{t.name}</strong>
                <span className="template-desc">{t.description}</span>
                <span className="template-bestfor">{t.bestFor}</span>
              </button>
            ))}
          </div>
          <button type="button" className="btn-text" onClick={() => setStep('welcome')}>
            ← Back
          </button>
        </section>
      ) : null}

      {step === 'brand' ? (
        <section className="welcome-card welcome-brand">
          <header>
            <h2>Tell us about your {template?.name.toLowerCase()}</h2>
            <p>This pre-fills the template. You can change anything later.</p>
          </header>
          <label className="brand-field">
            <span>App / brand name</span>
            <input
              type="text"
              autoFocus
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="My SaaS"
              maxLength={40}
            />
          </label>
          <label className="brand-field">
            <span>One-line tagline</span>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Get things done faster"
              maxLength={80}
            />
          </label>
          <label className="brand-field">
            <span>Brand colour</span>
            <div className="brand-color-row">
              {['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#18181b'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`brand-swatch ${brandColor === c ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => setBrandColor(c)}
                />
              ))}
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="brand-color-native"
              />
            </div>
          </label>
          <div className="welcome-actions">
            <button type="button" className="btn-text" onClick={() => setStep('template')}>
              ← Back
            </button>
            <button
              type="button"
              className="btn-primary btn-lg"
              onClick={finishOnboarding}
              disabled={!appName.trim()}
            >
              Open editor →
            </button>
          </div>
        </section>
      ) : null}

      {step === 'finishing' ? (
        <section className="welcome-card welcome-finishing">
          <p className="welcome-emoji">⚡</p>
          <h2>Setting up your {template?.name.toLowerCase()}…</h2>
          <div className="finishing-bar">
            <div className="finishing-bar-fill" />
          </div>
        </section>
      ) : null}

      <p className="welcome-footnote">
        Already an experienced user?{' '}
        <button type="button" className="btn-link" onClick={skipToEditor}>
          Open the empty editor directly
        </button>
        {' · '}
        <button type="button" className="btn-link" onClick={resetOnboarding}>
          Reset onboarding
        </button>
      </p>
    </div>
  )
}
