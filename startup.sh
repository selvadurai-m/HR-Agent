#!/bin/bash
# Azure App Service startup script for Next.js standalone build
cd /home/site/wwwroot

# Check if server.js exists at root (standalone deployed flat)
if [ -f "server.js" ]; then
    node server.js
# Check if it's in .next/standalone (full build deployed)
elif [ -f ".next/standalone/server.js" ]; then
    cd .next/standalone
    node server.js
else
    echo "ERROR: server.js not found. Contents of wwwroot:"
    ls -la
    exit 1
fi
