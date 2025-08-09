import { NavLink, Link } from 'react-router-dom'

export default function Header(){
  return (
    <header>
      <div className="container site-brand">
        {/* Logo is the Home link */}
        <Link to="/" className="cluster" aria-label="Home">
          <img className="logo" src="/logo.svg" alt="History & Events" />
        </Link>

        <nav className="cluster" aria-label="Main">
          {/* Removed: <NavLink to="/" end>Home</NavLink> */}
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </div>
    </header>
  )
}
