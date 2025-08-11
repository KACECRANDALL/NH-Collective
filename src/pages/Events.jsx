
import { useEffect, useState } from 'react'
import { listEvents } from '../data/eventsApi.js'
import EventCard from '../components/EventCard.jsx'

export default function Events() {
  const [events, setEvents] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    listEvents().then(setEvents).catch(setErr)
  }, [])

  useEffect(() => { document.title = 'Events · History & Events' }, [])

  if (err) return <p className="meta">Couldn’t load events.</p>
  if (!events.length) return <p className="meta">Loading…</p>

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.end) >= now)
  const past = events.filter(e => new Date(e.end) < now).reverse()

  return (
    <div className="stack">
      <h1>Events</h1>
      <section className="stack">
        <h2>Upcoming</h2>
        {upcoming.length ? (
          <div className="grid">
            {upcoming.map(e => <EventCard key={e.slug} event={e} />)}
          </div>
        ) : <p className="meta">No upcoming events yet.</p>}
      </section>
      <section className="stack">
        <h2>Past</h2>
        {past.length ? (
          <div className="grid">
            {past.map(e => <EventCard key={e.slug} event={e} />)}
          </div>
        ) : <p className="meta">No past events recorded.</p>}
      </section>
    </div>
  )
}
