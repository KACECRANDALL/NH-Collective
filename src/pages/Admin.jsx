// src/pages/Admin.jsx
import { useEffect, useMemo, useState } from 'react'
import { getAllEvents } from '../data/events.js'
import { getAllPosts } from '../data/posts.js'

const GLOBAL_RSVP_KEY = 'rsvps:ALL'

function loadJSON(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) }
  catch { return fallback }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
function formatTS(ts) {
  try { return new Date(ts).toLocaleString() } catch { return '' }
}
function csv(s) { return `"${String(s ?? '').replace(/"/g, '""')}"` }
function downloadText(text, filename, type = 'text/plain') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Admin() {
  useEffect(() => { document.title = 'Admin · History & Events' }, [])
  const [tab, setTab] = useState('rsvps') // 'rsvps' | 'subscribers' | 'comments'

  // Events & per-event RSVPs
  const events = getAllEvents()
  const [perEvent, setPerEvent] = useState({}) // {slug: [items]}
  const [master, setMaster] = useState([])     // all events combined

  useEffect(() => {
    const map = {}
    events.forEach(e => { map[e.slug] = loadJSON(`rsvps:${e.slug}`) })
    setPerEvent(map)
    setMaster(loadJSON(GLOBAL_RSVP_KEY))
  }, [events])

  // Subscribers
  const [subs, setSubs] = useState([])
  useEffect(() => { setSubs(loadJSON('subscribers')) }, [])

  // Comments across posts
  const posts = getAllPosts()
  const [comments, setComments] = useState({}) // {slug: [items]}
  useEffect(() => {
    const map = {}
    posts.forEach(p => { map[p.slug] = loadJSON(`comments:${p.slug}`) })
    setComments(map)
  }, [posts])

  // ---------- RSVP actions ----------
  function removeRSVP(eventSlug, ts) {
    const list = (perEvent[eventSlug] || []).filter(i => i.ts !== ts)
    saveJSON(`rsvps:${eventSlug}`, list)
    setPerEvent(prev => ({ ...prev, [eventSlug]: list }))

    const masterNext = master.filter(i => !(i.eventSlug === eventSlug && i.ts === ts))
    saveJSON(GLOBAL_RSVP_KEY, masterNext)
    setMaster(masterNext)
  }
  function exportPerEventCSV(eventSlug, eventTitle) {
    const list = perEvent[eventSlug] || []
    const header = 'name,email,timestamp\n'
    const rows = list.map(i => `${csv(i.name)},${csv(i.email)},${csv(new Date(i.ts).toISOString())}`).join('\n')
    downloadText(header + rows, `${eventSlug}-rsvps.csv`, 'text/csv')
  }
  function exportMasterCSV() {
    const header = 'event_slug,event_title,name,email,timestamp\n'
    const rows = master.map(i =>
      [i.eventSlug, i.eventTitle, i.name, i.email, new Date(i.ts).toISOString()]
        .map(csv).join(',')
    ).join('\n')
    downloadText(header + rows, 'all-rsvps.csv', 'text/csv')
  }

  // ---------- Subscriber actions ----------
  function removeSub(ts) {
    const next = subs.filter(s => s.ts !== ts)
    setSubs(next)
    saveJSON('subscribers', next)
  }
  function exportSubsCSV() {
    const header = 'email,timestamp\n'
    const rows = subs.map(s => `${csv(s.email)},${csv(new Date(s.ts).toISOString())}`).join('\n')
    downloadText(header + rows, 'subscribers.csv', 'text/csv')
  }

  // ---------- Comment actions ----------
  function removeComment(postSlug, id) {
    const list = (comments[postSlug] || []).filter(c => c.id !== id)
    saveJSON(`comments:${postSlug}`, list)
    setComments(prev => ({ ...prev, [postSlug]: list }))
  }
  function exportCommentsCSV() {
    const header = 'post_slug,post_title,name,email,comment,timestamp\n'
    const rows = posts.flatMap(p => (comments[p.slug] || []).map(c =>
      [p.slug, p.title, c.name, c.email, c.body, new Date(c.ts).toISOString()].map(csv).join(',')
    )).join('\n')
    downloadText(header + rows, 'all-comments.csv', 'text/csv')
  }

  const rsvpCount = useMemo(() => master.length, [master])
  const commentCount = useMemo(
    () => Object.values(comments).reduce((a, b) => a + (b?.length || 0), 0),
    [comments]
  )

  return (
    <div className="stack">
      <h1>Admin</h1>

      <div className="cluster" role="tablist" aria-label="Admin sections">
        <button
          className="btn secondary"
          aria-current={tab === 'rsvps' ? 'page' : undefined}
          onClick={() => setTab('rsvps')}
          type="button"
        >
          RSVPs
        </button>
        <button
          className="btn secondary"
          aria-current={tab === 'subscribers' ? 'page' : undefined}
          onClick={() => setTab('subscribers')}
          type="button"
        >
          Subscribers
        </button>
        <button
          className="btn secondary"
          aria-current={tab === 'comments' ? 'page' : undefined}
          onClick={() => setTab('comments')}
          type="button"
        >
          Comments
        </button>
      </div>

      {tab === 'rsvps' && (
        <section className="stack">
          <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ margin: 0 }}>
              RSVPs <span className="meta">({rsvpCount} total)</span>
            </h2>
            <button className="btn secondary" onClick={exportMasterCSV} type="button">
              Export Master CSV
            </button>
          </div>

          {events.length === 0 ? (
            <p className="meta">No events found.</p>
          ) : events.map(ev => {
            const list = perEvent[ev.slug] || []
            return (
              <div key={ev.slug} className="card stack">
                <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ margin: 0 }}>{ev.title}</h3>
                  <div className="cluster">
                    <span className="meta">{list.length} RSVP(s)</span>
                    <button className="btn secondary" onClick={() => exportPerEventCSV(ev.slug, ev.title)} type="button">
                      Export
                    </button>
                  </div>
                </div>

                {list.length ? (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Time</th><th></th></tr>
                      </thead>
                      <tbody>
                        {list.slice().reverse().map(i => (
                          <tr key={i.ts}>
                            <td><strong>{i.name}</strong></td>
                            <td className="meta">{i.email}</td>
                            <td className="meta">{formatTS(i.ts)}</td>
                            <td className="table-actions">
                              <button className="btn secondary" onClick={() => removeRSVP(ev.slug, i.ts)} type="button">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="meta">No RSVPs yet.</p>}
              </div>
            )
          })}
        </section>
      )}

      {tab === 'subscribers' && (
        <section className="stack">
          <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ margin: 0 }}>Subscribers <span className="meta">({subs.length})</span></h2>
            <button className="btn secondary" onClick={exportSubsCSV} type="button">Export CSV</button>
          </div>

          {subs.length ? (
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Email</th><th>Time</th><th></th></tr></thead>
                  <tbody>
                    {subs.slice().reverse().map(s => (
                      <tr key={s.ts}>
                        <td><strong>{s.email}</strong></td>
                        <td className="meta">{formatTS(s.ts)}</td>
                        <td className="table-actions">
                          <button className="btn secondary" onClick={() => removeSub(s.ts)} type="button">
                            Delete
                          </button>
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
          <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ margin: 0 }}>Comments <span className="meta">({commentCount})</span></h2>
            <button className="btn secondary" onClick={exportCommentsCSV} type="button">Export CSV</button>
          </div>

          {posts.length === 0 ? (
            <p className="meta">No posts yet.</p>
          ) : posts.map(p => {
            const list = comments[p.slug] || []
            return (
              <div key={p.slug} className="card stack">
                <h3 style={{ margin: 0 }}>
                  {p.title} <span className="meta">({list.length})</span>
                </h3>

                {list.length ? (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Comment</th><th>Time</th><th></th></tr>
                      </thead>
                      <tbody>
                        {list.slice().reverse().map(c => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td className="meta">{c.email}</td>
                            <td style={{ maxWidth: 480, whiteSpace: 'pre-wrap' }}>{c.body}</td>
                            <td className="meta">{formatTS(c.ts)}</td>
                            <td className="table-actions">
                              <button className="btn secondary" onClick={() => removeComment(p.slug, c.id)} type="button">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="meta">No comments on this post.</p>}
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
