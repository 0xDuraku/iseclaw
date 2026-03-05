import json, subprocess, os, requests
from dotenv import load_dotenv
load_dotenv("/root/iseclaw-acp/.env")

replied_file = "/root/iseclaw-data/replied-users.json"
mentions_file = "/tmp/iseclaw-mentions.json"
our_id = "1625069685753679873"
key = os.getenv("VENICE_API_KEY", "")

try:
    data = json.load(open(mentions_file))
    tweets = data.get('data', [])
except Exception as e:
    print(f"Error loading mentions: {e}")
    exit(0)

try:
    replied = json.load(open(replied_file))
except:
    replied = []

replied_ids = {r['tweet_id'] for r in replied}
new_count = 0

for tweet in tweets:
    tweet_id = tweet.get('id', '')
    author_id = tweet.get('author_id', '')
    if author_id == our_id or tweet_id in replied_ids:
        continue

    text = tweet.get('text', '')
    print(f"New mention: {text[:60]}")

    prompt = f"""Kamu Iseclaw, AI Web3 agent IsekaiDAO. Ada yang mention kamu:
"{text}"
Balas singkat, friendly, 1-2 kalimat, bahasa Indo+English. Jangan sebut ACP kecuali mereka tanya soal service."""

    try:
        resp = requests.post(
            "https://api.venice.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": "zai-org-glm-4.7-flash", "max_tokens": 80,
                  "venice_parameters": {"disable_thinking": True},
                  "messages": [{"role": "user", "content": prompt}]},
            timeout=20
        )
        reply_text = resp.json()['choices'][0]['message'].get('content', '').strip()
    except Exception as e:
        print(f"Venice error: {e}")
        reply_text = ""

    if not reply_text:
        reply_text = "GM! Stay locked in �� #Web3Indonesia"

    print(f"Replying: {reply_text}")
    result = subprocess.run(['xurl', 'reply', tweet_id, reply_text], capture_output=True, text=True)
    print(f"Result: {result.stdout[:100]}")

    replied.append({'tweet_id': tweet_id, 'author_id': author_id})
    new_count += 1

json.dump(replied, open(replied_file, 'w'))
print(f"Done! Replied to {new_count} new mentions")
