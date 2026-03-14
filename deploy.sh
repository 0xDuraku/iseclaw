#!/bin/bash
set -e
cd /root/iseclaw-web
echo "Building..."
npm run build
echo "Copying assets..."
cp /var/www/iseclaw/mascot.gif dist/ 2>/dev/null || cp /var/www/iseclaw/mascot.jpg dist/
echo "Fixing permissions..."
chmod -R 755 /root/iseclaw-web/dist
chmod 755 /root
echo "Done! $(date)"
