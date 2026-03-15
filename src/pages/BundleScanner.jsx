import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, ExternalLink, Users, PieChart, Clock, Shield, Zap, Code, Twitter, Globe, TrendingUp } from 'lucide-react'
import { Card, CardHeader, Badge, StatBox, LiveBadge } from '../components/Card.jsx'

const COLORS = ['var(--blue)','var(--cyan)','var(--purple)','var(--green)','var(--amber)','var(--orange)','var(--red)','var(--muted2)']

function fmt(n) {
  if (!n || n === 0) return 'N/A'
  if (n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + (n/1e3).toFixed(1) + 'K'
  return '$' + n.toFixed(4)
}

function fmtAge(days) {
  if (!days) return '?'
  if (days >= 365) return Math.floor(days/365) + 'y'
  if (days >= 30) return Math.floor(days/30) + 'mo'
  return days + 'd'
}

function TokenIcon({ symbol, logoURI, size = 44 }) {
  const [err, setErr] = useState(false)
  if (logoURI && !err) return (
    <img src={logoURI} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: size/4, border: '1px solid var(--b2)', objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }} />
  )
  return (
    <div style={{ width: size, height: size, borderRadius: size/4, background: 'var(--bg2)', border: '1px solid var(--b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron,monospace', fontSize: size/4.5, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>
      {symbol?.slice(0,4)||'?'}
    </div>
  )
}

function RiskBanner({ risk }) {
  const level = risk?.level||'LOW', score = risk?.score||0
  const C = {
    HIGH:   { bg:'rgba(244,63,94,.08)',  bd:'rgba(244,63,94,.3)',  c:'var(--red)',   I:AlertTriangle, t:'HIGH RISK — BUNDLING DETECTED' },
    MEDIUM: { bg:'rgba(245,158,11,.08)', bd:'rgba(245,158,11,.3)', c:'var(--amber)', I:AlertTriangle, t:'MEDIUM RISK — WATCH CAREFULLY' },
    LOW:    { bg:'rgba(16,185,129,.08)', bd:'rgba(16,185,129,.3)', c:'var(--green)', I:CheckCircle,   t:'LOW RISK — RELATIVELY SAFE' },
  }
  const c = C[level]||C.LOW
  return (
    <div style={{ borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:14, border:`1px solid ${c.bd}`, background:c.bg }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${c.c}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <c.I size={20} color={c.c} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, color:c.c }}>{c.t}</div>
        <div style={{ fontSize:11, color:'var(--muted2)', marginTop:3, lineHeight:1.5 }}>{risk?.flags?.slice(0,2).join(' · ')}</div>
      </div>
      <div style={{ textAlign:'center', marginLeft:'auto' }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:28, fontWeight:700, color:c.c }}>{score}</div>
        <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:'.06em' }}>RISK SCORE</div>
      </div>
    </div>
  )
}

function HolderRow({ owner, pct, rank, isLP, lpLabel, isKOL, kolLabel, funding, solBalance, ageDays, firstSeen }) {
  const short = owner && owner !== 'unknown' ? owner.slice(0,6)+'...'+owner.slice(-4) : 'Unknown'
  const typeColor = isLP ? 'var(--cyan)' : isKOL ? 'var(--purple)' : rank===1 ? 'var(--red)' : pct>5 ? 'var(--amber)' : 'var(--muted2)'
  const typeLabel = isLP ? lpLabel : isKOL ? kolLabel : rank===1 ? 'Top Holder' : `#${rank}`
  const fundLabel = isLP ? (lpLabel||'LP') : (funding?.label||'Unknown')
  const fundType = isLP ? 'lp' : (funding?.type||'unknown')
  const fundSrc = isLP ? null : funding?.source
  const fundColor = fundType==='cex' ? 'var(--green)' : fundType==='lp' ? 'var(--cyan)' : fundType==='kol' ? 'var(--purple)' : fundType==='fresh' ? 'var(--amber)' : 'var(--muted)'
  const ageColor = ageDays && ageDays < 7 ? 'var(--red)' : ageDays && ageDays < 30 ? 'var(--amber)' : 'var(--muted2)'

  return (
    <tr onMouseEnter={e=>e.currentTarget.style.background='rgba(14,165,233,.03)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <td style={{ padding:'8px 0', borderBottom:'1px solid var(--b1)', verticalAlign:'middle' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
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
      <td style={{ padding:'8px 0', borderBottom:'1px solid var(--b1)', textAlign:'right', color: pct>20?'var(--red)':pct>5?'var(--amber)':'#fff', fontFamily:'Space Mono,monospace', fontSize:11, fontWeight:600 }}>{pct?.toFixed(1)}%</td>
      <td style={{ padding:'8px 0', borderBottom:'1px solid var(--b1)', textAlign:'right', fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--muted2)' }}>
        {isLP ? '—' : solBalance != null ? solBalance.toFixed(2)+'◎' : '?'}
      </td>
      <td style={{ padding:'8px 0', borderBottom:'1px solid var(--b1)', textAlign:'right' }}>
        <span style={{ fontSize:9, color:ageColor }}>{isLP ? '—' : fmtAge(ageDays)}</span>
      </td>
      <td style={{ padding:'8px 0', borderBottom:'1px solid var(--b1)', textAlign:'right' }}>
        {isLP ? (
          <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:'rgba(6,182,212,.15)', color:'var(--cyan)', fontWeight:600 }}>LP Pool</span>
        ) : (
          fundSrc && fundSrc !== 'unknown' && fundSrc !== 'error' ? (
            <a href={`https://solscan.io/account/${fundSrc}`} target="_blank" rel="noreferrer"
              style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:`${fundColor}22`, color:fundColor, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:3 }}>
              {fundLabel} <ExternalLink size={8}/>
            </a>
          ) : (
            <span style={{ fontSize:9, padding:'2px 6px', borderRadius:8, background:`${fundColor}22`, color:fundColor, fontWeight:600 }}>{fundLabel}</span>
          )
        )}
      </td>
    </tr>
  )
}

export default function BundleScanner() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const MSGS = ['Fetching token info + DexScreener...','Fetching top holders via Helius...','Analyzing launch window...','Detecting sniper bots...','Checking wallet funding (2-hop CEX)...','Getting wallet age + SOL balance...','Analyzing dev wallet history...','Calculating risk score...']

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
    { label:'TRUMP', addr:'6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN' },
    { label:'JUP',   addr:'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    { label:'WIF',   addr:'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
    { label:'BONK',  addr:'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  ]

  const r = result
  const fund = r ? Object.entries(r.fundingDistribution||{}).sort((a,b)=>b[1].pct-a[1].pct) : []
  const maxPct = fund[0]?.[1].pct||1
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

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:14, fontWeight:700, color:'#fff', letterSpacing:'.06em' }}>BUNDLE SCANNER</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>Solana · bundle detection · sniper score · dev history · CEX funding · wallet age</div>
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
          Bundle wallets · Dev history · CEX funding (2-hop) · Sniper detection · Wallet age · KOL tracking
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

      {loading && (
        <div style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ width:32, height:32, border:'2px solid var(--b2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:11, letterSpacing:'.1em', color:'var(--blue)' }}>SCANNING ON-CHAIN DATA</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:6 }}>{loadMsg}</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background:'rgba(244,63,94,.08)', border:'1px solid rgba(244,63,94,.3)', borderRadius:12, padding:'1rem', color:'var(--red)', fontSize:12 }}>Error: {error}</div>
      )}

      {r && !loading && (<>
        {/* Token Header */}
        <div style={{ background:'var(--bg1)', border:'1px solid var(--b1)', borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <TokenIcon symbol={r.symbol} logoURI={r.logoURI} size={52}/>
              <div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:700, color:'#fff' }}>{r.name}</div>
                <div style={{ fontSize:11, color:'var(--blue)', fontWeight:600, marginTop:2 }}>{r.symbol}</div>
                <a href={`https://solscan.io/token/${r.mint}`} target="_blank" rel="noreferrer"
                  style={{ fontSize:10, color:'var(--muted)', fontFamily:'Space Mono,monospace', marginTop:3, display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
                  {r.mint?.slice(0,16)}...{r.mint?.slice(-4)} <ExternalLink size={10}/>
                </a>
              </div>
            </div>

            {/* Price stats */}
            <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff', fontFamily:'Orbitron,monospace' }}>
                  {r.price ? '$'+r.price.toFixed(6) : 'N/A'}
                </div>
                <div style={{ fontSize:11, color:chg24h>=0?'var(--green)':'var(--red)', marginTop:2 }}>
                  {chg24h>=0?'+':''}{chg24h?.toFixed(2)}% 24h
                </div>
              </div>
              {[
                { val:fmt(r.marketCap), label:'Market Cap' },
                { val:fmt(r.liquidity), label:'Liquidity' },
                { val:fmt(r.volume24h), label:'Vol 24h' },
                { val:dex?.txns24h?.toLocaleString()||'N/A', label:'Txns 24h' },
              ].map(s=>(
                <div key={s.label} style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{s.val}</div>
                  <div style={{ fontSize:9, color:'var(--muted)', marginTop:2, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Links row */}
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {dex?.url && (
              <a href={dex.url} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(14,165,233,.1)', border:'1px solid rgba(14,165,233,.25)', color:'var(--blue)', textDecoration:'none' }}>
                <TrendingUp size={10}/> DexScreener
                {dex.paid && <span style={{ fontSize:8, background:'var(--green)', color:'#fff', padding:'1px 4px', borderRadius:4, fontWeight:700 }}>PAID</span>}
              </a>
            )}
            {dex?.socials?.filter(s=>s.type==='twitter').map((s,i)=>(
              <a key={i} href={s.url} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid var(--b2)', color:'var(--text)', textDecoration:'none' }}>
                <Twitter size={10}/> Twitter/X
              </a>
            ))}
            {dex?.websites?.map((s,i)=>(
              <a key={i} href={s.url} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid var(--b2)', color:'var(--text)', textDecoration:'none' }}>
                <Globe size={10}/> {s.label||'Website'}
              </a>
            ))}
            {dex?.socials?.filter(s=>s.type!=='twitter').map((s,i)=>(
              <a key={i} href={s.url} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid var(--b2)', color:'var(--text)', textDecoration:'none' }}>
                <ExternalLink size={10}/> {s.type}
              </a>
            ))}
            <span style={{ fontSize:10, padding:'5px 10px', borderRadius:8, background:dex?.paid?'rgba(16,185,129,.1)':'rgba(74,112,144,.1)', border:`1px solid ${dex?.paid?'rgba(16,185,129,.3)':'var(--b1)'}`, color:dex?.paid?'var(--green)':'var(--muted)', display:'inline-flex', alignItems:'center', gap:4 }}>
              DEX {dex?.paid ? '✓ Paid' : 'Free Tier'}
            </span>
          </div>

          {/* KOL alert */}
          {kols.length > 0 && (
            <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.3)', borderRadius:8, fontSize:11, color:'var(--purple)', display:'flex', alignItems:'center', gap:8 }}>
              <Users size={12}/> KOL detected: {kols.map(k=>`${k.name} (${k.pct}%)`).join(', ')}
            </div>
          )}
        </div>

        <RiskBanner risk={r.risk}/>

        {/* Metrics */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:'1rem' }}>
          <StatBox value={top1+'%'} label="Top Holder %" color={top1>20?'var(--red)':'var(--amber)'} barPct={top1} barColor={top1>20?'var(--red)':'var(--amber)'}/>
          <StatBox value={top10+'%'} label="Top 10 %" color={top10>50?'var(--red)':'var(--amber)'} barPct={top10} barColor="var(--amber)"/>
          <StatBox value={sniperCount} label="Snipers" color={sniperCount>5?'var(--red)':sniperCount>0?'var(--amber)':'var(--green)'} barPct={Math.min(sniperCount*10,100)} barColor="var(--orange)"/>
          <StatBox value={dev?.deployCount||'--'} label="Dev Deploys" color={dev?.deployCount>3?'var(--red)':'var(--amber)'} barPct={Math.min((dev?.deployCount||0)*15,100)} barColor="var(--red)"/>
          <StatBox value={rugcheck+'/100'} label="RugCheck" color={rugcheck>=75?'var(--green)':'var(--amber)'} barPct={rugcheck} barColor={rugcheck>=75?'var(--green)':'var(--amber)'}/>
        </div>

        {/* Holders + Funding */}
        <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <Card>
            <CardHeader title="TOP HOLDERS" icon={Users} badge={{ label:r.holders?.total+' total', variant:'muted' }}/>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                <thead>
                  <tr>{['Wallet','% Supply','SOL Bal','Age','Funding Source'].map(h=>(
                    <th key={h} style={{ color:'var(--muted)', fontWeight:500, padding:'4px 4px 4px 0', borderBottom:'1px solid var(--b1)', fontSize:9, textTransform:'uppercase', letterSpacing:'.06em', textAlign:h==='Wallet'?'left':'right', whiteSpace:'nowrap' }}>{h}</th>
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
                const isLP = src.startsWith('LP:')
                const isCex = data.type==='cex'
                const isKOL = data.type==='kol'
                const isFresh = data.type==='fresh'
                const color = isLP?'var(--cyan)':isCex?'var(--green)':isKOL?'var(--purple)':isFresh?'var(--amber)':COLORS[i%COLORS.length]
                const firstWallet = data.wallets?.[0]||''
                const displayName = src.replace('LP: ','').replace('KOL: ','')
                return (
                  <div key={src} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:100, flexShrink:0, textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
                      {isLP && <span style={{ fontSize:7, background:'rgba(6,182,212,.2)', color:'var(--cyan)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>LP</span>}
                      {isCex && <span style={{ fontSize:7, background:'rgba(16,185,129,.2)', color:'var(--green)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>CEX</span>}
                      {isKOL && <span style={{ fontSize:7, background:'rgba(129,140,248,.2)', color:'var(--purple)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>KOL</span>}
                      {isFresh && <span style={{ fontSize:7, background:'rgba(245,158,11,.2)', color:'var(--amber)', padding:'1px 4px', borderRadius:3, fontWeight:700 }}>NEW</span>}
                      {firstWallet && firstWallet!=='unknown' && firstWallet!=='fresh' && firstWallet!=='error' ? (
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
                      <div style={{ height:'100%', width:`${(data.pct/maxPct*100).toFixed(0)}%`, background:color, borderRadius:3 }}/>
                    </div>
                    <div style={{ fontSize:10, color:'var(--text)', width:36, textAlign:'right', fontFamily:'Space Mono,monospace' }}>{data.pct.toFixed(1)}%</div>
                    <div style={{ fontSize:9, color:'var(--muted)', width:18 }}>{data.count}w</div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop:10, fontSize:10, color:'var(--muted)', paddingTop:10, borderTop:'1px solid var(--b1)', lineHeight:1.6 }}>
              <span style={{ color:'var(--green)' }}>CEX</span>=institutional · <span style={{ color:'var(--cyan)' }}>LP</span>=liquidity pool · <span style={{ color:'var(--amber)' }}>NEW</span>=fresh wallet · klik untuk Solscan
            </div>
          </Card>
        </div>

        {/* Dev Wallet + Sniper */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <Card>
            <CardHeader title="DEV WALLET ANALYSIS" icon={Code}
              badge={dev?.deployCount>3?{label:'serial deployer',variant:'red'}:{label:'analyzed',variant:'muted'}}/>
            {dev ? (<>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                <StatBox value={dev.deployCount} label="Tokens Deployed" color={dev.deployCount>5?'var(--red)':dev.deployCount>2?'var(--amber)':'var(--green)'}/>
                <StatBox value={dev.totalTxns>=1000?'1000+':dev.totalTxns} label="Total Txns" color="var(--blue)"/>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5 }}>Dev Wallet</div>
                <a href={`https://solscan.io/account/${dev.wallet}`} target="_blank" rel="noreferrer"
                  style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                  {dev.wallet?.slice(0,12)}...{dev.wallet?.slice(-6)} <ExternalLink size={10}/>
                </a>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5 }}>Funding Root</div>
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
                </div>
              </div>
              {dev.deployedTokens?.length>0 && (
                <div>
                  <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Previously Deployed</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {dev.deployedTokens.slice(0,5).map((t,i)=>(
                      <div key={i} style={{ background:'var(--bg2)', border:'1px solid var(--b1)', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                          <span style={{ fontSize:11, fontWeight:600, color:'#fff' }}>{t.symbol||'?'}</span>
                          {t.athMcap>0 && <span style={{ fontSize:10, color:'var(--green)', fontFamily:'Space Mono,monospace' }}>ATH: {fmt(t.athMcap)}</span>}
                        </div>
                        <a href={`https://solscan.io/token/${t.mint}`} target="_blank" rel="noreferrer"
                          style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                          {t.mint?.slice(0,14)}... <ExternalLink size={8}/>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>) : <div style={{ color:'var(--muted)', fontSize:11, padding:'1rem 0' }}>Dev wallet not identified</div>}
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
                      {s.wallet?.slice(0,6)}...{s.wallet?.slice(-4)} <ExternalLink size={9}/>
                    </a>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:9, color:'var(--muted)' }}>slot+{s.slot - (r.launchWindow?.launchSlot||0)}</span>
                      <span style={{ fontSize:9, padding:'2px 7px', borderRadius:8, background:'rgba(249,115,22,.15)', color:'var(--orange)', fontWeight:700 }}>score {s.sniperScore}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, fontSize:10, color:'var(--muted)' }}>Score 100 = block pertama. Semakin tinggi = lebih agresif.</div>
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
              { name:'Mintable',           val:props.mintable,        risk:props.mintable },
              { name:'Freezable',          val:props.freezable,       risk:props.freezable },
              { name:'Metadata Mutable',   val:props.metadataMutable, risk:props.metadataMutable },
              { name:'RugCheck Score',     val:rugcheck+'/100',       risk:rugcheck<50 },
              { name:'Total Holders',      val:r.holders?.total||'--', risk:false },
              { name:'Coord. Buy Groups',  val:coord,                 risk:coord>=3 },
              { name:'DEX Paid',           val:dex?.paid?'Yes':'No',  risk:false },
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

        {/* Deep Networks */}
        {r.deepNetworks?.length>0 && (
          <Card style={{ marginBottom:'1rem' }}>
            <CardHeader title="DEEP NETWORKS" icon={Users} badge={{ label:r.deepNetworks.length+' clusters', variant:'amber' }}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
              {r.deepNetworks.map((n,i)=>(
                <div key={i} style={{ background:'var(--bg2)', border:'1px solid var(--b1)', borderRadius:8, padding:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'#fff' }}>{n.name}</span>
                    <Badge label={n.pct.toFixed(1)+'%'} variant="amber"/>
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginBottom:6 }}>{n.count} wallets · same funding</div>
                  {n.wallets?.slice(0,2).map((w,j)=>(
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
      </>)}
    </div>
  )
}
