import DOMPurify from 'dompurify'
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAllPosts, getPostBySlug } from '../data/posts.js'
import Comments from '../components/Comments.jsx'

export default function Post(){
  const { slug } = useParams()
  const post = getPostBySlug(slug)
  const posts = getAllPosts()

  useEffect(()=>{
    document.title = post ? `${post.title} · History & Events` : 'Post not found'
  },[post])

  if(!post){
    return (
      <div className="stack">
        <h1>Post not found</h1>
        <p><Link to="/blog">Back to blog</Link></p>
      </div>
    )
  }

  const idx = posts.findIndex(p => p.slug === post.slug)
  const prev = posts[idx + 1]
  const next = posts[idx - 1]

  return (
    <article className="stack">
      <p className="kicker">History Blog</p>
      <h1>{post.title}</h1>
      <div className="meta">
        {new Date(post.date).toLocaleDateString()}
        {post.tags?.length ? ` · ${post.tags.join(' • ')}` : ''}
      </div>

      <div className="hr"></div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.html) }}
      />

      <div className="hr"></div>

      {/* Comments */}
      <Comments slug={post.slug} postTitle={post.title} />

      <div className="hr"></div>

      {/* Prev / Next */}
      <nav className="cluster" aria-label="Post navigation">
        {prev && (
          <Link className="btn secondary" to={`/blog/${prev.slug}`}>
            ← {prev.title}
          </Link>
        )}
        <span style={{ flex: 1 }} />
        {next && (
          <Link className="btn secondary" to={`/blog/${next.slug}`}>
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  )
}
