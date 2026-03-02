#!/bin/bash
cp /root/iseclaw-acp/dashboard/*.html /var/www/iseclaw/
cp /root/iseclaw-acp/dashboard/*.png /var/www/iseclaw/ 2>/dev/null
echo "deployed!"
