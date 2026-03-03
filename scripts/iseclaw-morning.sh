#!/bin/bash
# Step 1: Post GM tweet + generate tweet ID
bash /root/morning-post.sh
# Step 2: Reply thread dengan artikel + gambar
python3 /root/iseclaw-morning.py
