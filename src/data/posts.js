import { marked } from 'marked'
import { parseFrontMatter } from '../utils/FrontMatter.js'

const files = import.meta.glob('../../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

function fileToPost([path, raw]) {
  const { data, content } = parseFrontMatter(raw)
  const filename = path.split('/').pop()
  const slug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
  const dateFromName = (filename.match(/^(\d{4}-\d{2}-\d{2})-/) || [])[1]

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? dateFromName ?? new Date().toISOString().slice(0,10),
    tags: data.tags ?? [],
    excerpt: data.excerpt ?? (content || '').split('\n').slice(0,3).join(' ').slice(0,220) + '…',
    html: marked.parse(content || ''),
    content
  }
}

const posts = Object.entries(files).map(fileToPost)
  .sort((a,b) => new Date(b.date) - new Date(a.date))

export function getAllPosts(){ return posts }
export function getPostBySlug(slug){ return posts.find(p => p.slug === slug) }
export function getAllTags(){
  const set = new Set()
  posts.forEach(p => (p.tags||[]).forEach(t => set.add(t)))
  return Array.from(set).sort()
}
