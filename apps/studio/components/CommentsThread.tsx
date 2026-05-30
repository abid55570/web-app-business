'use client'
import { useEffect, useState } from 'react'

type Comment = {
  id: string
  pageId: string
  blockId?: string
  authorName: string
  body: string
  createdAt: number
  resolved: boolean
  replies: { id: string; authorName: string; body: string; createdAt: number }[]
}

export function CommentsThread({
  pageId,
  blockId,
}: {
  pageId: string
  blockId?: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState('')

  async function load() {
    const r = await fetch(`/api/comments?pageId=${encodeURIComponent(pageId)}`)
    if (!r.ok) return
    const j = (await r.json()) as { comments: Comment[] }
    setComments(j.comments.filter((c) => (blockId ? c.blockId === blockId : !c.blockId)))
  }

  useEffect(() => {
    void load()
  }, [pageId, blockId])

  async function post() {
    if (!draft.trim()) return
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pageId, blockId, body: draft }),
    })
    setDraft('')
    void load()
  }

  async function resolve(id: string) {
    await fetch('/api/comments', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, resolved: true }),
    })
    void load()
  }

  return (
    <div className="comments-thread">
      <h4 className="comments-title">💬 Comments ({comments.length})</h4>
      <ul className="comments-list">
        {comments.map((c) => (
          <li key={c.id} className={c.resolved ? 'comment resolved' : 'comment'}>
            <p className="comment-author">{c.authorName}</p>
            <p className="comment-body">{c.body}</p>
            {c.resolved ? <span className="comment-resolved">✓ resolved</span> : (
              <button type="button" className="comment-resolve" onClick={() => void resolve(c.id)}>
                Resolve
              </button>
            )}
          </li>
        ))}
      </ul>
      <textarea
        rows={2}
        placeholder="Leave a comment…"
        className="props-field-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button type="button" className="btn btn-primary comment-post" onClick={() => void post()}>
        Post
      </button>
    </div>
  )
}
