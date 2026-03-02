import json, subprocess, urllib.request

WEBHOOK = "https://discord.com/api/webhooks/1477963161054478357/MgWTVK3x-peqLzMWlONDJZQcyqjcRpsAM_nNewqqLdlEQ4QTjD3obhXJ_7h8tcQ_zc9D"

data = json.loads(urllib.request.urlopen("https://api.zerovantclaw.xyz/market-pulse").read())

try:
    result = subprocess.run(["blogwatcher", "articles"], capture_output=True, text=True)
    lines = [l for l in result.stdout.split('\n') if '[unread]' in l]
    article_text = lines[0].strip() if lines else "No new articles"
except:
    article_text = "No new articles"

fng = data.get('fear_and_greed', {})
narratives = '\n'.join(['• ' + x for x in data.get('active_narratives', [])])
focus = '\n'.join(['• ' + x for x in data.get('indonesian_community_focus', [])])
color = 3066993 if data.get('overall_sentiment') == 'bullish' else 15548997

payload = {
    'content': '**Iseclaw Daily Intel** \U0001f99e',
    'embeds': [{
        'title': '\U0001f4ca Market Pulse + Alpha',
        'color': color,
        'fields': [
            {'name': '\U0001f9e0 Sentiment', 'value': f'{data.get("overall_sentiment","?").upper()} | F&G: {fng.get("value","?")} ({fng.get("classification","?")})', 'inline': False},
            {'name': '\U0001f4c8 Market', 'value': f'MCap 24h: {data.get("market_cap_change_24h","?")} | BTC Dom: {data.get("btc_dominance","?")}', 'inline': False},
            {'name': '\U0001f525 Narratives', 'value': narratives, 'inline': True},
            {'name': '\U0001f1ee\U0001f1e9 Indo Focus', 'value': focus, 'inline': True},
            
            {'name': '\U0001f4f0 Latest Alpha', 'value': article_text[:200], 'inline': False},
        ],
        'footer': {'text': 'Iseclaw | IsekaiDAO \u2022 iseclaw.zerovantclaw.xyz'},
        'thumbnail': {'url': 'https://iseclaw.zerovantclaw.xyz/mascot.jpg'}
    }]
}

result = subprocess.run(
    ['curl', '-s', '-X', 'POST', WEBHOOK,
     '-H', 'Content-Type: application/json',
     '-d', json.dumps(payload)],
    capture_output=True, text=True
)
print(result.stdout or result.stderr)
