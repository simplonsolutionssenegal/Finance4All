#!/bin/bash
set -euo pipefail

# ============================================
# Authenticate to Infisical and export access token
# Required env vars:
#   INFISICAL_CLIENT_ID     - Machine Identity Client ID
#   INFISICAL_CLIENT_SECRET - Machine Identity Client Secret
#   INFISICAL_URL           - Infisical API URL
# ============================================

TOKEN=$(curl -s -X POST "${INFISICAL_URL}/api/v1/auth/universal-auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"clientId\": \"${INFISICAL_CLIENT_ID}\", \"clientSecret\": \"${INFISICAL_CLIENT_SECRET}\"}" \
  | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Échec authentification Infisical"
  exit 1
fi

echo "✅ Authentification Infisical réussie"

# Export pour GitHub Actions
echo "INFISICAL_ACCESS_TOKEN=${TOKEN}" >> "$GITHUB_ENV"
