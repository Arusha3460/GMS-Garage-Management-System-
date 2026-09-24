function Navbar({ title, onLogout, isDarkMode, onToggleDarkMode }) {
  return (
    <header className="navbar">
      <div>
        <p className="nav-kicker">Management</p>
        <h1>{title}</h1>
      </div>

      <div className="nav-actions">
        <button type="button" className="btn secondary nav-btn" onClick={onToggleDarkMode}>
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
        <button type="button" className="btn danger nav-btn" onClick={onLogout}>
          Logout
        </button>
        <div className="nav-badge">Live</div>
      </div>
    </header>
  )
}

export default Navbar
