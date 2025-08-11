
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listPosts, getPostBySlug } from '../data/postsApi.js'

export default function Post() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [all, setAll] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    getPostBySlug(slug).then(setPost).catch(setErr)
    listPosts().then(setAll).catch(() => {})
  }, [slug])

  useEffect(() => {
    if (post) document.title = `${post.title} · History & Events`
  }, [post])

  if (err) return <div className="stack"><h1>Post</h1><p className="meta">Couldn’t load.</p></div>
  if (!post) return <p className="meta">Loading…</p>

  const idx = all.findIndex(p => p.slug === post.slug)
  const prev = idx >= 0 ? all[idx + 1] : null
  const next = idx >= 0 ? all[idx - 1] : null

  return (
    <article className="stack">
      <p className="kicker">History Blog</p>
      <h1>{post.title}</h1>
      <div className="meta">
        {new Date(post.date).toLocaleDateString()}
        {post.tags?.length ? ` · ${post.tags.join(' • ')}` : ''}
      </div>

      <div className="hr"></div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.html) }} />
      <div className="hr"></div>

      <nav className="cluster" aria-label="Post navigation">
        {prev && <Link className="btn secondary" to={`/blog/${prev.slug}`}>← {prev.title}</Link>}
        <span style={{ flex: 1 }} />
        {next && <Link className="btn secondary" to={`/blog/${next.slug}`}>{next.title} →</Link>}
      </nav>
    </article>
  )
}
