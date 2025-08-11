
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPosts } from '../data/postsApi.js'
import { listEvents } from '../data/eventsApi.js'
import PostCard from '../components/PostCard.jsx'
import EventCard from '../components/EventCard.jsx'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    listPosts().then(data => setPosts(data.slice(0, 3))).catch(setErr)
    listEvents().then(data => setEvents(data.filter(e => new Date(e.end) >= new Date()).slice(0, 3))).catch(setErr)
  }, [])

  useEffect(() => { document.title = 'Home · History & Events' }, [])

  if (err) return <p className="meta">Couldn’t load content.</p>

  return (
    <div className="stack">
      <section className="hero rounded">
        <div className="container stack">
          <span className="badge">Local History</span>
          <h1>Stories of our place, and the people who built it.</h1>
          <p className="meta">A living archive and calendar for community events.</p>
          <div className="cluster">
            <Link className="btn" to="/blog">Read the blog</Link>
            <Link className="btn secondary" to="/events">See events</Link>
          </div>
        </div>
      </section>

      <section className="section stack">
        <div className="cluster" style={{justifyContent:'space-between'}}>
          <h2>Latest Posts</h2>
          <Link to="/blog" className="btn secondary">All posts</Link>
        </div>
        <div className="grid">
          {posts.map(p => <PostCard key={p.slug} post={p} />)}
        </div>
      </section>

      <section className="section stack">
        <div className="cluster" style={{justifyContent:'space-between'}}>
          <h2>Upcoming Events</h2>
          <Link to="/events" className="btn secondary">All events</Link>
        </div>
        <div className="grid">
          {events.map(e => <EventCard key={e.slug} event={e} />)}
        </div>
      </section>

      <section className="section card stack">
        <h2>Subscribe</h2>
        <p>Get new posts and event updates in your inbox.</p>
        {/* Use your Subscribe component here if needed */}
      </section>
    </div>
  )
}
