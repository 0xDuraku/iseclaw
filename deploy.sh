#!/bin/bash
set -e
cd /root/iseclaw-web
echo "Building..."
npm run build
echo "Copying assets..."
cp /var/www/iseclaw/mascot.jpg dist/mascot.jpg
cp /var/www/iseclaw/mascot.gif dist/mascot.gif 2>/dev/null || true
cp public/mascot.jpg dist/mascot.jpg 2>/dev/null || true
echo "Fixing permissions..."
chmod -R 755 /root/iseclaw-web/dist
chmod 755 /root /root/iseclaw-web /root/iseclaw-web/dist
echo "Done! $(date)"
