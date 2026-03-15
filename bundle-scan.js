#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const _raw = fs.readFileSync('/root/.env','utf8').split('\n');
const _env = {};
_raw.forEach(l => { const i = l.indexOf('='); if(i>0) _env[l.slice(0,i).trim()] = l.slice(i+1).trim(); });

const HELIUS_KEY = _env['HELIUS_API_KEY'];
const BIRDEYE_KEY = _env['BIRDEYE_API_KEY'];
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;

const KNOWN_PROGRAMS = {
  '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1': { label: 'Raydium AMM', type: 'lp' },
  '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5': { label: 'Raydium CLMM', type: 'lp' },
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK': { label: 'Raydium CPMM', type: 'lp' },
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP': { label: 'Orca Whirlpool', type: 'lp' },
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': { label: 'Orca', type: 'lp' },
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': { label: 'Jupiter', type: 'dex' },
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': { label: 'Pump.fun', type: 'launchpad' },
  '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg': { label: 'Pump.fun AMM', type: 'launchpad' },
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo': { label: 'Meteora DLMM', type: 'lp' },
  'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EkfAj58': { label: 'Meteora AMM', type: 'lp' },
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': { label: 'Token Program', type: 'program' },
  'So11111111111111111111111111111111111111112': { label: 'Wrapped SOL', type: 'token' },
};

const KNOWN_CEX = {
  // BINANCE
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': 'Binance',
  '5tzFkiKscXHK5ZXCGbXZxdw7gd8btjk7VFRvnNHokiVA': 'Binance',
  '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9': 'Binance',
  'H8BgJgae6qhMtf7BM2JtddywSQt11WdxHHxkGLNX5hss': 'Binance',
  'c5f9zfpkKMD9N8uLqJcFeJAAz7v12vDMnup9Y6EeQkk': 'Binance',
  'G7vNg68KfbjVLCTc8Uw9JVmaC4ZajpX97ApkToBqvviy': 'Binance',
  'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2': 'Binance',
  'HZoLTgBDqs6RiKNiXSBdBHbHFrXCEcASnVhJpMqrUSHY': 'Binance',
  '2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S': 'Binance',
  'DfiQgSvpW3x4GBBbFSKbFDGBVtFRqvzEWBSoFgQLYGnd': 'Binance',
  'Htp9MGP8Tig923ZFY7Qf2zzbMUmYneFRAhSp7vSg4wxV': 'Binance',
  // OKX
  'CBEADkb8TZAXHjVE3zwad4L995GZE7rJcacJ7asebkVG': 'OKX',
  'U6ou7nCsA8CeHQG6ZBsgBUFCTxoFfTXZFgGVUwCEFDr': 'OKX',
  'FWznbcNXWQuHTawe9RxvQ2LdCENssh12dsznf4RiouN5': 'OKX',
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn39QZ': 'OKX',
  'HksEFDMQSMfJuScswQLGTYdNhGXrSBEEoFMnHmCBGxNh': 'OKX',
  // BYBIT
  'A77HErqDzCEBQEyFJQnmCZPFtPYqkrrtEoxEq4LXPAJG': 'Bybit',
  'CkxBMoTxUuJcJxRFnq1mBgSpkHo4pFSJgEpkBB4frGmb': 'Bybit',
  // COINBASE
  'AobVSwdW7NsVhGSxMFQNBqQNs98Xj2p4LMpfbTCFEkS6': 'Coinbase',
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS': 'Coinbase',
  'GJnM2nd1gs7BSZD44RKXN8RXMVq1pJYuxhsWLNa6HVSY': 'Coinbase',
  // KRAKEN
  '6LY1JzAFVZsP2a2xKrtU6znQMQ5h4i7tocWdgrkZzkzF': 'Kraken',
  'HzKVUmEAuaf8nV3tcJk2uZKohmLwtk1351ASCdqT5B8q': 'Kraken',
  '5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD': 'Kraken',
  // HTX / HUOBI
  'HTSaKFkxNaLJVToSmDY5XTLaW5GSJgNRLQEPurWMj3qY': 'HTX',
  'AohM2HjVkDEFBFiSjLRSH3NMnXuLNXsMhXbRf4DLBF4E': 'HTX',
  'HuakuXAjFLx8i1Z2BHGBP9YDdSLQPnXSmUWKqx9DhzMq': 'HTX',
  'BbPEPBrMP5FvfVTqf9LnNTzHVo9AvjVuoQRGZ6n4n3Fo': 'HTX',
  'Fz1jnS6fNSfwX3N1E2uhwHnSMHuMHpCwEJUBZsDanpGE': 'HTX',
  '7MWYiCAkZmyFZo7FVk1MQEN8RgXzb4d3GhHaxKGTfg5w': 'HTX',
  // BITGET
  'JBskiRMBt6TBMGAZQxMnKSFkLCFiuMkNUPNBFBHiVnFr': 'Bitget',
  'BmFdpraQhkiDnE9SmkFo7dCR9e5iFzBiNu4TXZB5N67': 'Bitget',
  '7TWnq4WeYcwQWBCwKeEX2Q9xqVtthPGkB7adNvueuVuh': 'Bitget',
  // KUCOIN
  'GUBHAJBx2QQNRTJfGHdtqk2GGLS5T3RfPRSt2SKbCjFo': 'KuCoin',
  'FPRFLszBJFHCThF2yWvkGkfvtwyFPRGX9MFHnDGP6UYp': 'KuCoin',
  // GATE.IO
  'u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w': 'Gate.io',
  '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo': 'Gate.io',
  // MEXC
  'ASTyfSima4LLAdDgoFGkgqoKowG1LZFDr9fAQrg7iaJZ': 'MEXC',
  'MEXCuMwQEUCJZBYBdmGy4V7jUNUijmASH8kLqGnGGjY': 'MEXC',
  '2JJYD5SB4ZfmuBx2Bfes1cXJSMJVuBSwNNe4DZ1s8Mih': 'MEXC',
  'rMExcxVTCftFmRLYPCtApHqK7h2FwVeVQKBr39qzPkA': 'MEXC',
  // BITFINEX
  'FxteHmLwG9nk1eL4pjNve3Eub2goGkkz6g6TbvdmW46a': 'Bitfinex',
  'E7gNFBvQhiHUDMhAFtWFdHAKnqeNWfF1LR5jhGVPNJNW': 'Bitfinex',
  // BITHUMB
  '8Mm46CsqxiyAputDUp2cXHg41HE3BfynTeMBDwzrMZQH': 'Bithumb',
  // UPBIT
  '7mhcgF1DVsj5iv4CxZDgp51H6MBBwqamsH1KnqXhSRc5': 'Upbit',
  // CRYPTO.COM
  '22Wnk8PwyWZV7BfkZGJEKT9jGGdtvu7xY6EXeRh7zkBa': 'Crypto.com',
  '6FEVkH17P9y8Q9aCkDdPcMDjvj7SVxrTETaYEm8f51Jy': 'Crypto.com',
  // ROBINHOOD
  '8Tp9fFkZ2KcRBLYDTUNXo98Ez6ojGb6MZEPXfGDdeBzG': 'Robinhood',
  '4xLpwxgYuPwPvtQjE94RLS4WZ4aD8NJYYKr2AJk99Qdg': 'Robinhood',
  // OTHERS
  '8Vkgsarud8mSc1gkzayGA7XhNQfq4wDJRxTWDgq8RaJD': 'Bullish',
  '4GC3a1RkRXx5shwGP8pTY6cxXgSWkbfc66vM53a6qSKj': 'CoinSpot',
  '3B7XAQrLoEMDEGvX8569F9GRb9PcXXocJmj5wvhhei9z': 'BtcTurk',
};

const KNOWN_KOL = {
  // Top Solana KOLs & Influencers
  'GUFxwDrsLzSQ27xxTLe2tfnSRGQKBTmNSamNo7KCCMoE': 'Ansem',
  'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWgdprE': 'Hsaka',
  'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq': 'Cobie',
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': 'Lookonchain',
  'AVmoTMpSHBsJMmyAFHZhWBnwUJnKWjxKpAbDhiaTkwY3': 'Murad',
  '9RmMVgktBJJrJFkjBkqYN2CBBG7zJzgTCtLAqETKmCD': 'Blknoiz06',
  'FnCpojBJ2HQSGiMVb5xJnCRjBzSHEhNgRaEXkAEMkN2': 'DegenSpartan',
  'AbUnVe2YUJX7HnKWLCE7ymGmKBNnZ2bm5WMGt8r3UJVd': 'Giganticrebirth',
  'HVkVj7QAKzGAdBc9JEqPNg5opR2GRmKnHzLHMaGMvFTG': 'ZachXBT',
  'EarRnRfPkq7yt6grFPBvpCBBCcCKmFSGYpH6JaGBaF1Q': 'Pentoshi',
  // Smart Money / Profitable Wallets
  'AS2RrHHHFMwzMBFEeXKJaGgLUeGBnJYTg3aEWKR5cQiH': 'Smart Money #1',
  'BpFi9E5MhzKBCF1mJZERN26GhJjLjnN8S1bP5FVSFZUx': 'Smart Money #2',
  'Ek4WECfvpRgJkCg7XBMtfuMSPj5P5j4V8WHhLzfNn6G7': 'Smart Money #3',
  'CUWd4B3nJJbvJBRTBxzNBHKRK3bGTVHRnvVN3JkGfAPC': 'Whale Wallet',
  // Funds & DAOs
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bN8': 'Alpha Fund',
};

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch(e) { reject(e) } });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Iseclaw/1.0', ...headers } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch(e) { reject(e) } });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getTokenInfo(mint) {
  const overviewResp = await get(
    `https://public-api.birdeye.so/defi/token_overview?address=${mint}`,
    { 'X-API-KEY': BIRDEYE_KEY, 'X-Chain': 'solana' }
  );
  await sleep(400);
  const securityResp = await get(
    `https://public-api.birdeye.so/defi/token_security?address=${mint}`,
    { 'X-API-KEY': BIRDEYE_KEY, 'X-Chain': 'solana' }
  );
  const d = overviewResp?.data;
  if (d) {
    d.marketCap = d.marketCap || d.mc || d.fdv || 0;
    d.liquidity = d.liquidity || 0;
    d.logoURI = d.logoURI || d.logo || '';
    d.volume24h = d.v24hUSD || d.volume24h || 0;
    d.volume24hChange = d.v24hChangePercent || 0;
  }
  return { overview: d, security: securityResp?.data };
}

async function getTokenMetadata(mint) {
  const data = await post(HELIUS_RPC, {
    jsonrpc: '2.0', id: 1, method: 'getAsset', params: { id: mint }
  });
  return data?.result || null;
}

async function getDexScreenerData(mint) {
  try {
    const data = await get(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
    const pair = data?.pairs?.[0];
    if (!pair) return null;
    return {
      dexUrl: pair.url,
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
      priceUsd: pair.priceUsd,
      volume24h: pair.volume?.h24,
      liquidity: pair.liquidity?.usd,
      fdv: pair.fdv,
      txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
      priceChange24h: pair.priceChange?.h24,
      dexPaid: !!(pair.boosts?.active > 0 || pair.profile?.header || pair.profile?.links?.length > 0 || pair.info?.header || pair.labels?.includes('dexpaid')),
      isCto: !!(pair.labels?.includes('cto') || pair.info?.description?.toLowerCase().includes('community takeover') || pair.info?.description?.toLowerCase().includes('cto')),
      info: pair.info || null,
      socials: pair.info?.socials || [],
      websites: pair.info?.websites || [],
    };
  } catch(e) { return null; }
}

async function getTopHolders(mint) {
  const data = await post(HELIUS_RPC, {
    jsonrpc: '2.0', id: 1, method: 'getTokenLargestAccounts', params: [mint]
  });
  return data?.result?.value || [];
}

async function getLaunchTxns(mint) {
  const data = await post(HELIUS_RPC, {
    jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
    params: [mint, { limit: 50, commitment: 'confirmed' }]
  });
  return data?.result || [];
}

async function getTokenAccountOwner(tokenAccount) {
  try {
    const data = await post(HELIUS_RPC, {
      jsonrpc: '2.0', id: 1, method: 'getAccountInfo',
      params: [tokenAccount, { encoding: 'jsonParsed' }]
    });
    const parsed = data?.result?.value?.data?.parsed;
    // Token account owner is in parsed.info.owner
    return parsed?.info?.owner || null;
  } catch(e) { return null; }
}

async function getWalletDetails(wallet) {
  try {
    // Sequential to avoid rate limit
    const balResp = await post(HELIUS_RPC, { jsonrpc: '2.0', id: 1, method: 'getBalance', params: [wallet] });
    await sleep(100);
    const sigsResp = await post(HELIUS_RPC, { jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [wallet, { limit: 1000 }] });
    
    const solBalance = (balResp?.result?.value || 0) / 1e9;
    const allSigs = sigsResp?.result || [];
    const oldest = allSigs.length > 0 ? allSigs[allSigs.length - 1] : null;
    const firstSeen = oldest?.blockTime ? new Date(oldest.blockTime * 1000).toISOString().split('T')[0] : null;
    const ageDays = firstSeen ? Math.floor((Date.now() - new Date(firstSeen).getTime()) / 86400000) : null;
    return { 
      solBalance: +solBalance.toFixed(4), 
      firstSeen, 
      ageDays, 
      totalTxns: allSigs.length,
      isOldWallet: ageDays ? ageDays > 365 : false
    };
  } catch(e) { 
    console.error('getWalletDetails error:', e.message);
    return { solBalance: null, firstSeen: null, ageDays: null, totalTxns: 0, isOldWallet: false }; 
  }
}

async function findIncomingFunderFast(wallet) {
  // Fast version: only check oldest 5 txns, minimal delay
  const sigs = await post(HELIUS_RPC, {
    jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
    params: [wallet, { limit: 20 }]
  });
  const allSigs = sigs?.result || [];
  if (!allSigs.length) return null;
  for (const sig of [...allSigs].reverse().slice(0, 5)) {
    try {
      const tx = await post(HELIUS_RPC, {
        jsonrpc: '2.0', id: 1, method: 'getTransaction',
        params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
      });
      const res = tx?.result;
      if (!res) continue;
      const accounts = res.transaction?.message?.accountKeys || [];
      const fp = accounts[0]?.pubkey;
      const pre = res.meta?.preBalances || [];
      const post2 = res.meta?.postBalances || [];
      const idx = accounts.findIndex(a => a.pubkey === wallet);
      if (idx < 0) continue;
      const received = (post2[idx]||0) - (pre[idx]||0);
      if (received >= 500000 && fp && fp !== wallet) return fp;
    } catch(e) { /* skip */ }
    await sleep(40);
  }
  return null;
}

async function findIncomingFunder(wallet) {
  const sigs = await post(HELIUS_RPC, {
    jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
    params: [wallet, { limit: 100 }]
  });
  const allSigs = sigs?.result || [];
  if (!allSigs.length) return null;
  for (const sig of [...allSigs].reverse().slice(0, 30)) {
    try {
      await sleep(60);
      const tx = await post(HELIUS_RPC, {
        jsonrpc: '2.0', id: 1, method: 'getTransaction',
        params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
      });
      const res = tx?.result;
      if (!res) continue;
      const accounts = res.transaction?.message?.accountKeys || [];
      const fp = accounts[0]?.pubkey;
      const pre = res.meta?.preBalances || [];
      const post2 = res.meta?.postBalances || [];
      const idx = accounts.findIndex(a => a.pubkey === wallet);
      if (idx < 0) continue;
      const received = (post2[idx]||0) - (pre[idx]||0);
      if (received >= 500000 && fp && fp !== wallet) return fp;
    } catch(e) { /* skip */ }
  }
  return null;
}

async function getWalletFundingSource(wallet, maxHops = 3) {
  try {
    if (KNOWN_CEX[wallet]) return { source: wallet, label: KNOWN_CEX[wallet], type: 'cex', hops: 0 };
    if (KNOWN_PROGRAMS[wallet]) return { source: wallet, label: KNOWN_PROGRAMS[wallet].label, type: KNOWN_PROGRAMS[wallet].type, hops: 0 };
    if (KNOWN_KOL[wallet]) return { source: wallet, label: KNOWN_KOL[wallet], type: 'kol', hops: 0 };

    let current = wallet;
    const visited = new Set([wallet]);

    for (let hop = 1; hop <= maxHops; hop++) {
      const funder = await findIncomingFunderFast(current);
      if (!funder || visited.has(funder)) {
        const sigs2 = await post(HELIUS_RPC, {
          jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
          params: [current, { limit: 5 }]
        });
        const txCount = sigs2?.result?.length || 0;
        if (txCount === 0) return { source: current, label: 'Fresh Wallet', type: 'fresh', hops: hop-1 };
        return { source: current, label: current.slice(0,8)+'...'+current.slice(-4), type: 'unknown', hops: hop-1 };
      }
      if (KNOWN_CEX[funder]) return { source: funder, label: KNOWN_CEX[funder], type: 'cex', hops: hop };
      if (KNOWN_KOL[funder]) return { source: funder, label: KNOWN_KOL[funder], type: 'kol', hops: hop };
      if (KNOWN_PROGRAMS[funder]) return { source: funder, label: KNOWN_PROGRAMS[funder].label, type: KNOWN_PROGRAMS[funder].type, hops: hop };
      visited.add(funder);
      current = funder;
      await sleep(100);
    }
    return { source: current, label: current.slice(0,8)+'...'+current.slice(-4), type: 'unknown', hops: maxHops };
  } catch(e) {
    return { source: wallet, label: wallet.slice(0,8)+'...'+wallet.slice(-4), type: 'unknown', hops: 0 };
  }
}


async function getTokenATH(mint) {
  try {
    const data = await get(
      `https://public-api.birdeye.so/defi/token_overview?address=${mint}`,
      { 'X-API-KEY': BIRDEYE_KEY, 'X-Chain': 'solana' }
    );
    const d = data?.data;
    return {
      athPrice: d?.price || 0,
      symbol: d?.symbol || '?',
      name: d?.name || '?',
      marketCap: d?.marketCap || d?.fdv || 0,
    };
  } catch(e) { return null; }
}

async function analyzeDevWallet(devWallet, currentMint) {
  try {
    const sigs = await post(HELIUS_RPC, {
      jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
      params: [devWallet, { limit: 100 }]
    });
    const allSigs = sigs?.result || [];
    let deployCount = 0;
    const deployedTokens = [];

    for (const sig of allSigs.slice(0, 40)) {
      try {
        const tx = await post(HELIUS_RPC, {
          jsonrpc: '2.0', id: 1, method: 'getTransaction',
          params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
        });
        const instructions = tx?.result?.transaction?.message?.instructions || [];
        const innerInstructions = tx?.result?.meta?.innerInstructions || [];
        const allIx = [...instructions, ...innerInstructions.flatMap(i => i.instructions || [])];
        
        const hasInitMint = allIx.some(ix =>
          ix.parsed?.type === 'initializeMint' ||
          ix.parsed?.type === 'initializeMint2'
        );
        if (hasInitMint) {
          deployCount++;
          const postBals = tx?.result?.meta?.postTokenBalances || [];
          const mintAddr = postBals.find(b => b.mint && b.mint !== currentMint)?.mint;
          if (mintAddr && !deployedTokens.find(t => t.mint === mintAddr)) {
            deployedTokens.push({ mint: mintAddr, symbol: '?', athMcap: 0 });
          }
        }
        await sleep(60);
      } catch(e) { /* skip */ }
    }

    // Fetch token info for deployed tokens
    for (const token of deployedTokens.slice(0, 3)) {
      try {
        await sleep(300);
        const info = await getTokenATH(token.mint);
        if (info) {
          token.symbol = info.symbol;
          token.name = info.name;
          token.athMcap = info.marketCap;
        }
      } catch(e) { /* skip */ }
    }

    const funding = await getWalletFundingSource(devWallet, 8); // deep trace for dev

    return {
      wallet: devWallet,
      deployCount: deployCount || 1,
      deployedTokens: deployedTokens.slice(0, 5),
      fundingSource: funding,
      totalTxns: allSigs.length,
    };
  } catch(e) {
    return { wallet: devWallet, deployCount: 1, deployedTokens: [], fundingSource: { label: 'Unknown', type: 'unknown' }, totalTxns: 0 };
  }
}

function detectSnipers(buyers, launchSlot) {
  if (!launchSlot) return [];
  return buyers
    .filter(b => (b.slot - launchSlot) <= 5)
    .map(b => ({
      ...b,
      sniperScore: Math.max(0, Math.round(100 - (b.slot - launchSlot) * 20)),
      type: 'sniper'
    }))
    .sort((a, b) => b.sniperScore - a.sniperScore);
}

async function analyzeLaunchWindow(mint, sigs) {
  const earliest = sigs.slice(-15);
  const buyers = [];
  let launchSlot = null;

  for (const sig of earliest) {
    try {
      const tx = await post(HELIUS_RPC, {
        jsonrpc: '2.0', id: 1, method: 'getTransaction',
        params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
      });
      const res = tx?.result;
      if (!res) continue;
      const feePayer = res.transaction?.message?.accountKeys?.[0]?.pubkey;
      const slot = res.slot;
      if (!launchSlot || slot < launchSlot) launchSlot = slot;
      if (feePayer && feePayer !== mint) {
        buyers.push({ wallet: feePayer, slot, blockTime: res.blockTime, sig: sig.signature });
      }
      await sleep(60);
    } catch(e) { /* skip */ }
  }

  const bySlot = {};
  buyers.forEach(b => {
    bySlot[b.slot] = bySlot[b.slot] || [];
    bySlot[b.slot].push(b);
  });

  const coordinated = Object.entries(bySlot)
    .filter(([, wallets]) => wallets.length >= 2)
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const snipers = detectSnipers(buyers, launchSlot);
  return { buyers, bySlot, coordinated, launchBlocks: coordinated.length, snipers, launchSlot };
}

function analyzeTokenProperties(security, metadata) {
  const props = { mintable: false, freezable: false, metadataMutable: false, rugCheckScore: 0 };
  if (security) {
    props.mintable = security.mintAuthorityAddress != null;
    props.freezable = security.freezeAuthorityAddress != null;
  }
  if (metadata) props.metadataMutable = metadata.mutable || false;
  let score = 0;
  if (!props.mintable) score += 25;
  if (!props.freezable) score += 25;
  if (!props.metadataMutable) score += 25;
  score += 25; // LP lock assumed
  props.rugCheckScore = score;
  return props;
}

function scoreRisk(data) {
  let score = 0;
  const flags = [];

  // Only count as risk if top holder is NOT an LP
  if (!data.topHolderIsLP) {
    if (data.devSupplyPct > 20) { score += 30; flags.push(`Top holder kuasai ${data.devSupplyPct.toFixed(1)}% supply — sangat tinggi`); }
    else if (data.devSupplyPct > 10) { score += 15; flags.push(`Top holder kuasai ${data.devSupplyPct.toFixed(1)}% supply`); }
  }

  if (data.top10Pct > 60) { score += 20; flags.push(`Top 10 holders kuasai ${data.top10Pct.toFixed(1)}% supply`); }
  else if (data.top10Pct > 40) { score += 10; }

  if (data.coordinatedBuys >= 3) { score += 25; flags.push(`${data.coordinatedBuys} kelompok coordinated buy di launch`); }
  else if (data.coordinatedBuys >= 1) { score += 12; flags.push(`${data.coordinatedBuys} kelompok coordinated buy terdeteksi`); }

  if (data.sniperCount >= 5) { score += 15; flags.push(`${data.sniperCount} sniper bots di launch`); }
  else if (data.sniperCount >= 2) { score += 8; flags.push(`${data.sniperCount} sniper bots terdeteksi`); }

  if (data.devDeployCount > 5) { score += 10; flags.push(`Dev sudah deploy ${data.devDeployCount} token sebelumnya`); }
  else if (data.devDeployCount > 2) { score += 5; flags.push(`Dev sudah deploy ${data.devDeployCount} token sebelumnya`); }

  if (data.tokenProps?.mintable) { score += 15; flags.push('Mint authority aktif — supply bisa ditambah'); }
  if (data.tokenProps?.freezable) { score += 10; flags.push('Freeze authority aktif'); }
  if (data.tokenProps?.metadataMutable) { score += 5; flags.push('Metadata bisa diubah'); }

  return { score: Math.min(100, score), level: score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW', flags };
}

async function analyze(mint) {
  console.log(`\nIseclaw Bundle Scanner — ${mint}`);
  console.log('='.repeat(70));

  console.log('[1/7] Token info + DexScreener...');
  const [{ overview, security }, dex] = await Promise.all([
    getTokenInfo(mint),
    getDexScreenerData(mint),
  ]);

  console.log('[2/7] Token metadata...');
  const metadata = await getTokenMetadata(mint);

  console.log('[3/7] Top holders...');
  const holders = await getTopHolders(mint);

  console.log('[4/7] Launch transactions...');
  const sigs = await getLaunchTxns(mint);

  console.log('[5/7] Launch window + snipers...');
  const launchData = await analyzeLaunchWindow(mint, sigs);

  const tokenProps = analyzeTokenProperties(security, metadata);
  const totalSupply = holders.reduce((s, h) => s + Number(h.amount || 0), 0);
  const top1Pct = holders[0] ? (Number(holders[0].amount) / totalSupply * 100) : 0;
  const top10Pct = holders.slice(0, 10).reduce((s, h) => s + Number(h.amount || 0), 0) / totalSupply * 100;

  console.log('[6/7] Wallet funding sources...');
  const fundingSources = {};
  const holderDetails = [];
  let devWalletAddr = null;
  const kolPresent = [];

  for (let i = 0; i < Math.min(holders.length, 10); i++) {
    const holder = holders[i];
    try {
      // Step 1: get token account owner
      const owner = await getTokenAccountOwner(holder.address);
      await sleep(120);

      const pct = Number(holder.amount) / totalSupply * 100;
      const isLP = owner ? KNOWN_PROGRAMS[owner] : null;
      const isKOL = owner ? KNOWN_KOL[owner] : null;

      // Step 2: wallet details - only for non-LP wallets, skip known CEX
      let walletDetails = { solBalance: null, firstSeen: null, ageDays: null, totalTxns: 0 };
      const isKnownCEX = owner && Object.keys(KNOWN_CEX).includes(owner);
      if (owner && !isLP && !isKnownCEX) {
        walletDetails = await getWalletDetails(owner);
        await sleep(60);
      }

      // Step 3: funding source
      let funding = { 
        label: owner ? (owner.slice(0,8)+'...'+owner.slice(-4)) : 'Unknown', 
        type: 'unknown', 
        source: owner || 'unknown' 
      };
      if (owner && !isLP) {
        funding = await getWalletFundingSource(owner);
        await sleep(60);
      }

      if (isKOL) kolPresent.push({ wallet: owner, name: isKOL, pct: +pct.toFixed(2) });
      if (!devWalletAddr && !isLP && i < 3 && pct > 3) devWalletAddr = owner;

      const detail = {
        tokenAccount: holder.address,
        owner: owner || null,
        pct: +pct.toFixed(2),
        amount: holder.amount,
        isLP: !!isLP,
        lpLabel: isLP?.label || null,
        isKOL: !!isKOL,
        kolLabel: isKOL || null,
        funding,
        rank: i + 1,
        solBalance: walletDetails.solBalance,
        firstSeen: walletDetails.firstSeen,
        ageDays: walletDetails.ageDays,
        totalTxns: walletDetails.totalTxns,
      };
      holderDetails.push(detail);

      // Aggregate funding sources
      const label = isLP 
        ? ('LP: ' + isLP.label) 
        : (isKOL ? ('KOL: ' + isKOL) : funding.label);
      fundingSources[label] = fundingSources[label] || { 
        count: 0, pct: 0, wallets: [], type: isLP ? 'lp' : funding.type 
      };
      fundingSources[label].count++;
      fundingSources[label].pct += pct;
      if (owner) fundingSources[label].wallets.push(owner);

    } catch(e) {
      console.error('Holder ' + i + ' error:', e.message);
    }
  }

    console.log('[7/7] Dev wallet analysis...');
  let devAnalysis = null;
  if (devWalletAddr) {
    devAnalysis = await analyzeDevWallet(devWalletAddr, mint);
  }

  const deepNetworks = Object.entries(fundingSources)
    .filter(([src, d]) => d.count >= 2 && !src.startsWith('LP:'))
    .sort((a, b) => b[1].pct - a[1].pct)
    .map(([name, d]) => ({ name, ...d }));

  const snipers = launchData.snipers || [];
  const avgSniperScore = snipers.length > 0
    ? Math.round(snipers.reduce((s, x) => s + x.sniperScore, 0) / snipers.length) : 0;

  // Check if top holder is LP
  const topHolderIsLP = holderDetails[0]?.isLP || false;
  const effectiveDevPct = topHolderIsLP ? (holderDetails[1]?.pct || 0) : top1Pct;

  const risk = scoreRisk({
    devSupplyPct: effectiveDevPct,
    top10Pct,
    topHolderIsLP,
    coordinatedBuys: launchData.coordinated.length,
    sniperCount: snipers.length,
    devDeployCount: devAnalysis?.deployCount || 0,
    tokenProps
  });

  const result = {
    mint,
    symbol: overview?.symbol || 'UNKNOWN',
    name: overview?.name || 'Unknown',
    logoURI: overview?.logoURI || '',
    price: overview?.price || dex?.priceUsd ? Number(dex?.priceUsd) : null,
    marketCap: overview?.marketCap || dex?.fdv || 0,
    liquidity: overview?.liquidity || dex?.liquidity || 0,
    volume24h: overview?.volume24h || dex?.volume24h || 0,
    volume24hChange: overview?.volume24hChange || 0,
    priceChange24h: dex?.priceChange24h || 0,
    dex: dex ? {
      url: dex.dexUrl,
      id: dex.dexId,
      pairAddress: dex.pairAddress,
      txns24h: dex.txns24h,
      paid: dex.dexPaid,
      isCto: dex.isCto,
      socials: dex.socials,
      websites: dex.websites,
    } : null,
    holders: { total: overview?.holder || holders.length, top1Pct: +top1Pct.toFixed(2), top10Pct: +top10Pct.toFixed(2), details: holderDetails },
    tokenProps,
    launchWindow: {
      totalTxns: sigs.length, earlyBuyers: launchData.buyers.length,
      coordinatedGroups: launchData.coordinated.length,
      launchBlocks: launchData.launchBlocks,
      snipers: snipers.slice(0, 10), sniperCount: snipers.length, avgSniperScore,
    },
    devWallet: devAnalysis,
    kolPresent,
    fundingDistribution: fundingSources,
    deepNetworks,
    risk,
    scannedAt: new Date().toISOString()
  };

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log(`${result.symbol} | $${result.price?.toFixed(4)} | MCap: $${(result.marketCap/1e6).toFixed(1)}M | Vol24h: $${(result.volume24h/1e3).toFixed(0)}K`);
  console.log(`DEX: ${dex?.dexId || 'N/A'} | Paid: ${dex?.dexPaid ? 'YES' : 'No'}`);
  console.log(`RISK: ${risk.score}/100 [${risk.level}]`);
  console.log(`Snipers: ${snipers.length} | Dev deploys: ${devAnalysis?.deployCount || '?'}`);
  console.log(`KOLs present: ${kolPresent.length > 0 ? kolPresent.map(k=>k.name).join(', ') : 'None detected'}`);
  console.log('\nFunding:');
  Object.entries(fundingSources).slice(0,6).forEach(([s,d]) => console.log(`  ${s.padEnd(22)}: ${d.count}w ${d.pct.toFixed(1)}%`));
  console.log('\nFlags:');
  risk.flags.forEach(f => console.log(`  [!] ${f}`));

  if (process.env.JSON_OUTPUT) process.stdout.write('\nJSON_RESULT:' + JSON.stringify(result) + '\n');
  return result;
}

const mint = process.argv[2];
if (!mint) { console.error('Usage: node bundle-scan.js <token_address>'); process.exit(1); }
analyze(mint).catch(console.error);
