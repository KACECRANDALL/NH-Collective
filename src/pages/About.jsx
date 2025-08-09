import { useEffect } from 'react'

export default function About(){
  useEffect(()=>{ document.title = 'About · History & Events' },[])
  return (
    <div className="stack">
      <h1>About</h1>
      <p>Hi, my name is Kace Crandall. As a New Homeite, I desire to establish a community of everyone not defined solely by creed, by class, or by the sport you most align yourself to. This project aims to bring us as New Homeites closer to our forgotten past, our unenvisioned future, and most importantly our present. This is The New Home Collective stronger together.  </p>
    </div>
  )
}
