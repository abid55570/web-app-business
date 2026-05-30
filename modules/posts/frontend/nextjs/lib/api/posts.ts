import { apiFetch } from './client'

export type PostStatus = 'draft' | 'published' | 'archived'

export type Post = {
  id: string
  authorId: string
  title: string
  slug: string
  body: string
  excerpt: string | null
  coverUrl: string | null
  status: PostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PostInput = {
  title: string
  slug: string
  body: string
  excerpt?: string | null
  coverUrl?: string | null
  status?: PostStatus
}

export type PostListResponse = {
  items: Post[]
  total: number
}

const PUBLIC = '/api/posts'
const ADMIN = '/api/admin/posts'

export const postsApi = {
  list: (authorId?: string) => {
    const url = authorId
      ? `${PUBLIC}?authorId=${encodeURIComponent(authorId)}`
      : PUBLIC
    return apiFetch<PostListResponse>(url)
  },
  getBySlug: (slug: string) => apiFetch<Post>(`${PUBLIC}/${slug}`),

  adminList: (status?: PostStatus) => {
    const url = status ? `${ADMIN}?status=${status}` : ADMIN
    return apiFetch<PostListResponse>(url)
  },
  adminGet: (id: string) => apiFetch<Post>(`${ADMIN}/${id}`),
  create: (body: PostInput) =>
    apiFetch<Post>(ADMIN, { method: 'POST', body }),
  update: (id: string, body: Partial<PostInput>) =>
    apiFetch<Post>(`${ADMIN}/${id}`, { method: 'PATCH', body }),
  setStatus: (id: string, status: PostStatus) =>
    apiFetch<Post>(`${ADMIN}/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  remove: (id: string) =>
    apiFetch<void>(`${ADMIN}/${id}`, { method: 'DELETE' }),
}
