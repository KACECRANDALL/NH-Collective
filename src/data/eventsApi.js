import { supabase } from '../lib/supabase.js'
import { marked } from 'marked'

export async function listEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('slug,title,start,end,location,rsvpEmail,content_md')
    .order('start', { ascending: true })
  if (error) throw error
  return data.map(e => ({
    ...e,
    html: marked.parse(e.content_md || '')
  }))
}

export async function getEventBySlug(slug) {
  const { data, error } = await supabase
    .from('events')
    .select('slug,title,start,end,location,rsvpEmail,content_md')
    .eq('slug', slug)
    .single()
  if (error) return null
  return { ...data, html: marked.parse(data.content_md || '') }
}
