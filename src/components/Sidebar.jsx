import { LayoutDashboard, Search, Zap, Eye, Twitter, Youtube, MessageCircle, User } from 'lucide-react'

const LiveDot = () => (
  <span style={{
    width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)',
    display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite', flexShrink: 0
  }} />
)

const SbItem = ({ icon: Icon, label, id, active, onClick, href }) => {
  const style = {
    display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem 1.25rem',
    fontSize: 12, color: active ? 'var(--blue)' : 'var(--muted2)',
    cursor: 'pointer', borderLeft: `2px solid ${active ? 'var(--blue)' : 'transparent'}`,
    background: active ? 'rgba(14,165,233,.1)' : 'transparent',
    textDecoration: 'none', transition: 'all .15s', userSelect: 'none'
  }
  if (href) return (
    <a href={href} target="_blank" rel="noreferrer" style={style}>
      <Icon size={14} style={{ opacity: active ? 1 : .7, flexShrink: 0 }} />
      {label}
    </a>
  )
  return (
    <div style={style} onClick={() => onClick(id)}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.background = 'rgba(14,165,233,.06)'; e.currentTarget.style.borderLeftColor = 'var(--b2)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--muted2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}}>
      <Icon size={14} style={{ opacity: active ? 1 : .7, flexShrink: 0 }} />
      {label}
    </div>
  )
}

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside style={{
      background: 'var(--bg1)', borderRight: '1px solid var(--b1)',
      padding: '1.5rem 0', display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--b1)' }}>
        <img src="/mascot.gif" onError={e => e.target.src='/mascot.jpg'}
          style={{ width: 48, height: 48, borderRadius: 12, border: '1.5px solid var(--blue)', objectFit: 'cover', background: 'var(--bg2)', marginBottom: 10, display: 'block' }} />
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '.08em' }}>ISECLAW</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>IsekaiDAO Alpha Intelligence</div>
      </div>

      {/* Core */}
      <div style={{ padding: '.75rem 1.25rem .25rem', fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Core</div>
      <SbItem icon={LayoutDashboard} label="Dashboard" id="dashboard" active={active === 'dashboard'} onClick={onNavigate} />
      <SbItem icon={Search} label="Bundle Scanner" id="scanner" active={active === 'scanner'} onClick={onNavigate} />
      <SbItem icon={Zap} label="Alpha Signals" id="signals" active={active === 'signals'} onClick={onNavigate} />
      <SbItem icon={Eye} label="Watchlist" id="watchlist" active={active === 'watchlist'} onClick={onNavigate} />

      {/* Content */}
      <div style={{ padding: '.75rem 1.25rem .25rem', fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Content</div>
      <SbItem icon={Twitter} label="X @IsekaiDAO" id="x" href="https://twitter.com/IsekaiDAO" onClick={onNavigate} />
      <SbItem icon={Youtube} label="YouTube Shorts" id="yt" href="https://youtube.com/@IsekaiDAO" onClick={onNavigate} />

      {/* About */}
      <div style={{ padding: '.75rem 1.25rem .25rem', fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>About</div>
      <SbItem icon={User} label="IsekaiDAO" id="dao" href="https://twitter.com/IsekaiDAO" onClick={onNavigate} />

      {/* Bottom */}
      <div style={{ marginTop: 'auto', padding: '1rem 1.25rem', borderTop: '1px solid var(--b1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--cyan)' }}>
          <LiveDot /> SCANNING LIVE
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>Solana</div>
      </div>
    </aside>
  )
}
