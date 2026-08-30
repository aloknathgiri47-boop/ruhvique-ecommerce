#!/bin/bash
while true; do
  cd /home/z/my-project
  NODE_OPTIONS="--max-old-space-size=512" node node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1
  sleep 2
done
