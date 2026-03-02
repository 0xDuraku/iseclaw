#!/bin/bash
# Generate image
FILENAME="morning-$(date +%Y%m%d)"
/root/poster-by-scene.sh gm $FILENAME

# Convert to JPG
python3 -c "
from PIL import Image
img = Image.open('/var/www/iseclaw/$FILENAME.webp')
img.convert('RGB').save('/var/www/iseclaw/$FILENAME.jpg', 'JPEG', quality=85)
"

# Upload ke Twitter
MEDIA_ID=$(xurl media upload /var/www/iseclaw/$FILENAME.jpg \
  --category tweet_image --media-type image/jpeg 2>/dev/null \
  | grep "Media ID:" | awk '{print $NF}' | sed 's/\x1b\[[0-9;]*m//g')

# Post GM tweet dengan image
TWEET_ID=$(xurl post "GM frens! Iseclaw online scanning alpha #Web3Indonesia #IsekaiDAO" \
  --media-id $MEDIA_ID | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['id'])")

echo $TWEET_ID > /tmp/morning-tweet-id.txt
echo "Posted! Tweet ID: $TWEET_ID"
