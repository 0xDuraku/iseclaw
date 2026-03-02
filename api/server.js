import express from "express";
const app = express();
const PORT = 3001;

const cache = { data: {}, timestamp: {} };
const CACHE_TTL = 5 * 60 * 1000;

async function fetchWithCache(key, fetchFn) {
  const now = Date.now();
  if (cache.data[key] && now - cache.timestamp[key] < CACHE_TTL) {
    return cache.data[key];
  }
  const data = await fetchFn();
  cache.data[key] = data;
  cache.timestamp[key] = now;
  return data;
}

app.get("/indo-watchlist", async (req, res) => {
  try {
    const data = await fetchWithCache("watchlist", async () => {
      const ids =
        "virtual-protocol,solana,jupiter-exchange-solana,pudgy-penguins,aerodrome-finance,ethereum,dogwifcoin,pendle";
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const prices = await resp.json();
      const mapping = [
        { token: "VIRTUAL", id: "virtual-protocol", chain: "Base", category: "AI Agent" },
        { token: "SOL", id: "solana", chain: "Solana", category: "L1" },
        { token: "JUP", id: "jupiter-exchange-solana", chain: "Solana", category: "DEX" },
        { token: "PENGU", id: "pudgy-penguins", chain: "Solana", category: "NFT/Meme" },
        { token: "AERO", id: "aerodrome-finance", chain: "Base", category: "DEX" },
        { token: "ETH", id: "ethereum", chain: "Base/ETH", category: "L1" },
        { token: "WIF", id: "dogwifcoin", chain: "Solana", category: "Meme" },
        { token: "PENDLE", id: "pendle", chain: "Base/ETH", category: "DeFi" },
      ];
      return {
        updated: new Date().toISOString(),
        source: "Iseclaw | IsekaiDAO",
        watchlist: mapping.map((t) => ({
          token: t.token,
          chain: t.chain,
          category: t.category,
          price_usd: prices[t.id]?.usd || null,
          change_24h: prices[t.id]?.usd_24h_change?.toFixed(2) || null,
          sentiment:
            (prices[t.id]?.usd_24h_change || 0) > 3
              ? "bullish"
              : (prices[t.id]?.usd_24h_change || 0) < -3
                ? "bearish"
                : "neutral",
        })),
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/market-pulse", async (req, res) => {
  try {
    const data = await fetchWithCache("pulse", async () => {
      const [globalResp, fngResp] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/global"),
        fetch("https://api.alternative.me/fng/?limit=1"),
      ]);
      const globalData = await globalResp.json();
      const fng = await fngResp.json();
      const marketCapChange = globalData.data?.market_cap_change_percentage_24h_usd || 0;
      const btcDom = globalData.data?.market_cap_percentage?.btc;
      const fngValue = parseInt(fng.data?.[0]?.value || "50");
      const fngClass = fng.data?.[0]?.value_classification || "Neutral";
      return {
        updated: new Date().toISOString(),
        source: "Iseclaw | IsekaiDAO",
        overall_sentiment:
          marketCapChange > 2 ? "bullish" : marketCapChange < -2 ? "bearish" : "neutral",
        market_cap_change_24h: marketCapChange.toFixed(2) + "%",
        fear_and_greed: { value: fngValue, classification: fngClass },
        btc_dominance: btcDom ? btcDom.toFixed(1) + "%" : "N/A",
        indonesian_community_focus: (() => {
          const base = ["Base ecosystem", "Virtuals Protocol"];
          if (fngValue < 25) base.push("Stablecoin yields");
          else if (fngValue > 65) base.push("Meme coins");
          else base.push("Monad testnet");
          const dominance = parseFloat(btcDom) || 50;
          if (dominance > 58) base.push("BTC season");
          else base.push("Altcoin rotation");
          return base;
        })(),
        active_narratives: (() => {
          const n = ["AI agents"];
          const mc = parseFloat(marketCapChange) || 0;
          if (mc < -2) n.push("Buy the dip");
          else if (mc > 2) n.push("Bull momentum");
          else n.push("Sideways accumulation");
          if (fngValue < 30) n.push("Fear = opportunity");
          else if (fngValue > 70) n.push("Take profits");
          else n.push("DeFi yields");
          n.push(parseFloat(btcDom) > 55 ? "BTC dominance play" : "Altseason watch");
          return n;
        })(),
        risk_level: fngValue < 30 ? "high_opportunity" : fngValue > 70 ? "high_risk" : "medium",
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TGE Calendar - gabungan CoinGecko new listings + curated list
app.get("/tge-calendar", async (req, res) => {
  try {
    const data = await fetchWithCache("tge", async () => {
      // Fetch new coins dari CoinGecko (coins yang baru listed)
      const [newCoinsResp, trendingResp] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/coins/list?include_platform=true"),
        fetch("https://api.coingecko.com/api/v3/search/trending"),
      ]);
      const trending = await trendingResp.json();

      // Ambil trending coins sebagai proxy untuk "hot upcoming"
      const trendingCoins =
        trending.coins?.slice(0, 5).map((c) => ({
          project: c.item.name,
          symbol: c.item.symbol,
          type: "trending",
          chain: c.item.platforms ? Object.keys(c.item.platforms)[0] || "unknown" : "unknown",
          status: "listed_trending",
          market_cap_rank: c.item.market_cap_rank,
          community_interest: c.item.score > 3 ? "high" : "medium",
          coingecko_id: c.item.id,
          thumb: c.item.thumb,
        })) || [];

      return {
        updated: new Date().toISOString(),
        source: "Iseclaw | IsekaiDAO",
        description:
          "Upcoming & trending TGE/IDO events. Data from CoinGecko trending + curated Indonesian community picks.",
        disclaimer: "Always DYOR. Not financial advice.",
        trending_now: trendingCoins,
        curated_upcoming: [
          {
            project: "Monad",
            symbol: "MON",
            type: "TGE",
            chain: "Monad",
            status: "anticipated",
            community_interest: "very_high",
            indo_notes: "Paling ditunggu komunitas Indonesia 2026",
          },
        ],
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/clawhub-stats", async (req, res) => {
  try {
    const data = await fetchWithCache("clawhub", async () => {
      const resp = await fetch("https://clawhub.ai/api/v1/skills/iseclaw-intel");
      const json = await resp.json();
      return {
        updated: new Date().toISOString(),
        downloads: json.skill.stats.downloads,
        stars: json.skill.stats.stars,
        versions: json.skill.stats.versions,
        latest_version: json.skill.tags.latest,
        changelog: json.latestVersion.changelog,
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    agent: "Iseclaw | IsekaiDAO",
    resources: ["indo-watchlist", "market-pulse", "tge-calendar"],
    updated: new Date().toISOString(),
  })
);

app.listen(PORT, () => console.log(`Iseclaw API running on port ${PORT}`));
