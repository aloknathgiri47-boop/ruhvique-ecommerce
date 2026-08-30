#!/bin/bash
LOG=/home/z/my-project/dev.log
SERVER_DIR=/home/z/my-project/.next/standalone

while true; do
  echo "[$(date '+%H:%M:%S')] Starting server..." > "$LOG"
  cd "$SERVER_DIR" && NODE_OPTIONS="--max-old-space-size=512" node server.js >> "$LOG" 2>&1
  EXIT=$?
  echo "[$(date '+%H:%M:%S')] Server exited ($EXIT). Restart in 2s..." >> "$LOG"
  sleep 2
done
