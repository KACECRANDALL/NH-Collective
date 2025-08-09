import { buildICS, downloadICS, googleCalendarUrl } from '../utils/Calendar.js'

export default function AddToCalendar({ event }) {
  const handleICS = () => {
    const ics = buildICS({
      title: event.title,
      description: 'Community event',
      location: event.location,
      start: event.start,
      end: event.end
    })
    downloadICS(ics, `${event.slug}.ics`)
  }

  const gcal = googleCalendarUrl({
    title: event.title,
    description: 'Community event',
    location: event.location,
    start: event.start,
    end: event.end
  })

  return (
    <div className="cluster">
      <button className="btn" type="button" onClick={handleICS}>
        Add to Calendar (.ics)
      </button>
      <a
        className="btn secondary btn-small"
        href={gcal}
        target="_blank"
        rel="noopener noreferrer"
      >
        Add to Google
      </a>
    </div>
  )
}
