import { Link } from 'react-router-dom'

export default function EventCard({ event }){
  const start = new Date(event.start)
  const dateStr = start.toLocaleString(undefined, {
    weekday:'short', month:'short', day:'numeric',
    hour:'numeric', minute:'2-digit'
  })
  return (
    <article className="card stack">
      <div className="kicker">Community Event</div>
      <h3><Link to={`/events/${event.slug}`}>{event.title}</Link></h3>
      <div className="meta">{dateStr} · {event.location}</div>
      <div><Link className="btn" to={`/events/${event.slug}`}>Event details</Link></div>
    </article>
  )
}
