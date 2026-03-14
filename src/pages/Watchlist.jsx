import { Eye, ExternalLink } from 'lucide-react'
import { Card, CardHeader, Badge, LiveBadge } from '../components/Card.jsx'
import { useWatchlist } from '../hooks/useMarketData.js'

export default function Watchlist() {
  const watchlist = useWatchlist()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>INDO WATCHLIST</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Community token picks — live prices from CoinGecko</div>
        </div>
        <LiveBadge />
      </div>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>{['Token','Chain','Category','Price','24h Change','Signal'].map(h => (
              <th key={h} style={{ color: 'var(--muted)', fontWeight: 500, padding: '6px 0', borderBottom: '1px solid var(--b1)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', textAlign: h === 'Token' || h === 'Chain' || h === 'Category' ? 'left' : 'right' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {watchlist.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>Loading...</td></tr>
            ) : watchlist.map(t => {
              const chg = parseFloat(t.change_24h) || 0
              const chgColor = chg >= 0 ? 'var(--green)' : 'var(--red)'
              const sigVariant = t.sentiment === 'bullish' ? 'green' : t.sentiment === 'bearish' ? 'red' : 'muted'
              return (
                <tr key={t.token} style={{ transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 0', borderBottom: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--blue)', fontFamily: 'Orbitron, monospace' }}>{t.token.slice(0,3)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{t.token}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 0', borderBottom: '1px solid var(--b1)', fontSize: 10, color: 'var(--muted)' }}>{t.chain}</td>
                  <td style={{ padding: '12px 0', borderBottom: '1px solid var(--b1)' }}><Badge label={t.category || '--'} variant="blue" /></td>
                  <td style={{ padding: '12px 0', borderBottom: '1px solid var(--b1)', textAlign: 'right', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>${t.price_usd?.toFixed(4) || '--'}</td>
                  <td style={{ padding: '12px 0', borderBottom: '1px solid var(--b1)', textAlign: 'right', color: chgColor, fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</td>
                  <td style={{ padding: '12px 0', borderBottom: '1px solid var(--b1)', textAlign: 'right' }}><Badge label={t.sentiment || 'neutral'} variant={sigVariant} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
