#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy --schema=src/infrastructure/config/schema.prisma

echo "✅ Migrations completed successfully"
echo "🚀 Starting Finance4All Backend..."

# Execute the main command (node dist/main.js)
exec "$@"