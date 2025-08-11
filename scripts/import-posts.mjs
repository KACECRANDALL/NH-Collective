// scripts/import-posts.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY // service_role (NEVER commit, use env)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const POSTS_DIR = path.resolve('content/posts')

function parseFrontMatter(raw){
  const m = raw.match(/^---\s*[\r\n]+([\s\S]*?)\s*[\r\n]+---\s*[\r\n]?([\s\S]*)$/)
  if(!m) return { data:{}, content: raw }
  return { data: yaml.load(m[1]) || {}, content: m[2] || '' }
}

function metaFromFilename(fname){
  const m = fname.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/)
  return m ? { date: m[1], slug: m[2] } : { date: null, slug: fname.replace(/\.md$/,'') }
}

function excerptOf(md){
  return md.split('\n').slice(0,3).join(' ').slice(0,220) + '…'
}

const files = await fs.readdir(POSTS_DIR)
for(const fname of files.filter(f=>f.endsWith('.md'))){
  const raw = await fs.readFile(path.join(POSTS_DIR, fname), 'utf8')
  const { data, content } = parseFrontMatter(raw)
  const { date, slug } = metaFromFilename(fname)
  const row = {
    slug: data.slug || slug,
    title: data.title || slug,
    date: data.date || date || new Date().toISOString().slice(0,10),
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: data.excerpt || excerptOf(content),
    content_md: content
  }
  const { error } = await supabase.from('posts').upsert(row, { onConflict: 'slug' })
  if(error){ console.error('Failed:', fname, error.message); process.exitCode = 1 }
  else { console.log('Imported:', fname) }
}
