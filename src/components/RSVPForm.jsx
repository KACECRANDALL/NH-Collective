import { useEffect, useMemo, useState } from 'react'

function storageKey(slug){ return `rsvps:${slug}` }
const GLOBAL_KEY = 'rsvps:ALL'

function loadJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) }
  catch { return fallback }
}

export default function RSVPForm({ event }){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [items,setItems] = useState([])
  const [allCount, setAllCount] = useState(0)

  useEffect(()=>{ // load per-event + global count
    setItems(loadJSON(storageKey(event.slug), []))
    const all = loadJSON(GLOBAL_KEY, [])
    setAllCount(all.length)
  },[event.slug])

  function savePerEvent(list){
    setItems(list)
    localStorage.setItem(storageKey(event.slug), JSON.stringify(list))
  }

  function appendGlobal({ name, email, ts }){
    const all = loadJSON(GLOBAL_KEY, [])
    all.push({
      id: crypto.randomUUID(),
      eventSlug: event.slug,
      eventTitle: event.title,
      name, email, ts
    })
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(all))
    setAllCount(all.length)
  }

  function submit(e){
    e.preventDefault()
    if(!name || !email) return
    const ts = Date.now()
    const next = [...items, { id: crypto.randomUUID(), name, email, ts }]
    savePerEvent(next)
    appendGlobal({ name, email, ts })
    setName(''); setEmail('')
  }

  function remove(id){
    const next = items.filter(x=>x.id!==id)
    savePerEvent(next)
    // (Optional) also remove from global by matching (name/email + event),
    // but we’ll keep global as an audit log for now.
  }

  const csvPerEvent = useMemo(()=>{
    const header = 'name,email,timestamp\n'
    const rows = items.map(i => `${escape(i.name)},${escape(i.email)},${new Date(i.ts).toISOString()}`).join('\n')
    return header + rows
  },[items])

  function download(blob, filename){
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadCSV(){
    download(new Blob([csvPerEvent], { type:'text/csv' }), `${event.slug}-rsvps.csv`)
  }

  function downloadMasterCSV(){
    const all = loadJSON(GLOBAL_KEY, [])
    const header = 'event_slug,event_title,name,email,timestamp\n'
    const rows = all.map(i =>
      [i.eventSlug, i.eventTitle, i.name, i.email, new Date(i.ts).toISOString()]
        .map(s => `"${String(s).replace(/"/g,'""')}"`).join(',')
    ).join('\n')
    download(new Blob([header + rows], { type:'text/csv' }), `all-rsvps.csv`)
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
        <button className="btn" type="submit">I’m going</button>
      </form>

      {items.length>0 && (
        <div className="stack">
          <div className="hr"></div>
          <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <h4 style={{margin:0}}>Responses ({items.length})</h4>
            <div className="cluster">
              <button className="btn secondary" onClick={downloadCSV}>Export This Event CSV</button>
              <button className="btn secondary" onClick={downloadMasterCSV} title={`Total RSVPs across all events: ${allCount}`}>
                Export Master CSV ({allCount})
              </button>
            </div>
          </div>
          <ul className="stack" style={{margin:0, padding:0, listStyle:'none'}}>
            {items.map(i=>(
              <li key={i.id} className="cluster" style={{justifyContent:'space-between'}}>
                <div>
                  <strong>{i.name}</strong> · <span className="meta">{i.email}</span>
                </div>
                <button className="btn secondary" onClick={()=>remove(i.id)} type="button">Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
