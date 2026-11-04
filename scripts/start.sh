#!/bin/sh
set -e

echo "Starting IHR OSINT — Open Source Intelligence Academy..."
npx tsx prisma/seed.ts
exec npx tsx server.ts
