#!/bin/bash

# 4Tango System Status Check Script
# Usage: ./scripts/status.sh [quick|full|health|deploy|db]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# AWS Config
DEV_APP_ID="d35qopwzo3l31w"
PROD_APP_ID="d3jwiy3qjkzx5q"
AWS_REGION="eu-west-1"

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Health Check
check_health() {
    print_header "SITE HEALTH"

    # Dev
    DEV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://dev.4tango.com 2>/dev/null || echo "000")
    if [ "$DEV_STATUS" == "200" ]; then
        check_ok "Dev (dev.4tango.com): $DEV_STATUS"
    else
        check_fail "Dev (dev.4tango.com): $DEV_STATUS"
    fi

    # Prod
    PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://4tango.com 2>/dev/null || echo "000")
    if [ "$PROD_STATUS" == "200" ]; then
        check_ok "Prod (4tango.com): $PROD_STATUS"
    else
        check_fail "Prod (4tango.com): $PROD_STATUS"
    fi

    # API Health
    DEV_API=$(curl -s -o /dev/null -w "%{http_code}" https://dev.4tango.com/api/health 2>/dev/null || echo "000")
    PROD_API=$(curl -s -o /dev/null -w "%{http_code}" https://4tango.com/api/health 2>/dev/null || echo "000")

    echo ""
    echo "API Health Endpoints:"
    if [ "$DEV_API" == "200" ]; then
        check_ok "Dev API: $DEV_API"
    else
        check_warn "Dev API: $DEV_API"
    fi

    if [ "$PROD_API" == "200" ]; then
        check_ok "Prod API: $PROD_API"
    else
        check_warn "Prod API: $PROD_API"
    fi
}

# Deployment Status
check_deploy() {
    print_header "DEPLOYMENT STATUS"

    echo "Dev (develop branch):"
    DEV_DEPLOY=$(aws amplify list-jobs --app-id $DEV_APP_ID --branch-name develop --region $AWS_REGION \
        --query 'jobSummaries[0].{status:status,commit:commitId,time:endTime}' --output json 2>/dev/null)

    DEV_STATUS=$(echo $DEV_DEPLOY | jq -r '.status')
    DEV_COMMIT=$(echo $DEV_DEPLOY | jq -r '.commit' | cut -c1-7)
    DEV_TIME=$(echo $DEV_DEPLOY | jq -r '.time')

    if [ "$DEV_STATUS" == "SUCCEED" ]; then
        check_ok "Status: $DEV_STATUS"
    elif [ "$DEV_STATUS" == "RUNNING" ]; then
        check_warn "Status: $DEV_STATUS (in progress)"
    else
        check_fail "Status: $DEV_STATUS"
    fi
    echo "   Commit: $DEV_COMMIT"
    echo "   Time: $DEV_TIME"

    echo ""
    echo "Prod (main branch):"
    PROD_DEPLOY=$(aws amplify list-jobs --app-id $PROD_APP_ID --branch-name main --region $AWS_REGION \
        --query 'jobSummaries[0].{status:status,commit:commitId,time:endTime}' --output json 2>/dev/null)

    PROD_STATUS=$(echo $PROD_DEPLOY | jq -r '.status')
    PROD_COMMIT=$(echo $PROD_DEPLOY | jq -r '.commit' | cut -c1-7)
    PROD_TIME=$(echo $PROD_DEPLOY | jq -r '.time')

    if [ "$PROD_STATUS" == "SUCCEED" ]; then
        check_ok "Status: $PROD_STATUS"
    elif [ "$PROD_STATUS" == "RUNNING" ]; then
        check_warn "Status: $PROD_STATUS (in progress)"
    else
        check_fail "Status: $PROD_STATUS"
    fi
    echo "   Commit: $PROD_COMMIT"
    echo "   Time: $PROD_TIME"

    # Check if commits match
    echo ""
    if [ "$DEV_COMMIT" == "$PROD_COMMIT" ]; then
        check_ok "Dev and Prod are on same commit: $DEV_COMMIT"
    else
        check_warn "Dev ($DEV_COMMIT) and Prod ($PROD_COMMIT) are on different commits"
    fi
}

# Git Status
check_git() {
    print_header "GIT STATUS"

    CURRENT_BRANCH=$(git branch --show-current)
    echo "Current branch: $CURRENT_BRANCH"
    echo ""

    # Fetch latest
    git fetch origin --quiet 2>/dev/null

    # Check if branches are in sync
    DEVELOP_COMMIT=$(git rev-parse origin/develop 2>/dev/null | cut -c1-7)
    MAIN_COMMIT=$(git rev-parse origin/main 2>/dev/null | cut -c1-7)

    echo "Branch commits:"
    echo "   develop: $DEVELOP_COMMIT"
    echo "   main:    $MAIN_COMMIT"
    echo ""

    if [ "$DEVELOP_COMMIT" == "$MAIN_COMMIT" ]; then
        check_ok "Branches are in sync"
    else
        AHEAD_COUNT=$(git rev-list origin/main..origin/develop --count 2>/dev/null || echo "?")
        check_warn "develop is $AHEAD_COUNT commit(s) ahead of main"
        echo ""
        echo "Commits on develop not in main:"
        git log origin/main..origin/develop --oneline 2>/dev/null | head -5
    fi

    # Check for uncommitted changes
    echo ""
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "You have uncommitted changes"
        git status --short
    else
        check_ok "Working directory is clean"
    fi
}

# Database Status
check_db() {
    print_header "DATABASE STATUS"

    echo "Checking schema sync..."

    # Check if prisma can connect
    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        check_ok "Dev database connection: OK"
    else
        check_fail "Dev database connection: FAILED"
    fi

    echo ""
    echo "To compare schemas, run:"
    echo "   npx prisma db pull --print  # Shows current DB schema"
    echo "   npx prisma migrate status   # Shows migration status"
}

# Environment Variables
check_env() {
    print_header "ENVIRONMENT VARIABLES"

    echo "Dev environment:"
    aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | while read var; do
        echo "   ✓ $var"
    done

    echo ""
    echo "Prod environment:"
    aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | while read var; do
        echo "   ✓ $var"
    done

    # Compare
    echo ""
    DEV_VARS=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)
    PROD_VARS=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
        --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)

    MISSING=$(comm -23 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))
    if [ -n "$MISSING" ]; then
        check_warn "Variables in Dev but not in Prod:"
        echo "$MISSING" | while read var; do
            echo "   - $var"
        done
    else
        check_ok "All Dev variables exist in Prod"
    fi
}

# Quick status (default)
quick_status() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           4TANGO SYSTEM STATUS                            ║${NC}"
    echo -e "${BLUE}║           $(date '+%Y-%m-%d %H:%M:%S')                             ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

    check_health
    check_deploy
    check_git
}

# Full status
full_status() {
    quick_status
    check_db
    check_env
}

# Main
case "${1:-quick}" in
    quick)
        quick_status
        ;;
    full)
        full_status
        ;;
    health)
        check_health
        ;;
    deploy)
        check_deploy
        ;;
    git)
        check_git
        ;;
    db)
        check_db
        ;;
    env)
        check_env
        ;;
    *)
        echo "Usage: $0 [quick|full|health|deploy|git|db|env]"
        echo ""
        echo "Commands:"
        echo "  quick   - Health, deployments, and git status (default)"
        echo "  full    - All checks including database and env vars"
        echo "  health  - Check if sites are responding"
        echo "  deploy  - Check deployment status"
        echo "  git     - Check git branch status"
        echo "  db      - Check database connection"
        echo "  env     - Compare environment variables"
        exit 1
        ;;
esac

echo ""
