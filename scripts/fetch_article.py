import requests, trafilatura, time, os, re
import threading
from dotenv import load_dotenv
load_dotenv("/root/iseclaw-acp/.env")

VENICE_KEY = os.getenv("VENICE_API_KEY", "")
MODEL = "zai-org-glm-4.7-flash"

def _fetch_with_timeout(fn, timeout=15):
    result = [None]
    error = [None]
    def run():
        try:
            result[0] = fn()
        except Exception as e:
            error[0] = e
    t = threading.Thread(target=run, daemon=True)
    t.start()
    t.join(timeout)
    if t.is_alive():
        return None
    return result[0]

def fetch_insight(title, url, lang="indo"):
    try:
        def do_fetch():
            downloaded = trafilatura.fetch_url(url)
            return trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        
        content = _fetch_with_timeout(do_fetch, timeout=10)
        if not content or len(content) < 150:
            return None

        if lang == "indo":
            prompt = f"Buat 1-2 kalimat insight dari artikel kripto ini untuk Twitter. Bahasa Indonesia campur English. Max 220 karakter. Langsung ke poin, no hashtag, no emoji.\n\nJudul: {title}\nIsi: {content[:600]}"
        else:
            prompt = f"Write 1-2 sentence insight from this crypto article for Twitter. Max 220 chars. Direct, no hashtags, no emoji.\n\nTitle: {title}\nContent: {content[:600]}"

        def do_venice():
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
            return (msg.get('content') or msg.get('reasoning_content', '')).strip()

        result = _fetch_with_timeout(do_venice, timeout=15)
        if not result:
            return None
        result = re.sub(r'^(Here is (your )?insight:|Insight:|Berikut insight[^:]*:)\s*', '', result, flags=re.IGNORECASE).strip()
        return result if len(result) > 20 else None

    except Exception as e:
        print(f"  fetch_insight error: {e}", flush=True)
        return None
