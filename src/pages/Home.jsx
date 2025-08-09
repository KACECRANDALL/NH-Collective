import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts } from '../data/posts.js'
import { getUpcomingEvents } from '../data/events.js'
import PostCard from '../components/PostCard.jsx'
import EventCard from '../components/EventCard.jsx'

export default function Home(){
  useEffect(()=>{ document.title = 'Home · History & Events' },[])
  const posts = getAllPosts().slice(0,3)
  const events = getUpcomingEvents().slice(0,3)

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
        <SubscribeFormInline />
      </section>
    </div>
  )
}

function SubscribeFormInline(){
  function submit(e){
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    if(email){
      const list = JSON.parse(localStorage.getItem('subscribers')||'[]')
      list.push({ email, ts: Date.now() })
      localStorage.setItem('subscribers', JSON.stringify(list))
      e.currentTarget.reset()
      alert('Thanks! You are subscribed locally (demo).')
    }
  }
  return (
    <form className="cluster" onSubmit={submit}>
      <input className="input" name="email" type="email" placeholder="you@example.com" required style={{minWidth:'260px'}}/>
      <button className="btn">Subscribe</button>
    </form>
  )
}
