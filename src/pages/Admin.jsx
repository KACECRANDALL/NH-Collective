import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getAllEvents } from '../data/events.js'
import { getAllPosts } from '../data/posts.js'

function csv(s){ return `"${String(s ?? '').replace(/"/g,'""')}"` }
function downloadText(text, filename, type='text/plain'){
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
function fmt(ts){ try { return new Date(ts).toLocaleString() } catch { return '' } }

export default function Admin(){
  useEffect(()=>{ document.title = 'Admin · History & Events' },[])
  const [tab, setTab] = useState('rsvps')

  const events = getAllEvents()
  const posts = getAllPosts()

  const [rsvps, setRsvps] = useState([])
  const [subs, setSubs] = useState([])
  const [comments, setComments] = useState([])

  async function loadAll(){
    const [rv, sv, cv] = await Promise.all([
      supabase.from('rsvps').select('*').order('ts', { ascending:false }),
      supabase.from('subscribers').select('*').order('ts', { ascending:false }),
      supabase.from('comments').select('*').order('ts', { ascending:false })
    ])
    if(!rv.error) setRsvps(rv.data || [])
    if(!sv.error) setSubs(sv.data || [])
    if(!cv.error) setComments(cv.data || [])
  }
  useEffect(()=>{ loadAll() },[])

  // Deletes
  async function deleteRsvp(id){ const { error } = await supabase.from('rsvps').delete().eq('id', id); if(!error) setRsvps(x=>x.filter(r=>r.id!==id)) }
  async function deleteSub(id){ const { error } = await supabase.from('subscribers').delete().eq('id', id); if(!error) setSubs(x=>x.filter(s=>s.id!==id)) }
  async function deleteComment(id){ const { error } = await supabase.from('comments').delete().eq('id', id); if(!error) setComments(x=>x.filter(c=>c.id!==id)) }

  // Group RSVPs by event
  const rsvpsByEvent = useMemo(()=>{
    const m = new Map()
    for(const r of rsvps){
      if(!m.has(r.event_slug)) m.set(r.event_slug, [])
      m.get(r.event_slug).push(r)
    }
    return m
  },[rsvps])

  function exportMasterRSVPS(){
    const header = 'event_slug,event_title,name,email,timestamp\n'
    const rows = rsvps.map(i => [i.event_slug,i.event_title,i.name,i.email,new Date(i.ts).toISOString()].map(csv).join(',')).join('\n')
    downloadText(header+rows, 'all-rsvps.csv', 'text/csv')
  }
  function exportPerEvent(event_slug){
    const list = (rsvpsByEvent.get(event_slug) || [])
    const header = 'name,email,timestamp\n'
    const rows = list.map(i => [i.name,i.email,new Date(i.ts).toISOString()].map(csv).join(',')).join('\n')
    downloadText(header+rows, `${event_slug}-rsvps.csv`, 'text/csv')
  }
  function exportSubs(){
    const header = 'email,timestamp\n'
    const rows = subs.map(s => [s.email, new Date(s.ts).toISOString()].map(csv).join(',')).join('\n')
    downloadText(header+rows, 'subscribers.csv', 'text/csv')
  }
  function exportComments(){
    const header = 'post_slug,post_title,name,email,comment,timestamp\n'
    const rows = comments.map(c => [c.post_slug,c.post_title,c.name,c.email||'',c.body,new Date(c.ts).toISOString()].map(csv).join(',')).join('\n')
    downloadText(header+rows, 'all-comments.csv', 'text/csv')
  }

  const commentCount = comments.length
  const rsvpTotal = rsvps.length

  return (
    <div className="stack">
      <h1>Admin</h1>

      <div className="cluster" role="tablist" aria-label="Admin sections">
        <button className="btn secondary" aria-current={tab==='rsvps'?'page':undefined} onClick={()=>setTab('rsvps')} type="button">RSVPs</button>
        <button className="btn secondary" aria-current={tab==='subscribers'?'page':undefined} onClick={()=>setTab('subscribers')} type="button">Subscribers</button>
        <button className="btn secondary" aria-current={tab==='comments'?'page':undefined} onClick={()=>setTab('comments')} type="button">Comments</button>
      </div>

      {tab === 'rsvps' && (
        <section className="stack">
          <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <h2 style={{margin:0}}>RSVPs <span className="meta">({rsvpTotal} total)</span></h2>
            <button className="btn secondary" onClick={exportMasterRSVPS} type="button">Export Master CSV</button>
          </div>

          {events.length ? events.map(ev => {
            const list = rsvpsByEvent.get(ev.slug) || []
            return (
              <div key={ev.slug} className="card stack">
                <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
                  <h3 style={{margin:0}}>{ev.title}</h3>
                  <div className="cluster">
                    <span className="meta">{list.length} RSVP(s)</span>
                    <button className="btn secondary" onClick={()=>exportPerEvent(ev.slug)} type="button">Export</button>
                  </div>
                </div>

                {list.length ? (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Name</th><th>Email</th><th>Time</th><th></th></tr></thead>
                      <tbody>
                        {list.map(i => (
                          <tr key={i.id}>
                            <td><strong>{i.name}</strong></td>
                            <td className="meta">{i.email}</td>
                            <td className="meta">{fmt(i.ts)}</td>
                            <td className="table-actions">
                              <button className="btn secondary" onClick={()=>deleteRsvp(i.id)} type="button">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="meta">No RSVPs yet.</p>}
              </div>
            )
          }) : <p className="meta">No events found.</p>}
        </section>
      )}

      {tab === 'subscribers' && (
        <section className="stack">
          <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <h2 style={{margin:0}}>Subscribers <span className="meta">({subs.length})</span></h2>
            <button className="btn secondary" onClick={exportSubs} type="button">Export CSV</button>
          </div>
          {subs.length ? (
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Email</th><th>Time</th><th></th></tr></thead>
                  <tbody>
                    {subs.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.email}</strong></td>
                        <td className="meta">{fmt(s.ts)}</td>
                        <td className="table-actions">
                          <button className="btn secondary" onClick={()=>deleteSub(s.id)} type="button">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <p className="meta">No subscribers yet.</p>}
        </section>
      )}

      {tab === 'comments' && (
        <section className="stack">
          <div className="cluster" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <h2 style={{margin:0}}>Comments <span className="meta">({commentCount})</span></h2>
            <button className="btn secondary" onClick={exportComments} type="button">Export CSV</button>
          </div>

          {posts.length ? posts.map(p => {
            const list = comments.filter(c => c.post_slug === p.slug)
            return (
              <div key={p.slug} className="card stack">
                <h3 style={{margin:0}}>{p.title} <span className="meta">({list.length})</span></h3>
                {list.length ? (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Name</th><th>Email</th><th>Comment</th><th>Time</th><th></th></tr></thead>
                      <tbody>
                        {list.map(c => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td className="meta">{c.email}</td>
                            <td style={{maxWidth:480, whiteSpace:'pre-wrap'}}>{c.body}</td>
                            <td className="meta">{fmt(c.ts)}</td>
                            <td className="table-actions">
                              <button className="btn secondary" onClick={()=>deleteComment(c.id)} type="button">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="meta">No comments on this post.</p>}
              </div>
            )
          }) : <p className="meta">No posts.</p>}
        </section>
      )}
    </div>
  )
}
