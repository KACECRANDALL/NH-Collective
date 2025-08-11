import yaml from 'js-yaml'

export function parseFrontMatter(raw) {
  const m = raw.match(/^---\s*[\r\n]+([\s\S]*?)\s*[\r\n]+---\s*[\r\n]?([\s\S]*)$/)
  if (m) {
    const data = yaml.load(m[1]) || {}
    const content = m[2] || ''
    return { data, content }
  }
  return { data: {}, content: raw }
}
