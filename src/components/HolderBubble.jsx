import { useState, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'

const LP_COLOR = '#06b6d4'
const KOL_COLOR = '#818cf8'
const CEX_COLOR = '#10b981'
const FRESH_COLOR = '#f59e0b'
const WHALE_COLOR = '#f43f5e'
const NORMAL_COLOR = '#0ea5e9'
const MUTED_COLOR = '#1a3a5c'

function getColor(holder) {
  if (holder.isLP) return LP_COLOR
  if (holder.isKOL) return KOL_COLOR
  if (holder.funding?.type === 'cex') return CEX_COLOR
  if (holder.funding?.type === 'fresh') return FRESH_COLOR
  if (holder.pct > 10) return WHALE_COLOR
  return NORMAL_COLOR
}

function getLabel(holder) {
  if (holder.isLP) return 'LP'
  if (holder.isKOL) return holder.kolLabel?.split(' ')[0] || 'KOL'
  if (holder.funding?.type === 'cex') return holder.funding.label?.split('/')[0] || 'CEX'
  if (holder.funding?.type === 'fresh') return 'NEW'
  if (holder.pct > 15) return 'WHALE'
  return '#' + holder.rank
}

export default function HolderBubble({ holders = [], totalMcap = 0 }) {
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 })

  const W = 680, H = 340, CX = W/2, CY = H/2

  // Calculate bubble sizes proportional to % holding
  const bubbles = useMemo(() => {
    if (!holders.length) return []
    
    const maxPct = Math.max(...holders.map(h => h.pct || 0))
    const minR = 16, maxR = 72

    // Place bubbles in a circle layout
    const result = holders.slice(0, 15).map((h, i) => {
      const pct = h.pct || 0
      const r = minR + (pct / maxPct) * (maxR - minR)
      return { ...h, r, color: getColor(h), label: getLabel(h) }
    })

    // Simple force-like placement
    const placed = []
    const attempts = 200

    for (const bubble of result) {
      let bestX = CX, bestY = CY
      let placed_ok = false

      for (let a = 0; a < attempts; a++) {
        // Try random position within ellipse
        const angle = (a / attempts) * Math.PI * 2 * 3
        const dist = (a / attempts) * Math.min(W, H) * 0.42
        const x = CX + Math.cos(angle) * dist * (W/H)
        const y = CY + Math.sin(angle) * dist

        // Check bounds
        if (x - bubble.r < 8 || x + bubble.r > W - 8) continue
        if (y - bubble.r < 8 || y + bubble.r > H - 8) continue

        // Check overlap
        let overlap = false
        for (const p of placed) {
          const dx = x - p.x, dy = y - p.y
          const dist2 = Math.sqrt(dx*dx + dy*dy)
          if (dist2 < p.r + bubble.r + 4) { overlap = true; break }
        }

        if (!overlap) {
          bestX = x; bestY = y; placed_ok = true; break
        }
      }

      placed.push({ ...bubble, x: bestX, y: bestY })
    }

    return placed
  }, [holders])

  const hov = hovered !== null ? bubbles[hovered] : null

  return (
    <div style={{ position:'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--b1)', display:'block' }}>
        {/* Grid lines */}
        {[0.25,0.5,0.75].map(f=>(
          <ellipse key={f} cx={CX} cy={CY} rx={W*f*0.45} ry={H*f*0.45}
            fill="none" stroke="var(--b1)" strokeWidth={0.5} strokeDasharray="3,4"/>
        ))}

        {/* Bubbles */}
        {bubbles.map((b, i) => (
          <g key={i} style={{ cursor:'pointer' }}
            onMouseEnter={e=>{ setHovered(i); setTooltip({x:e.clientX,y:e.clientY}) }}
            onMouseLeave={()=>setHovered(null)}>
            {/* Glow */}
            <circle cx={b.x} cy={b.y} r={b.r+4}
              fill={b.color} opacity={hovered===i?0.2:0.06}/>
            {/* Main bubble */}
            <circle cx={b.x} cy={b.y} r={b.r}
              fill={b.color} opacity={hovered===i?0.9:0.75}
              stroke={hovered===i?'#fff':b.color}
              strokeWidth={hovered===i?2:1}/>
            {/* Label */}
            {b.r > 18 && (
              <text x={b.x} y={b.y - (b.r>28?4:0)} textAnchor="middle" dominantBaseline="middle"
                fontSize={Math.max(7, Math.min(11, b.r/3.5))} fontWeight="700"
                fontFamily="Orbitron,monospace" fill="#fff" style={{ pointerEvents:'none' }}>
                {b.label}
              </text>
            )}
            {b.r > 28 && (
              <text x={b.x} y={b.y+10} textAnchor="middle" dominantBaseline="middle"
                fontSize={Math.max(6, Math.min(9, b.r/4))} fontFamily="Space Mono,monospace" fill="rgba(255,255,255,.8)"
                style={{ pointerEvents:'none' }}>
                {b.pct.toFixed(1)}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hov && (
        <div style={{
          position:'fixed', left:tooltip.x+12, top:tooltip.y-60, zIndex:1000,
          background:'#0a1628', border:`1px solid ${hov.color}`, borderRadius:10,
          padding:'10px 14px', fontSize:11, color:'var(--text)', pointerEvents:'none',
          boxShadow:'0 8px 24px rgba(0,0,0,.5)', minWidth:180
        }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:11, fontWeight:700, color:'#fff', marginBottom:4 }}>
            {hov.owner?.slice(0,8)}...{hov.owner?.slice(-4)}
          </div>
          <div style={{ color:hov.color, fontWeight:700, marginBottom:3 }}>{hov.pct?.toFixed(2)}% supply</div>
          <div style={{ color:'var(--muted2)', marginBottom:2 }}>SOL: {hov.solBalance?.toFixed(3)||'?'}</div>
          <div style={{ color:'var(--muted2)', marginBottom:2 }}>Age: {hov.ageDays!=null?(hov.ageDays<1?'<1d':hov.ageDays+'d'):'?'}</div>
          <div style={{ color:'var(--muted2)', marginBottom:4 }}>
            Source: <span style={{ color:hov.color }}>{hov.isLP?hov.lpLabel:hov.funding?.label||'?'}</span>
          </div>
          {hov.owner && hov.owner !== 'unknown' && (
            <a href={`https://solscan.io/account/${hov.owner}`} target="_blank" rel="noreferrer"
              style={{ fontSize:10, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
              Solscan <ExternalLink size={9}/>
            </a>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:10, fontSize:10 }}>
        {[
          { color:WHALE_COLOR, label:'Whale (>10%)' },
          { color:CEX_COLOR,   label:'CEX funded' },
          { color:KOL_COLOR,   label:'KOL/Smart' },
          { color:LP_COLOR,    label:'LP Pool' },
          { color:FRESH_COLOR, label:'Fresh wallet' },
          { color:NORMAL_COLOR,label:'Regular' },
        ].map(l=>(
          <span key={l.label} style={{ display:'flex', alignItems:'center', gap:5, color:'var(--muted2)' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, display:'inline-block', flexShrink:0 }}/>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
