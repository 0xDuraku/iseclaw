#!/bin/bash
FILENAME="noon-$(date +%Y%m%d)"

for i in 1 2 3; do
    /root/poster-by-scene.sh alpha "$FILENAME"
    [ -f "/var/www/iseclaw/$FILENAME.jpg" ] && break
    echo "Retry $i/3 in 20s..."
    sleep 20
done

if [ -f "/var/www/iseclaw/$FILENAME.jpg" ]; then
    MEDIA_ID=$(xurl media upload "/var/www/iseclaw/$FILENAME.jpg" \
        --category tweet_image --media-type image/jpeg 2>/dev/null \
        | grep "Media ID:" | awk '{print $NF}' | sed 's/\x1b\[[0-9;]*m//g')
    TWEET_ID=$(xurl post "Siang update! Iseclaw scanning alpha market... #Web3Indonesia #IsekaiDAO" \
        --media-id "$MEDIA_ID" 2>/dev/null \
        | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['id'])")
else
    echo "No image, posting text only"
    TWEET_ID=$(xurl post "Siang update! Iseclaw scanning alpha market... #Web3Indonesia #IsekaiDAO" 2>/dev/null \
        | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['id'])")
fi

[ -z "$TWEET_ID" ] && echo "Failed to post" && exit 1
echo "$TWEET_ID" > /tmp/noon-tweet-id.txt
echo "Noon posted: $TWEET_ID"
sleep 5
python3 /root/iseclaw-noon-thread.py "$TWEET_ID"
