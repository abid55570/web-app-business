/**
 * Wizard types + recipe builder.
 *
 * The wizard collects answers across 7 steps then synthesises a recipe
 * by picking a base starter (matching the chosen template) and merging
 * additional modules based on user feature choices.
 */

export type AuthMethod = 'none' | 'email-pass' | 'magic-link' | 'google' | 'github'
export type PaymentMethod = 'none' | 'stripe-onetime' | 'stripe-subs'
export type NotifChannel = 'email' | 'sms' | 'whatsapp' | 'push'

export type WizardAnswers = {
  intent: string
  templateId: string
  appName: string
  tagline: string
  brandColor: string
  auth: AuthMethod
  payment: PaymentMethod
  notifications: NotifChannel[]
  deployTarget: 'docker-zip' | 'vercel' | 'render' | 'fly' | 'none'
}

/** Map each template to the best-fit starter recipe to use as a base. */
const TEMPLATE_TO_STARTER: Record<string, string> = {
  landing: 'newsletter-landing',
  pricing: 'saas-jwt',
  blog: 'content-blog',
  todo: 'notes-personal',
  portfolio: 'portfolio-mono',
  shop: 'digital-downloads',
  event: 'event-rsvp',
  blank: 'notes-personal', // smallest viable starter
}

/** Map wizard answers → list of modules to add ON TOP of the starter base. */
function answersToExtraModules(a: WizardAnswers): string[] {
  const mods = new Set<string>()
  switch (a.auth) {
    case 'email-pass': mods.add('auth-jwt'); break
    case 'magic-link': mods.add('auth-magic-link'); mods.add('notif-email'); break
    case 'google': mods.add('auth-jwt'); mods.add('auth-google'); break
    case 'github': mods.add('auth-jwt'); mods.add('auth-github'); break
  }
  switch (a.payment) {
    case 'stripe-onetime': mods.add('payment-stripe'); break
    case 'stripe-subs': mods.add('payment-stripe-subs'); break
  }
  for (const ch of a.notifications) {
    if (ch === 'email') mods.add('notif-email')
    if (ch === 'sms') mods.add('notif-sms')
    if (ch === 'whatsapp') mods.add('notif-whatsapp')
    if (ch === 'push') mods.add('notifications-push')
  }
  return Array.from(mods)
}

export function starterForTemplate(templateId: string): string {
  return TEMPLATE_TO_STARTER[templateId] ?? 'notes-personal'
}

export function extraModulesForAnswers(a: WizardAnswers): string[] {
  return answersToExtraModules(a)
}

/** Pretty summary string for the Review step. */
export function summarizeAnswers(a: WizardAnswers): { label: string; value: string }[] {
  const tplName = a.templateId.charAt(0).toUpperCase() + a.templateId.slice(1)
  const authLabel: Record<AuthMethod, string> = {
    'none': 'No sign-in',
    'email-pass': 'Email + password',
    'magic-link': 'Magic-link (passwordless email)',
    'google': 'Google sign-in',
    'github': 'GitHub sign-in',
  }
  const payLabel: Record<PaymentMethod, string> = {
    'none': 'Free (no payments)',
    'stripe-onetime': 'Stripe one-time payments',
    'stripe-subs': 'Stripe subscriptions',
  }
  const notifs = a.notifications.length ? a.notifications.join(', ') : 'None'
  return [
    { label: 'App type', value: tplName },
    { label: 'App name', value: a.appName || '(unnamed)' },
    { label: 'Tagline', value: a.tagline || '(none)' },
    { label: 'Brand color', value: a.brandColor },
    { label: 'Sign-in', value: authLabel[a.auth] },
    { label: 'Payments', value: payLabel[a.payment] },
    { label: 'Notifications', value: notifs },
    { label: 'Deploy target', value: a.deployTarget },
  ]
}
