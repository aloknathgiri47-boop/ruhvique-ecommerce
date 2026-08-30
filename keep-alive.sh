#!/bin/bash
while true; do
  cd /home/z/my-project/.next/standalone
  NODE_OPTIONS="--max-old-space-size=256" node server.js > /home/z/my-project/dev.log 2>&1
  sleep 2
done
