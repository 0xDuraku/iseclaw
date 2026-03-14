import { Zap } from 'lucide-react'
import { Card, LiveBadge } from '../components/Card.jsx'
import { useMarketData } from '../hooks/useMarketData.js'

export default function AlphaSignals() {
  const market = useMarketData()
  const fng = market?.fear_and_greed?.value || 50

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>ALPHA SIGNALS</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Real-time on-chain signal detection — Solana, BNB, Base</div>
        </div>
        <LiveBadge label="SCANNING" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { type: 'SMART_ENTRY', desc: 'VOL_ANOMALY + ACCUMULATION bersamaan', variant: 'red', strength: 'strongest' },
          { type: 'VOL_ANOMALY', desc: 'Volume 1h > 3x rata-rata, harga flat', variant: 'amber', strength: 'vol >3x' },
          { type: 'ACCUMULATION', desc: 'Buy txn > 2x sell txn, min 5 buys', variant: 'blue', strength: 'buy >2x' },
          { type: 'LIQ_INFLOW', desc: 'Fresh LP masuk, liq/vol ratio >10x', variant: 'green', strength: 'liq >50k' },
        ].map(s => (
          <div key={s.type} style={{ background: 'var(--bg1)', border: '1px solid var(--b1)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700, color: '#fff' }}>{s.type}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Zap size={48} color="var(--blue)" style={{ margin: '0 auto 1rem', opacity: .6 }} />
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: '.08em', color: 'var(--blue)', marginBottom: '.5rem' }}>
          {fng < 25 ? 'MARKET EXTREME FEAR' : fng < 50 ? 'MARKET FEAR' : 'SCANNING...'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted2)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
          Signal muncul saat vol_ratio &gt; 3x atau buy_ratio &gt; 2x. F&amp;G saat ini: <span style={{ color: fng < 30 ? 'var(--red)' : 'var(--amber)', fontWeight: 600 }}>{fng}</span>.
          Pantau terus — signal terbaik muncul saat fear mulai mereda.
        </div>
      </Card>
    </div>
  )
}
