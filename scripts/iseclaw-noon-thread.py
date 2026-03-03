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
    return lines[0].replace('[unread]', '').strip()[:100] if lines else "Virtuals Protocol & Base ecosystem update"

tweet_id = sys.argv[1] if len(sys.argv) > 1 else open('/tmp/noon-tweet-id.txt').read().strip()
article = get_articles()

id1 = reply(tweet_id, f"Alpha siang ini \U0001f99e\n\n{article}\n\n#Web3Indonesia #Crypto")
print(f"Reply 1: {id1}")
time.sleep(3)

id2 = reply(id1, "Mid-day check:\n\n\u2022 AI agents makin banyak diadopsi\n\u2022 Base developer activity tinggi\n\u2022 Monad testnet progress\n\nKamu lagi hold apa sekarang? \U0001f914 #DeFi #Base")
print(f"Reply 2: {id2}")
time.sleep(3)

id3 = reply(id2, "Iseclaw bisa bantu research project Web3 kamu \U0001f916\nHire di ACP: https://agdp.io/agent/12785\n\nAda yang mau di-research? Drop di sini! \U0001f447")
print(f"Reply 3: {id3}")
print("Noon thread done!")
