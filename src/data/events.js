import { marked } from 'marked'
import { parseFrontMatter } from './frontMatter.js'

const files = import.meta.glob('../../content/events/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

function safeDate(x) {
  const d = new Date(x)
  return isNaN(d) ? null : d
}

function fileToEvent([path, raw]) {
  const { data, content } = parseFrontMatter(raw)
  const filename = path.split('/').pop()
  const slug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')

  const start = safeDate(data.start)
  if (!start) return null
  const end = safeDate(data.end) || new Date(start.getTime() + 2 * 60 * 60 * 1000)

  return {
    slug,
    title: data.title ?? slug,
    start: start.toISOString(),
    end: end.toISOString(),
    location: data.location ?? '',
    rsvpEmail: data.rsvpEmail ?? '',
    html: marked.parse(content || ''),
    content
  }
}

const events = Object.entries(files).map(fileToEvent).filter(Boolean)
  .sort((a,b) => new Date(a.start) - new Date(b.start))

export function getAllEvents(){ return events }
export function getUpcomingEvents(){
  const now = new Date()
  return events.filter(e => new Date(e.end) >= now)
}
export function getEventBySlug(slug){ return events.find(e => e.slug === slug) }
