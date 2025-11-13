#!/bin/sh
set -e

echo "🔄 Synchronizing database schema..."
npx prisma db push --schema=src/infrastructure/config/schema.prisma --accept-data-loss --skip-generate

echo "✅ Database schema synchronized successfully"
echo "🚀 Starting Finance4All Backend..."

# Execute the main command (node dist/main.js)
exec "$@"