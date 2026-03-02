# 🦞 Iseclaw — Autonomous AI Agent for Indonesian Web3

> Southeast Asia's first transparent AI agent, built on OpenClaw + Virtuals ACP

[![Live Dashboard](https://img.shields.io/badge/Dashboard-Live-00d4ff)](https://iseclaw.zerovantclaw.xyz)
[![ACP Marketplace](https://img.shields.io/badge/ACP-Marketplace-ff6b35)](https://agdp.io/agent/12785)
[![ClawHub](https://img.shields.io/badge/ClawHub-iseclaw--intel-7fff6b)](https://clawhub.ai/skills/iseclaw-intel)
[![Twitter](https://img.shields.io/badge/Twitter-@IsekaiDAO-1DA1F2)](https://twitter.com/IsekaiDAO)

## What is Iseclaw?

Iseclaw is an autonomous AI agent that provides real-time Indonesian Web3 intelligence — market signals, GameFi research, TGE analysis, and DeFi yield scanning. Built for the ACP ecosystem by IsekaiDAO community.

## 🚀 Features

- 🤖 **Autonomous** — runs 24/7, posts daily insights to Discord & Twitter
- 📊 **Real-time data** — CoinGecko + Fear & Greed API
- 🏪 **ACP Marketplace** — 11 service offerings, earn USDC per job
- 🔗 **Free Resources API** — open endpoints for other agents
- 🇮🇩 **Indonesia-first** — SEA market focus, Bahasa Indonesia support

## 📊 Live Dashboard

**https://iseclaw.zerovantclaw.xyz**

## 🌐 Free API Resources

| Endpoint          | Description                                   |
| ----------------- | --------------------------------------------- |
| `/market-pulse`   | Market sentiment, Fear & Greed, BTC dominance |
| `/indo-watchlist` | Real-time prices for Indo community tokens    |
| `/tge-calendar`   | Upcoming TGE + trending coins                 |

Base URL: `https://api.zerovantclaw.xyz`

## 🏪 ACP Service Offerings

| Service                 | Price | Description                      |
| ----------------------- | ----- | -------------------------------- |
| `indo_daily_brief` ⭐   | $0.30 | Instant Indo Web3 daily brief    |
| `token_signal`          | $0.15 | Entry/SL/TP signal for any token |
| `market_sentiment`      | $0.10 | Real-time sentiment scan         |
| `indonesian_web3_intel` | $0.20 | Deep SEA market intel            |
| `gamefi_research`       | $0.75 | GameFi deep dive                 |
| `tge_project_research`  | $1.00 | Full TGE research report         |
| `web3_thread_writer`    | $1.00 | Viral Web3 thread writing        |
| `whitepaper_tldr`       | $1.00 | Whitepaper summary               |
| `defi_yield_scan`       | $0.25 | DeFi yield opportunities         |
| `crypto_price_summary`  | $0.05 | Quick price + context            |
| `mutual_boost`          | $0.05 | Agent cross-promotion            |

## 🛠 Setup

```bash
npm install
cp .env.example .env
npm run seller:run
```

## 🧱 Architecture

```
Iseclaw
├── ACP Seller (OpenClaw)
├── Cron Jobs (Twitter + Discord)
├── Resources API
│ ├── /market-pulse
│ ├── /indo-watchlist
│ └── /tge-calendar
└── Dashboard (iseclaw.zerovantclaw.xyz)
```

## 💬 Community

- 🌐 [iseclaw.zerovantclaw.xyz](https://iseclaw.zerovantclaw.xyz)
- 💬 [Discord IsekaiDAO](https://discord.gg/Vx34ebmBcT)
- 🐦 [Twitter @IsekaiDAO](https://twitter.com/IsekaiDAO)
- 🏪 [ACP agdp.io/agent/12785](https://agdp.io/agent/12785)

---

_Built by [@0xDuraku](https://github.com/0xDuraku) | [🐦 @0xDuraku](https://x.com/0xDuraku) | IsekaiDAO | Indonesia 🇮🇩_
