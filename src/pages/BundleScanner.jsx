import { useState, useEffect } from 'react'
import { Search, AlertTriangle, CheckCircle, ExternalLink, Users, PieChart, Clock, Shield, Zap, Code, Twitter, Globe, TrendingUp } from 'lucide-react'
import { Card, CardHeader, Badge, StatBox, LiveBadge } from '../components/Card.jsx'
import HolderBubble from '../components/HolderBubble.jsx'

const COLORS = ['#0ea5e9','#06b6d4','#818cf8','#10b981','#f59e0b','#f97316','#f43f5e','#6b8fa8']

function fmtSol(bal) {
  if (bal === null || bal === undefined) return '?'
  if (bal === 0) return '0◎'
  if (bal < 0.001) return '<0.001◎'
  if (bal < 1) return bal.toFixed(3) + '◎'
  if (bal < 100) return bal.toFixed(2) + '◎'
  return Math.round(bal).toLocaleString() + '◎'
}

function fmtAge(days) {
  if (days === null || days === undefined) return '?'
  if (days === 0) return '<1d'
  if (days >= 365) return Math.floor(days/365) + 'y'
  if (days >= 30) return Math.floor(days/30) + 'mo'
  return days + 'd'
}

function fmt(n) {
  if (!n || n === 0) return 'N/A'
  if (n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + (n/1e3).toFixed(1) + 'K'
  return '$' + n.toFixed(4)
}

function TokenIcon({ symbol, logoURI, size = 44 }) {
  const [err, setErr] = useState(false)
  if (logoURI && !err) return (
    <img src={logoURI} onError={() => setErr(true)}
      style={{ width:size, height:size, borderRadius:size/4, border:'1px solid var(--b2)', objectFit:'cover', background:'var(--bg2)', flexShrink:0 }} />
  )
  return (
    <div style={{ width:size, height:size, borderRadius:size/4, background:'var(--bg2)', border:'1px solid var(--b2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:size/4.5, fontWeight:700, color:'var(--blue)', flexShrink:0 }}>
      {(symbol||'?').slice(0,4)}
    </div>
  )
}

function RiskBanner({ risk }) {
  if (!risk) return null
  const level = risk.level || 'LOW'
  const score = risk.score || 0
  const C = {
    HIGH:   { bg:'rgba(244,63,94,.08)',  bd:'rgba(244,63,94,.3)',  c:'var(--red)',   I:AlertTriangle, t:'HIGH RISK — BUNDLING DETECTED' },
    MEDIUM: { bg:'rgba(245,158,11,.08)', bd:'rgba(245,158,11,.3)', c:'var(--amber)', I:AlertTriangle, t:'MEDIUM RISK — WATCH CAREFULLY' },
    LOW:    { bg:'rgba(16,185,129,.08)', bd:'rgba(16,185,129,.3)', c:'var(--green)', I:CheckCircle,   t:'LOW RISK — RELATIVELY SAFE' },
  }
  const c = C[level] || C.LOW
  return (
    <div style={{ borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:14, border:`1px solid ${c.bd}`, background:c.bg }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${c.c}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <c.I size={20} color={c.c} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, color:c.c }}>{c.t}</div>
        <div style={{ fontSize:11, color:'var(--muted2)', marginTop:3, lineHeight:1.5 }}>
          {(risk.flags||[]).slice(0,2).join(' · ')}
        </div>
      </div>
      <div style={{ textAlign:'center', marginLeft:'auto' }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:28, fontWeight:700, color:c.c }}>{score}</div>
        <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:'.06em' }}>RISK SCORE</div>
      </div>
    </div>
  )
}

function HolderRow({ owner, pct, rank, isLP, lpLabel, isKOL, kolLabel, funding, solBalance, ageDays }) {
  const short = owner && owner !== 'unknown' ? owner.slice(0,6)+'...'+owner.slice(-4) : '?'
  const typeColor = isLP ? 'var(--cyan)' : isKOL ? 'var(--purple)' : rank===1 ? 'var(--red)' : pct>5 ? 'var(--amber)' : 'var(--muted2)'
  const typeLabel = isLP ? (lpLabel||'LP') : isKOL ? kolLabel : rank===1 ? 'Top' : '#'+rank
  const fundLabel = isLP ? (lpLabel||'LP') : (funding?.label||'?')
  const fundType = isLP ? 'lp' : (funding?.type||'unknown')
  const fundSrc = isLP ? null : funding?.source
  const fundColor = fundType==='cex'?'var(--green)':fundType==='lp'?'var(--cyan)':fundType==='kol'?'var(--purple)':fundType==='fresh'?'var(--amber)':'var(--muted)'
  const ageColor = ageDays!==null&&ageDays!==undefined ? (ageDays<7?'var(--red)':ageDays<30?'var(--amber)':'var(--muted2)') : 'var(--muted)'

  return (
    <tr onMouseEnter={e=>e.currentTarget.style.background='rgba(14,165,233,.03)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <td style={{ padding:'7px 0', borderBottom:'1px solid var(--b1)', verticalAlign:'middle' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          {owner && owner !== 'unknown' ? (
            <a href={`https://solscan.io/account/${owner}`} target="_blank" rel="noreferrer"
              style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
              {short} <ExternalLink size={9}/>
            </a>
          ) : <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--muted)' }}>{short}</span>}
          <span style={{ fontSize:8, padding:'1px 5px', borderRadius:8, background:`${typeColor}22`, color:typeColor, fontWeight:600 }}>{typeLabel}</span>
          {isKOL && <span style={{ fontSize:8, padding:'1px 5px', borderRadius:8, background:'rgba(129,140,248,.2)', color:'var(--purple)', fontWeight:700 }}>KOL</span>}
        </div>
      </td>
      <td style={{ padding:'7px 0', borderBottom:'1px solid var(--b1)', textAlign:'right', color:pct>20?'var(--red)':pct>5?'var(--amber)':'#fff', fontFamily:'Space Mono,monospace', fontSize:11, fontWeight:600 }}>
        {(pct||0).toFixed(1)}%
      </td>
      <td style={{ padding:'7px 0', borderBottom:'1px solid var(--b1)', textAlign:'right', fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--muted2)' }}>
        {isLP ? '—' : fmtSol(solBalance)}
      </td>
      <td style={{ padding:'7px 0', borderBottom:'1px solid var(--b1)', textAlign:'right' }}>
        <span style={{ fontSize:9, color:ageColor }}>{isLP ? '—' : fmtAge(ageDays)}</span>
      </td>
      <td style={{ padding:'7px 0', borderBottom:'1px solid var(--b1)', textAlign:'right' }}>
        {isLP ? (
          <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:'rgba(6,182,212,.15)', color:'var(--cyan)', fontWeight:600 }}>LP Pool</span>
        ) : fundSrc && !['unknown','error','fresh'].includes(fundSrc) ? (
          <a href={`https://solscan.io/account/${fundSrc}`} target="_blank" rel="noreferrer"
            style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:`${fundColor}22`, color:fundColor, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:3 }}>
            {(fundLabel||'?').slice(0,14)} <ExternalLink size={8}/>
          </a>
        ) : (
          <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:`${fundColor}22`, color:fundColor, fontWeight:600 }}>
            {(fundLabel||'?').slice(0,14)}
          </span>
        )}
      </td>
    </tr>
  )
}

// Vamp score: dev sells quickly after launch
function calcVampScore(dev, launchWindow) {
  if (!dev) return { score: 0, label: 'Unknown', isVamp: false }
  const deployCount = dev.deployCount || 0
  const ageDays = dev.ageDays || 999
  const totalTxns = dev.totalTxns || 0
  
  let score = 0
  if (deployCount >= 10) score += 40
  else if (deployCount >= 5) score += 25
  else if (deployCount >= 2) score += 15
  
  if (ageDays < 7) score += 30
  else if (ageDays < 30) score += 15
  
  if (totalTxns < 20 && ageDays < 30) score += 20
  
  const sniperCount = launchWindow?.sniperCount || 0
  if (sniperCount >= 5) score += 10
  
  score = Math.min(100, score)
  const isVamp = score >= 50
  const label = score >= 70 ? 'HIGH VAMP' : score >= 50 ? 'LIKELY VAMP' : score >= 30 ? 'WATCH' : 'CLEAN'
  return { score, label, isVamp }
}

// Bundle score: how concentrated is the early buying
function calcBundleScore(holders, launchWindow) {
  const details = holders?.details || []
  const top3NonLP = details.filter(h => !h.isLP).slice(0, 3)
  const top3Pct = top3NonLP.reduce((s, h) => s + (h.pct||0), 0)
  const coord = launchWindow?.coordinatedGroups || 0
  const snipers = launchWindow?.sniperCount || 0
  
  let score = 0
  if (top3Pct > 50) score += 40
  else if (top3Pct > 30) score += 25
  else if (top3Pct > 20) score += 15
  
  if (coord >= 3) score += 30
  else if (coord >= 1) score += 15
  
  if (snipers >= 5) score += 20
  else if (snipers >= 2) score += 10
  
  score = Math.min(100, score)
  const label = score >= 70 ? 'HEAVY BUNDLE' : score >= 40 ? 'MODERATE' : 'CLEAN'
  return { score, label, top3Pct: +top3Pct.toFixed(1) }
}

// Cabal detection: multiple wallets from same funding source
function calcCabalScore(deepNetworks, fundingDist) {
  const networks = deepNetworks || []
  const totalCabalPct = networks.reduce((s, n) => s + (n.pct||0), 0)
  const cabalWallets = networks.reduce((s, n) => s + (n.count||0), 0)
  
  let score = 0
  if (totalCabalPct > 30) score += 50
  else if (totalCabalPct > 15) score += 30
  else if (totalCabalPct > 5) score += 15
  
  if (cabalWallets >= 5) score += 30
  else if (cabalWallets >= 3) score += 15
  
  if (networks.length >= 3) score += 20
  
  score = Math.min(100, score)
  const label = score >= 60 ? 'CABAL DETECTED' : score >= 30 ? 'POSSIBLE CABAL' : 'NO CABAL'
  return { score, label, totalPct: +totalCabalPct.toFixed(1), networks: networks.length }
}

function getVerdict(risk, vampScore, bundleScore, cabalScore, dev, holders, dex) {
  const riskScore = risk?.score || 0
  const vamp = vampScore?.score || 0
  const bundle = bundleScore?.score || 0
  const cabal = cabalScore?.score || 0
  const composite = (riskScore * 0.35) + (vamp * 0.25) + (bundle * 0.25) + (cabal * 0.15)
  
  const positives = []
  const negatives = []
  
  // Positive signals
  if (dex?.paid) positives.push('DEX ads aktif — ada marketing budget')
  if ((holders?.top1Pct||0) < 10 && !holders?.details?.[0]?.isLP) positives.push('Distribusi supply cukup merata')
  if (dev?.deployCount <= 1) positives.push('Dev wallet baru / pertama kali deploy')
  if ((dev?.ageDays||0) > 180) positives.push('Dev wallet sudah lama — bukan burner')
  if (riskScore < 30) positives.push('Risk score rendah')
  if (bundle < 30) positives.push('Tidak ada indikasi heavy bundle')
  if (cabal < 20) positives.push('Tidak ada cluster cabal terdeteksi')
  
  // Negative signals
  if (riskScore >= 70) negatives.push('Risk score tinggi — banyak red flags')
  if (vamp >= 60) negatives.push('Dev profile mirip vamp — serial deployer')
  if (bundle >= 60) negatives.push('Indikasi heavy bundle di launch')
  if (cabal >= 50) negatives.push('Cluster cabal terdeteksi')
  if ((dev?.ageDays||999) < 7) negatives.push('Dev wallet sangat baru — kemungkinan burner')
  if (dev?.deployCount > 5) negatives.push(`Dev sudah deploy ${dev.deployCount} token sebelumnya`)

  let verdict, color, emoji
  if (composite < 25) { verdict = 'RELATIVELY SAFE'; color = 'var(--green)'; emoji = '✅' }
  else if (composite < 45) { verdict = 'PROCEED WITH CAUTION'; color = 'var(--amber)'; emoji = '⚠️' }
  else if (composite < 65) { verdict = 'HIGH RISK'; color = 'var(--orange)'; emoji = '��' }
  else { verdict = 'AVOID'; color = 'var(--red)'; emoji = '❌' }
  
  return { verdict, color, emoji, composite: Math.round(composite), positives, negatives }
}

export default function BundleScanner() {
  const [input, setInput] = useState(() => {
    const saved = sessionStorage.getItem('bundleScanMint')
    if (saved) { sessionStorage.removeItem('bundleScanMint'); return saved }
    return ''
  })
  const [loading, setLoading] = useState(false)

  // Auto-scan if mint was pre-filled from Alpha Signals
  useEffect(() => {
    const saved = sessionStorage.getItem('bundleScanMint')
    if (saved) {
      sessionStorage.removeItem('bundleScanMint')
      setInput(saved)
      setTimeout(() => scan(saved), 100)
    }
  }, [])
  const [loadMsg, setLoadMsg] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const MSGS = [
    'Fetching token info + DexScreener...',
    'Fetching top holders via Helius...',
    'Analyzing launch window...',
    'Detecting sniper bots...',
    'Checking wallet funding (2-hop CEX)...',
    'Getting wallet age + SOL balance...',
    'Analyzing dev wallet history...',
    'Calculating risk + vamp + bundle score...',
  ]

  async function scan(addr) {
    const mint = (addr||input).trim()
    if (!mint) return
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) { setError('Invalid Solana address'); return }
    setInput(mint); setLoading(true); setResult(null); setError(null)
    let mi = 0; setLoadMsg(MSGS[0])
    const iv = setInterval(() => { mi++; setLoadMsg(MSGS[mi%MSGS.length]) }, 2500)
    try {
      const r = await fetch(`/api/bundle/scan?mint=${mint}`)
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch(e) { setError(e.message) }
    finally { clearInterval(iv); setLoading(false) }
  }

  const chips = [
    { label:'DISTORT', addr:'YDxyiWyWFxmF12qjUwkwg27dv7Rn9YyGqYC8dGPpump' },
    { label:'JUP',   addr:'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    { label:'WIF',   addr:'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
    { label:'BONK',  addr:'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  ]

  const r = result
  const fund = r ? Object.entries(r.fundingDistribution||{}).sort((a,b)=>b[1].pct-a[1].pct) : []
  const maxPct = fund.length > 0 ? (fund[0][1].pct||1) : 1
  const top1 = r?.holders?.top1Pct||0
  const top10 = r?.holders?.top10Pct||0
  const coord = r?.launchWindow?.coordinatedGroups||0
  const rugcheck = r?.tokenProps?.rugCheckScore||0
  const props = r?.tokenProps||{}
  const snipers = r?.launchWindow?.snipers||[]
  const sniperCount = r?.launchWindow?.sniperCount||0
  const dev = r?.devWallet
  const dex = r?.dex
  const kols = r?.kolPresent||[]
  const chg24h = r?.priceChange24h||0

  // Computed scores
  const vampScore = r ? calcVampScore(dev, r.launchWindow) : null
  const bundleScore = r ? calcBundleScore(r.holders, r.launchWindow) : null
  const cabalScore = r ? calcCabalScore(r.deepNetworks, r.fundingDistribution) : null

  // Top holder LP check
  const topHolderIsLP = r?.holders?.details?.[0]?.isLP || false
  // Investment verdict
  const verdict = r ? getVerdict(r.risk, vampScore, bundleScore, cabalScore, dev, r.holders, dex) : null

  return (
    <div>
      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:14, fontWeight:700, color:'#fff', letterSpacing:'.06em' }}>BUNDLE SCANNER</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>Solana · bundle · sniper · vamp · cabal · dev history · CEX funding</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ background:'var(--bg1)', border:'1px solid var(--b1)', borderRadius:16, padding:'2rem', marginBottom:'1.25rem', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:400, height:300, background:'radial-gradient(circle,rgba(14,165,233,.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:9, color:'var(--cyan)', background:'rgba(6,182,212,.08)', border:'1px solid rgba(6,182,212,.2)', padding:'4px 12px', borderRadius:20, marginBottom:'1rem', fontWeight:600, letterSpacing:'.1em', position:'relative', zIndex:1 }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--cyan)', display:'inline-block', animation:'blink 1.5s ease-in-out infinite' }} />
          SOLANA BUNDLE DETECTOR
        </div>
        <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:18, fontWeight:700, color:'#fff', marginBottom:'.4rem', position:'relative', zIndex:1 }}>
          Token <span style={{ color:'var(--blue)' }}>Risk Analysis</span>
        </h2>
        <p style={{ fontSize:11, color:'var(--muted2)', marginBottom:'1.5rem', position:'relative', zIndex:1 }}>
          Bundle · Vamp Detection · Cabal Analysis · Dev History · CEX Funding · Sniper Score
        </p>
        <div style={{ display:'flex', gap:10, maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&scan()}
            placeholder="Token address Solana..."
            style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--b2)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--text)', fontFamily:'Space Mono,monospace', outline:'none' }} />
          <button onClick={()=>scan()} disabled={loading}
            style={{ background:loading?'var(--b2)':'var(--blue)', color:'#fff', border:'none', borderRadius:10, padding:'12px 22px', fontSize:12, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:'Orbitron,monospace', letterSpacing:'.06em', display:'flex', alignItems:'center', gap:8 }}>
            <Search size={13}/>{loading?'SCANNING...':'SCAN'}
          </button>
        </div>
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:10, position:'relative', zIndex:1 }}>
          <span style={{ fontSize:10, color:'var(--muted)', marginRight:4 }}>Try:</span>
          {chips.map(c=>(
            <button key={c.label} onClick={()=>scan(c.addr)}
              style={{ fontSize:10, padding:'3px 10px', borderRadius:20, border:'1px solid var(--b1)', color:'var(--muted)', cursor:'pointer', fontFamily:'Space Mono,monospace', background:'transparent' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ width:32, height:32, border:'2px solid var(--b2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:11, letterSpacing:'.1em', color:'var(--blue)' }}>SCANNING ON-CHAIN DATA</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:6 }}>{loadMsg}</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background:'rgba(244,63,94,.08)', border:'1px solid rgba(244,63,94,.3)', borderRadius:12, padding:'1rem', color:'var(--red)', fontSize:12 }}>
          Error: {error}
        </div>
      )}

      {r && !loading && (
        <>
          {/* Token Header */}
          <div style={{ background:'var(--bg1)', border:'1px solid var(--b1)', borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'1rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <TokenIcon symbol={r.symbol} logoURI={r.logoURI} size={52}/>
                <div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:700, color:'#fff' }}>{r.name||'?'}</div>
                  <div style={{ fontSize:11, color:'var(--blue)', fontWeight:600, marginTop:2 }}>{r.symbol||'?'}</div>
                  <a href={`https://solscan.io/token/${r.mint}`} target="_blank" rel="noreferrer"
                    style={{ fontSize:10, color:'var(--muted)', fontFamily:'Space Mono,monospace', marginTop:3, display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
                    {(r.mint||'').slice(0,16)}...{(r.mint||'').slice(-4)} <ExternalLink size={10}/>
                  </a>
                </div>
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-start' }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#fff', fontFamily:'Orbitron,monospace' }}>
                    {r.price ? '$'+r.price.toFixed(6) : 'N/A'}
                  </div>
                  <div style={{ fontSize:11, color:chg24h>=0?'var(--green)':'var(--red)', marginTop:2 }}>
                    {chg24h>=0?'+':''}{(chg24h||0).toFixed(2)}% 24h
                  </div>
                </div>
                {[
                  { val:fmt(r.marketCap), label:'Market Cap' },
                  { val:fmt(r.liquidity), label:'Liquidity' },
                  { val:fmt(r.volume24h), label:'Vol 24h' },
                  { val:(dex?.txns24h||0).toLocaleString(), label:'Txns 24h' },
                ].map(s=>(
                  <div key={s.label} style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{s.val}</div>
                    <div style={{ fontSize:9, color:'var(--muted)', marginTop:2, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              {dex?.url && (
                <a href={dex.url} target="_blank" rel="noreferrer"
                  style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(14,165,233,.1)', border:'1px solid rgba(14,165,233,.25)', color:'var(--blue)', textDecoration:'none' }}>
                  <TrendingUp size={10}/> DexScreener
                  {dex.paid && <span style={{ fontSize:8, background:'var(--green)', color:'#fff', padding:'1px 4px', borderRadius:4, fontWeight:700 }}>PAID</span>}
                </a>
              )}
              {(dex?.socials||[]).filter(s=>s.type==='twitter').map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noreferrer"
                  style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid var(--b2)', color:'var(--text)', textDecoration:'none' }}>
                  <Twitter size={10}/> Twitter/X
                </a>
              ))}
              {(dex?.websites||[]).map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noreferrer"
                  style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid var(--b2)', color:'var(--text)', textDecoration:'none' }}>
                  <Globe size={10}/> {s.label||'Website'}
                </a>
              ))}
              <a href={`https://app.bubblemaps.io/sol/token/${r.mint}`} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.3)', color:'var(--purple)', textDecoration:'none' }}>
                Bubblemaps
              </a>
              {dex?.isCto && (
                <span style={{ fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.3)', color:'var(--amber)' }}>
                  CTO Token
                </span>
              )}
              {!dex?.paid && (
                <span style={{ fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(74,112,144,.1)', border:'1px solid var(--b1)', color:'var(--muted)' }}>
                  DEX Free Tier
                </span>
              )}
            </div>

            {/* KOL alert */}
            {kols.length > 0 && (
              <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.3)', borderRadius:8, fontSize:11, color:'var(--purple)', display:'flex', alignItems:'center', gap:8 }}>
                <Users size={12}/> KOL detected: {kols.map(k=>`${k.name} (${k.pct}%)`).join(', ')}
              </div>
            )}
          </div>

          {/* INVESTMENT VERDICT - full */}
          {verdict && (
            <div style={{ background:'var(--bg1)', border:`1px solid ${verdict.color}66`, borderRadius:14, padding:'1.5rem', marginBottom:'1rem', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${verdict.color},transparent)` }}/>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1.5rem', flexWrap:'wrap' }}>
                {/* Left: verdict + breakdown */}
                <div style={{ flex:1, minWidth:280 }}>
                  <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>INVESTMENT VERDICT</div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:20, fontWeight:700, color:verdict.color, marginBottom:6 }}>
                    {verdict.emoji} {verdict.verdict}
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted2)', marginBottom:12 }}>
                    Composite: <span style={{ color:verdict.color, fontWeight:700 }}>{verdict.composite}/100</span>
                    {' · '}Risk {r.risk?.score||0} · Vamp {vampScore?.score||0} · Bundle {bundleScore?.score||0} · Cabal {cabalScore?.score||0}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {verdict.positives.length > 0 && (
                      <div>
                        <div style={{ fontSize:9, color:'var(--green)', fontWeight:700, letterSpacing:'.06em', marginBottom:6 }}>✓ POSITIVES</div>
                        {verdict.positives.map((p,i)=>(
                          <div key={i} style={{ display:'flex', gap:5, marginBottom:4, fontSize:10, color:'var(--muted2)', lineHeight:1.4 }}>
                            <span style={{ color:'var(--green)', flexShrink:0 }}>+</span>{p}
                          </div>
                        ))}
                      </div>
                    )}
                    {verdict.negatives.length > 0 && (
                      <div>
                        <div style={{ fontSize:9, color:'var(--red)', fontWeight:700, letterSpacing:'.06em', marginBottom:6 }}>✗ RISKS</div>
                        {verdict.negatives.map((n,i)=>(
                          <div key={i} style={{ display:'flex', gap:5, marginBottom:4, fontSize:10, color:'var(--muted2)', lineHeight:1.4 }}>
                            <span style={{ color:'var(--red)', flexShrink:0 }}>−</span>{n}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Right: big score */}
                <div style={{ textAlign:'center', padding:'1rem 1.5rem', background:`${verdict.color}11`, border:`1px solid ${verdict.color}33`, borderRadius:12 }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:52, fontWeight:700, color:verdict.color, lineHeight:1 }}>{verdict.composite}</div>
                  <div style={{ fontSize:9, color:'var(--muted)', marginTop:4, letterSpacing:'.08em' }}>COMPOSITE</div>
                  <div style={{ fontSize:10, color:verdict.color, marginTop:8, fontWeight:600 }}>{verdict.verdict}</div>
                </div>
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${verdict.color}33`, fontSize:10, color:'var(--muted)' }}>
                ⚠️ Analisis on-chain otomatis — bukan financial advice. DYOR always.
              </div>
            </div>
          )}

          <RiskBanner risk={r.risk}/>

          {/* VAMP + BUNDLE + CABAL scores */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:'1rem' }}>
            {/* Vamp */}
            <div style={{ background:'var(--bg1)', border:`1px solid ${vampScore?.isVamp?'rgba(244,63,94,.3)':'var(--b1)'}`, borderRadius:12, padding:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:10, fontWeight:700, color:'var(--text)', letterSpacing:'.08em' }}>VAMP SCORE</div>
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, fontWeight:700,
                  background:vampScore?.score>=70?'rgba(244,63,94,.15)':vampScore?.score>=40?'rgba(245,158,11,.1)':'rgba(16,185,129,.1)',
                  color:vampScore?.score>=70?'var(--red)':vampScore?.score>=40?'var(--amber)':'var(--green)',
                  border:`1px solid ${vampScore?.score>=70?'rgba(244,63,94,.3)':vampScore?.score>=40?'rgba(245,158,11,.3)':'rgba(16,185,129,.3)'}` }}>
                  {vampScore?.label||'?'}
                </span>
              </div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:28, fontWeight:700, color:vampScore?.score>=70?'var(--red)':vampScore?.score>=40?'var(--amber)':'var(--green)', marginBottom:6 }}>
                {vampScore?.score||0}
              </div>
              <div style={{ height:3, background:'var(--b1)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${vampScore?.score||0}%`, background:vampScore?.score>=70?'var(--red)':vampScore?.score>=40?'var(--amber)':'var(--green)', borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--muted)', marginTop:8, lineHeight:1.5 }}>
                Dev deploy {dev?.deployCount||0}x · age {fmtAge(dev?.ageDays)}
              </div>
            </div>

            {/* Bundle */}
            <div style={{ background:'var(--bg1)', border:`1px solid ${bundleScore?.score>=70?'rgba(249,115,22,.3)':'var(--b1)'}`, borderRadius:12, padding:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:10, fontWeight:700, color:'var(--text)', letterSpacing:'.08em' }}>BUNDLE SCORE</div>
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, fontWeight:700,
                  background:bundleScore?.score>=70?'rgba(249,115,22,.15)':bundleScore?.score>=40?'rgba(245,158,11,.1)':'rgba(16,185,129,.1)',
                  color:bundleScore?.score>=70?'var(--orange)':bundleScore?.score>=40?'var(--amber)':'var(--green)',
                  border:`1px solid ${bundleScore?.score>=70?'rgba(249,115,22,.3)':bundleScore?.score>=40?'rgba(245,158,11,.3)':'rgba(16,185,129,.3)'}` }}>
                  {bundleScore?.label||'?'}
                </span>
              </div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:28, fontWeight:700, color:bundleScore?.score>=70?'var(--orange)':bundleScore?.score>=40?'var(--amber)':'var(--green)', marginBottom:6 }}>
                {bundleScore?.score||0}
              </div>
              <div style={{ height:3, background:'var(--b1)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${bundleScore?.score||0}%`, background:bundleScore?.score>=70?'var(--orange)':bundleScore?.score>=40?'var(--amber)':'var(--green)', borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--muted)', marginTop:8, lineHeight:1.5 }}>
                Top 3 hold {bundleScore?.top3Pct||0}% · {coord} coord groups
              </div>
            </div>

            {/* Cabal */}
            <div style={{ background:'var(--bg1)', border:`1px solid ${cabalScore?.score>=60?'rgba(129,140,248,.3)':'var(--b1)'}`, borderRadius:12, padding:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:10, fontWeight:700, color:'var(--text)', letterSpacing:'.08em' }}>CABAL SCORE</div>
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, fontWeight:700,
                  background:cabalScore?.score>=60?'rgba(129,140,248,.15)':cabalScore?.score>=30?'rgba(245,158,11,.1)':'rgba(16,185,129,.1)',
                  color:cabalScore?.score>=60?'var(--purple)':cabalScore?.score>=30?'var(--amber)':'var(--green)',
                  border:`1px solid ${cabalScore?.score>=60?'rgba(129,140,248,.3)':cabalScore?.score>=30?'rgba(245,158,11,.3)':'rgba(16,185,129,.3)'}` }}>
                  {cabalScore?.label||'?'}
                </span>
              </div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:28, fontWeight:700, color:cabalScore?.score>=60?'var(--purple)':cabalScore?.score>=30?'var(--amber)':'var(--green)', marginBottom:6 }}>
                {cabalScore?.score||0}
              </div>
              <div style={{ height:3, background:'var(--b1)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${cabalScore?.score||0}%`, background:cabalScore?.score>=60?'var(--purple)':cabalScore?.score>=30?'var(--amber)':'var(--green)', borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--muted)', marginTop:8, lineHeight:1.5 }}>
                {cabalScore?.networks||0} clusters · {cabalScore?.totalPct||0}% supply
              </div>
            </div>
          </div>

          {/* Main metrics */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:'1rem' }}>
            <StatBox value={topHolderIsLP ? (r.holders?.details?.find(h=>!h.isLP)?.pct||0)+'%' : top1+'%'} label={topHolderIsLP?"Top Non-LP %":"Top Holder %"} color={top1>20&&!topHolderIsLP?'var(--red)':'var(--amber)'} barPct={topHolderIsLP?(r.holders?.details?.find(h=>!h.isLP)?.pct||0):top1} barColor="var(--amber)"/>
            <StatBox value={top10+'%'} label="Top 10 %" color={top10>50?'var(--red)':'var(--amber)'} barPct={top10} barColor="var(--amber)"/>
            <StatBox value={sniperCount} label="Snipers" color={sniperCount>5?'var(--red)':sniperCount>0?'var(--amber)':'var(--green)'} barPct={Math.min(sniperCount*10,100)} barColor="var(--orange)"/>
            <StatBox value={dev?.deployCount||0} label="Dev Deploys" color={dev?.deployCount>5?'var(--red)':dev?.deployCount>2?'var(--amber)':'var(--green)'} barPct={Math.min((dev?.deployCount||0)*10,100)} barColor="var(--red)"/>
            <StatBox value={rugcheck+'/100'} label="RugCheck" color={rugcheck>=75?'var(--green)':'var(--amber)'} barPct={rugcheck} barColor={rugcheck>=75?'var(--green)':'var(--amber)'}/>
          </div>

          {/* Holders + Funding */}
          <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <Card>
              <CardHeader title="TOP HOLDERS" icon={Users} badge={{ label:(r.holders?.total||0)+' total', variant:'muted' }}/>
              {topHolderIsLP && (
                <div style={{ fontSize:10, color:'var(--cyan)', background:'rgba(6,182,212,.08)', border:'1px solid rgba(6,182,212,.2)', borderRadius:6, padding:'5px 8px', marginBottom:8 }}>
                  Top holder adalah LP Pool — tidak dihitung sebagai risiko
                </div>
              )}
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
                  <thead>
                    <tr>{['Wallet','%','SOL','Age','Funding'].map(h=>(
                      <th key={h} style={{ color:'var(--muted)', fontWeight:500, padding:'4px 4px 4px 0', borderBottom:'1px solid var(--b1)', fontSize:9, textTransform:'uppercase', letterSpacing:'.06em', textAlign:h==='Wallet'?'left':'right' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {(r.holders?.details||[]).map((h,i)=>(
                      <HolderRow key={i} {...h}/>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="FUNDING DISTRIBUTION" icon={PieChart} badge={{ label:fund.length+' sources', variant:'muted' }}/>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {fund.map(([src, data], i)=>{
                  if (!data) return null
                  const isLP = src.startsWith('LP:')
                  const isCex = data.type==='cex'
                  const isKOL = data.type==='kol'
                  const isFresh = data.type==='fresh'
                  const color = isLP?'var(--cyan)':isCex?'var(--green)':isKOL?'var(--purple)':isFresh?'var(--amber)':COLORS[i%COLORS.length]
                  const firstWallet = (data.wallets||[])[0]||''
                  const displayName = src.replace('LP: ','').replace('KOL: ','')
                  const pct = data.pct||0
                  return (
                    <div key={src} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:100, flexShrink:0, textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
                        {isLP && <span style={{ fontSize:7, background:'rgba(6,182,212,.2)', color:'var(--cyan)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>LP</span>}
                        {isCex && <span style={{ fontSize:7, background:'rgba(16,185,129,.2)', color:'var(--green)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>CEX</span>}
                        {isKOL && <span style={{ fontSize:7, background:'rgba(129,140,248,.2)', color:'var(--purple)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>KOL</span>}
                        {isFresh && <span style={{ fontSize:7, background:'rgba(245,158,11,.2)', color:'var(--amber)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>NEW</span>}
                        {firstWallet && !['unknown','error'].includes(firstWallet) ? (
                          <a href={`https://solscan.io/account/${firstWallet}`} target="_blank" rel="noreferrer"
                            style={{ fontSize:10, color, textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                            {displayName.length>13?displayName.slice(0,11)+'..':displayName}
                            <ExternalLink size={8}/>
                          </a>
                        ) : (
                          <span style={{ fontSize:10, color }}>{displayName.length>13?displayName.slice(0,11)+'..':displayName}</span>
                        )}
                      </div>
                      <div style={{ flex:1, height:6, background:'var(--b1)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.max(1,(pct/maxPct*100)).toFixed(0)}%`, background:color, borderRadius:3 }}/>
                      </div>
                      <div style={{ fontSize:10, color:'var(--text)', width:34, textAlign:'right', fontFamily:'Space Mono,monospace' }}>{pct.toFixed(1)}%</div>
                      <div style={{ fontSize:9, color:'var(--muted)', width:18 }}>{data.count||0}w</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop:10, fontSize:10, color:'var(--muted)', paddingTop:10, borderTop:'1px solid var(--b1)', lineHeight:1.6 }}>
                <span style={{ color:'var(--green)' }}>CEX</span>=institutional · <span style={{ color:'var(--cyan)' }}>LP</span>=pool · <span style={{ color:'var(--amber)' }}>NEW</span>=fresh · klik→Solscan
              </div>
            </Card>
          </div>

          {/* HOLDER BUBBLE VISUALIZATION */}
          {(r.holders?.details||[]).length > 0 && (
            <Card style={{ marginBottom:'1rem' }}>
              <CardHeader title="HOLDER VISUALIZATION" icon={Users}
                badge={{ label:(r.holders?.total||0)+' holders', variant:'muted' }}/>
              <HolderBubble holders={r.holders?.details||[]} totalMcap={r.marketCap}/>
            </Card>
          )}

          {/* Dev Wallet + Sniper */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <Card>
              <CardHeader title="DEV WALLET ANALYSIS" icon={Code}
                badge={vampScore?.isVamp?{label:'VAMP '+vampScore.score,variant:'red'}:dev?.deployCount>3?{label:'serial deployer',variant:'amber'}:{label:'analyzed',variant:'muted'}}/>
              {dev ? (<>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                  <StatBox value={dev.deployCount||0} label="Deploys" color={dev.deployCount>5?'var(--red)':dev.deployCount>2?'var(--amber)':'var(--green)'}/>
                  <StatBox value={dev.migrationCount||0} label="Migrated" color={dev.migrationCount>0?'var(--green)':'var(--muted)'}/>
                  <StatBox value={fmtAge(dev.ageDays)} label="Wallet Age" color={(dev.ageDays||999)<7?'var(--red)':(dev.ageDays||999)<30?'var(--amber)':'var(--muted2)'}/>
                  <StatBox value={fmtSol(dev.solBalance)} label="SOL Bal" color="var(--muted2)"/>
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Dev Wallet</div>
                  <a href={`https://solscan.io/account/${dev.wallet}`} target="_blank" rel="noreferrer"
                    style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    {(dev.wallet||'').slice(0,12)}...{(dev.wallet||'').slice(-6)} <ExternalLink size={10}/>
                  </a>
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Funding Root</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {dev.fundingSource?.source && !['unknown','error','fresh'].includes(dev.fundingSource.source) ? (
                      <a href={`https://solscan.io/account/${dev.fundingSource.source}`} target="_blank" rel="noreferrer"
                        style={{ fontSize:11, fontWeight:600, color:dev.fundingSource.type==='cex'?'var(--green)':'var(--muted2)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                        {dev.fundingSource.label} <ExternalLink size={10}/>
                      </a>
                    ) : (
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{dev.fundingSource?.label||'Unknown'}</span>
                    )}
                    {dev.fundingSource?.hops>0 && <span style={{ fontSize:9, color:'var(--muted)', background:'var(--bg2)', padding:'2px 6px', borderRadius:6 }}>{dev.fundingSource.hops}-hop</span>}
                    {dev.fundingSource?.type==='cex' && <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:'rgba(16,185,129,.15)', color:'var(--green)', fontWeight:600 }}>CEX</span>}
                    {dev.fundingSource?.type==='fresh' && <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:'rgba(245,158,11,.15)', color:'var(--amber)', fontWeight:600 }}>FRESH</span>}
                  </div>
                </div>
                {(dev.deployedTokens||[]).length>0 && (
                  <div>
                    <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>
                      Previously Deployed ({dev.deployCount} tokens)
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {dev.deployedTokens.slice(0,5).map((t,i)=>(
                        <div key={i} style={{ background:'var(--bg2)', border:`1px solid ${t.isBonding?'rgba(16,185,129,.3)':'var(--b1)'}`, borderRadius:8, padding:'8px 10px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:11, fontWeight:700, color:'#fff', fontFamily:'Orbitron,monospace' }}>{t.symbol||'?'}</span>
                              {t.isBonding && <span style={{ fontSize:8, padding:'1px 5px', borderRadius:6, background:'rgba(16,185,129,.15)', color:'var(--green)', fontWeight:700 }}>LIVE</span>}
                              {t.isPumpFun && <span style={{ fontSize:8, padding:'1px 5px', borderRadius:6, background:'rgba(14,165,233,.1)', color:'var(--blue)', fontWeight:600 }}>pump.fun</span>}
                            </div>
                            <div style={{ textAlign:'right' }}>
                              {t.currentMcap>0 && <div style={{ fontSize:10, color:'var(--blue)', fontFamily:'Space Mono,monospace' }}>{fmt(t.currentMcap)}</div>}
                            </div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <a href={`https://solscan.io/token/${t.mint}`} target="_blank" rel="noreferrer"
                              style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                              {(t.mint||'').slice(0,10)}...{(t.mint||'').slice(-4)} <ExternalLink size={8}/>
                            </a>
                            <a href={`https://dexscreener.com/solana/${t.mint}`} target="_blank" rel="noreferrer"
                              style={{ fontSize:9, color:'var(--muted)', textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                              DEX <ExternalLink size={7}/>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>) : <div style={{ color:'var(--muted)', fontSize:11 }}>Dev wallet not identified</div>}
            </Card>

            <Card>
              <CardHeader title="SNIPER ANALYSIS" icon={Zap}
                badge={sniperCount>5?{label:sniperCount+' snipers!',variant:'red'}:sniperCount>0?{label:sniperCount+' detected',variant:'amber'}:{label:'clean',variant:'green'}}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                <StatBox value={sniperCount} label="Sniper Bots" color={sniperCount>5?'var(--red)':sniperCount>0?'var(--amber)':'var(--green)'}/>
                <StatBox value={r.launchWindow?.avgSniperScore||0} label="Avg Score" color="var(--orange)"/>
              </div>
              {snipers.length>0 ? (<>
                <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Top Snipers</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {snipers.slice(0,5).map((s,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--b1)' }}>
                      <a href={`https://solscan.io/account/${s.wallet}`} target="_blank" rel="noreferrer"
                        style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                        {(s.wallet||'').slice(0,6)}...{(s.wallet||'').slice(-4)} <ExternalLink size={9}/>
                      </a>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:9, color:'var(--muted)' }}>slot +{(s.slot||0)-(r.launchWindow?.launchSlot||0)}</span>
                        <span style={{ fontSize:9, padding:'2px 7px', borderRadius:8, background:'rgba(249,115,22,.15)', color:'var(--orange)', fontWeight:700 }}>
                          {s.sniperScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:10, fontSize:10, color:'var(--muted)' }}>Score 100 = block pertama. Lebih tinggi = lebih agresif.</div>
              </>) : (
                <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--green)', fontSize:11 }}>
                  <CheckCircle size={24} style={{ margin:'0 auto 8px', display:'block' }}/>
                  No sniper bots detected
                </div>
              )}
            </Card>
          </div>

          {/* Token Properties + Risk Flags */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <Card>
              <CardHeader title="TOKEN PROPERTIES" icon={Shield}/>
              {[
                { name:'Mintable',          val:props.mintable,        risk:props.mintable },
                { name:'Freezable',         val:props.freezable,       risk:props.freezable },
                { name:'Metadata Mutable',  val:props.metadataMutable, risk:props.metadataMutable },
                { name:'RugCheck Score',    val:rugcheck+'/100',       risk:rugcheck<50 },
                { name:'Total Holders',     val:r.holders?.total||'?', risk:false },
                { name:'Coord. Buy Groups', val:coord,                 risk:coord>=3 },
                { name:'DEX Paid',          val:dex?.paid?'Yes':'No',  risk:false },
                { name:'CTO',              val:dex?.isCto?'Yes':'No',  risk:false },
              ].map(p=>(
                <div key={p.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--b1)' }}>
                  <span style={{ fontSize:11, color:'var(--muted2)' }}>{p.name}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:p.risk?'var(--red)':'var(--green)' }}>
                    {typeof p.val==='boolean'?(p.val?'YES (RISK)':'No'):p.val}
                  </span>
                </div>
              ))}
            </Card>

            <Card>
              <CardHeader title="RISK FLAGS" icon={AlertTriangle}
                badge={{ label:(r.risk?.flags?.length||0)+' flags', variant:r.risk?.flags?.length>3?'red':'amber' }}/>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(r.risk?.flags||[]).length>0 ? r.risk.flags.map((f,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'6px 8px', background:'rgba(244,63,94,.06)', borderRadius:6, borderLeft:'2px solid rgba(244,63,94,.4)' }}>
                    <AlertTriangle size={10} color="var(--red)" style={{ flexShrink:0, marginTop:2 }}/>
                    <span style={{ fontSize:11, color:'var(--text)', lineHeight:1.4 }}>{f}</span>
                  </div>
                )) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--green)', fontSize:11 }}>
                    <CheckCircle size={14}/> No major risk flags
                  </div>
                )}
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--b1)', fontSize:10, color:'var(--muted)' }}>
                Data on-chain real-time. Bukan financial advice. DYOR always.
              </div>
            </Card>
          </div>

          {/* INVESTMENT VERDICT */}
          {verdict && (
            <div style={{ background:'var(--bg1)', border:`2px solid ${verdict.color}`, borderRadius:14, padding:'1.5rem', marginBottom:'1rem', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${verdict.color},transparent)` }}/>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>INVESTMENT VERDICT</div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:18, fontWeight:700, color:verdict.color, marginBottom:6 }}>
                    {verdict.emoji} {verdict.verdict}
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted2)', marginBottom:12 }}>
                    Composite risk score: <span style={{ color:verdict.color, fontWeight:700 }}>{verdict.composite}/100</span>
                    {' '}(risk 35% + vamp 25% + bundle 25% + cabal 15%)
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    {verdict.positives.length > 0 && (
                      <div>
                        <div style={{ fontSize:9, color:'var(--green)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6, fontWeight:700 }}>✓ Positive Signals</div>
                        {verdict.positives.map((p,i)=>(
                          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:4 }}>
                            <span style={{ color:'var(--green)', fontSize:10, flexShrink:0 }}>+</span>
                            <span style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.4 }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {verdict.negatives.length > 0 && (
                      <div>
                        <div style={{ fontSize:9, color:'var(--red)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6, fontWeight:700 }}>✗ Risk Signals</div>
                        {verdict.negatives.map((n,i)=>(
                          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:4 }}>
                            <span style={{ color:'var(--red)', fontSize:10, flexShrink:0 }}>−</span>
                            <span style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.4 }}>{n}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign:'center', minWidth:100 }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:42, fontWeight:700, color:verdict.color, lineHeight:1 }}>{verdict.composite}</div>
                  <div style={{ fontSize:9, color:'var(--muted)', marginTop:4, letterSpacing:'.06em' }}>COMPOSITE SCORE</div>
                </div>
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${verdict.color}44`, fontSize:10, color:'var(--muted)' }}>
                ⚠️ Ini adalah analisis on-chain otomatis, bukan financial advice. Always DYOR. Past patterns don't guarantee future results.
              </div>
            </div>
          )}



          {/* Deep Networks / Cabal */}
          {(r.deepNetworks||[]).length>0 && (
            <Card>
              <CardHeader title="CABAL / DEEP NETWORKS" icon={Users}
                badge={{ label:(r.deepNetworks||[]).length+' clusters', variant:'amber' }}/>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
                {r.deepNetworks.map((n,i)=>(
                  <div key={i} style={{ background:'var(--bg2)', border:'1px solid var(--b1)', borderRadius:8, padding:'12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#fff' }}>{n.name||'?'}</span>
                      <Badge label={(n.pct||0).toFixed(1)+'%'} variant="amber"/>
                    </div>
                    <div style={{ fontSize:10, color:'var(--muted)', marginBottom:6 }}>{n.count||0} wallets · same funding source</div>
                    {(n.wallets||[]).slice(0,2).map((w,j)=>(
                      <a key={j} href={`https://solscan.io/account/${w}`} target="_blank" rel="noreferrer"
                        style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3, marginBottom:3 }}>
                        {w.slice(0,8)}...{w.slice(-4)} <ExternalLink size={8}/>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
