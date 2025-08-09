function pad(n){ return String(n).padStart(2,'0') }
function toCalDT(dt){
  // Format: YYYYMMDDTHHMMSS (local time; leave off Z so it shows in user's TZ)
  const d = new Date(dt)
  const Y = d.getFullYear()
  const M = pad(d.getMonth()+1)
  const D = pad(d.getDate())
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  return `${Y}${M}${D}T${h}${m}${s}`
}

export function buildICS({ title, description = '', location = '', start, end }){
  const uid = `${Date.now()}@history.local`
  const dtStart = toCalDT(start)
  const dtEnd = toCalDT(end)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//History Blog//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toCalDT(new Date().toISOString())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  return lines.join('\r\n')
}

export function downloadICS(icsText, filename='event.ics'){
  const blob = new Blob([icsText], { type:'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl({ title, description='', location='', start, end }){
  const fmt = (d)=> encodeURIComponent(toCalDT(d))
  const params = new URLSearchParams({
    action:'TEMPLATE',
    text:title,
    details: description,
    location,
    dates: `${toCalDT(start)}/${toCalDT(end)}`
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}

function escapeText(s){
  return String(s).replace(/([,;])/g,'\\$1').replace(/\n/g,'\\n')
}
