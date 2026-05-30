import { apiFetch } from './client'

export type TenantRole = 'owner' | 'admin' | 'member'

export type Tenant = {
  id: string
  ownerId: string
  name: string
  slug: string
  plan: string
  createdAt: string
  updatedAt: string
}

export type Member = {
  id: string
  tenantId: string
  userId: string
  role: TenantRole
  invitedBy: string | null
  joinedAt: string
}

export type TenantCreateInput = {
  name: string
  slug: string
}

export type TenantUpdateInput = {
  name?: string
  slug?: string
  plan?: string
}

export type TenantListResponse = {
  items: Tenant[]
  total: number
}

export type MemberListResponse = {
  items: Member[]
  total: number
}

const BASE = '/api/tenants'

export const tenantsApi = {
  my: () => apiFetch<TenantListResponse>(`${BASE}/my`),
  get: (slugOrId: string) => apiFetch<Tenant>(`${BASE}/${slugOrId}`),
  create: (body: TenantCreateInput) =>
    apiFetch<Tenant>(BASE, { method: 'POST', body }),
  update: (slugOrId: string, body: TenantUpdateInput) =>
    apiFetch<Tenant>(`${BASE}/${slugOrId}`, { method: 'PATCH', body }),

  members: (slugOrId: string) =>
    apiFetch<MemberListResponse>(`${BASE}/${slugOrId}/members`),
  invite: (slugOrId: string, userId: string, role: TenantRole = 'member') =>
    apiFetch<Member>(`${BASE}/${slugOrId}/members`, {
      method: 'POST',
      body: { userId, role },
    }),
  changeRole: (slugOrId: string, userId: string, role: TenantRole) =>
    apiFetch<Member>(`${BASE}/${slugOrId}/members/${userId}`, {
      method: 'PATCH',
      body: { role },
    }),
  removeMember: (slugOrId: string, userId: string) =>
    apiFetch<void>(`${BASE}/${slugOrId}/members/${userId}`, { method: 'DELETE' }),
}
