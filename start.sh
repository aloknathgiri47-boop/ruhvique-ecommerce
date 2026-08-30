#!/bin/bash
# Start the Next.js server and keep it running
cd /home/z/my-project/.next/standalone
while true; do
  node server.js > /home/z/my-project/dev.log 2>&1
  sleep 1
done
