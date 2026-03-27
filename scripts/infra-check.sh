#!/bin/bash

# 4Tango Infrastructure Drift Check
# Compares dev and prod AWS configurations
# Usage: ./scripts/infra-check.sh

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

ISSUES=0

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
    ISSUES=$((ISSUES + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       4TANGO INFRASTRUCTURE DRIFT CHECK                   ║${NC}"
echo -e "${BLUE}║       $(date '+%Y-%m-%d %H:%M:%S')                              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# ============================================
# 1. Amplify Apps
# ============================================
print_header "AMPLIFY HOSTING"

DEV_APP=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION 2>/dev/null)
PROD_APP=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION 2>/dev/null)

if [ -n "$DEV_APP" ]; then
    check_ok "Dev app exists: $DEV_APP_ID"
else
    check_fail "Dev app NOT FOUND: $DEV_APP_ID"
fi

if [ -n "$PROD_APP" ]; then
    check_ok "Prod app exists: $PROD_APP_ID"
else
    check_fail "Prod app NOT FOUND: $PROD_APP_ID"
fi

# ============================================
# 2. Environment Variables Comparison
# ============================================
print_header "ENVIRONMENT VARIABLES"

DEV_VARS=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)
PROD_VARS=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)

# Variables in dev but not in prod
MISSING_IN_PROD=$(comm -23 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))
if [ -n "$MISSING_IN_PROD" ]; then
    check_fail "Variables in DEV but missing in PROD:"
    echo "$MISSING_IN_PROD" | while read var; do
        echo -e "   ${RED}→${NC} $var"
    done
else
    check_ok "All dev variables exist in prod"
fi

# Variables in prod but not in dev
MISSING_IN_DEV=$(comm -13 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))
if [ -n "$MISSING_IN_DEV" ]; then
    check_warn "Variables in PROD but not in DEV (may be intentional):"
    echo "$MISSING_IN_DEV" | while read var; do
        echo -e "   ${YELLOW}→${NC} $var"
    done
fi

# ============================================
# 3. RDS Databases
# ============================================
print_header "RDS DATABASES"

DEV_RDS=$(aws rds describe-db-instances --db-instance-identifier tango-dev --region $AWS_REGION \
    --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "NOT_FOUND")
PROD_RDS=$(aws rds describe-db-instances --db-instance-identifier tango-prod --region $AWS_REGION \
    --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$DEV_RDS" == "available" ]; then
    check_ok "Dev database: available"
else
    check_fail "Dev database: $DEV_RDS"
fi

if [ "$PROD_RDS" == "available" ]; then
    check_ok "Prod database: available"
else
    check_fail "Prod database: $PROD_RDS"
fi

# Compare RDS configurations
DEV_CLASS=$(aws rds describe-db-instances --db-instance-identifier tango-dev --region $AWS_REGION \
    --query 'DBInstances[0].DBInstanceClass' --output text 2>/dev/null)
PROD_CLASS=$(aws rds describe-db-instances --db-instance-identifier tango-prod --region $AWS_REGION \
    --query 'DBInstances[0].DBInstanceClass' --output text 2>/dev/null)

echo ""
echo "Instance classes:"
echo "   Dev:  $DEV_CLASS"
echo "   Prod: $PROD_CLASS"

PROD_MULTIAZ=$(aws rds describe-db-instances --db-instance-identifier tango-prod --region $AWS_REGION \
    --query 'DBInstances[0].MultiAZ' --output text 2>/dev/null)
if [ "$PROD_MULTIAZ" == "True" ]; then
    check_ok "Prod has Multi-AZ enabled (high availability)"
else
    check_warn "Prod does NOT have Multi-AZ enabled"
fi

# ============================================
# 4. Cognito User Pools
# ============================================
print_header "COGNITO (SOCIAL LOGIN)"

COGNITO_POOLS=$(aws cognito-idp list-user-pools --max-results 20 --region $AWS_REGION \
    --query 'UserPools[].Name' --output json 2>/dev/null | jq -r '.[]')

if echo "$COGNITO_POOLS" | grep -q "4tango-dev"; then
    check_ok "Dev Cognito pool exists: 4tango-dev"
else
    check_fail "Dev Cognito pool NOT FOUND"
fi

if echo "$COGNITO_POOLS" | grep -q "4tango-prod"; then
    check_ok "Prod Cognito pool exists: 4tango-prod"
else
    check_fail "Prod Cognito pool NOT FOUND - Social login (Google/Apple) won't work!"
fi

# ============================================
# 5. S3 Buckets
# ============================================
print_header "S3 STORAGE"

if aws s3 ls s3://4tango-dev-uploads >/dev/null 2>&1; then
    check_ok "Dev S3 bucket exists: 4tango-dev-uploads"
else
    check_fail "Dev S3 bucket NOT FOUND"
fi

if aws s3 ls s3://4tango-prod-uploads >/dev/null 2>&1; then
    check_ok "Prod S3 bucket exists: 4tango-prod-uploads"
else
    check_fail "Prod S3 bucket NOT FOUND"
fi

# ============================================
# 6. SES Email
# ============================================
print_header "SES EMAIL"

SES_IDENTITIES=$(aws ses list-identities --region $AWS_REGION --output json 2>/dev/null | jq -r '.Identities[]')

if echo "$SES_IDENTITIES" | grep -q "4tango.com"; then
    check_ok "SES domain verified: 4tango.com"
else
    check_fail "SES domain NOT verified: 4tango.com"
fi

# ============================================
# 7. Database Schema Sync
# ============================================
print_header "DATABASE SCHEMA"

echo "Run these commands to check schema sync:"
echo ""
echo "   # Compare local schema with dev DB:"
echo "   npx prisma db pull --print | head -50"
echo ""
echo "   # Compare with prod DB:"
echo "   DATABASE_URL=\"\$PROD_DATABASE_URL\" npx prisma db pull --print | head -50"

# ============================================
# Summary
# ============================================
print_header "SUMMARY"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ No critical issues found${NC}"
    echo ""
    echo "Dev and Prod infrastructure are aligned."
else
    echo -e "${RED}✗ Found $ISSUES issue(s) that need attention${NC}"
    echo ""
    echo "Please review the issues above and fix before deploying to production."
fi

echo ""
echo "For detailed infrastructure documentation, see: INFRASTRUCTURE.md"
echo ""

exit $ISSUES
