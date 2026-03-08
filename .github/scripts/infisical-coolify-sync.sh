#!/bin/bash
set -euo pipefail

# ============================================
# Sync secrets from Infisical to Coolify
# Usage: ./infisical-coolify-sync.sh <infisical_project_id> <infisical_env> <coolify_app_uuid> <label>
#
# Required env vars:
#   INFISICAL_ACCESS_TOKEN - Infisical access token (from auth step)
#   INFISICAL_URL          - Infisical API URL
#   COOLIFY_URL            - Coolify API URL
#   COOLIFY_TOKEN          - Coolify API token
# ============================================

PROJECT_ID=$1
ENV=$2
APP_UUID=$3
LABEL=$4

SECRETS=$(curl -s -X GET \
  "${INFISICAL_URL}/api/v3/secrets/raw?workspaceId=${PROJECT_ID}&environment=${ENV}" \
  -H "Authorization: Bearer ${INFISICAL_ACCESS_TOKEN}")

COUNT=$(echo "$SECRETS" | jq '.secrets | length')
echo "📦 ${LABEL} : ${COUNT} secrets trouvés"

echo "$SECRETS" | jq -r '.secrets[] | "\(.secretKey)=\(.secretValue)"' | while IFS= read -r line; do
  KEY=$(echo "$line" | cut -d= -f1)
  VALUE=$(echo "$line" | cut -d= -f2-)

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${COOLIFY_URL}/api/v1/applications/${APP_UUID}/envs" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"key\": \"${KEY}\", \"value\": \"${VALUE}\", \"is_preview\": false}")

  if [ "$RESPONSE" != "201" ] && [ "$RESPONSE" != "200" ]; then
    curl -s -X PATCH "${COOLIFY_URL}/api/v1/applications/${APP_UUID}/envs" \
      -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"key\": \"${KEY}\", \"value\": \"${VALUE}\", \"is_preview\": false}"
  fi
done

echo "✅ ${LABEL} : secrets synchronisés"
