#!/bin/bash
FILENAME="evening-$(date +%Y%m%d)"

for i in 1 2 3; do
    /root/poster-by-scene.sh bullish "$FILENAME"
    [ -f "/var/www/iseclaw/$FILENAME.jpg" ] && break
    echo "Retry $i/3 in 20s..."
    sleep 20
done

if [ -f "/var/www/iseclaw/$FILENAME.jpg" ]; then
    MEDIA_ID=$(xurl media upload "/var/www/iseclaw/$FILENAME.jpg" \
        --category tweet_image --media-type image/jpeg 2>/dev/null \
        | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])")
    TWEET_ID=$(xurl post "Alpha time! Iseclaw scanning market moves... #Web3Indonesia #IsekaiDAO" \
        --media-id "$MEDIA_ID" 2>/dev/null \
        | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])")
else
    echo "No image generated, posting text only"
    TWEET_ID=$(xurl post "Alpha time! Iseclaw scanning market moves... #Web3Indonesia #IsekaiDAO" 2>/dev/null \
        | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['id'])")
fi

[ -z "$TWEET_ID" ] && echo "Failed to post" && exit 1
echo "$TWEET_ID" > /tmp/evening-tweet-id.txt
echo "Evening posted: $TWEET_ID"
sleep 5
python3 /root/iseclaw-evening-thread.py "$TWEET_ID"
