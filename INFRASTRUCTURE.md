# 4Tango AWS Infrastructure

> **Last Updated**: 2026-03-27
> **Region**: eu-west-1 (Ireland)

## Quick Reference

| Service | Dev | Prod | Shared |
|---------|-----|------|--------|
| Amplify | d35qopwzo3l31w | d3jwiy3qjkzx5q | - |
| RDS PostgreSQL | tango-dev | tango-prod | - |
| Cognito | eu-west-1_xf1rFIxFp | eu-west-1_rsb53q7Ks | - |
| S3 | 4tango-dev-uploads | 4tango-prod-uploads | - |
| SES | - | - | 4tango.com |

---

## 1. AWS Amplify (Hosting)

### Dev Environment
- **App ID**: `d35qopwzo3l31w`
- **App Name**: `4tango-dev`
- **URL**: https://dev.4tango.com
- **Branch**: `develop`
- **Repository**: https://github.com/hamdiceylan/4tango.com

### Prod Environment
- **App ID**: `d3jwiy3qjkzx5q`
- **App Name**: `4tango-prod`
- **URL**: https://4tango.com
- **Branch**: `main`
- **Repository**: https://github.com/hamdiceylan/4tango.com

### Environment Variables

| Variable | Dev | Prod | Notes |
|----------|-----|------|-------|
| DATABASE_URL | ✅ | ✅ | Different values (dev/prod DB) |
| NEXT_PUBLIC_URL | ✅ | ✅ | https://dev.4tango.com / https://4tango.com |
| SES_REGION | ✅ | ✅ | eu-west-1 |
| SES_FROM_EMAIL | ✅ | ✅ | noreply@4tango.com |
| SES_ACCESS_KEY_ID | ✅ | ✅ | Same IAM user |
| SES_SECRET_ACCESS_KEY | ✅ | ✅ | Same IAM user |
| COGNITO_CLIENT_ID | ✅ | ✅ | Different values (dev/prod pool) |
| COGNITO_REGION | ✅ | ✅ | eu-west-1 |
| COGNITO_USER_POOL_ID | ✅ | ✅ | Different values (dev/prod pool) |
| NEXT_PUBLIC_COGNITO_DOMAIN | ✅ | ✅ | Different domains (dev/prod) |
| NEXT_PUBLIC_COGNITO_CLIENT_ID | ✅ | ✅ | Different values (dev/prod) |

---

## 2. RDS PostgreSQL

### Dev Database
- **Identifier**: `tango-dev`
- **Endpoint**: `tango-dev.cbucqu4yajzz.eu-west-1.rds.amazonaws.com`
- **Database**: `tango_dev`
- **Instance**: `db.t4g.micro`
- **Storage**: 20 GB
- **Multi-AZ**: No
- **Publicly Accessible**: Yes

### Prod Database
- **Identifier**: `tango-prod`
- **Endpoint**: `tango-prod.cbucqu4yajzz.eu-west-1.rds.amazonaws.com`
- **Database**: `tango`
- **Instance**: `db.t4g.small` (larger than dev)
- **Storage**: 50 GB
- **Multi-AZ**: Yes (high availability)
- **Publicly Accessible**: Yes

### Connection Strings
```
# Dev
postgresql://tangoadmin:PASSWORD@tango-dev.cbucqu4yajzz.eu-west-1.rds.amazonaws.com:5432/tango_dev

# Prod
postgresql://tangoadmin:PASSWORD@tango-prod.cbucqu4yajzz.eu-west-1.rds.amazonaws.com:5432/tango
```

---

## 3. Cognito (Authentication)

### Dev User Pool
- **Pool ID**: `eu-west-1_xf1rFIxFp`
- **Pool Name**: `4tango-dev`
- **Client ID**: `btpfeakg10l0vjl34vufr1v91`
- **Domain**: `https://4tango-dev.auth.eu-west-1.amazoncognito.com`

### Prod User Pool
- **Pool ID**: `eu-west-1_rsb53q7Ks`
- **Pool Name**: `4tango-prod`
- **Client ID**: `31089qf4mefcl9etj9mv99hvgm`
- **Domain**: `https://4tango-prod.auth.eu-west-1.amazoncognito.com`

### Social Login (Google/Apple)
To enable social login, you need to:
1. Create OAuth credentials in Google Cloud Console / Apple Developer
2. Add identity providers to Cognito: `aws cognito-idp create-identity-provider`
3. Update the app client to support the identity providers

---

## 4. S3 (File Storage)

### Dev Bucket
- **Name**: `4tango-dev-uploads`
- **Purpose**: Event images, profile pictures, etc.

### Prod Bucket
- **Name**: `4tango-prod-uploads`
- **Purpose**: Event images, profile pictures, etc.

---

## 5. SES (Email)

- **Identity**: `4tango.com` (domain verified)
- **From Email**: `noreply@4tango.com`
- **Region**: `eu-west-1`
- **IAM User**: `4tango-ses-sender`
- **Status**: Shared between dev and prod

---

## 6. Route53 (DNS)

- **Domain**: `4tango.com`
- **Records**:
  - `4tango.com` → Amplify prod
  - `dev.4tango.com` → Amplify dev
  - `www.4tango.com` → Redirect to 4tango.com

---

## Infrastructure Status

### 🟢 All Systems Aligned
1. ✅ RDS prod has Multi-AZ (high availability)
2. ✅ RDS prod is larger instance (handles more load)
3. ✅ Separate S3 buckets prevent dev/prod file mixing
4. ✅ SES is properly configured
5. ✅ Cognito user pools exist for both environments
6. ✅ All environment variables are synced

### 🟡 Optional Enhancements
1. **Social Login** - Google/Apple identity providers not yet configured in Cognito
   - Email/password auth works fine without this
   - Add when social login is needed for dancers

---

## How to Keep Dev/Prod in Sync

### After making infrastructure changes in dev:

1. **Document the change** in this file
2. **Run the drift check**: `npm run infra`
3. **Apply same change to prod** using AWS CLI or Console
4. **Update environment variables** if needed:
   ```bash
   aws amplify update-app --app-id d3jwiy3qjkzx5q --region eu-west-1 \
     --environment-variables KEY=value
   ```

### Environment Variable Commands

```bash
# View all env vars for an app
aws amplify get-app --app-id APP_ID --region eu-west-1 \
  --query 'app.environmentVariables'

# Add/update env var
aws amplify update-app --app-id APP_ID --region eu-west-1 \
  --environment-variables '{"KEY":"value"}'

# Trigger redeploy after env var change
aws amplify start-job --app-id APP_ID --branch-name BRANCH \
  --job-type RELEASE --region eu-west-1
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Code tested on dev.4tango.com
- [ ] Database schema synced to prod (`npm run db:push` with prod DATABASE_URL)
- [ ] All required env vars exist in prod (`npm run infra:check`)
- [ ] No infrastructure changes pending for prod
