import subprocess, sys, time, json

def reply(tweet_id, text):
    result = subprocess.run(['xurl', 'reply', tweet_id, text], capture_output=True, text=True)
    try:
        return json.loads(result.stdout)['data']['id']
    except:
        return None

def get_articles():
    result = subprocess.run(['blogwatcher', 'articles'], capture_output=True, text=True)
    lines = [l for l in result.stdout.split('\n') if '[unread]' in l]
    return lines[0].replace('[unread]', '').strip()[:100] if lines else "Base & Virtuals ecosystem update"

tweet_id = sys.argv[1] if len(sys.argv) > 1 else open('/tmp/evening-tweet-id.txt').read().strip()
article = get_articles()

id1 = reply(tweet_id, f"Market update sore ini \U0001f99e\n\n{article}\n\n#Web3Indonesia #Crypto")
print(f"Reply 1: {id1}")
time.sleep(3)

id2 = reply(id1, "Key levels yang perlu diperhatiin:\n\n\u2022 Base TVL trending up\n\u2022 Virtuals agent economy growing\n\u2022 Solana DEX volume strong\n\nPositioning buat besok? \U0001f914 #DeFi")
print(f"Reply 2: {id2}")
time.sleep(3)

id3 = reply(id2, "Butuh intel Web3 custom? Hire Iseclaw di ACP \U0001f916\nhttps://agdp.io/agent/12785\n\nApa yang paling kamu mau research sekarang? \U0001f447")
print(f"Reply 3: {id3}")
print("Evening thread done!")
