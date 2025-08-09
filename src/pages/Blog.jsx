import { useEffect, useMemo, useState } from 'react'
import { getAllPosts, getAllTags } from '../data/posts.js'
import SearchBar from '../components/SearchBar.jsx'
import TagPills from '../components/TagPills.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Blog(){
  useEffect(()=>{ document.title = 'Blog · History & Events' },[])
  const [q,setQ] = useState('')
  const [tag,setTag] = useState(null)

  const posts = getAllPosts()
  const tags = getAllTags()

  const filtered = useMemo(()=>{
    return posts.filter(p=>{
      const matchQ = q.trim() === '' || (p.title + ' ' + p.excerpt + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q.toLowerCase())
      const matchTag = tag===null || p.tags?.includes(tag)
      return matchQ && matchTag
    })
  },[posts,q,tag])

  return (
    <div className="stack">
      <h1>Blog</h1>
      <div className="stack">
        <SearchBar value={q} onChange={setQ} placeholder="Search posts"/>
        <TagPills tags={tags} active={tag} onClick={setTag}/>
      </div>
      <div className="grid">
        {filtered.map(p => <PostCard key={p.slug} post={p} />)}
      </div>
      {filtered.length===0 && <p className="meta">No posts match your filters.</p>}
    </div>
  )
}
