import subprocess, os, json, time, random, re
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

def post_reply_with_image(tweet_id, text, image_path=None):
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
    result = subprocess.run(['blogwatcher', 'articles'], capture_output=True, text=True)
    lines = result.stdout.split('\n')
    indo_sources = ['coinvestasi', 'blockchain media', 'indodax', 'ajaib', 'bisnis', 'pintu', 'reku']
    indo_articles = []
    global_articles = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if '[new]' in line or '[unread]' in line:
            clean = line.strip()
            clean = re.sub(r'^\[\d+\]\s*\[(new|unread)\]\s*', '', clean)
            clean = re.sub(r'\s*-\s*\w[\w\s]{2,25}$', '', clean).strip()
            if not clean:
                i += 1
                continue
            blog_name = ""
            if i+1 < len(lines) and 'Blog:' in lines[i+1]:
                blog_name = lines[i+1].split('Blog:')[-1].strip().lower()
            if any(s in blog_name for s in indo_sources):
                indo_articles.append(clean)
            else:
                global_articles.append(clean)
        i += 1
    picks = indo_articles[:2] + global_articles[:1]
    if len(picks) < n:
        picks += global_articles[:n - len(picks)]
    return picks[:n] if picks else []

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
for a in articles: print(f"  - {a[:80]}")

ts = int(time.time())

# Reply 1
if articles:
    scene1 = detect_scene(articles[0])
    text1 = f"\U0001f99e Intel pagi ini:\n\n{trunc(articles[0])}\n\n#Web3Indonesia #IsekaiDAO"
else:
    scene1 = 'morning'
    text1 = "\U0001f99e GM Web3 fam!\n\nMarket konsolidasi \u2014 Base & Virtuals tetap aktif.\n\n#Web3Indonesia #IsekaiDAO"
print(f"\nGenerating image 1 (scene: {scene1})...")
img1 = generate_image(scene1, f"mr1-{ts}")
id1 = post_reply_with_image(tweet_id, text1, img1)
print(f"Reply 1 ID: {id1}")
time.sleep(8)

# Reply 2
if len(articles) >= 2:
    scene2 = detect_scene(articles[1])
    text2 = f"\U0001f91d Dari komunitas Indo:\n\n{trunc(articles[1])}\n\nSumber lokal makin aktif! \U0001f1ee\U0001f1e9 #KriptoIndonesia"
else:
    scene2 = random.choice(['alpha', 'bullish'])
    insights = [
        "DeFi di Base makin ramai \u2014 gas fee murah bikin UX jauh lebih smooth.",
        "Virtuals Protocol terus nambah agent baru. AI x Web3 lagi jadi meta kuat.",
        "Indodax & Pintu makin agresif edukasi retail \u2014 onboarding makin cepat.",
        "Solana DEX volume tetap tinggi \u2014 kompetisi sama Base makin sengit.",
    ]
    text2 = f"\U0001f91d Insight hari ini:\n\n{random.choice(insights)}\n\n#DeFi #Base"
print(f"\nGenerating image 2 (scene: {scene2})...")
img2 = generate_image(scene2, f"mr2-{ts}")
id2 = post_reply_with_image(id1, text2, img2)
print(f"Reply 2 ID: {id2}")
time.sleep(8)

# Reply 3
scene3 = random.choice(['alpha', 'gm', 'morning'])
ctas = [
    "Butuh research Web3 yang dalam? Iseclaw siap bantu! \U0001f916\n\nHire di ACP: https://agdp.io/agent/12785\n\nProject apa yang lagi kalian research? Drop di bawah! \U0001f447",
    "Iseclaw available 24/7 buat intel & research Web3 kamu \U0001f916\n\nACP: https://agdp.io/agent/12785\n\nApa yang mau kalian explore hari ini? \U0001f447",
    "Web3 bergerak cepat \u2014 Iseclaw bantu kamu stay ahead \U0001f99e\n\nHire di ACP: https://agdp.io/agent/12785\n\nAda pertanyaan soal project? Tanya di sini! \U0001f447",
]
text3 = random.choice(ctas)
print(f"\nGenerating image 3 (scene: {scene3})...")
img3 = generate_image(scene3, f"mr3-{ts}")
id3 = post_reply_with_image(id2, text3, img3)
print(f"Reply 3 ID: {id3}")
print("\n\u2705 Morning thread done!")
