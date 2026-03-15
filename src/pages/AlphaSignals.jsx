import { useState, useEffect, useRef } from 'react'
import { Zap, TrendingUp, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react'
import { Card, CardHeader, Badge, LiveBadge } from '../components/Card.jsx'
import { useMarketData } from '../hooks/useMarketData.js'

const SIGNAL_TYPES = {
  SMART_ENTRY:  { color: 'var(--red)',    bg: 'rgba(244,63,94,.12)',   label: 'SMART ENTRY',  desc: 'VOL anomaly + akumulasi bersamaan' },
  VOL_ANOMALY:  { color: 'var(--amber)',  bg: 'rgba(245,158,11,.1)',   label: 'VOL ANOMALY',  desc: 'Volume 1h > 3x rata-rata' },
  ACCUMULATION: { color: 'var(--blue)',   bg: 'rgba(14,165,233,.1)',   label: 'ACCUMULATION', desc: 'Buy txn > 2x sell txn' },
  LIQ_INFLOW:   { color: 'var(--green)',  bg: 'rgba(16,185,129,.1)',   label: 'LIQ INFLOW',   desc: 'Fresh LP masuk signifikan' },
}

function SignalCard({ signal }) {
  const st = SIGNAL_TYPES[signal.type] || SIGNAL_TYPES.VOL_ANOMALY
  const [imgErr, setImgErr] = useState(false)
  const age = signal.detectedAt ? Math.floor((Date.now() - signal.detectedAt) / 60000) : 0

  return (
    <div style={{ background:'var(--bg1)', border:`1px solid ${st.color}44`, borderRadius:12, padding:'1rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${st.color},transparent)` }}/>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
        {signal.logoURI && !imgErr ? (
          <img src={signal.logoURI} onError={()=>setImgErr(true)}
            style={{ width:36, height:36, borderRadius:8, border:'1px solid var(--b2)', objectFit:'cover', flexShrink:0 }}/>
        ) : (
          <div style={{ width:36, height:36, borderRadius:8, background:'var(--bg2)', border:'1px solid var(--b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:st.color, fontFamily:'Orbitron,monospace', flexShrink:0 }}>
            {signal.symbol?.slice(0,4)||'?'}
          </div>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:12, fontWeight:700, color:'#fff' }}>{signal.symbol}</span>
            <span style={{ fontSize:8, padding:'2px 6px', borderRadius:10, background:st.bg, color:st.color, fontWeight:700, border:`1px solid ${st.color}44` }}>{st.label}</span>
            <span style={{ fontSize:9, color:'var(--muted)', marginLeft:'auto' }}>{age}m ago</span>
          </div>
          <div style={{ fontSize:10, color:'var(--muted2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{signal.name}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
        {[
          { label:'Price', val: signal.price ? '$'+signal.price.toFixed(6) : 'N/A' },
          { label:'Vol 1h', val: signal.vol1h ? '$'+(signal.vol1h/1000).toFixed(1)+'K' : 'N/A' },
          { label:'Score', val: signal.score+'/100', color: signal.score>=70?'var(--red)':signal.score>=50?'var(--amber)':'var(--blue)' },
        ].map(s=>(
          <div key={s.label} style={{ background:'var(--bg2)', borderRadius:6, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:s.color||'#fff' }}>{s.val}</div>
            <div style={{ fontSize:9, color:'var(--muted)', marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6, marginBottom:10, fontSize:10, color:'var(--muted2)' }}>
        <div>Buy/Sell: <span style={{ color:'var(--green)' }}>{signal.buys||0}</span>/<span style={{ color:'var(--red)' }}>{signal.sells||0}</span></div>
        <div>Ratio: <span style={{ color:'var(--amber)' }}>{signal.buyRatio?.toFixed(1)||'?'}x</span></div>
        <div>Vol ratio: <span style={{ color:'var(--cyan)' }}>{signal.volRatio?.toFixed(1)||'?'}x</span></div>
        <div>MCap: <span style={{ color:'#fff' }}>{signal.mcap ? '$'+(signal.mcap/1e6).toFixed(2)+'M' : 'N/A'}</span></div>
      </div>

      <div style={{ display:'flex', gap:6 }}>
        <a href={`https://dexscreener.com/solana/${signal.address}`} target="_blank" rel="noreferrer"
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:10, padding:'6px', borderRadius:6, background:'rgba(14,165,233,.1)', border:'1px solid rgba(14,165,233,.25)', color:'var(--blue)', textDecoration:'none' }}>
          <TrendingUp size={10}/> DexScreener
        </a>
        <a href={`https://iseclaw.zerovantclaw.xyz/?scanner=${signal.address}`} target="_blank" rel="noreferrer"
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:10, padding:'6px', borderRadius:6, background:'rgba(244,63,94,.08)', border:'1px solid rgba(244,63,94,.25)', color:'var(--red)', textDecoration:'none' }}>
          Bundle Scan
        </a>
      </div>
    </div>
  )
}

export default function AlphaSignals() {
  const market = useMarketData()
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [scanStatus, setScanStatus] = useState('')
  const [autoScan, setAutoScan] = useState(false)
  const intervalRef = useRef(null)
  const fng = market?.fear_and_greed?.value || 50

  async function runScan() {
    setLoading(true)
    setScanStatus('Fetching top Solana pairs via Birdeye...')
    try {
      const r = await fetch('/api/market/alpha-scan')
      const data = await r.json()
      if (data.signals) {
        setSignals(prev => {
          // Merge new signals, keep unique by address
          const map = new Map(prev.map(s=>[s.address,s]))
          data.signals.forEach(s => map.set(s.address, s))
          return [...map.values()].sort((a,b)=>b.score-a.score).slice(0,20)
        })
        setScanStatus(`Found ${data.signals.length} signals · ${data.scanned} pairs scanned`)
      } else {
        setScanStatus(data.message || 'No signals found')
      }
      setLastScan(new Date())
    } catch(e) {
      setScanStatus('Scan error: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (autoScan) {
      runScan()
      intervalRef.current = setInterval(runScan, 5 * 60 * 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoScan])

  const byType = {}
  signals.forEach(s => {
    byType[s.type] = byType[s.type] || []
    byType[s.type].push(s)
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:14, fontWeight:700, color:'#fff', letterSpacing:'.06em' }}>ALPHA SIGNALS</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>Real-time on-chain signal detection — Solana</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {lastScan && <span style={{ fontSize:10, color:'var(--muted)' }}>Last: {lastScan.toLocaleTimeString()}</span>}
          <button onClick={()=>setAutoScan(p=>!p)}
            style={{ fontSize:11, padding:'7px 14px', borderRadius:8, border:`1px solid ${autoScan?'var(--green)':'var(--b2)'}`, background:autoScan?'rgba(16,185,129,.1)':'var(--bg2)', color:autoScan?'var(--green)':'var(--muted2)', cursor:'pointer', fontFamily:'Orbitron,monospace', letterSpacing:'.04em' }}>
            {autoScan ? '● AUTO ON' : '○ AUTO OFF'}
          </button>
          <button onClick={runScan} disabled={loading}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, padding:'7px 14px', borderRadius:8, border:'1px solid var(--blue)', background:'rgba(14,165,233,.1)', color:'var(--blue)', cursor:loading?'not-allowed':'pointer' }}>
            <RefreshCw size={12} style={{ animation:loading?'spin .8s linear infinite':'none' }}/> {loading?'Scanning...':'Scan Now'}
          </button>
        </div>
      </div>

      {/* Signal type legend */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.25rem' }}>
        {Object.entries(SIGNAL_TYPES).map(([key, st])=>(
          <div key={key} style={{ background:'var(--bg1)', border:'1px solid var(--b1)', borderRadius:10, padding:'.75rem 1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, fontWeight:700, color:st.color }}>{st.label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:st.color }}>{byType[key]?.length||0}</span>
            </div>
            <div style={{ fontSize:10, color:'var(--muted)', lineHeight:1.4 }}>{st.desc}</div>
          </div>
        ))}
      </div>

      {/* Market context */}
      <div style={{ background:'var(--bg1)', border:'1px solid var(--b1)', borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Fear & Greed</div>
          <div style={{ fontSize:16, fontWeight:700, color:fng<30?'var(--red)':fng<60?'var(--amber)':'var(--green)', fontFamily:'Orbitron,monospace' }}>
            {fng} — {market?.fear_and_greed?.classification||'--'}
          </div>
        </div>
        <div>
          <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>BTC Dominance</div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--blue)', fontFamily:'Orbitron,monospace' }}>{market?.btc_dominance||'--'}</div>
        </div>
        <div>
          <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Sentiment</div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--amber)', fontFamily:'Orbitron,monospace' }}>{(market?.overall_sentiment||'--').toUpperCase()}</div>
        </div>
        <div style={{ marginLeft:'auto', fontSize:11, color:'var(--muted2)', maxWidth:300, lineHeight:1.5 }}>
          {fng < 25
            ? 'Extreme Fear — sinyal langka. Akumulasi smart money lebih credible saat market fear.'
            : fng < 50
            ? 'Fear zone — hati-hati false signal. Confirm dengan volume dan holder data.'
            : 'Normal/Greed — scan normal. Filter strict untuk hindari FOMO signals.'}
        </div>
      </div>

      {/* Status */}
      {scanStatus && (
        <div style={{ fontSize:11, color:'var(--muted2)', padding:'8px 12px', background:'var(--bg1)', border:'1px solid var(--b1)', borderRadius:8, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
          {loading && <div style={{ width:10, height:10, border:'1.5px solid var(--b2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin .8s linear infinite', flexShrink:0 }}/>}
          {scanStatus}
        </div>
      )}

      {/* Signals grid */}
      {signals.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
          {signals.map((s,i)=><SignalCard key={s.address+i} signal={s}/>)}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'4rem 2rem' }}>
          <Zap size={48} color="var(--blue)" style={{ margin:'0 auto 1rem', display:'block', opacity:.4 }}/>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:12, letterSpacing:'.08em', color:'var(--blue)', marginBottom:'.75rem' }}>
            {loading ? 'SCANNING SOLANA...' : 'NO SIGNALS YET'}
          </div>
          <div style={{ fontSize:12, color:'var(--muted2)', maxWidth:400, margin:'0 auto', lineHeight:1.7 }}>
            {loading
              ? 'Checking 50 pairs via Birdeye for volume anomalies and accumulation patterns...'
              : 'Klik "Scan Now" atau aktifkan Auto Scan untuk mulai deteksi sinyal. Signal muncul saat score ≥ 40.'}
          </div>
          {!loading && (
            <button onClick={runScan}
              style={{ marginTop:'1.5rem', display:'inline-flex', alignItems:'center', gap:8, fontSize:12, padding:'10px 24px', borderRadius:10, border:'1px solid var(--blue)', background:'rgba(14,165,233,.1)', color:'var(--blue)', cursor:'pointer', fontFamily:'Orbitron,monospace' }}>
              <Zap size={14}/> START SCANNING
            </button>
          )}
        </div>
      )}
    </div>
  )
}
