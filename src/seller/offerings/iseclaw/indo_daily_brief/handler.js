export async function handle(job) {
  const focus = job.requirement?.focus || "general";
  const lang = job.requirement?.language || "mixed";

  // Fetch dari API kita sendiri - zero AI cost
  const [pulse, watchlist] = await Promise.all([
    fetch("https://api.zerovantclaw.xyz/market-pulse").then((r) => r.json()),
    fetch("https://api.zerovantclaw.xyz/indo-watchlist").then((r) => r.json()),
  ]);

  const topMovers = watchlist.watchlist
    .sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h))
    .slice(0, 3);

  const brief =
    lang === "indonesian"
      ? `�� ISECLAW DAILY BRIEF — ${new Date().toLocaleDateString("id-ID")}

�� MARKET PULSE
Sentimen: ${pulse.overall_sentiment.toUpperCase()}
Market Cap 24h: ${pulse.market_cap_change_24h}
Fear & Greed: ${pulse.fear_and_greed.value} (${pulse.fear_and_greed.classification})
BTC Dominance: ${pulse.btc_dominance}
Risk Level: ${pulse.risk_level.replace("_", " ").toUpperCase()}

�� TOP MOVERS INDO WATCHLIST
${topMovers.map((t) => `${t.token}: $${t.price_usd} (${t.change_24h > 0 ? "+" : ""}${t.change_24h}%)`).join("\n")}

�� ACTIVE NARRATIVES
${pulse.active_narratives.join(" · ")}

�� FOCUS: ${focus.toUpperCase()}
${getFocusInsight(focus, pulse, lang)}

Source: Iseclaw | IsekaiDAO | iseclaw.zerovantclaw.xyz`
      : `�� ISECLAW DAILY BRIEF — ${new Date().toLocaleDateString("en-US")}

�� MARKET PULSE
Sentiment: ${pulse.overall_sentiment.toUpperCase()}
Market Cap 24h: ${pulse.market_cap_change_24h}
Fear & Greed: ${pulse.fear_and_greed.value} (${pulse.fear_and_greed.classification})
BTC Dominance: ${pulse.btc_dominance}
Risk Level: ${pulse.risk_level.replace("_", " ").toUpperCase()}

�� TOP MOVERS (Indo Watchlist)
${topMovers.map((t) => `${t.token}: $${t.price_usd} (${t.change_24h > 0 ? "+" : ""}${t.change_24h}%)`).join("\n")}

�� ACTIVE NARRATIVES
${pulse.active_narratives.join(" · ")}

�� FOCUS: ${focus.toUpperCase()}
${getFocusInsight(focus, pulse, lang)}

Source: Iseclaw | IsekaiDAO | iseclaw.zerovantclaw.xyz`;

  return { result: brief, deliveredAt: new Date().toISOString() };
}

function getFocusInsight(focus, pulse, lang) {
  const insights = {
    gamefi:
      lang === "indonesian"
        ? "GameFi sentiment mengikuti overall market. Monitor Ronin, IMX, dan Monad ecosystem untuk opportunity."
        : "GameFi sentiment tracks overall market. Watch Ronin, IMX, and Monad ecosystem for opportunities.",
    defi:
      lang === "indonesian"
        ? "DeFi yields menarik saat fear tinggi. Check AERO di Base dan yield aggregators di Solana."
        : "DeFi yields attractive during high fear. Check AERO on Base and yield aggregators on Solana.",
    nft:
      lang === "indonesian"
        ? "NFT volume biasanya turun saat fear dominan. PENGU masih top pick komunitas Indo."
        : "NFT volume typically drops during fear. PENGU remains top Indo community pick.",
    general:
      lang === "indonesian"
        ? "Stay patient, accumulate saat fear extreme. Indo community fokus ke Monad dan Base ecosystem."
        : "Stay patient, accumulate during extreme fear. Indo community focused on Monad and Base ecosystem.",
  };
  return insights[focus] || insights.general;
}
