#!/bin/sh
set -e

# Try to run migrations, but don't fail if they timeout
# (Migrations may have been applied by another instance or manually)
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or timed out (may already be applied), continuing..."

# Start the app
exec next start