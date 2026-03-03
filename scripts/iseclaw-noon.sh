#!/bin/bash
FILENAME="noon-$(date +%Y%m%d)"
/root/poster-by-scene.sh alpha $FILENAME

python3 -c "
from PIL import Image
img = Image.open('/var/www/iseclaw/$FILENAME.webp')
img.convert('RGB').save('/var/www/iseclaw/$FILENAME.jpg', 'JPEG', quality=85)
" 2>/dev/null

MEDIA_ID=$(xurl media upload /var/www/iseclaw/$FILENAME.jpg --category tweet_image --media-type image/jpeg 2>/dev/null | grep "Media ID:" | awk '{print $NF}' | sed 's/\x1b\[[0-9;]*m//g')

TWEET_ID=$(xurl post "Siang update! Iseclaw scanning alpha market... #Web3Indonesia #IsekaiDAO" --media-id $MEDIA_ID 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])")

echo $TWEET_ID > /tmp/noon-tweet-id.txt
echo "Noon posted: $TWEET_ID"

sleep 5
python3 /root/iseclaw-noon-thread.py $TWEET_ID
