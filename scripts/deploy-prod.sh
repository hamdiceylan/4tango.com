#!/bin/bash

# 4Tango Production Deployment Script
# Usage: ./scripts/deploy-prod.sh [--skip-checks] [--watch]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SKIP_CHECKS=false
WATCH_BUILD=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-checks) SKIP_CHECKS=true ;;
        --watch) WATCH_BUILD=true ;;
    esac
done

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           4TANGO PRODUCTION DEPLOYMENT                    ║${NC}"
echo -e "${BLUE}║           $(date '+%Y-%m-%d %H:%M:%S')                              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# ============================================
# Step 1: Pre-deployment Checks
# ============================================
if [ "$SKIP_CHECKS" = false ]; then
    echo ""
    echo -e "${BLUE}━━━ STEP 1: Pre-deployment Checks ━━━${NC}"
    echo ""

    # Check git status
    echo -e "${YELLOW}Checking git status...${NC}"
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${RED}✗ You have uncommitted changes. Commit or stash them first.${NC}"
        git status --short
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Working directory clean"

    # Check we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠ You're on '$CURRENT_BRANCH', not 'main'. Deploy anyway? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 1
        fi
    else
        echo -e "${GREEN}✓${NC} On main branch"
    fi

    # Run infrastructure deep check
    echo ""
    echo -e "${YELLOW}Running infrastructure comparison...${NC}"
    if ! npm run infra:deep; then
        echo -e "${RED}✗ Infrastructure check found critical issues. Fix them first.${NC}"
        exit 1
    fi

    # Run health check
    echo ""
    echo -e "${YELLOW}Running health checks...${NC}"
    npm run status:health

    # Local build test
    echo ""
    echo -e "${YELLOW}Testing local build...${NC}"
    if ! npm run build; then
        echo -e "${RED}✗ Build failed locally. Fix errors before deploying.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Local build successful"
fi

# ============================================
# Step 2: Trigger Deployment
# ============================================
echo ""
echo -e "${BLUE}━━━ STEP 2: Triggering Production Deployment ━━━${NC}"
echo ""

APP_ID="d3jwiy3qjkzx5q"
BRANCH="main"
REGION="eu-west-1"

# Push to main (triggers Amplify build)
echo -e "${YELLOW}Pushing to main branch...${NC}"
git push origin main

# Or manually trigger if already pushed
# aws amplify start-job --app-id $APP_ID --branch-name $BRANCH --job-type RELEASE --region $REGION

echo -e "${GREEN}✓${NC} Deployment triggered"

# ============================================
# Step 3: Monitor Build (optional)
# ============================================
if [ "$WATCH_BUILD" = true ]; then
    echo ""
    echo -e "${BLUE}━━━ STEP 3: Monitoring Build ━━━${NC}"
    echo ""

    while true; do
        STATUS=$(aws amplify list-jobs --app-id $APP_ID --branch-name $BRANCH --region $REGION \
            --query 'jobSummaries[0].status' --output text 2>/dev/null)

        case $STATUS in
            PENDING|RUNNING)
                echo -e "  Build status: ${YELLOW}$STATUS${NC}"
                sleep 15
                ;;
            SUCCEED)
                echo -e "  Build status: ${GREEN}$STATUS${NC}"
                break
                ;;
            FAILED|CANCELLED)
                echo -e "  Build status: ${RED}$STATUS${NC}"
                echo -e "${RED}✗ Build failed! Check Amplify console for details.${NC}"
                exit 1
                ;;
            *)
                echo -e "  Build status: $STATUS"
                sleep 15
                ;;
        esac
    done
fi

# ============================================
# Step 4: Post-deployment Verification
# ============================================
echo ""
echo -e "${BLUE}━━━ STEP 4: Post-deployment Verification ━━━${NC}"
echo ""

echo -e "${YELLOW}Waiting 30s for deployment to propagate...${NC}"
sleep 30

echo -e "${YELLOW}Running health checks...${NC}"
npm run status:health

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           DEPLOYMENT COMPLETE                             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Production URL: https://4tango.com"
echo "  Amplify Console: https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo ""
