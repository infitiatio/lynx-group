import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Lynx Group</h1>
        <nav aria-label="Primary" className="app-nav">
          <Link to="/groups">Groups</Link>
          <Link to="/login">Login</Link>
          <Link to="/shared/demo-share">Shared Demo</Link>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default App
