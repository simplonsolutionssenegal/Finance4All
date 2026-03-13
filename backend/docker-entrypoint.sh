#!/bin/sh
set -e

# Build DATABASE_URL from individual Postgres variables if not already set
if [ -z "$DATABASE_URL" ]; then
  if [ -n "$POSTGRES_HOST" ] && [ -n "$POSTGRES_USERNAME" ] && [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_DATABASE" ]; then
    POSTGRES_PORT="${POSTGRES_PORT:-5432}"
    export DATABASE_URL="postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}?schema=public"
    echo "✅ DATABASE_URL constructed from Postgres variables"
  else
    echo "❌ DATABASE_URL is not set and individual Postgres variables are missing"
    exit 1
  fi
fi

echo "🔄 Synchronizing database schema..."
npx prisma db push --schema=src/infrastructure/config/schema.prisma --accept-data-loss --skip-generate

echo "✅ Database schema synchronized successfully"
echo "🚀 Starting Finance4All Backend..."

# Execute the main command (node dist/main.js)
exec "$@"