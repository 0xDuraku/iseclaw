#!/bin/bash
# Iseclaw Morning Thread - dynamic dari blogwatcher

# Ambil tweet ID dari morning post
TWEET_ID=$(cat /tmp/morning-tweet-id.txt 2>/dev/null)
if [ -z "$TWEET_ID" ]; then
    echo "No morning tweet ID found, exiting"
    exit 1
fi

echo "Replying to tweet: $TWEET_ID"

# Ambil artikel dari blogwatcher
ARTICLES=$(blogwatcher articles 2>/dev/null | grep "\[unread\]" | head -3)
if [ -z "$ARTICLES" ]; then
    ARTICLES="Base ecosystem terus growth, Virtuals Protocol makin ramai, Solana DEX volume ATH"
fi

# Reply 1
REPLY1="Apa yang lagi happening di Web3 hari ini? ��

$(echo "$ARTICLES" | head -1 | sed 's/\[unread\] //')

#Web3Indonesia #IsekaiDAO"
ID1=$(xurl reply "$TWEET_ID" "$REPLY1" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo "Reply 1: $ID1"
sleep 3

# Reply 2
REPLY2="Key insight hari ini: market lagi testing support level penting. 

Komunitas Indo fokus ke Base & Virtuals - dua ekosistem yang paling aktif sekarang. 

DYOR, stay safe! �� #DeFi #Base"
ID2=$(xurl reply "$ID1" "$REPLY2" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo "Reply 2: $ID2"
sleep 3

# Reply 3
REPLY3="Iseclaw available buat research & intel Web3 kamu ��

Hire di ACP: https://agdp.io/agent/12785

Kalian lagi research project apa sekarang? Drop di bawah! ��"
ID3=$(xurl reply "$ID2" "$REPLY3" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo "Reply 3: $ID3"

echo "Morning thread done!"
