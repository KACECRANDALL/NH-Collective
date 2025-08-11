
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventBySlug } from '../data/eventsApi.js'
import RSVPForm from '../components/RSVPForm.jsx'
import AddToCalendar from '../components/AddToCalendar.jsx'

export default function EventDetail() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    getEventBySlug(slug).then(setEvent).catch(setErr)
  }, [slug])

  useEffect(() => {
    if (event) document.title = `${event.title} · Events`
    else document.title = 'Event not found'
  }, [event])

  if (err) return <div className="stack"><h1>Event not found</h1><p className="meta">Couldn’t load event.</p></div>
  if (!event) return <p className="meta">Loading…</p>

  const start = new Date(event.start)
  const end = new Date(event.end)

  return (
    <div className="split">
      <article className="stack">
        <p className="kicker">Community Event</p>
        <h1>{event.title}</h1>
        <div className="meta">
          {start.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          {' — '}
          {end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          {' · '}
          {event.location}
        </div>
        <div className="hr"></div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.html) }} />
        <div className="hr"></div>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <AddToCalendar event={event} />
          <div className="hr"></div>
        </div>
      </article>
      <aside>
        <RSVPForm event={event} />
      </aside>
    </div>
  )
}
