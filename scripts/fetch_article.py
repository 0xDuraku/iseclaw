import requests, trafilatura, time

import os
from dotenv import load_dotenv
load_dotenv("/root/iseclaw-acp/.env")
VENICE_KEY = os.getenv("VENICE_API_KEY", "")
MODEL = "zai-org-glm-4.7-flash"

def fetch_insight(title, url, lang="indo"):
    try:
        downloaded = trafilatura.fetch_url(url)
        content = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        if not content or len(content) < 150:
            return None

        if lang == "indo":
            prompt = f"Buat 1-2 kalimat insight dari artikel kripto ini untuk Twitter. Bahasa Indonesia campur English. Max 220 karakter. Langsung ke poin, no hashtag, no emoji.\n\nJudul: {title}\nIsi: {content[:600]}"
        else:
            prompt = f"Write 1-2 sentence insight from this crypto article for Twitter. Max 220 chars. Direct, no hashtags, no emoji.\n\nTitle: {title}\nContent: {content[:600]}"

        # Retry 2x kalau timeout
        for attempt in range(2):
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
                    timeout=25
                )
                msg = resp.json()['choices'][0]['message']
                result = (msg.get('content') or msg.get('reasoning_content', '')).strip()
                # Strip common preambles
import re as _re
result = _re.sub(r'^(Here is (your )?insight:|Insight:|Berikut insight[^:]*:)\s*', '', result, flags=_re.IGNORECASE).strip()
return result if len(result) > 20 else None
            except Exception:
                if attempt == 0:
                    time.sleep(5)
                continue
        return None
    except Exception:
        return None
