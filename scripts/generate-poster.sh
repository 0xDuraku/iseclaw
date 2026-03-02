#!/bin/bash
SCENE="${1:-}"
FILENAME="${2:-poster-$(date +%s)}"
VENICE_KEY="VENICE_INFERENCE_KEY_1gY_6KbUPvfk1oYMNZVPO9lRDvZPkZu8AmhPHxA-KI"
OUTPUT_DIR="/var/www/iseclaw"
BASE_PROMPT="90s anime style, retro cel shading, young Asian woman, short silver white bob haircut with blunt bangs, all hair tucked inside hood, hood up on head, sharp cat eye makeup with glowing neon blue eyeliner, blue eyes, thin natural pink lips, bare face no mask, oversized black hoodie only, bare thighs and legs visible below hoodie hem, large bold white ISECLAW text across chest, large bright blue moon background, dark cyberpunk city skyline, 3/4 body shot, Cowboy Bebop art style, bold outlines, confident pose"

FULL_PROMPT="$BASE_PROMPT, $SCENE"

echo "Generating: $FILENAME"
curl -s https://api.venice.ai/api/v1/image/generate \
  -H "Authorization: Bearer $VENICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"flux-2-max\",
    \"prompt\": \"$FULL_PROMPT\",
    \"negative_prompt\": \"glasses, goggles, spiral eyes, yellow eyes, red lips, thick lipstick, hair outside hoodie, long hair, mask, pants, jeans, armor, realistic photo, blurry, low quality, deformed, chibi, 3D\",
    \"width\": 1024,
    \"height\": 1024,
    \"seed\": 400
  }" | python3 -c "
import json,sys,base64
d=json.load(sys.stdin)
if 'images' in d:
    open('$OUTPUT_DIR/$FILENAME.webp','wb').write(base64.b64decode(d['images'][0]))
    print('SUCCESS: https://iseclaw.zerovantclaw.xyz/$FILENAME.webp')
else:
    print('ERROR:', d)
"

# Convert webp to jpg
python3 -c "
from PIL import Image
img = Image.open('$OUTPUT_DIR/$FILENAME.webp')
img = img.convert('RGB')
img.save('$OUTPUT_DIR/$FILENAME.jpg', 'JPEG', quality=85)
"
echo "JPG ready: $OUTPUT_DIR/$FILENAME.jpg"
