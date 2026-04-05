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
# 2. Environment Variables (Exact Name Comparison)
# ============================================
print_header "ENVIRONMENT VARIABLES"

DEV_VARS=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)
PROD_VARS=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables | keys(@)' --output json 2>/dev/null | jq -r '.[]' | sort)

DEV_COUNT=$(echo "$DEV_VARS" | wc -l | tr -d ' ')
PROD_COUNT=$(echo "$PROD_VARS" | wc -l | tr -d ' ')

# Check each variable by name
echo -e "  Comparing $DEV_COUNT dev variables with $PROD_COUNT prod variables:"
echo ""

# Variables that should exist in both (check by name)
COMMON_VARS=$(comm -12 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))
MISSING_IN_PROD=$(comm -23 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))
MISSING_IN_DEV=$(comm -13 <(echo "$DEV_VARS") <(echo "$PROD_VARS"))

# Show all variables and their status
for var in $DEV_VARS; do
    if echo "$PROD_VARS" | grep -q "^${var}$"; then
        echo -e "  ${GREEN}✓${NC} $var"
    else
        echo -e "  ${RED}✗${NC} $var ${RED}(missing in prod!)${NC}"
        ISSUES=$((ISSUES + 1))
    fi
done

# Show variables only in prod (might be intentional or leftover)
for var in $MISSING_IN_DEV; do
    echo -e "  ${YELLOW}⚠${NC} $var ${YELLOW}(only in prod)${NC}"
    WARNINGS=$((WARNINGS + 1))
done

echo ""
if [ -z "$MISSING_IN_PROD" ] && [ -z "$MISSING_IN_DEV" ]; then
    echo -e "  ${GREEN}✓${NC} All environment variables are aligned"
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

# Critical: App client must not have secret (for web apps)
echo ""
echo "  App Client Configuration:"

# Get client IDs from Amplify env vars
DEV_CLIENT_ID=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables.COGNITO_CLIENT_ID' --output text 2>/dev/null)
PROD_CLIENT_ID=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables.COGNITO_CLIENT_ID' --output text 2>/dev/null)

# Check if dev client has a secret
DEV_CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id $DEV_POOL_ID \
    --client-id "$DEV_CLIENT_ID" --region $AWS_REGION \
    --query 'UserPoolClient.ClientSecret' --output text 2>/dev/null)
if [ "$DEV_CLIENT_SECRET" == "None" ] || [ -z "$DEV_CLIENT_SECRET" ]; then
    echo -e "  ${GREEN}✓${NC} Dev client has no secret (correct for web app)"
else
    echo -e "  ${RED}✗${NC} Dev client HAS a secret - web auth will fail!"
    ISSUES=$((ISSUES + 1))
fi

# Check if prod client has a secret
PROD_CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id $PROD_POOL_ID \
    --client-id "$PROD_CLIENT_ID" --region $AWS_REGION \
    --query 'UserPoolClient.ClientSecret' --output text 2>/dev/null)
if [ "$PROD_CLIENT_SECRET" == "None" ] || [ -z "$PROD_CLIENT_SECRET" ]; then
    echo -e "  ${GREEN}✓${NC} Prod client has no secret (correct for web app)"
else
    echo -e "  ${RED}✗${NC} Prod client HAS a secret - web auth will fail!"
    echo -e "      Create new client without secret: aws cognito-idp create-user-pool-client --no-generate-secret ..."
    ISSUES=$((ISSUES + 1))
fi

# Check custom attributes match between dev and prod
echo ""
echo "  Custom Attributes:"
DEV_CUSTOM_ATTRS=$(aws cognito-idp describe-user-pool --user-pool-id $DEV_POOL_ID --region $AWS_REGION \
    --query 'UserPool.SchemaAttributes[?starts_with(Name, `custom:`)].Name' --output text 2>/dev/null | tr '\t' '\n' | sort)
PROD_CUSTOM_ATTRS=$(aws cognito-idp describe-user-pool --user-pool-id $PROD_POOL_ID --region $AWS_REGION \
    --query 'UserPool.SchemaAttributes[?starts_with(Name, `custom:`)].Name' --output text 2>/dev/null | tr '\t' '\n' | sort)

MISSING_IN_PROD=$(comm -23 <(echo "$DEV_CUSTOM_ATTRS") <(echo "$PROD_CUSTOM_ATTRS") | grep -v "^$")
MISSING_IN_DEV=$(comm -13 <(echo "$DEV_CUSTOM_ATTRS") <(echo "$PROD_CUSTOM_ATTRS") | grep -v "^$")

if [ -z "$MISSING_IN_PROD" ] && [ -z "$MISSING_IN_DEV" ]; then
    echo -e "  ${GREEN}✓${NC} Custom attributes match: $(echo "$DEV_CUSTOM_ATTRS" | tr '\n' ' ')"
else
    if [ -n "$MISSING_IN_PROD" ]; then
        echo -e "  ${RED}✗${NC} Attributes missing in PROD: $MISSING_IN_PROD"
        echo -e "      Add with: aws cognito-idp add-custom-attributes --user-pool-id $PROD_POOL_ID ..."
        ISSUES=$((ISSUES + 1))
    fi
    if [ -n "$MISSING_IN_DEV" ]; then
        echo -e "  ${YELLOW}⚠${NC} Attributes only in PROD: $MISSING_IN_DEV"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

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

# Public Access Block settings
echo ""
echo "  Public Access Settings:"
DEV_PUBLIC_BLOCK=$(aws s3api get-public-access-block --bucket 4tango-dev-uploads \
    --query 'PublicAccessBlockConfiguration.BlockPublicPolicy' --output text 2>/dev/null || echo "false")
PROD_PUBLIC_BLOCK=$(aws s3api get-public-access-block --bucket 4tango-prod-uploads \
    --query 'PublicAccessBlockConfiguration.BlockPublicPolicy' --output text 2>/dev/null || echo "false")
check_match "Block Public Policy" "$DEV_PUBLIC_BLOCK" "$PROD_PUBLIC_BLOCK"

# Check if public read policy exists
DEV_HAS_POLICY=$(aws s3api get-bucket-policy --bucket 4tango-dev-uploads 2>/dev/null && echo "yes" || echo "no")
PROD_HAS_POLICY=$(aws s3api get-bucket-policy --bucket 4tango-prod-uploads 2>/dev/null && echo "yes" || echo "no")
check_match "Has Bucket Policy" "$DEV_HAS_POLICY" "$PROD_HAS_POLICY"

# CORS Configuration
echo ""
echo "  CORS Configuration:"
DEV_CORS_METHODS=$(aws s3api get-bucket-cors --bucket 4tango-dev-uploads \
    --query 'CORSRules[0].AllowedMethods' --output text 2>/dev/null | tr '\t' ',' || echo "NONE")
PROD_CORS_METHODS=$(aws s3api get-bucket-cors --bucket 4tango-prod-uploads \
    --query 'CORSRules[0].AllowedMethods' --output text 2>/dev/null | tr '\t' ',' || echo "NONE")
check_match "CORS Methods" "$DEV_CORS_METHODS" "$PROD_CORS_METHODS"

# Check CORS origins (expected to differ)
DEV_CORS_ORIGINS=$(aws s3api get-bucket-cors --bucket 4tango-dev-uploads \
    --query 'CORSRules[0].AllowedOrigins' --output text 2>/dev/null | tr '\t' ',' || echo "NONE")
PROD_CORS_ORIGINS=$(aws s3api get-bucket-cors --bucket 4tango-prod-uploads \
    --query 'CORSRules[0].AllowedOrigins' --output text 2>/dev/null | tr '\t' ',' || echo "NONE")
check_match "CORS Origins" "$DEV_CORS_ORIGINS" "$PROD_CORS_ORIGINS" "yes"

# IAM User Permissions for S3
echo ""
echo "  IAM Permissions (4tango-ses-sender):"
S3_POLICY=$(aws iam get-user-policy --user-name 4tango-ses-sender --policy-name 4tango-s3-uploads \
    --query 'PolicyDocument.Statement[0].Action' --output text 2>/dev/null | tr '\t' ',' || echo "NONE")
if [ "$S3_POLICY" != "NONE" ]; then
    echo -e "  ${GREEN}✓${NC} S3 upload policy exists: $S3_POLICY"
else
    echo -e "  ${RED}✗${NC} S3 upload policy missing for IAM user!"
    echo "      Run: aws iam put-user-policy --user-name 4tango-ses-sender --policy-name 4tango-s3-uploads ..."
    ISSUES=$((ISSUES + 1))
fi

# ============================================
# 6. Database Schema Comparison
# ============================================
print_header "DATABASE SCHEMA (Prisma)"

# Get connection strings from Amplify env vars
DEV_DB_URL=$(aws amplify get-app --app-id $DEV_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables.DATABASE_URL' --output text 2>/dev/null)
PROD_DB_URL=$(aws amplify get-app --app-id $PROD_APP_ID --region $AWS_REGION \
    --query 'app.environmentVariables.DATABASE_URL' --output text 2>/dev/null)

if [ -z "$DEV_DB_URL" ] || [ "$DEV_DB_URL" == "None" ]; then
    echo -e "  ${YELLOW}⚠${NC} Could not retrieve dev DATABASE_URL"
    WARNINGS=$((WARNINGS + 1))
elif [ -z "$PROD_DB_URL" ] || [ "$PROD_DB_URL" == "None" ]; then
    echo -e "  ${YELLOW}⚠${NC} Could not retrieve prod DATABASE_URL"
    WARNINGS=$((WARNINGS + 1))
else
    # Create temp directory for schema comparison
    TEMP_DIR=$(mktemp -d)

    # Pull schemas (suppress prisma warnings)
    echo "  Pulling dev schema..."
    DATABASE_URL="$DEV_DB_URL" npx prisma db pull --print 2>/dev/null | grep -v "^Prisma" > "$TEMP_DIR/dev_schema.prisma" 2>/dev/null

    echo "  Pulling prod schema..."
    DATABASE_URL="$PROD_DB_URL" npx prisma db pull --print 2>/dev/null | grep -v "^Prisma" > "$TEMP_DIR/prod_schema.prisma" 2>/dev/null

    # Compare schemas
    if [ ! -s "$TEMP_DIR/dev_schema.prisma" ]; then
        echo -e "  ${YELLOW}⚠${NC} Could not pull dev schema (connection issue or empty DB)"
        WARNINGS=$((WARNINGS + 1))
    elif [ ! -s "$TEMP_DIR/prod_schema.prisma" ]; then
        echo -e "  ${YELLOW}⚠${NC} Could not pull prod schema (connection issue or empty DB)"
        WARNINGS=$((WARNINGS + 1))
    else
        # Extract table names from both schemas
        DEV_TABLES=$(grep -E "^model " "$TEMP_DIR/dev_schema.prisma" | awk '{print $2}' | sort)
        PROD_TABLES=$(grep -E "^model " "$TEMP_DIR/prod_schema.prisma" | awk '{print $2}' | sort)

        DEV_TABLE_COUNT=$(echo "$DEV_TABLES" | wc -l | tr -d ' ')
        PROD_TABLE_COUNT=$(echo "$PROD_TABLES" | wc -l | tr -d ' ')

        echo ""
        echo "  Tables: Dev=$DEV_TABLE_COUNT, Prod=$PROD_TABLE_COUNT"
        echo ""

        # Check for missing tables
        MISSING_IN_PROD=$(comm -23 <(echo "$DEV_TABLES") <(echo "$PROD_TABLES"))
        MISSING_IN_DEV=$(comm -13 <(echo "$DEV_TABLES") <(echo "$PROD_TABLES"))

        if [ -n "$MISSING_IN_PROD" ]; then
            for table in $MISSING_IN_PROD; do
                echo -e "  ${RED}✗${NC} Table '$table' ${RED}(missing in prod!)${NC}"
                ISSUES=$((ISSUES + 1))
            done
        fi

        if [ -n "$MISSING_IN_DEV" ]; then
            for table in $MISSING_IN_DEV; do
                echo -e "  ${YELLOW}⚠${NC} Table '$table' ${YELLOW}(only in prod)${NC}"
                WARNINGS=$((WARNINGS + 1))
            done
        fi

        # Compare full schema hashes
        DEV_HASH=$(md5 -q "$TEMP_DIR/dev_schema.prisma" 2>/dev/null || md5sum "$TEMP_DIR/dev_schema.prisma" | cut -d' ' -f1)
        PROD_HASH=$(md5 -q "$TEMP_DIR/prod_schema.prisma" 2>/dev/null || md5sum "$TEMP_DIR/prod_schema.prisma" | cut -d' ' -f1)

        if [ "$DEV_HASH" == "$PROD_HASH" ]; then
            echo -e "  ${GREEN}✓${NC} Database schemas are identical"
        elif [ -z "$MISSING_IN_PROD" ] && [ -z "$MISSING_IN_DEV" ]; then
            echo -e "  ${YELLOW}⚠${NC} Schemas have same tables but differ in columns/indexes"
            echo "      Run 'npx prisma migrate status' on each environment to check"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi

    # Cleanup
    rm -rf "$TEMP_DIR"
fi

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
