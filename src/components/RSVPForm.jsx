import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function RSVPForm({ event }){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(true)

  async function load(){
    setLoading(true)
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_slug', event.slug)
      .order('ts', { ascending:false })
    if(!error) setItems(data || [])
    setLoading(false)
  }
  useEffect(()=>{ load() },[event.slug])

  async function submit(e){
    e.preventDefault()
    if(!name || !email) return
    const { data, error } = await supabase.from('rsvps').insert({
      event_slug: event.slug,
      event_title: event.title,
      name, email
    }).select().single()
    if(!error && data){
      setItems(prev => [data, ...prev])
      setName(''); setEmail('')
    }
  }

  async function remove(id){
    const { error } = await supabase.from('rsvps').delete().eq('id', id)
    if(!error) setItems(prev => prev.filter(x=>x.id!==id))
  }

  const csv = useMemo(()=>{
    const header = 'name,email,timestamp\n'
    const rows = items.map(i => `${q(i.name)},${q(i.email)},${q(new Date(i.ts).toISOString())}`).join('\n')
    return header + rows
  },[items])
  function downloadCSV(){
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${event.slug}-rsvps.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card stack" aria-labelledby="rsvp">
      <h3 id="rsvp">RSVP</h3>
      <form className="stack" onSubmit={submit}>
        <label>
          <span className="kicker">Name</span>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label>
          <span className="kicker">Email</span>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <button className="btn" type="submit" disabled={loading}>I’m going</button>
      </form>

      {loading && <p className="meta">Loading…</p>}

      {items.length>0 && (
        <div className="stack">
          <div className="hr"></div>
          <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <h4 style={{margin:0}}>Responses ({items.length})</h4>
            <button className="btn secondary" onClick={downloadCSV}>Export CSV</button>
          </div>
          <ul className="stack" style={{margin:0, padding:0, listStyle:'none'}}>
            {items.map(i=>(
              <li key={i.id} className="cluster" style={{justifyContent:'space-between'}}>
                <div><strong>{i.name}</strong> · <span className="meta">{i.email}</span></div>
                <button className="btn secondary" onClick={()=>remove(i.id)} type="button">Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
function q(s){ return `"${String(s??'').replace(/"/g,'""')}"` }
