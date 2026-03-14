import { useState, useEffect } from 'react'

export function useMarketData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('https://api.zerovantclaw.xyz/market-pulse')
        setData(await r.json())
      } catch(e) { console.error(e) }
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
        const r = await fetch('https://api.zerovantclaw.xyz/indo-watchlist')
        const d = await r.json()
        setData(d.watchlist || [])
      } catch(e) { console.error(e) }
    }
    load()
    const t = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [])

  return data
}
