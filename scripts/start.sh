#!/bin/sh
set -e

# Try to run migrations, but don't fail if they timeout
npx prisma migrate deploy || echo "Migration failed or timed out, continuing..."

# Start the app
exec next start
