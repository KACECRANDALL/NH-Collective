import { supabase } from '../lib/supabase.js'
import { marked } from 'marked'

export async function listPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('slug,title,date,tags,excerpt')
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select('slug,title,date,tags,excerpt,content_md')
    .eq('slug', slug)
    .single()
  if (error) return null
  return { ...data, html: marked.parse(data.content_md || '') }
}
