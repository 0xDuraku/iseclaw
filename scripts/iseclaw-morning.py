import subprocess, os, json, time, random, re, sys
sys.path.insert(0, '/root/iseclaw-acp/scripts')
from fetch_article import fetch_insight
from datetime import datetime

def get_tweet_id(file):
    try:
        return open(file).read().strip()
    except:
        return None

def upload_media(image_path):
    if not image_path or not os.path.exists(image_path):
        print(f"  No image at: {image_path}")
        return None
    result = subprocess.run(
        ['xurl', 'media', 'upload', image_path, '--category', 'tweet_image', '--media-type', 'image/jpeg'],
        capture_output=True, text=True
    )
    try:
        first_line = result.stdout.strip().split(chr(10))[0]
        data = json.loads(first_line)
        media_id = data['data']['id']
        print(f"  Media uploaded: {media_id}")
        return media_id
    except:
        clean = re.sub(r'\x1b\[\d+m', '', result.stdout)
        match = re.search(r'Media ID[:\s]+(\d+)', clean)
        if match:
            print(f"  Media uploaded: {match.group(1)}")
            return match.group(1)
    print(f"  Media upload failed: {result.stdout[:150]}")
    return None

def post_reply_with_image(tweet_id, text, image_path=None, media_id=None):
    if not tweet_id:
        print("  Skipping: no parent tweet ID")
        return None
    cmd = ['xurl', 'reply', tweet_id, text]
    if image_path:
        media_id = upload_media(image_path)
        if media_id:
            cmd += ['--media-id', media_id]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        if 'data' in data:
            return data['data']['id']
        else:
            print("Error:", json.dumps(data, indent=2))
            return None
    except:
        print("Error:", result.stdout[:200], result.stderr[:200])
        return None

def generate_image(scene_key, filename):
    result = subprocess.run(
        ['bash', '/root/poster-by-scene.sh', scene_key, filename],
        capture_output=True, text=True
    )
    print(f"  Image gen ({scene_key}): rc={result.returncode}")
    jpg = f"/var/www/iseclaw/{filename}.jpg"
    if os.path.exists(jpg):
        return jpg
    webp = f"/var/www/iseclaw/{filename}.webp"
    if os.path.exists(webp):
        return webp
    print(f"  File not found: {jpg}")
    return None

def get_articles(n=3):
    subprocess.run(['blogwatcher', 'scan'], capture_output=True, text=True)
    result = subprocess.run(['blogwatcher', 'articles'], capture_output=True, text=True)
    lines = result.stdout.split('\n')
    indo_sources = ['blockchain media', 'indodax']
    scrapable_sources = ['blockchain media', 'coindesk', 'cointelegraph', 'decrypt', 'blockworks', 'thedefiant', 'indodax']
    indo_articles = []
    global_articles = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if '[new]' in line or '[unread]' in line:
            id_match = re.search(r'\[(\d+)\]', line)
            art_id = id_match.group(1) if id_match else None
            clean = re.sub(r'^\[\d+\]\s*\[(new|unread)\]\s*', '', line.strip())
            clean = re.sub(r'\s*-\s*\w[\w\s]{2,25}$', '', clean).strip()
            if not clean:
                i += 1
                continue
            blog_name = lines[i+1].split('Blog:')[-1].strip().lower() if i+1 < len(lines) and 'Blog:' in lines[i+1] else ""
            url = ''
            for j in range(i+1, min(i+4, len(lines))):
                url_match = re.search(r'URL: (https?://\S+)', lines[j])
                if url_match:
                    url = url_match.group(1)
                    break
            entry = {'title': clean, 'id': art_id, 'url': url, 'blog': blog_name}
            if not any(s in blog_name for s in scrapable_sources):
                i += 1
                continue  # skip non-scrapable
            if any(s in blog_name for s in indo_sources):
                indo_articles.append(entry)
            else:
                global_articles.append(entry)
        i += 1
    picks = indo_articles[:2] + global_articles[:1]
    if len(picks) < n:
        picks += global_articles[:n-len(picks)]
    picks = picks[:n]
    for a in picks:
        if a['id']:
            subprocess.run(['blogwatcher', 'read', a['id']], capture_output=True, text=True)
    return picks

def detect_scene(title):
    t = title.lower()
    if any(w in t for w in ['ath', 'tembus', 'pump', 'naik', 'bullish', 'rekor', 'all time', 'akumulasi']):
        return 'bullish'
    if any(w in t for w in ['turun', 'drop', 'crash', 'bearish', 'koreksi', 'jatuh', 'tertekan']):
        return 'bearish'
    if any(w in t for w in ['breaking', 'hack', 'exploit', 'serangan', 'urgent', 'konflik']):
        return 'breaking_news'
    if any(w in t for w in ['alpha', 'insider', 'gem', 'early', 'rekomendasi']):
        return 'alpha'
    if any(w in t for w in ['bitcoin', 'btc', 'ethereum', 'eth']):
        return random.choice(['bullish', 'alpha'])
    if any(w in t for w in ['defi', 'dex', 'yield', 'liquidity', 'solana', 'base']):
        return 'alpha'
    return 'morning'

def trunc(text, n=120):
    return text[:n] + "\u2026" if len(text) > n else text

tweet_id = get_tweet_id('/tmp/morning-tweet-id.txt')
if not tweet_id:
    print("No morning tweet ID found")
    exit(1)

print(f"Replying to: {tweet_id}")
articles = get_articles(3)
print(f"Articles found: {len(articles)}")
for a in articles: print(f"  - {a['title'][:80]}")

ts = int(time.time())
# Reply 1
if articles:
    a1_title, a1_url = articles[0]['title'], articles[0]['url']
    a1_insight = fetch_insight(a1_title, a1_url, lang='indo') or trunc(articles[0]['title'], 200)
    text1 = '\U0001f99e Intel pagi ini:\n\n' + a1_insight + '\n\n#Web3Indonesia #IsekaiDAO'
else:
    text1 = '\U0001f99e GM Web3 fam!\n\nMarket konsolidasi \u2014 Base & Virtuals tetap aktif.\n\n#Web3Indonesia #IsekaiDAO'
id1 = post_reply_with_image(tweet_id, text1)
print(f'Reply 1 ID: {id1}')
time.sleep(8)
# Reply 2
if len(articles) >= 2:
    a2_insight = fetch_insight(articles[1]['title'], articles[1]['url'], lang='indo') or trunc(articles[1]['title'], 200)
    text2 = '\U0001f91d Dari komunitas Indo:\n\n' + a2_insight + '\n\nSumber lokal makin aktif! \U0001f1ee\U0001f1e9 #KriptoIndonesia'
else:
    insights = [
        'DeFi di Base makin ramai \u2014 gas fee murah bikin UX jauh lebih smooth.',
        'Virtuals Protocol terus nambah agent baru. AI x Web3 lagi jadi meta kuat.',
        'Indodax & Pintu makin agresif edukasi retail \u2014 onboarding makin cepat.',
    ]
    text2 = '\U0001f91d Insight hari ini:\n\n' + random.choice(insights) + '\n\n#DeFi #Base'
id2 = post_reply_with_image(id1, text2)
print(f'Reply 2 ID: {id2}')
time.sleep(8)
# Reply 3
if len(articles) >= 3:
    a3_insight = fetch_insight(articles[2]['title'], articles[2]['url'], lang='en') or trunc(articles[2]['title'], 180)
    cta = random.choice(['Hire Iseclaw di ACP \U0001f916 https://agdp.io/agent/12785', 'Research lebih dalam? \U0001f99e https://agdp.io/agent/12785'])
    text3 = '\U0001f310 Global intel:\n\n' + a3_insight + '\n\n' + cta
else:
    ctas = [
        'Butuh research Web3? Iseclaw siap! \U0001f916\n\nHire di ACP: https://agdp.io/agent/12785',
        'Iseclaw available 24/7 \U0001f916\n\nACP: https://agdp.io/agent/12785',
    ]
    text3 = random.choice(ctas)
id3 = post_reply_with_image(id2, text3)
print(f'Reply 3 ID: {id3}')
print('\n\u2705 Morning thread done!')
