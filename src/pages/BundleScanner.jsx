import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, ExternalLink, Users, PieChart, Clock, Shield } from 'lucide-react'
import { Card, CardHeader, Badge, StatBox, LiveBadge } from '../components/Card.jsx'

const COLORS = ['var(--blue)','var(--cyan)','var(--purple)','var(--green)','var(--amber)','var(--orange)','var(--red)','var(--muted2)']

function formatNum(n) {
  if (!n) return 'N/A'
  if (n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + (n/1e3).toFixed(1) + 'K'
  return '$' + n.toFixed(2)
}

function TokenIcon({ symbol, logoURI, size = 44 }) {
  const [err, setErr] = useState(false)
  if (logoURI && !err) {
    return <img src={logoURI} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: size/4, border: '1px solid var(--b2)', objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size/4, background: 'var(--bg2)', border: '1px solid var(--b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, monospace', fontSize: size/4.5, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>
      {symbol?.slice(0,3) || '?'}
    </div>
  )
}

function WalletLink({ address, label, tag }) {
  const tagStyles = {
    dev:    { bg: 'rgba(244,63,94,.15)',  color: 'var(--red)' },
    bundle: { bg: 'rgba(249,115,22,.15)', color: 'var(--orange)' },
    sniper: { bg: 'rgba(245,158,11,.15)', color: 'var(--amber)' },
    kol:    { bg: 'rgba(129,140,248,.15)','color': 'var(--purple)' },
  }
  const ts = tagStyles[tag] || {}
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noreferrer"
        style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label || (address.slice(0,6) + '...' + address.slice(-4))}
        <ExternalLink size={10} />
      </a>
      {tag && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: ts.bg, color: ts.color }}>{tag.toUpperCase()}</span>}
    </div>
  )
}

function RiskBanner({ risk, flags }) {
  const level = risk?.level || 'LOW'
  const score = risk?.score || 0
  const configs = {
    HIGH:   { bg: 'rgba(244,63,94,.08)',   border: 'rgba(244,63,94,.3)',   color: 'var(--red)',   icon: AlertTriangle, title: 'HIGH RISK — BUNDLING DETECTED' },
    MEDIUM: { bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.3)',  color: 'var(--amber)', icon: AlertTriangle, title: 'MEDIUM RISK — WATCH CAREFULLY' },
    LOW:    { bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.3)',  color: 'var(--green)', icon: CheckCircle,   title: 'LOW RISK — RELATIVELY SAFE' },
  }
  const c = configs[level]
  const Icon = c.icon
  return (
    <div style={{ borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${c.border}`, background: c.bg }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={c.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, color: c.color }}>{c.title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 3, lineHeight: 1.5 }}>{flags?.slice(0,2).join(' · ')}</div>
      </div>
      <div style={{ textAlign: 'center', marginLeft: 'auto' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 28, fontWeight: 700, color: c.color }}>{score}</div>
        <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '.06em' }}>RISK SCORE</div>
      </div>
    </div>
  )
}

export default function BundleScanner() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const MSGS = [
    'Fetching token info via Birdeye...',
    'Fetching top holders via Helius...',
    'Analyzing launch transactions...',
    'Checking wallet funding sources...',
    'Detecting bundle clusters...',
    'Calculating risk score...',
  ]

  async function scan(addr) {
    const mint = addr || input.trim()
    if (!mint) return
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) { setError('Invalid Solana address'); return }
    setInput(mint)
    setLoading(true); setResult(null); setError(null)
    let mi = 0
    setLoadMsg(MSGS[0])
    const interval = setInterval(() => { mi++; setLoadMsg(MSGS[mi % MSGS.length]) }, 2000)
    try {
      const r = await fetch(`/api/bundle/scan?mint=${mint}`)
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch(e) {
      setError(e.message)
    } finally {
      clearInterval(interval); setLoading(false)
    }
  }

  const chips = [
    { label: 'TRUMP', addr: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN' },
    { label: 'BONK',  addr: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
    { label: 'JUP',   addr: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    { label: 'WIF',   addr: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
  ]

  const fund = result ? Object.entries(result.fundingDistribution || {}).sort((a,b) => b[1].pct - a[1].pct) : []
  const maxPct = fund[0]?.[1].pct || 1
  const top1 = result?.holders?.top1Pct || 0
  const top10 = result?.holders?.top10Pct || 0
  const coord = result?.launchWindow?.coordinatedGroups || 0
  const rugcheck = result?.tokenProps?.rugCheckScore || 0
  const props = result?.tokenProps || {}
  const logoURI = result?.logoURI

  return (
    <div>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>BUNDLE SCANNER</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Deteksi insider bundling &amp; manipulation patterns pada token Solana</div>
        </div>
      </div>

      {/* Search hero */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--b1)', borderRadius: 16, padding: '2.5rem 2rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(circle,rgba(14,165,233,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, color: 'var(--cyan)', background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)', padding: '4px 12px', borderRadius: 20, marginBottom: '1rem', fontWeight: 600, letterSpacing: '.1em' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
          SOLANA BUNDLE DETECTOR
        </div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: '.5rem', position: 'relative', zIndex: 1 }}>
          Token <span style={{ color: 'var(--blue)' }}>Risk Analysis</span>
        </h2>
        <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
          Cek bundle wallets, dev holdings, funding sources, sniper score, dan token properties sebelum invest.
        </p>
        <div style={{ display: 'flex', gap: 10, maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && scan()}
            placeholder="Masukkan token address Solana..."
            style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text)', fontFamily: 'Space Mono, monospace', outline: 'none' }} />
          <button onClick={() => scan()} disabled={loading}
            style={{ background: loading ? 'var(--b2)' : 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Orbitron, monospace', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={13} />
            {loading ? 'SCANNING...' : 'SCAN'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', marginRight: 4 }}>Recent:</span>
          {chips.map(c => (
            <button key={c.label} onClick={() => scan(c.addr)}
              style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, border: '1px solid var(--b1)', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Space Mono, monospace', background: 'transparent' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--b2)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: '.1em', color: 'var(--blue)' }}>SCANNING ON-CHAIN DATA</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{loadMsg}</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.3)', borderRadius: 12, padding: '1rem 1.25rem', color: 'var(--red)', fontSize: 12 }}>
          Error: {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Token header */}
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--b1)', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <TokenIcon symbol={result.symbol} logoURI={result.logoURI} size={48} />
              <div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 700, color: '#fff' }}>{result.name}</div>
                <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>{result.symbol}</div>
                <a href={`https://solscan.io/token/${result.mint}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Space Mono, monospace', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  {result.mint?.slice(0,16)}...{result.mint?.slice(-4)}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { val: result.price ? '$' + result.price.toFixed(6) : 'N/A', label: 'Price' },
                { val: formatNum(result.marketCap), label: 'Market Cap' },
                { val: formatNum(result.liquidity), label: 'Liquidity' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk banner */}
          <RiskBanner risk={result.risk} flags={result.risk?.flags} />

          {/* Metric boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1rem' }}>
            <StatBox value={top1 + '%'} label="Top Holder %" color={top1 > 20 ? 'var(--red)' : 'var(--amber)'} barPct={top1} barColor={top1 > 20 ? 'var(--red)' : 'var(--amber)'} />
            <StatBox value={top10 + '%'} label="Top 10 Holders %" color={top10 > 50 ? 'var(--red)' : 'var(--amber)'} barPct={top10} barColor="var(--amber)" />
            <StatBox value={coord} label="Coordinated Groups" color="var(--blue)" barPct={coord * 20} barColor="var(--blue)" />
            <StatBox value={rugcheck + '/100'} label="RugCheck Score" color={rugcheck >= 75 ? 'var(--green)' : 'var(--amber)'} barPct={rugcheck} barColor={rugcheck >= 75 ? 'var(--green)' : 'var(--amber)'} />
          </div>

          {/* Funding + Properties */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Card>
              <CardHeader title="FUNDING DISTRIBUTION" icon={PieChart} badge={{ label: fund.length + ' sources', variant: 'muted' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fund.slice(0, 8).map(([src, data], i) => (
                  <div key={src} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <a href={`https://solscan.io/account/${data.wallets?.[0] || ''}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 10, color: COLORS[i % COLORS.length], width: 90, flexShrink: 0, textAlign: 'right', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                      {src.length > 14 ? src.slice(0,12) + '..' : src}
                      <ExternalLink size={8} />
                    </a>
                    <div style={{ flex: 1, height: 6, background: 'var(--b1)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(data.pct / maxPct * 100).toFixed(0)}%`, background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text)', width: 36, textAlign: 'right', fontFamily: 'Space Mono, monospace' }}>{data.pct.toFixed(1)}%</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', width: 20 }}>{data.count}w</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--b1)', fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>
                Klik nama source untuk lihat di Solscan. CEX = institutional flow, Unknown = fresh/private wallet.
              </div>
            </Card>

            <Card>
              <CardHeader title="TOKEN PROPERTIES" icon={Shield} />
              <div>
                {[
                  { name: 'Mintable', val: props.mintable, risk: props.mintable },
                  { name: 'Freezable', val: props.freezable, risk: props.freezable },
                  { name: 'Metadata Mutable', val: props.metadataMutable, risk: props.metadataMutable },
                  { name: 'RugCheck Score', val: rugcheck + '/100', risk: rugcheck < 50 },
                  { name: 'Total Holders', val: result.holders?.total || '--', risk: false },
                  { name: 'Early Buyers (launch)', val: result.launchWindow?.earlyBuyers || '--', risk: false },
                  { name: 'Coordinated Buy Groups', val: coord, risk: coord >= 3 },
                ].map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--b1)' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{p.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.risk ? 'var(--red)' : 'var(--green)' }}>
                      {typeof p.val === 'boolean' ? (p.val ? 'YES (RISK)' : 'No') : p.val}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--b1)' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.08em', marginBottom: 8 }}>RISK FLAGS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(result.risk?.flags || []).length > 0 ? result.risk.flags.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11 }}>
                      <AlertTriangle size={10} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: 'var(--text)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  )) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <CheckCircle size={10} color="var(--green)" />
                      <span style={{ color: 'var(--green)' }}>No major risk flags detected</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 10, color: 'var(--muted)', paddingTop: 10, borderTop: '1px solid var(--b1)' }}>
                Data on-chain bisa berubah. Bukan financial advice. Always DYOR.
              </div>
            </Card>
          </div>

          {/* Deep Networks */}
          {result.deepNetworks?.length > 0 && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader title="DEEP NETWORKS" icon={Users} badge={{ label: result.deepNetworks.length + ' clusters', variant: 'amber' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 10 }}>
                {result.deepNetworks.map((n, i) => (
                  <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{n.name}</span>
                      <Badge label={n.pct.toFixed(1) + '% supply'} variant="amber" />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>{n.count} wallets dari sumber funding yang sama</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {n.wallets?.slice(0, 3).map((w, j) => (
                        <WalletLink key={j} address={w} tag={j === 0 ? 'bundle' : undefined} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Launch Timeline */}
          <Card>
            <CardHeader title="LAUNCH WINDOW ANALYSIS" icon={Clock} meta={`${result.launchWindow?.totalTxns || 0} txns analyzed`} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              <StatBox value={result.launchWindow?.earlyBuyers || 0} label="Early Buyers" color="var(--text)" />
              <StatBox value={coord} label="Coordinated Groups" color={coord >= 3 ? 'var(--red)' : coord >= 1 ? 'var(--amber)' : 'var(--green)'} />
              <StatBox value={result.launchWindow?.launchBlocks || 0} label="Bundle Blocks" color="var(--blue)" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted2)', lineHeight: 1.7, padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, borderLeft: '2px solid var(--b3)' }}>
              {coord >= 3
                ? `Terdeteksi ${coord} kelompok wallet yang beli secara koordinasi di launch window. Ini indikasi kuat insider/bundling activity.`
                : coord >= 1
                ? `Terdeteksi ${coord} kelompok koordinasi. Perlu observasi lebih lanjut.`
                : 'Tidak terdeteksi pola koordinasi signifikan di launch window.'}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
