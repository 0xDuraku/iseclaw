#!/bin/bash
# Generate image + post evening tweet
FILENAME="evening-$(date +%Y%m%d)"
/root/poster-by-scene.sh bullish $FILENAME

python3 -c "
from PIL import Image
img = Image.open('/var/www/iseclaw/$FILENAME.webp')
img.convert('RGB').save('/var/www/iseclaw/$FILENAME.jpg', 'JPEG', quality=85)
" 2>/dev/null

MEDIA_ID=$(xurl media upload /var/www/iseclaw/$FILENAME.jpg --category tweet_image --media-type image/jpeg 2>/dev/null | grep "Media ID:" | awk '{print $NF}' | sed 's/\x1b\[[0-9;]*m//g')

TWEET_ID=$(xurl post "Alpha time! Iseclaw scanning market moves... #Web3Indonesia #IsekaiDAO" --media-id $MEDIA_ID 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])")

echo $TWEET_ID > /tmp/evening-tweet-id.txt
echo "Evening posted: $TWEET_ID"

# Thread replies via Python
sleep 5
python3 /root/iseclaw-evening-thread.py $TWEET_ID
