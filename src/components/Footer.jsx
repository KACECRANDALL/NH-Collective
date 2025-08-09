export default function Footer(){
  const year = new Date().getFullYear()
  return (
    <footer>
      <div className="container footer-inner">
        <div>
          <div className="kicker">The NH Collective</div>
          <div>© {year} The NH Collective · Kace Crandall</div>
        </div>
        <div className="cluster">
          <a className="btn secondary" href="mailto:crandallkace@gmail.com">Email Us</a>
          <a className="btn secondary" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
