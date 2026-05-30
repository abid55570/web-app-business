import { apiFetch } from './client'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'

export type OrderItemInput = { itemId: string; qty: number }

export type OrderItemDetail = {
  itemId: string
  name: string
  qty: number
  unitPrice: number
  currency: string
  subtotal: number
}

export type Order = {
  id: string
  customerId: string
  items: OrderItemDetail[]
  subtotal: number
  tax: number
  discount: number
  total: number
  currency: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type OrderListResponse = { orders: Order[]; total: number }

export const ordersApi = {
  create: (body: { items: OrderItemInput[]; notes?: string }) =>
    apiFetch<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listMine: () => apiFetch<OrderListResponse>('/api/orders'),
  getMine: (id: string) => apiFetch<Order>(`/api/orders/${id}`),
  cancelMine: (id: string) =>
    apiFetch<Order>(`/api/orders/${id}/cancel`, { method: 'POST' }),
  adminList: (status?: OrderStatus) =>
    apiFetch<OrderListResponse>(
      `/api/admin/orders${status ? `?status=${status}` : ''}`,
    ),
  adminGet: (id: string) => apiFetch<Order>(`/api/admin/orders/${id}`),
  adminUpdateStatus: (id: string, status: OrderStatus) =>
    apiFetch<Order>(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  adminCancel: (id: string) =>
    apiFetch<Order>(`/api/admin/orders/${id}/cancel`, { method: 'POST' }),
}
