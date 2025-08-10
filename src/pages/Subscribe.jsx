import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'


export default function Subscribe(){
  useEffect(()=>{ document.title = 'Subscribe · History & Events' },[])

  async function submit(e){
  e.preventDefault()
  const email = new FormData(e.currentTarget).get('email')
  if(!email) return
  const { error } = await supabase.from('subscribers').insert({ email })
  if(!error){
    e.currentTarget.reset()
    alert('Thanks! You are subscribed.')
  }else{
    alert('Could not subscribe right now.')
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
