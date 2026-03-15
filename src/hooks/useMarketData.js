import { useState, useEffect } from 'react'

export function useMarketData() {
  const [data, setData] = useState(null)
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/market/market-pulse')
        const json = await r.json()
        console.log('market-pulse data:', json?.fear_and_greed?.value)
        setData(json)
      } catch(e) { console.error('market-pulse error:', e) }
    }
    load()
    const t = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [])
  return data
}

export function useWatchlist() {
  const [data, setData] = useState([])
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/market/indo-watchlist')
        const d = await r.json()
        setData(d.watchlist || [])
      } catch(e) { console.error('watchlist error:', e) }
    }
    load()
    const t = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [])
  return data
}
