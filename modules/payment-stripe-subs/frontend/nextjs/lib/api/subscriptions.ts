import { apiFetch } from './client'

export type SubStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'

export type Plan = {
  id: string
  key: string
  name: string
  description: string | null
  amountCents: number
  currency: string
  interval: 'month' | 'year'
  stripePriceId: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type Subscription = {
  id: string
  customerRef: string
  planKey: string
  status: SubStatus
  stripeSubscriptionId: string | null
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

export type CheckoutInput = {
  planKey: string
  customerRef: string
  successUrl: string
  cancelUrl: string
}

export type PortalInput = {
  customerRef: string
  returnUrl?: string
}

export type PlanListResponse = {
  items: Plan[]
  total: number
}

export type SubscriptionListResponse = {
  items: Subscription[]
  total: number
}

const PUBLIC = '/api'
const ADMIN = '/api/admin'

export const subscriptionsApi = {
  /** Public-readable plan list. */
  plans: () => apiFetch<PlanListResponse>(`${PUBLIC}/plans`),

  /** Start a Stripe Checkout session. Returns { sessionId, checkoutUrl }. */
  checkout: (body: CheckoutInput) =>
    apiFetch<{ sessionId: string; checkoutUrl: string }>(
      `${PUBLIC}/subscriptions/checkout`,
      { method: 'POST', body },
    ),

  /** Open the Stripe billing portal. */
  portal: (body: PortalInput) =>
    apiFetch<{ portalUrl: string }>(`${PUBLIC}/subscriptions/portal`, {
      method: 'POST',
      body,
    }),

  /** The most-recent non-canceled subscription for a customer ref, or null. */
  active: (customerRef: string) =>
    apiFetch<Subscription | null>(
      `${PUBLIC}/subscriptions/active/${encodeURIComponent(customerRef)}`,
    ),

  // Admin
  adminPlans: () => apiFetch<PlanListResponse>(`${ADMIN}/plans`),
  createPlan: (body: Omit<Plan, 'id' | 'stripePriceId' | 'active' | 'createdAt' | 'updatedAt'> & { active?: boolean }) =>
    apiFetch<Plan>(`${ADMIN}/plans`, { method: 'POST', body }),
  updatePlan: (id: string, body: Partial<Omit<Plan, 'id' | 'key' | 'stripePriceId' | 'createdAt' | 'updatedAt'>>) =>
    apiFetch<Plan>(`${ADMIN}/plans/${id}`, { method: 'PATCH', body }),
  adminSubscriptions: () => apiFetch<SubscriptionListResponse>(`${ADMIN}/subscriptions`),
}
