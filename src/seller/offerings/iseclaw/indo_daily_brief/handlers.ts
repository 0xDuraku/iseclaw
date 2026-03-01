export async function evaluateJob(requirements: Record<string, unknown>) {
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const focus = (requirements.focus as string) || "general";
  const lang = (requirements.language as string) || "mixed";
  const isIndo = lang === "indonesian";

  const [pulse, watchlist] = await Promise.all([
    fetch("https://api.zerovantclaw.xyz/market-pulse").then((r) => r.json()),
    fetch("https://api.zerovantclaw.xyz/indo-watchlist").then((r) => r.json()),
  ]);

  const topMovers = watchlist.watchlist
    .sort(
      (a: any, b: any) => Math.abs(parseFloat(b.change_24h)) - Math.abs(parseFloat(a.change_24h))
    )
    .slice(0, 3);

  const insights: Record<string, [string, string]> = {
    gamefi: [
      "GameFi sentiment tracks overall market. Watch Ronin, IMX, Monad ecosystem.",
      "GameFi ikuti overall market. Monitor Ronin, IMX, dan Monad ecosystem.",
    ],
    defi: [
      "DeFi yields attractive during high fear. Check AERO on Base and Solana aggregators.",
      "DeFi yields menarik saat fear tinggi. Check AERO di Base dan Solana.",
    ],
    nft: [
      "NFT volume drops during fear. PENGU remains top Indo community pick.",
      "NFT volume turun saat fear. PENGU masih top pick komunitas Indo.",
    ],
    general: [
      "Stay patient, accumulate during extreme fear. Indo community focused on Monad and Base.",
      "Stay patient, accumulate saat fear extreme. Komunitas Indo fokus Monad dan Base.",
    ],
  };
  const [en, id] = insights[focus] || insights.general;
  const focusInsight = isIndo ? id : en;

  const result = `�� ISECLAW DAILY BRIEF — ${new Date().toLocaleDateString(isIndo ? "id-ID" : "en-US")}

�� MARKET PULSE
${isIndo ? "Sentimen" : "Sentiment"}: ${pulse.overall_sentiment.toUpperCase()}
Market Cap 24h: ${pulse.market_cap_change_24h}
Fear & Greed: ${pulse.fear_and_greed.value} (${pulse.fear_and_greed.classification})
BTC Dominance: ${pulse.btc_dominance}
Risk Level: ${pulse.risk_level.replace("_", " ").toUpperCase()}

�� TOP MOVERS
${topMovers.map((t: any) => `${t.token}: $${t.price_usd} (${parseFloat(t.change_24h) > 0 ? "+" : ""}${t.change_24h}%)`).join("\n")}

�� NARRATIVES
${pulse.active_narratives.join(" · ")}

�� FOCUS: ${focus.toUpperCase()}
${focusInsight}

Source: Iseclaw | IsekaiDAO | iseclaw.zerovantclaw.xyz`;

  return { result, deliveredAt: new Date().toISOString() };
}
