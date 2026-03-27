#!/bin/bash

# 4Tango Sync to Production Script
# Syncs configuration from dev to prod
# Usage: ./scripts/sync-to-prod.sh [env|db|all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# AWS Config
DEV_APP_ID="d35qopwzo3l31w"
PROD_APP_ID="d3jwiy3qjkzx5q"
AWS_REGION="eu-west-1"

# Prod Database URL (fetch from Amplify)
get_prod_db_url() {
    aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables.DATABASE_URL' --output text 2>/dev/null
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Sync environment variables from dev to prod
sync_env() {
    print_header "SYNCING ENVIRONMENT VARIABLES"

    echo "Fetching dev environment variables..."
    DEV_VARS=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables' --output json 2>/dev/null)

    echo "Fetching prod environment variables..."
    PROD_VARS=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables' --output json 2>/dev/null)

    # Find missing variables
    DEV_KEYS=$(echo "$DEV_VARS" | jq -r 'keys[]' | sort)
    PROD_KEYS=$(echo "$PROD_VARS" | jq -r 'keys[]' | sort)

    MISSING=$(comm -23 <(echo "$DEV_KEYS") <(echo "$PROD_KEYS"))

    if [ -z "$MISSING" ]; then
        echo -e "${GREEN}✓${NC} All environment variables are in sync"
        return 0
    fi

    echo ""
    echo -e "${YELLOW}The following variables are in DEV but not in PROD:${NC}"
    echo "$MISSING" | while read var; do
        VALUE=$(echo "$DEV_VARS" | jq -r ".[\"$var\"]")
        echo "   $var = ${VALUE:0:20}..."
    done

    echo ""
    echo -e "${YELLOW}⚠ WARNING: Some variables should NOT be copied directly:${NC}"
    echo "   - DATABASE_URL (different database)"
    echo "   - NEXT_PUBLIC_URL (different domain)"
    echo "   - Cognito vars (may need separate prod pool)"
    echo ""

    read -p "Do you want to see commands to sync these? (y/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Run these commands to add missing variables to prod:"
        echo ""
        echo "$MISSING" | while read var; do
            VALUE=$(echo "$DEV_VARS" | jq -r ".[\"$var\"]" | sed 's/"/\\"/g')
            echo "aws amplify update-app --app-id $PROD_APP_ID --region $AWS_REGION \\"
            echo "  --environment-variables '{\"$var\":\"$VALUE\"}'"
            echo ""
        done

        echo "Then trigger a redeploy:"
        echo "aws amplify start-job --app-id $PROD_APP_ID --branch-name main --job-type RELEASE --region $AWS_REGION"
    fi
}

# Sync database schema from dev to prod
sync_db() {
    print_header "SYNCING DATABASE SCHEMA"

    echo "Fetching prod DATABASE_URL..."
    PROD_DB_URL=$(get_prod_db_url)

    if [ -z "$PROD_DB_URL" ] || [ "$PROD_DB_URL" == "None" ]; then
        echo -e "${RED}✗${NC} Could not fetch prod DATABASE_URL from Amplify"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Got prod DATABASE_URL"
    echo ""

    echo "Current local schema will be pushed to PRODUCTION database."
    echo -e "${YELLOW}⚠ WARNING: This may modify the production database schema!${NC}"
    echo ""

    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Pushing schema to production..."
        DATABASE_URL="$PROD_DB_URL" npx prisma db push

        echo ""
        echo -e "${GREEN}✓${NC} Schema synced to production"
    else
        echo "Aborted."
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  env     - Compare and sync environment variables"
    echo "  db      - Sync database schema to production"
    echo "  all     - Run all sync operations"
    echo ""
    echo "Examples:"
    echo "  $0 env      # Check/sync env vars"
    echo "  $0 db       # Push schema to prod DB"
    echo "  $0 all      # Do everything"
}

# Main
case "${1:-help}" in
    env)
        sync_env
        ;;
    db)
        sync_db
        ;;
    all)
        sync_env
        sync_db
        ;;
    *)
        show_help
        ;;
esac

echo ""
