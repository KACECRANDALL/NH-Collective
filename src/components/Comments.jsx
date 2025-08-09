import { useEffect, useMemo, useState } from 'react'

function keyFor(slug){ return `comments:${slug}` }

export default function Comments({ slug, postTitle }) {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(slug))
      setItems(raw ? JSON.parse(raw) : [])
    } catch { /* ignore */ }
  }, [slug])

  function save(next){
    setItems(next)
    localStorage.setItem(keyFor(slug), JSON.stringify(next))
  }

  function submit(e){
    e.preventDefault()
    const trimmed = body.trim()
    if (!name.trim() || !trimmed) return
    const item = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      body: trimmed.slice(0, 1000), // simple guard
      ts: Date.now()
    }
    const next = [item, ...items]
    save(next)
    setBody('')
  }

  function remove(id){
    const next = items.filter(i => i.id !== id)
    save(next)
  }

  const csv = useMemo(()=>{
    const header = 'post_slug,post_title,name,email,comment,timestamp\n'
    const esc = (s)=> `"${String(s).replace(/"/g,'""')}"`
    const rows = items
      .slice()
      .reverse()
      .map(i => [slug, postTitle || '', i.name, i.email, i.body, new Date(i.ts).toISOString()]
        .map(esc).join(','))
      .join('\n')
    return header + rows
  },[items, slug, postTitle])

  function downloadCSV(){
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-comments.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card stack" aria-labelledby="comments">
      <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
        <h3 id="comments" style={{margin:0}}>Comments ({items.length})</h3>
        {items.length > 0 && (
          <button className="btn secondary" onClick={downloadCSV}>Export Comments CSV</button>
        )}
      </div>

      <form className="stack" onSubmit={submit}>
        <label>
          <span className="kicker">Name</span>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label>
          <span className="kicker">Email (optional)</span>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label>
          <span className="kicker">Comment</span>
          <textarea className="input" rows="5" value={body} onChange={e=>setBody(e.target.value)} required />
        </label>
        <button className="btn" type="submit">Post comment</button>
      </form>

      {items.length > 0 && (
        <ul className="stack" style={{margin:0, padding:0, listStyle:'none'}}>
          {items.map(i => (
            <li key={i.id} className="card stack" style={{padding:'var(--space-4)'}}>
              <div className="cluster" style={{justifyContent:'space-between'}}>
                <div>
                  <strong>{i.name}</strong>
                  {i.email ? <span className="meta"> · {i.email}</span> : null}
                </div>
                <span className="meta">{new Date(i.ts).toLocaleString()}</span>
              </div>
              <div style={{whiteSpace:'pre-wrap'}}>{i.body}</div>
              <div className="cluster" style={{justifyContent:'flex-end'}}>
                <button className="btn secondary" onClick={()=>remove(i.id)} type="button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
