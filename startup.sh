#!/bin/bash
# Azure App Service startup script for Next.js standalone build
cd /home/site/wwwroot

# Check if server.js exists at root (standalone deployed flat)
if [ -f "server.js" ]; then
    node server.js
    exit $?
fi

# Check if it's in .next/standalone (full build deployed)
if [ -f ".next/standalone/server.js" ]; then
    cd .next/standalone

    # Ensure static assets are available where standalone expects them
    if [ -d "../static" ] && [ ! -d ".next/static" ]; then
        mkdir -p .next
        cp -R ../static .next/static
    fi

    # Ensure public assets are available (when deploying full repo build output)
    if [ -d "../../public" ] && [ ! -d "./public" ]; then
        cp -R ../../public ./public
    fi

    node server.js
    exit $?
fi

echo "ERROR: server.js not found. Contents of wwwroot:"
ls -la
exit 1
