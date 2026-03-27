#!/bin/bash

# 4Tango Deep Infrastructure Comparison
# Compares actual configurations between dev and prod
# Usage: ./scripts/infra-deep-check.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# AWS Config
DEV_APP_ID="d35qopwzo3l31w"
PROD_APP_ID="d3jwiy3qjkzx5q"
DEV_POOL_ID="eu-west-1_xf1rFIxFp"
PROD_POOL_ID="eu-west-1_rsb53q7Ks"
AWS_REGION="eu-west-1"

ISSUES=0
WARNINGS=0

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_match() {
    local name="$1"
    local dev_val="$2"
    local prod_val="$3"
    local expected_diff="$4"  # "yes" if difference is expected

    if [ "$dev_val" == "$prod_val" ]; then
        echo -e "  ${GREEN}✓${NC} $name: $dev_val"
    elif [ "$expected_diff" == "yes" ]; then
        echo -e "  ${CYAN}○${NC} $name: Dev=$dev_val, Prod=$prod_val ${CYAN}(intentional)${NC}"
    else
        echo -e "  ${RED}✗${NC} $name: Dev=$dev_val, Prod=$prod_val ${RED}(MISMATCH!)${NC}"
        ISSUES=$((ISSUES + 1))
    fi
}

check_warn() {
    local name="$1"
    local dev_val="$2"
    local prod_val="$3"

    if [ "$dev_val" == "$prod_val" ]; then
        echo -e "  ${GREEN}✓${NC} $name: $dev_val"
    else
        echo -e "  ${YELLOW}⚠${NC} $name: Dev=$dev_val, Prod=$prod_val ${YELLOW}(review)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       4TANGO DEEP INFRASTRUCTURE COMPARISON               ║${NC}"
echo -e "${BLUE}║       $(date '+%Y-%m-%d %H:%M:%S')                              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# ============================================
# 1. Amplify Build Spec Comparison
# ============================================
print_header "AMPLIFY BUILD CONFIGURATION"

DEV_BUILDSPEC=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.buildSpec' --output text 2>/dev/null | md5 | cut -c1-8)
PROD_BUILDSPEC=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.buildSpec' --output text 2>/dev/null | md5 | cut -c1-8)

if [ "$DEV_BUILDSPEC" == "$PROD_BUILDSPEC" ]; then
    echo -e "  ${GREEN}✓${NC} Build specs are identical"
else
    echo -e "  ${RED}✗${NC} Build specs differ! (Dev: $DEV_BUILDSPEC, Prod: $PROD_BUILDSPEC)"
    ISSUES=$((ISSUES + 1))
fi

# Check platform
DEV_PLATFORM=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.platform' --output text 2>/dev/null)
PROD_PLATFORM=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.platform' --output text 2>/dev/null)
check_match "Platform" "$DEV_PLATFORM" "$PROD_PLATFORM"

# ============================================
# 2. Environment Variables
# ============================================
print_header "ENVIRONMENT VARIABLES"

DEV_VARS=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)
PROD_VARS=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)

DEV_COUNT=$(echo "$DEV_VARS" | wc -l | tr -d ' ')
PROD_COUNT=$(echo "$PROD_VARS" | wc -l | tr -d ' ')

echo -e "  Dev has $DEV_COUNT variables, Prod has $PROD_COUNT variables"

MISSING_IN_PROD=$(comm -23 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))
MISSING_IN_DEV=$(comm -13 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))

if [ -z "$MISSING_IN_PROD" ]; then
    echo -e "  ${GREEN}✓${NC} All dev variables exist in prod"
else
    echo -e "  ${RED}✗${NC} Missing in prod: $MISSING_IN_PROD"
    ISSUES=$((ISSUES + 1))
fi

# ============================================
# 3. RDS Configuration
# ============================================
print_header "RDS DATABASE CONFIGURATION"

DEV_RDS=$(aws rds describe-db-instances --db-instance-identifier tango-dev --region $AWS_REGION \
    --query 'DBInstances[0]' --output json 2>/dev/null)
PROD_RDS=$(aws rds describe-db-instances --db-instance-identifier tango-prod --region $AWS_REGION \
    --query 'DBInstances[0]' --output json 2>/dev/null)

# Critical: Engine version must match
DEV_VERSION=$(echo "$DEV_RDS" | jq -r '.EngineVersion')
PROD_VERSION=$(echo "$PROD_RDS" | jq -r '.EngineVersion')
check_match "PostgreSQL Version" "$DEV_VERSION" "$PROD_VERSION"

# Critical: Encryption
DEV_ENCRYPTED=$(echo "$DEV_RDS" | jq -r '.StorageEncrypted')
PROD_ENCRYPTED=$(echo "$PROD_RDS" | jq -r '.StorageEncrypted')
check_match "Storage Encrypted" "$DEV_ENCRYPTED" "$PROD_ENCRYPTED"

# Expected to differ: Instance class
DEV_CLASS=$(echo "$DEV_RDS" | jq -r '.DBInstanceClass')
PROD_CLASS=$(echo "$PROD_RDS" | jq -r '.DBInstanceClass')
check_match "Instance Class" "$DEV_CLASS" "$PROD_CLASS" "yes"

# Expected to differ: Multi-AZ
DEV_MULTIAZ=$(echo "$DEV_RDS" | jq -r '.MultiAZ')
PROD_MULTIAZ=$(echo "$PROD_RDS" | jq -r '.MultiAZ')
check_match "Multi-AZ" "$DEV_MULTIAZ" "$PROD_MULTIAZ" "yes"

# Warning: Backup retention
DEV_BACKUP=$(echo "$DEV_RDS" | jq -r '.BackupRetentionPeriod')
PROD_BACKUP=$(echo "$PROD_RDS" | jq -r '.BackupRetentionPeriod')
check_warn "Backup Retention (days)" "$DEV_BACKUP" "$PROD_BACKUP"

# ============================================
# 4. Cognito Configuration
# ============================================
print_header "COGNITO CONFIGURATION"

DEV_COGNITO=$(aws cognito-idp describe-user-pool --user-pool-id $DEV_POOL_ID --region $AWS_REGION \
    --query 'UserPool' --output json 2>/dev/null)
PROD_COGNITO=$(aws cognito-idp describe-user-pool --user-pool-id $PROD_POOL_ID --region $AWS_REGION \
    --query 'UserPool' --output json 2>/dev/null)

# Critical: Password policy
DEV_MIN_LEN=$(echo "$DEV_COGNITO" | jq -r '.Policies.PasswordPolicy.MinimumLength')
PROD_MIN_LEN=$(echo "$PROD_COGNITO" | jq -r '.Policies.PasswordPolicy.MinimumLength')
check_match "Min Password Length" "$DEV_MIN_LEN" "$PROD_MIN_LEN"

DEV_REQ_UPPER=$(echo "$DEV_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireUppercase')
PROD_REQ_UPPER=$(echo "$PROD_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireUppercase')
check_match "Require Uppercase" "$DEV_REQ_UPPER" "$PROD_REQ_UPPER"

DEV_REQ_LOWER=$(echo "$DEV_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireLowercase')
PROD_REQ_LOWER=$(echo "$PROD_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireLowercase')
check_match "Require Lowercase" "$DEV_REQ_LOWER" "$PROD_REQ_LOWER"

DEV_REQ_NUM=$(echo "$DEV_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireNumbers')
PROD_REQ_NUM=$(echo "$PROD_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireNumbers')
check_match "Require Numbers" "$DEV_REQ_NUM" "$PROD_REQ_NUM"

DEV_REQ_SYM=$(echo "$DEV_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireSymbols')
PROD_REQ_SYM=$(echo "$PROD_COGNITO" | jq -r '.Policies.PasswordPolicy.RequireSymbols')
check_match "Require Symbols" "$DEV_REQ_SYM" "$PROD_REQ_SYM"

# Critical: MFA config
DEV_MFA=$(echo "$DEV_COGNITO" | jq -r '.MfaConfiguration')
PROD_MFA=$(echo "$PROD_COGNITO" | jq -r '.MfaConfiguration')
check_match "MFA Configuration" "$DEV_MFA" "$PROD_MFA"

# ============================================
# 5. S3 Configuration
# ============================================
print_header "S3 BUCKET CONFIGURATION"

# Encryption
DEV_S3_ENC=$(aws s3api get-bucket-encryption --bucket 4tango-dev-uploads --region $AWS_REGION \
    --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' \
    --output text 2>/dev/null || echo "NONE")
PROD_S3_ENC=$(aws s3api get-bucket-encryption --bucket 4tango-prod-uploads --region $AWS_REGION \
    --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' \
    --output text 2>/dev/null || echo "NONE")
check_match "Encryption" "$DEV_S3_ENC" "$PROD_S3_ENC"

# Versioning (expected to differ)
DEV_S3_VER=$(aws s3api get-bucket-versioning --bucket 4tango-dev-uploads --region $AWS_REGION \
    --query 'Status' --output text 2>/dev/null || echo "Disabled")
PROD_S3_VER=$(aws s3api get-bucket-versioning --bucket 4tango-prod-uploads --region $AWS_REGION \
    --query 'Status' --output text 2>/dev/null || echo "Disabled")
check_match "Versioning" "$DEV_S3_VER" "$PROD_S3_VER" "yes"

# ============================================
# Summary
# ============================================
print_header "SUMMARY"

echo ""
if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All configurations are aligned!${NC}"
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠ Found $WARNINGS warning(s) to review${NC}"
    echo "  Warnings are differences that may be intentional but should be verified."
else
    echo -e "${RED}✗ Found $ISSUES critical issue(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "  Critical issues may cause different behavior between dev and prod!"
    echo "  Please fix before deploying to production."
fi

echo ""
echo "Legend:"
echo -e "  ${GREEN}✓${NC} Matching configuration"
echo -e "  ${CYAN}○${NC} Intentional difference (expected)"
echo -e "  ${YELLOW}⚠${NC} Warning - review recommended"
echo -e "  ${RED}✗${NC} Critical mismatch - fix required"
echo ""

exit $ISSUES
