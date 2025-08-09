export default function SearchBar({ value, onChange, placeholder='Search' }){
  return (
    <input
      className="input"
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={e=>onChange(e.target.value)}
      aria-label={placeholder}
    />
  )
}
