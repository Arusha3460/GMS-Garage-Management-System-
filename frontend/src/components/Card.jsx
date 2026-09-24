function Card({ title, value, subtitle, tone = 'blue' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-value">{value}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}
    </div>
  )
}

export default Card
