#!/bin/bash
# Auto-restart wrapper for Next.js standalone production server
# The 4GB sandbox OOM-kills node periodically; this restarts it automatically

cd /home/z/my-project/.next/standalone

while true; do
  echo "[$(date '+%H:%M:%S')] Starting standalone server..."
  node server.js > /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date '+%H:%M:%S')] Server exited with code $EXIT_CODE. Restarting in 2s..."
  sleep 2
done
