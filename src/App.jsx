import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BundleScanner from './pages/BundleScanner.jsx'
import AlphaSignals from './pages/AlphaSignals.jsx'
import Watchlist from './pages/Watchlist.jsx'

export default function App() {
  const [view, setView] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard onNavigate={setView} />,
    scanner: <BundleScanner />,
    signals: <AlphaSignals onNavigate={setView} />,
    watchlist: <Watchlist />,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', maxWidth: '1280px', margin: '0 auto' }}>
      <Sidebar active={view} onNavigate={setView} />
      <main style={{ padding: '1.5rem', overflowY: 'auto', minHeight: '100vh' }}>
        {pages[view]}
      </main>
    </div>
  )
}
