export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg1)', border: '1px solid var(--b1)',
      borderRadius: 14, padding: '1.25rem', ...style
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, icon: Icon, meta, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '1rem', paddingBottom: 10, borderBottom: '1px solid var(--b1)'
    }}>
      <span style={{
        fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 700,
        color: 'var(--text)', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 8
      }}>
        {Icon && <Icon size={12} color="var(--blue)" />}
        {title}
      </span>
      {badge && <Badge {...badge} />}
      {meta && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{meta}</span>}
    </div>
  )
}

export function Badge({ label, variant = 'muted' }) {
  const variants = {
    red:   { bg: 'rgba(244,63,94,.12)',   color: 'var(--red)',    border: 'rgba(244,63,94,.3)' },
    amber: { bg: 'rgba(245,158,11,.1)',   color: 'var(--amber)',  border: 'rgba(245,158,11,.3)' },
    green: { bg: 'rgba(16,185,129,.1)',   color: 'var(--green)',  border: 'rgba(16,185,129,.3)' },
    blue:  { bg: 'rgba(14,165,233,.1)',   color: 'var(--blue)',   border: 'rgba(14,165,233,.3)' },
    muted: { bg: 'rgba(74,112,144,.1)',   color: 'var(--muted2)', border: 'var(--b1)' },
    orange:{ bg: 'rgba(249,115,22,.1)',   color: 'var(--orange)', border: 'rgba(249,115,22,.3)' },
  }
  const v = variants[variant] || variants.muted
  return (
    <span style={{
      fontSize: 9, padding: '3px 9px', borderRadius: 20, fontWeight: 700,
      letterSpacing: '.04em', background: v.bg, color: v.color,
      border: `1px solid ${v.border}`
    }}>{label}</span>
  )
}

export function StatBox({ value, label, color = '#fff', barPct, barColor }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--b1)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, fontWeight: 700, color, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
      {barPct !== undefined && (
        <div style={{ height: 3, background: 'var(--b1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(barPct, 100)}%`, background: barColor || color, borderRadius: 2, transition: 'width .4s ease' }} />
        </div>
      )}
    </div>
  )
}

export function LiveBadge({ label = 'live' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 9, color: 'var(--cyan)', background: 'rgba(6,182,212,.08)',
      border: '1px solid rgba(6,182,212,.2)', padding: '4px 10px',
      borderRadius: 20, fontWeight: 600, letterSpacing: '.04em'
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
      {label.toUpperCase()}
    </span>
  )
}

export function Terminal({ title, lines }) {
  return (
    <div style={{ background: '#010b14', border: '1px solid var(--b2)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--b1)' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--muted)', marginLeft: 6, letterSpacing: '.06em' }}>{title}</span>
      </div>
      <div style={{ padding: '14px 16px', fontFamily: 'Space Mono, monospace', fontSize: 11, lineHeight: 1.9 }}>
        {lines.map((l, i) => (
          <div key={i}>
            {l.map((part, j) => (
              <span key={j} style={{ color: part.color || 'var(--muted)' }}>{part.text}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
