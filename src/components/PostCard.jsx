import { Link } from 'react-router-dom'

export default function PostCard({ post }){
  return (
    <article className="card stack">
      <div className="kicker">History Blog</div>
      <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
      <div className="meta">{new Date(post.date).toLocaleDateString()}</div>
      <p>{post.excerpt}</p>
      {post.tags?.length ? (
        <div className="tags">{post.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
      ):null}
      <div><Link className="btn" to={`/blog/${post.slug}`}>Read post</Link></div>
    </article>
  )
}
