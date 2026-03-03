#!/bin/bash
TOPICS=(
    "Base ecosystem growth dan peluang developer Indonesia"
    "Solana AI agents dan masa depan DeFi"
    "Virtuals Protocol agent economy Indonesia"
    "Monad testnet dan kenapa penting untuk Web3 Indonesia"
    "DeFi yield farming terbaik untuk pemula Indonesia"
    "NFT gaming di Indonesia masih worth it gak di 2026"
    "AI agents dan masa depan kerja di Web3"
    "Stablecoin yields terbaik untuk komunitas Indonesia"
)

TOPIC=$(blogwatcher articles 2>/dev/null | grep -m1 "\[unread\]" | sed 's/.*\[unread\] //' | cut -c1-80)
if [ -z "$TOPIC" ]; then
    TOPIC=${TOPICS[$((RANDOM % ${#TOPICS[@]}))]}
fi

echo "$(date): Topic: $TOPIC"
python3 /root/youtube_shorts.py "$TOPIC"
echo "$(date): Done"
