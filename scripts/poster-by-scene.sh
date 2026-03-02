#!/bin/bash
SCENE_KEY="${1:-gm}"
FILENAME="${2:-poster-$(date +%s)}"

SCENE=$(python3 -c "
import json
scenes = json.load(open('/root/.openclaw/iseclaw-scenes.json'))
print(scenes.get('$SCENE_KEY', scenes['gm']))
")

/root/generate-poster.sh "$SCENE" "$FILENAME"
