import { BarChart2, Zap, Search, Shield } from 'lucide-react'
import { Card, CardHeader, Badge, StatBox, LiveBadge, Terminal } from '../components/Card.jsx'
import { useMarketData, useWatchlist } from '../hooks/useMarketData.js'

const HowCard = ({ num, icon: Icon, title, desc }) => (
  <div style={{
    background: 'var(--bg1)', border: '1px solid var(--b1)', borderRadius: 14,
    padding: '1.25rem', position: 'relative', overflow: 'hidden'
  }}>
    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 32, fontWeight: 700, color: 'rgba(14,165,233,.06)', position: 'absolute', top: 8, right: 12, lineHeight: 1 }}>{num}</div>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={16} color="var(--blue)" />
    </div>
    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '.05em' }}>{title}</div>
    <div style={{ fontSize: 11, color: 'var(--muted2)', lineHeight: 1.6 }}>{desc}</div>
  </div>
)

export default function Dashboard({ onNavigate }) {
  const market = useMarketData()
  const watchlist = useWatchlist()

  const fng = market?.fear_and_greed?.value
  const fngClass = market?.fear_and_greed?.classification || ''
  const btcDom = market?.btc_dominance || '--'
  const mcap = market?.market_cap_change_24h || '--'
  const sentiment = market?.overall_sentiment || '--'
  const narratives = market?.active_narratives || []
  const risk = market?.risk_level?.replace(/_/g,' ').toUpperCase() || '--'
  const fngColor = fng < 30 ? 'var(--red)' : fng < 60 ? 'var(--amber)' : 'var(--green)'
  const mcapColor = parseFloat(mcap) >= 0 ? 'var(--green)' : 'var(--red)'

  return (
    <div>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>OVERVIEW</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Alpha Intelligence Dashboard — IsekaiDAO</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LiveBadge label="AUTO-SCAN ACTIVE" />
          <a href="https://twitter.com/IsekaiDAO" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '7px 14px', borderRadius: 8, background: 'var(--blue)', color: '#fff', border: '1px solid var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
            Follow @IsekaiDAO
          </a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ border: '1px solid var(--b1)', borderRadius: 16, padding: '2.5rem 2rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden', minHeight: 320, background: 'var(--bg1)' }}>
        <img src="/mascot.jpg" alt="" style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '55%', objectFit: 'cover', objectPosition: 'top center', pointerEvents: 'none', display: 'block' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', background: 'linear-gradient(to right, var(--bg1) 0%, var(--bg1) 15%, rgba(6,13,26,.7) 45%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent 60%, var(--bg1) 100%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>

          <div style={{ flex: 1, minWidth: 280, order: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, color: 'var(--cyan)', background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)', padding: '4px 12px', borderRadius: 20, marginBottom: '1rem', fontWeight: 600, letterSpacing: '.08em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
              SOUTHEAST ASIA ALPHA INTELLIGENCE
            </div>
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: '#fff', marginBottom: '.6rem' }}>
              On-chain signals untuk<br /><span style={{ color: 'var(--blue)' }}>komunitas Web3 Indonesia</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 460 }}>
              Iseclaw mendeteksi smart money movement, bundle patterns, dan accumulation signals di Solana — gratis untuk komunitas Web3 Indonesia.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Bundle Scanner', onClick: () => onNavigate('scanner'), primary: true },
                { label: 'Alpha Signals', onClick: () => onNavigate('signals') },
                { label: 'Watchlist', onClick: () => onNavigate('watchlist') },
              ].map(b => (
                <button key={b.label} onClick={b.onClick} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '9px 18px',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: b.primary ? 600 : 400,
                  background: b.primary ? 'var(--blue)' : 'var(--bg2)', color: b.primary ? '#fff' : 'var(--muted2)',
                  border: `1px solid ${b.primary ? 'var(--blue)' : 'var(--b2)'}`, transition: 'all .15s'
                }}>{b.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
            {[
              { val: fng ?? '--', label: 'Fear & Greed Index', color: fngColor },
              { val: btcDom, label: 'BTC Dominance', color: 'var(--blue)' },
              { val: 'SOLANA', label: 'Chain covered', color: 'var(--green)' },
            ].map(k => (
              <div key={k.label} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--b2)', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: k.color, borderRadius: '3px 0 0 3px' }} />
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, fontWeight: 700, color: k.color, marginBottom: 2 }}>{k.val}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { val: fng ?? '--', label: 'Fear & Greed', color: fngColor },
          { val: btcDom, label: 'BTC Dominance' },
          { val: mcap, label: 'MCap 24h', color: mcapColor },
          { val: '4', label: 'Signal Types', color: 'var(--blue)' },
          { val: '3', label: 'Chains', color: 'var(--green)' },
          { val: '30m', label: 'Scan Interval', color: 'var(--amber)' },
          { val: '3x', label: 'Shorts/Day' },
          { val: '45', label: 'YT Subs', color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg1)', border: '1px solid var(--b1)', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--blue),transparent)' }} />
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 700, color: s.color || '#fff', marginBottom: 3 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Market pulse + signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <Card>
          <CardHeader title="MARKET PULSE" meta={<LiveBadge />} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { k: 'Sentiment', v: sentiment.toUpperCase(), color: sentiment === 'bearish' ? 'var(--red)' : sentiment === 'bullish' ? 'var(--green)' : 'var(--amber)' },
              { k: 'MCap 24h', v: mcap, color: mcapColor },
            ].map(p => (
              <div key={p.k} style={{ background: 'var(--bg2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{p.k}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: p.color || '#fff' }}>{p.v}</div>
              </div>
            ))}
            <div style={{ gridColumn: 'span 2', background: 'var(--bg2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Fear &amp; Greed Index</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: fngColor }}>{fng ?? '--'} — {fngClass}</div>
              <div style={{ height: 3, background: 'var(--b1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${fng || 0}%`, background: fngColor, borderRadius: 2, transition: 'width .5s' }} />
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>BTC Dom</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{btcDom}</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Risk Level</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--amber)' }}>{risk}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
            {narratives.map(n => (
              <span key={n} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, border: '1px solid var(--b2)', color: 'var(--muted2)' }}>{n}</span>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="ALPHA SIGNALS" meta="Solana" />
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 12, padding: '8px 10px', background: 'var(--bg2)', borderRadius: 6, borderLeft: '2px solid var(--b3)' }}>
            Signal muncul saat vol_ratio &gt; 3x atau buy_ratio &gt; 2x. Market sedang Extreme Fear.
          </div>
          <Terminal title="ISECLAW ALPHA-SCAN SOL" lines={[
            [{text:'$ ', color:'var(--muted)'},{text:'node alpha-scan.js sol', color:'var(--blue)'}],
            [{text:'Scanning 30 pairs via Birdeye...', color:'var(--muted)'}],
            [{text:'─'.repeat(32), color:'var(--b2)'}],
            [{text:'SMART_ENTRY ', color:'var(--cyan)'},{text:'WIF/USDC', color:'#fff'}],
            [{text:'Score  ', color:'var(--muted)'},{text:'82/100', color:'var(--red)'},{text:' [CRITICAL]', color:'var(--muted)'}],
            [{text:'Vol 1h ', color:'var(--muted)'},{text:'$2.4M', color:'var(--amber)'},{text:' avg:$580K ', color:'var(--muted)'},{text:'(4.1x)', color:'var(--green)'}],
            [{text:'Buy/Sell ', color:'var(--muted)'},{text:'847/312', color:'var(--green)'},{text:' (2.7x)', color:'var(--muted)'}],
            [{text:'─'.repeat(32), color:'var(--b2)'}],
            [{text:'Not financial advice. DYOR.', color:'var(--red)'}],
          ]} />
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--muted)' }}>Auto-alert Discord &amp; X jika score &gt; 40</div>
        </Card>
      </div>

      {/* Watchlist preview */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <CardHeader title="INDO WATCHLIST" meta={<LiveBadge />} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>{['Token','Chain','Price','24h','Signal'].map(h => (
              <th key={h} style={{ color: 'var(--muted)', fontWeight: 500, padding: '4px 0', borderBottom: '1px solid var(--b1)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', textAlign: h === 'Token' || h === 'Chain' ? 'left' : 'right' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {watchlist.slice(0,6).map(t => {
              const chg = parseFloat(t.change_24h) || 0
              const chgColor = chg >= 0 ? 'var(--green)' : 'var(--red)'
              const sigVariant = t.sentiment === 'bullish' ? 'green' : t.sentiment === 'bearish' ? 'red' : 'muted'
              return (
                <tr key={t.token}>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--blue)', fontFamily: 'Orbitron, monospace' }}>{t.token.slice(0,3)}</div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{t.token}</span>
                    </div>
                  </td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid var(--b1)', fontSize: 10, color: 'var(--muted)' }}>{t.chain}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid var(--b1)', textAlign: 'right', color: '#fff' }}>${t.price_usd?.toFixed(4) || '--'}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid var(--b1)', textAlign: 'right', color: chgColor }}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid var(--b1)', textAlign: 'right' }}>
                    <Badge label={t.sentiment || 'neutral'} variant={sigVariant} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* How it works */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.25rem' }}>
        <HowCard num="01" icon={Search} title="SCAN" desc="Birdeye + DexScreener di-scan setiap 30 menit untuk top pairs di Solana, BNB, Base." />
        <HowCard num="02" icon={BarChart2} title="SCORE" desc="Setiap pair diberi skor 0–100. SMART_ENTRY adalah sinyal terkuat — vol anomaly + akumulasi." />
        <HowCard num="03" icon={Zap} title="ALERT" desc="Score >70 langsung alert Discord & X. Score 40–69 dengan catatan perlu konfirmasi." />
        <HowCard num="04" icon={Shield} title="DYOR" desc="Alpha window 15 menit–4 jam. False signal ada. Ini sinyal, bukan rekomendasi." />
      </div>

      <div style={{ padding: '1.5rem 0 .5rem', fontSize: 10, color: 'var(--muted)', borderTop: '1px solid var(--b1)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Iseclaw · IsekaiDAO · iseclaw.zerovantclaw.xyz</span>
        <span>Powered by Helius · Birdeye · DexScreener · CoinGecko</span>
      </div>
    </div>
  )
}
