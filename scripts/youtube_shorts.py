import os, pickle, json, subprocess, textwrap, requests, asyncio, re, time
from PIL import Image, ImageDraw, ImageFont
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import edge_tts

def get_venice_key():
    data = json.loads(open('/root/.openclaw/openclaw.json').read())
    return data['env']['VENICE_API_KEY']

def generate_script(topic):
    key = get_venice_key()
    resp = requests.post('https://api.venice.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {key}'},
        json={'model': 'llama-3.3-70b', 'messages': [
            {'role': 'system', 'content': 'Kamu adalah Iseclaw. Namamu adalah Iseclaw. JANGAN pernah sebut nama model atau AI lain. Buat script YouTube Shorts 30 detik. Maksimal 80 kata. Energik, mix Indo-English. Mulai dengan Halo aku Iseclaw. Akhiri dengan pertanyaan untuk penonton. JANGAN pakai tanda petik. Tulis plain text saja.'},
            {'role': 'user', 'content': f'Topik: {topic}'}
        ], 'max_tokens': 200})
    script = resp.json()['choices'][0]['message']['content']
    script = script.replace('"', '').replace('\u201c', '').replace('\u201d', '').replace("'", ' ')
    script = re.sub(r'\s+', ' ', script).strip()
    return script

def text_to_speech(text, output):
    text = re.sub(r'([a-zA-Z])([A-Z])', r'\1 \2', text)
    text = re.sub(r'\s+', ' ', text).strip()
    async def _tts():
        communicate = edge_tts.Communicate(text, voice="id-ID-GadisNeural", rate="+15%", pitch="+10Hz")
        await communicate.save(output)
    asyncio.run(_tts())

def mix_audio(voice_path, bgm_path, output):
    subprocess.run([
        'ffmpeg', '-y',
        '-i', voice_path,
        '-i', bgm_path,
        '-filter_complex', '[0:a]volume=1.5[voice];[1:a]volume=0.4,aloop=loop=-1:size=2e+09[bgm];[voice][bgm]amix=inputs=2:duration=first[out]',
        '-map', '[out]',
        output
    ], capture_output=True)

def create_image(script):
    img = Image.open('/var/www/iseclaw/mascot.jpg').convert('RGB')
    w, h = img.size
    target_w, target_h = 1080, 1920
    scale = max(target_w/w, target_h/h)
    new_w, new_h = int(w*scale), int(h*scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    img = img.crop((left, top, left+target_w, top+target_h))
    overlay = Image.new('RGBA', (target_w, target_h), (4, 10, 15, 170))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)

    try:
        font_big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 75)
        font_med = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 46)
        font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 36)
    except:
        font_big = font_med = font_small = ImageFont.load_default()

    draw.text((540, 110), 'ISECLAW', font=font_big, fill='#00d4ff', anchor='mm')
    draw.text((540, 195), 'Web3 Intel | IsekaiDAO', font=font_small, fill='#aaaaaa', anchor='mm')
    draw.line([(80, 235), (1000, 235)], fill='#00d4ff', width=2)

    lines = textwrap.wrap(script, width=26)
    y = 820
    for line in lines[:12]:
        draw.text((540, y), line, font=font_med, fill='#ffffff', anchor='mm')
        y += 70

    draw.line([(80, 1740), (1000, 1740)], fill='#00d4ff', width=2)
    draw.text((540, 1790), '@IsekaiDAO', font=font_med, fill='#00d4ff', anchor='mm')
    draw.text((540, 1855), '#Web3Indonesia #Shorts', font=font_small, fill='#aaaaaa', anchor='mm')

    img.save('/tmp/yt_short.jpg', 'JPEG', quality=92)

def create_video(image_path, audio_path, output_path):
    subprocess.run([
        'ffmpeg', '-y',
        '-loop', '1', '-i', image_path,
        '-i', audio_path,
        '-c:v', 'libx264', '-tune', 'stillimage',
        '-c:a', 'aac', '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-vf', 'scale=1080:1920',
        output_path
    ])

def notify_discord(url, topic_hint):
    payload = {"content": f"\U0001f99e **Iseclaw Short baru!**\n{url}\n\n#{topic_hint} #Web3Indonesia #Shorts"}
    subprocess.run([
        "curl", "-s", "-X", "POST",
        "https://discord.com/api/webhooks/1477963161054478357/MgWTVK3x-peqLzMWlONDJZQcyqjcRpsAM_nNewqqLdlEQ4QTjD3obhXJ_7h8tcQ_zc9D",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ])
    print("Discord notified!")

def upload_youtube(video_path, title, description, topic_hint=""):
    with open('/root/youtube_token.pkl', 'rb') as f:
        creds = pickle.load(f)
    youtube = build('youtube', 'v3', credentials=creds)
    body = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': ['Web3', 'Crypto', 'Indonesia', 'IsekaiDAO', 'Shorts', 'Iseclaw'],
            'categoryId': '28'
        },
        'status': {'privacyStatus': 'public', 'selfDeclaredMadeForKids': False}
    }
    media = MediaFileUpload(video_path, mimetype='video/mp4', resumable=True)
    response = youtube.videos().insert(part='snippet,status', body=body, media_body=media).execute()
    video_id = response['id']
    url = f"https://youtube.com/shorts/{video_id}"
    print(f"Uploaded! ID: {video_id}")
    print(f"URL: {url}")
    print("Waiting 5 minutes for YouTube to process...")
    time.sleep(300)
    notify_discord(url, topic_hint)
    return video_id

if __name__ == '__main__':
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else 'Base ecosystem growth dan AI agents di 2026'
    title = f'{topic[:50]} #Shorts #Web3Indonesia'
    description = f"---\nIseclaw | IsekaiDAO\nhttps://x.com/IsekaiDAO\n#Web3Indonesia #IsekaiDAO #Crypto #Shorts"

    print(f'Generating script: {topic}')
    script = generate_script(topic)
    print(f'Script: {script[:100]}...')
    description = f"{script}\n\n{description}"

    print('Generating TTS...')
    text_to_speech(script, '/tmp/yt_audio.mp3')

    print('Mixing audio...')
    mix_audio('/tmp/yt_audio.mp3', '/root/bgm-lofi.mp3', '/tmp/yt_mixed.mp3')

    print('Creating image...')
    create_image(script)

    print('Creating video...')
    create_video('/tmp/yt_short.jpg', '/tmp/yt_mixed.mp3', '/tmp/yt_short.mp4')

    print('Uploading...')
    upload_youtube('/tmp/yt_short.mp4', title, description, topic[:30])
