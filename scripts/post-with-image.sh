#!/bin/bash
TWEET="$1"
SCENE="${2:-gm}"
FILENAME="post-$(date +%s)"

# Generate image
/root/poster-by-scene.sh "$SCENE" "$FILENAME"

# Cek apakah webp berhasil dibuat
if [ ! -f "/var/www/iseclaw/$FILENAME.webp" ]; then
    echo "Generate failed, using cached image..."
    # Fallback ke gambar terakhir yang berhasil
    LATEST=$(ls -t /var/www/iseclaw/poster-hoodie-v7.webp 2>/dev/null)
    if [ -z "$LATEST" ]; then
        echo "No cached image, posting without image"
        xurl post "$TWEET"
        exit 0
    fi
    cp /var/www/iseclaw/poster-hoodie-v7.webp /var/www/iseclaw/$FILENAME.webp
fi

# Convert ke JPG
python3 -c "
from PIL import Image
img = Image.open('/var/www/iseclaw/$FILENAME.webp')
img.convert('RGB').save('/var/www/iseclaw/$FILENAME.jpg', 'JPEG', quality=85)
print('JPG ready')
"

# Upload ke Twitter
MEDIA_ID=$(xurl media upload /var/www/iseclaw/$FILENAME.jpg \
  --category tweet_image \
  --media-type image/jpeg 2>/dev/null | grep "Media ID:" | awk '{print $NF}' | sed 's/\x1b\[[0-9;]*m//g')

echo "Media ID: $MEDIA_ID"

if [ -z "$MEDIA_ID" ]; then
    echo "Upload failed, posting without image"
    xurl post "$TWEET"
else
    xurl post "$TWEET" --media-id $MEDIA_ID
fi
