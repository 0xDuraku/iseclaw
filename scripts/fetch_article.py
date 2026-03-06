import requests, trafilatura, time, os, re, signal
from dotenv import load_dotenv
load_dotenv("/root/iseclaw-acp/.env")

VENICE_KEY = os.getenv("VENICE_API_KEY", "")
MODEL = "zai-org-glm-4.7-flash"

class TimeoutError(Exception):
    pass

def _timeout_handler(signum, frame):
    raise TimeoutError("fetch timeout")

def fetch_insight(title, url, lang="indo"):
    try:
        # Hard timeout 20 detik untuk seluruh fungsi
        signal.signal(signal.SIGALRM, _timeout_handler)
        signal.alarm(20)
        
        try:
            downloaded = trafilatura.fetch_url(url)
            content = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        finally:
            signal.alarm(0)
            
        if not content or len(content) < 150:
            return None

        if lang == "indo":
            prompt = f"Buat 1-2 kalimat insight dari artikel kripto ini untuk Twitter. Bahasa Indonesia campur English. Max 220 karakter. Langsung ke poin, no hashtag, no emoji.\n\nJudul: {title}\nIsi: {content[:600]}"
        else:
            prompt = f"Write 1-2 sentence insight from this crypto article for Twitter. Max 220 chars. Direct, no hashtags, no emoji.\n\nTitle: {title}\nContent: {content[:600]}"

        signal.signal(signal.SIGALRM, _timeout_handler)
        signal.alarm(15)
        try:
            resp = requests.post(
                "https://api.venice.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {VENICE_KEY}", "Content-Type": "application/json"},
                json={
                    "model": MODEL,
                    "max_tokens": 120,
                    "venice_parameters": {"disable_thinking": True},
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=12
            )
            msg = resp.json()['choices'][0]['message']
            result = (msg.get('content') or msg.get('reasoning_content', '')).strip()
            result = re.sub(r'^(Here is (your )?insight:|Insight:|Berikut insight[^:]*:)\s*', '', result, flags=re.IGNORECASE).strip()
            return result if len(result) > 20 else None
        finally:
            signal.alarm(0)

    except Exception as e:
        print(f"  fetch_insight error: {e}", flush=True)
        return None
