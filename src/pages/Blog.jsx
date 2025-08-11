

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPosts } from '../data/posts.js'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    listPosts().then(setPosts).catch(setErr)
  }, [])

  if (err) return <p className="meta">Couldn’t load posts.</p>
  if (!posts.length) return <p className="meta">Loading…</p>

  return (
    <div className="stack">
      <h1>Blog</h1>
      <ul className="stack" style={{ listStyle: 'none', padding: 0 }}>
        {posts.map(p => (
          <li key={p.slug} className="card stack" style={{ padding: 'var(--space-4)' }}>
            <h3><Link to={`/blog/${p.slug}`}>{p.title}</Link></h3>
            <div className="meta">
              {p.date ? new Date(p.date).toLocaleDateString() : ''}
              {p.tags?.length ? ` · ${p.tags.join(' • ')}` : ''}
            </div>
            {p.excerpt ? <p>{p.excerpt}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
