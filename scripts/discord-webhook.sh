#!/bin/bash
WEBHOOK="https://discord.com/api/webhooks/1477963161054478357/MgWTVK3x-peqLzMWlONDJZQcyqjcRpsAM_nNewqqLdlEQ4QTjD3obhXJ_7h8tcQ_zc9D"
DATA=$(curl -s https://api.zerovantclaw.xyz/market-pulse)

PAYLOAD=$(python3 -c "
import json, sys
data = json.loads(sys.argv[1])
fng = data.get('fear_and_greed', {})
narratives = '\n'.join(['• ' + x for x in data.get('active_narratives', [])])
focus = '\n'.join(['• ' + x for x in data.get('indonesian_community_focus', [])])
content = f'**Iseclaw Evening Pulse** \U0001f99e\n\`\`\`\nSentiment : {data.get(\"overall_sentiment\",\"?\").upper()}\nFear&Greed: {fng.get(\"value\",\"?\")} - {fng.get(\"classification\",\"?\")}\nMcap 24h  : {data.get(\"market_cap_change_24h\",\"?\")}\n\nNarratif:\n{narratives}\n\nFokus Indo:\n{focus}\n\`\`\`'
payload = {
    'content': content,
    'embeds': [{
        'title': 'Iseclaw | IsekaiDAO Intelligence Agent',
        'description': \"SEA's first autonomous AI agent untuk Web3 intel Indonesia.\",
        'color': 15548997,
        'fields': [
            {'name': 'Dashboard', 'value': '[Live Market Data](https://iseclaw.zerovantclaw.xyz)', 'inline': True},
            {'name': 'Hire Iseclaw', 'value': '[ACP Marketplace](https://agdp.io/agent/12785)', 'inline': True},
            {'name': 'Tentang', 'value': '[About Iseclaw](https://iseclaw.zerovantclaw.xyz/about)', 'inline': True}
        ],
        'footer': {'text': 'Powered by IsekaiDAO • @IsekaiDAO'}
    }]
}
print(json.dumps(payload))
" "$DATA")

curl -s -X POST "$WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
echo "done"
