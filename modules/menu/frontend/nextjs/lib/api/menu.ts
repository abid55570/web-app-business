import { apiFetch } from './client'

export type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  imageUrl: string | null
  category: string
  isAvailable: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type MenuItemInput = {
  name: string
  description?: string | null
  price: number
  currency?: string
  imageUrl?: string | null
  category: string
  isAvailable?: boolean
  sortOrder?: number
}

export type MenuListResponse = {
  items: MenuItem[]
  total: number
}

export type CategoryListResponse = {
  categories: string[]
}

const PUBLIC = '/api/menu'
const ADMIN = '/api/admin/menu'

export const menuApi = {
  list: (category?: string) => {
    const url = category
      ? `${PUBLIC}?category=${encodeURIComponent(category)}`
      : PUBLIC
    return apiFetch<MenuListResponse>(url)
  },
  categories: () => apiFetch<CategoryListResponse>(`${PUBLIC}/categories`),
  get: (id: string) => apiFetch<MenuItem>(`${PUBLIC}/${id}`),

  adminList: () => apiFetch<MenuListResponse>(ADMIN),
  create: (body: MenuItemInput) =>
    apiFetch<MenuItem>(ADMIN, { method: 'POST', body }),
  update: (id: string, body: Partial<MenuItemInput>) =>
    apiFetch<MenuItem>(`${ADMIN}/${id}`, { method: 'PATCH', body }),
  setAvailability: (id: string, isAvailable: boolean) =>
    apiFetch<MenuItem>(`${ADMIN}/${id}/availability`, {
      method: 'PATCH',
      body: { isAvailable },
    }),
  remove: (id: string) =>
    apiFetch<void>(`${ADMIN}/${id}`, { method: 'DELETE' }),
}
