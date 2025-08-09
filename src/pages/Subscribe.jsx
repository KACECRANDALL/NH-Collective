import { useEffect } from 'react'

export default function Subscribe(){
  useEffect(()=>{ document.title = 'Subscribe · History & Events' },[])

  function submit(e){
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    if(email){
      const list = JSON.parse(localStorage.getItem('subscribers')||'[]')
      list.push({ email, ts: Date.now() })
      localStorage.setItem('subscribers', JSON.stringify(list))
      e.currentTarget.reset()
      alert('Thanks for subscribing! (Saved locally for demo)')
    }
  }

  return (
    <div className="stack">
      <h1>Subscribe</h1>
      <p>Sign up to get new posts and event announcements.</p>
      <form className="stack" onSubmit={submit} style={{maxWidth:'520px'}}>
        <input className="input" name="email" type="email" placeholder="you@example.com" required />
        <button className="btn">Subscribe</button>
      </form>
    </div>
  )
}
