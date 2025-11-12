#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NEON_DB_URL:-}" ]]; then
  echo "Error: NEON_DB_URL is not set. Export it first."
  echo "Example:"
  echo "  export NEON_DB_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require'"
  exit 1
fi

echo "Applying schema to Neon..."
psql "$NEON_DB_URL" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/init_neon.sql"
echo "Done."
