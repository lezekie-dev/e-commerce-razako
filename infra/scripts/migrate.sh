#!/usr/bin/env bash
#
# migrate.sh — Drizzle migration runner for production
#
# Usage:
#   ./migrate.sh staging              # dry-run + apply to staging
#   ./migrate.sh production           # apply to production (requires confirmation)
#   ./migrate.sh production --force   # skip confirmation
#   ./migrate.sh rollback production  # rollback to previous migration
#
set -euo pipefail

ENV="${1:-}"
ACTION="${2:-up}"
FORCE="${3:-}"

if [ -z "$ENV" ]; then
  echo "Usage: $0 <staging|production> [up|rollback] [--force]"
  exit 1
fi

case "$ENV" in
  staging)
    DB_URL_VAR="STAGING_DATABASE_URL"
    ;;
  production)
    DB_URL_VAR="DATABASE_URL"
    ;;
  *)
    echo "Unknown env: $ENV (use 'staging' or 'production')"
    exit 1
    ;;
esac

if [ -z "${!DB_URL_VAR:-}" ]; then
  echo "Error: $DB_URL_VAR is not set"
  exit 1
fi

DB_URL="${!DB_URL_VAR}"

echo "=== Migration runner ==="
echo "Env:       $ENV"
echo "Action:    $ACTION"
echo "DB host:   $(echo "$DB_URL" | sed -E 's|.*@([^/]+).*|\1|')"
echo "Timestamp: $(date -Iseconds)"
echo ""

if [ "$ENV" = "production" ] && [ "$FORCE" != "--force" ]; then
  echo "⚠️  PRODUCTION MIGRATION"
  echo ""
  read -r -p "Type 'migrate production' to confirm: " CONFIRM
  if [ "$CONFIRM" != "migrate production" ]; then
    echo "Aborted"
    exit 1
  fi
fi

case "$ACTION" in
  up)
    echo "--- Step 1/3: Generate migration files ---"
    pnpm --filter @ecommerce/db exec drizzle-kit generate

    echo ""
    echo "--- Step 2/3: Show pending migrations ---"
    PENDING=$(pnpm --filter @ecommerce/db exec drizzle-kit list 2>&1 || true)
    echo "$PENDING"

    if [ "$ENV" = "production" ]; then
      echo ""
      echo "--- Step 2b/3: Backup DB ---"
      BACKUP_FILE="/tmp/backup-$ENV-$(date +%Y%m%d-%H%M%S).sql.gz"
      pg_dump "$DB_URL" --no-owner --clean --if-exists | gzip > "$BACKUP_FILE"
      echo "Backup written to $BACKUP_FILE ($(stat -c %s "$BACKUP_FILE") bytes)"
    fi

    echo ""
    echo "--- Step 3/3: Apply migrations ---"
    pnpm --filter @ecommerce/db exec drizzle-kit migrate

    echo ""
    echo "✅ Migrations applied to $ENV"
    ;;

  rollback)
    echo "--- Rolling back last migration on $ENV ---"
    if [ "$ENV" = "production" ]; then
      echo "⚠️  PRODUCTION ROLLBACK"
      read -r -p "Type 'rollback production' to confirm: " CONFIRM
      if [ "$CONFIRM" != "rollback production" ]; then
        echo "Aborted"
        exit 1
      fi
    fi
    pnpm --filter @ecommerce/db exec drizzle-kit drop
    echo "⚠️  Last migration dropped. Run '$0 $ENV up' to re-apply."
    ;;

  *)
    echo "Unknown action: $ACTION (use 'up' or 'rollback')"
    exit 1
    ;;
esac