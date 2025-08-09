import { Link, useRouteError } from 'react-router-dom'

export default function NotFound(){
  const err = useRouteError()
  return (
    <div className="stack">
      <h1>Not found</h1>
      <p className="meta">The page you requested doesn’t exist.</p>
      <pre style={{whiteSpace:'pre-wrap'}}>{err?.statusText || err?.message}</pre>
      <p><Link className="btn" to="/">Go home</Link></p>
    </div>
  )
}
