import { useEffect } from 'react'
import { getAllEvents, getUpcomingEvents } from '../data/events.js'
import EventCard from '../components/EventCard.jsx'

export default function Events(){
  useEffect(()=>{ document.title = 'Events · History & Events' },[])
  const upcoming = getUpcomingEvents()
  const past = getAllEvents().filter(e => new Date(e.end) < new Date()).reverse()

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
