export default function TagPills({ tags=[], active=null, onClick }){
  return (
    <div className="tags">
      <button
        className="tag"
        onClick={()=>onClick(null)}
        aria-pressed={active===null}
        title="Show all"
      >All</button>
      {tags.map(t=>(
        <button key={t}
          className="tag"
          onClick={()=>onClick(t)}
          aria-pressed={active===t}
        >{t}</button>
      ))}
    </div>
  )
}
