#!/bin/bash
# Auto-restart wrapper for Next.js dev server
# The 4GB sandbox OOM-kills next-server periodically; this restarts it automatically

cd /home/z/my-project

while true; do
  echo "[$(date '+%H:%M:%S')] Starting next dev..."
  NODE_OPTIONS="--max-old-space-size=512" node node_modules/.bin/next dev -p 3000 --webpack > /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date '+%H:%M:%S')] Server exited with code $EXIT_CODE (likely OOM). Restarting in 3s..."
  sleep 3
  # Clear .next cache to reduce memory pressure on restart
  rm -rf /home/z/my-project/.next 2>/dev/null
done
