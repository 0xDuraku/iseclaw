import subprocess, os, sys, json, time, random, re

def upload_media(image_path):
    if not image_path or not os.path.exists(image_path):
        print(f"  No image at: {image_path}")
        return None
    result = subprocess.run(
        ['xurl', 'media', 'upload', image_path, '--category', 'tweet_image', '--media-type', 'image/jpeg'],
        capture_output=True, text=True
    )
    try:
        data = json.loads(result.stdout.strip().split(chr(10))[0])
        media_id = data['data']['id']
        print(f"  Media uploaded: {media_id}")
        return media_id
    except:
        match = re.search(r'Media ID[:\s]+(\d+)', result.stdout)
        if match:
            return match.group(1)
    print(f"  Upload failed: {result.stdout[:100]}")
    return None

def post_reply_with_image(tweet_id, text, image_path=None):
    if not tweet_id:
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
        print("Error:", json.dumps(data, indent=2))
    except:
        print("Error:", result.stdout[:200])
    return None

def generate_image(scene_key, filename):
    subprocess.run(['bash', '/root/poster-by-scene.sh', scene_key, filename], capture_output=True, text=True)
    jpg = f"/var/www/iseclaw/{filename}.jpg"
    if os.path.exists(jpg):
        return jpg
    webp = f"/var/www/iseclaw/{filename}.webp"
    if os.path.exists(webp):
        return webp
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
            clean = re.sub(r'^\[\d+\]\s*\[(new|unread)\]\s*', '', line.strip())
            clean = re.sub(r'\s*-\s*\w[\w\s]{2,25}$', '', clean).strip()
            if not clean:
                i += 1
                continue
            blog_name = lines[i+1].split('Blog:')[-1].strip().lower() if i+1 < len(lines) and 'Blog:' in lines[i+1] else ""
            if any(s in blog_name for s in indo_sources):
                indo_articles.append(clean)
            else:
                global_articles.append(clean)
        i += 1
    picks = indo_articles[:2] + global_articles[:1]
    if len(picks) < n:
        picks += global_articles[:n-len(picks)]
    return picks[:n] if picks else []

def detect_scene(title):
    t = title.lower()
    if any(w in t for w in ['ath', 'tembus', 'pump', 'naik', 'bullish', 'rekor', 'akumulasi']):
        return 'bullish'
    if any(w in t for w in ['turun', 'drop', 'crash', 'bearish', 'koreksi', 'tertekan']):
        return 'bearish'
    if any(w in t for w in ['hack', 'exploit', 'serangan', 'konflik', 'breaking']):
        return 'breaking_news'
    if any(w in t for w in ['rekomendasi', 'alpha', 'gem', 'early']):
        return 'alpha'
    if any(w in t for w in ['bitcoin', 'btc', 'ethereum', 'eth']):
        return random.choice(['bullish', 'alpha'])
    return 'evening'

def trunc(text, n=120):
    return text[:n] + "\u2026" if len(text) > n else text

tweet_id = sys.argv[1] if len(sys.argv) > 1 else open('/tmp/evening-tweet-id.txt').read().strip()
articles = get_articles(3)
print(f"Articles found: {len(articles)}")
ts = int(time.time())

# Reply 1
if articles:
    scene1 = detect_scene(articles[0])
    text1 = f"\U0001f99e Market update sore ini:\n\n{trunc(articles[0])}\n\n#Web3Indonesia #Crypto"
else:
    scene1 = 'evening'
    text1 = "\U0001f99e Market update sore ini:\n\nBase TVL trending up \u2014 Virtuals agent economy growing.\n\n#Web3Indonesia #Crypto"
print(f"Generating image 1 (scene: {scene1})...")
img1 = generate_image(scene1, f"ev1-{ts}")
id1 = post_reply_with_image(tweet_id, text1, img1)
print(f"Reply 1: {id1}")
time.sleep(8)

# Reply 2
if len(articles) >= 2:
    scene2 = detect_scene(articles[1])
    text2 = f"\U0001f91d Dari komunitas Indo:\n\n{trunc(articles[1])}\n\nSumber lokal makin aktif! \U0001f1ee\U0001f1e9 #KriptoIndonesia"
else:
    scene2 = random.choice(['bullish', 'evening'])
    insights = [
        "Base TVL trending up \u2014 developer activity makin tinggi.",
        "Virtuals agent economy growing \u2014 AI x Web3 makin solid.",
        "Solana DEX volume strong \u2014 positioning buat besok.",
        "Key resistance levels hold \u2014 accumulation zone terlihat jelas.",
    ]
    text2 = f"\U0001f4ca Key levels sore ini:\n\n{random.choice(insights)}\n\nPositioning buat besok? \U0001f914 #DeFi"
print(f"Generating image 2 (scene: {scene2})...")
img2 = generate_image(scene2, f"ev2-{ts}")
id2 = post_reply_with_image(id1, text2, img2)
print(f"Reply 2: {id2}")
time.sleep(8)

# Reply 3
scene3 = random.choice(['alpha', 'evening'])
ctas = [
    "Butuh intel Web3 custom? Hire Iseclaw di ACP \U0001f916\nhttps://agdp.io/agent/12785\n\nApa yang paling kamu mau research sekarang? \U0001f447",
    "Iseclaw available buat deep research Web3 kamu \U0001f99e\nACP: https://agdp.io/agent/12785\n\nProject apa yang lagi kamu pantau? \U0001f447",
    "Stay informed di Web3 \u2014 Iseclaw scanning 24/7 \U0001f916\nhttps://agdp.io/agent/12785\n\nAda alpha yang mau di-dig? Drop di sini! \U0001f447",
]
text3 = random.choice(ctas)
print(f"Generating image 3 (scene: {scene3})...")
img3 = generate_image(scene3, f"ev3-{ts}")
id3 = post_reply_with_image(id2, text3, img3)
print(f"Reply 3: {id3}")
print("\u2705 Evening thread done!")
