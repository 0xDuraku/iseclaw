import os, pickle, json, subprocess, textwrap, requests
from pathlib import Path
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def get_venice_key():
    result = subprocess.run(['cat', '/root/.openclaw/openclaw.json'], capture_output=True, text=True)
    data = json.loads(result.stdout)
    return data['env']['VENICE_API_KEY']

def generate_script(topic):
    key = get_venice_key()
    resp = requests.post('https://api.venice.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {key}'},
        json={'model': 'llama-3.3-70b', 'messages': [
            {'role': 'system', 'content': 'You are Iseclaw, Web3 crypto expert. Generate a 30-second YouTube Shorts script about the given topic. Max 80 words. Engaging, mix Indonesian/English. End with a question for viewers. NO quotes, just plain text.'},
            {'role': 'user', 'content': f'Topic: {topic}'}
        ], 'max_tokens': 200})
    script = resp.json()['choices'][0]['message']['content']
    # Hapus tanda petik
    script = script.replace('"', '').replace('"', '').replace('"', '').replace("'", '')
    return script

def text_to_speech(text, output):
    # Bersihkan teks - hapus tanda baca aneh dan pastikan spasi
    import re
    text = text.replace('"', '').replace('"', '').replace('"', '').replace("'", '')
    text = re.sub(r'([a-zA-Z])([A-Z])', r'\1 \2', text)  # Fix missing spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    async def _tts():
        communicate = edge_tts.Communicate(text, voice="id-ID-GadisNeural", rate="+15%", pitch="+10Hz")
        await communicate.save(output)
    asyncio.run(_tts())

def create_video(script, output_path, title):
    # Pakai mascot sebagai background
    mascot_path = '/var/www/iseclaw/mascot.jpg'
    
    img = Image.open(mascot_path).convert('RGB')
    # Resize ke 9:16 dengan crop center
    w, h = img.size
    target_w, target_h = 1080, 1920
    
    # Scale up dulu
    scale = max(target_w/w, target_h/h)
    new_w, new_h = int(w*scale), int(h*scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    
    # Crop center
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    img = img.crop((left, top, left+target_w, top+target_h))
    
    # Dark overlay supaya teks terbaca
    overlay = Image.new('RGBA', (target_w, target_h), (4, 10, 15, 180))
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay).convert('RGB')
    
    draw = ImageDraw.Draw(img)

    try:
        font_big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 70)
        font_med = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 44)
        font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 38)
    except:
        font_big = font_med = font_small = ImageFont.load_default()

    # Header
    draw.text((540, 120), 'ISECLAW', font=font_big, fill='#00d4ff', anchor='mm')
    draw.text((540, 200), 'Web3 Intel | IsekaiDAO', font=font_small, fill='#ffffff', anchor='mm')
    
    # Divider
    draw.line([(100, 240), (980, 240)], fill='#00d4ff', width=2)

    # Script text
    lines = textwrap.wrap(script, width=28)
    y = 900
    for line in lines[:14]:
        draw.text((540, y), line, font=font_med, fill='#ffffff', anchor='mm')
        y += 65

    # Bottom watermark
    draw.line([(100, 1750), (980, 1750)], fill='#00d4ff', width=2)
    draw.text((540, 1800), '@IsekaiDAO', font=font_med, fill='#00d4ff', anchor='mm')
    draw.text((540, 1860), '#Web3Indonesia #Shorts', font=font_small, fill='#ffffff', anchor='mm')

    img.save('/tmp/yt_short.jpg', 'JPEG', quality=90)

    subprocess.run([
        'ffmpeg', '-y',
        '-loop', '1', '-i', '/tmp/yt_short.jpg',
        '-i', '/tmp/yt_audio.mp3',
        '-c:v', 'libx264', '-tune', 'stillimage',
        '-c:a', 'aac', '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-vf', 'scale=1080:1920',
        output_path
    ])

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
    request = youtube.videos().insert(part='snippet,status', body=body, media_body=media)
    response = request.execute()
    video_id = response['id']
    url = f"https://youtube.com/shorts/{video_id}"
    print(f"Uploaded! ID: {video_id}")
    print(f"URL: {url}")
    
    # Wait 5 menit untuk YouTube proses video
    import time
    print("Waiting 5 minutes for YouTube to process...")
    time.sleep(300)
    # Notify Discord
    import subprocess, json
    payload = {
        "content": f"🦞 **Iseclaw Short baru!**\n{url}\n\n#{topic_hint} #Web3Indonesia #Shorts"
    }
    subprocess.run([
        "curl", "-s", "-X", "POST",
        "https://discord.com/api/webhooks/1477963161054478357/MgWTVK3x-peqLzMWlONDJZQcyqjcRpsAM_nNewqqLdlEQ4QTjD3obhXJ_7h8tcQ_zc9D",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ])
    print("Discord notified!")
    return video_id

if __name__ == '__main__':
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else 'Base ecosystem growth dan AI agents di 2026'
    title = f'{topic[:50]} #Shorts #Web3Indonesia'

    print(f'Generating script for: {topic}')
    script = generate_script(topic)
    print(f'Script: {script[:100]}...')

    print('Generating TTS...')
    text_to_speech(script, '/tmp/yt_audio.mp3')

    print('Creating video...')
    create_video(script, '/tmp/yt_short.mp4', title)

    print('Uploading to YouTube...')
    description = f"{script}\n\n---\nIseclaw | IsekaiDAO\nhttps://x.com/IsekaiDAO\n#Web3Indonesia #IsekaiDAO #Crypto #Shorts"
    upload_youtube('/tmp/yt_short.mp4', title, description, topic[:30])
