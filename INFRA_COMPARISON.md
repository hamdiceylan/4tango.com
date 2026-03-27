# Infrastructure Configuration Comparison

> **Generated**: 2026-03-27
> **Purpose**: Deep comparison of dev vs prod configurations to identify drift

## Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
| Amplify | ✅ Aligned | Build specs match |
| RDS | ⚠️ Intentional Differences | Size, Multi-AZ, Backup retention differ (expected) |
| Cognito | 🔴 Config Mismatch | Password policy differs! |
| S3 | ⚠️ Intentional Differences | Versioning differs (expected) |
| SES | ✅ Aligned | Shared service |

---

## 1. AWS Amplify (Hosting)

| Attribute | Dev | Prod | Match | Notes |
|-----------|-----|------|-------|-------|
| App ID | d35qopwzo3l31w | d3jwiy3qjkzx5q | N/A | Different by design |
| Platform | WEB_COMPUTE | WEB_COMPUTE | ✅ | |
| Build Spec | [see below] | [see below] | ✅ | Identical |
| Branch | develop | main | N/A | Different by design |

### Build Spec (identical in both):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx prisma generate
        - echo env vars to .env.production
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files: '**/*'
```

### Environment Variables

| Variable | Dev | Prod | Match | Notes |
|----------|-----|------|-------|-------|
| DATABASE_URL | tango-dev DB | tango-prod DB | N/A | Different by design |
| NEXT_PUBLIC_URL | dev.4tango.com | 4tango.com | N/A | Different by design |
| SES_REGION | eu-west-1 | eu-west-1 | ✅ | |
| SES_FROM_EMAIL | noreply@4tango.com | noreply@4tango.com | ✅ | |
| SES_ACCESS_KEY_ID | [same] | [same] | ✅ | Shared IAM user |
| SES_SECRET_ACCESS_KEY | [same] | [same] | ✅ | Shared IAM user |
| COGNITO_REGION | eu-west-1 | eu-west-1 | ✅ | |
| COGNITO_USER_POOL_ID | eu-west-1_xf1rFIxFp | eu-west-1_rsb53q7Ks | N/A | Different by design |
| COGNITO_CLIENT_ID | [dev client] | [prod client] | N/A | Different by design |
| NEXT_PUBLIC_COGNITO_DOMAIN | 4tango-dev.auth... | 4tango-prod.auth... | N/A | Different by design |
| NEXT_PUBLIC_COGNITO_CLIENT_ID | [dev client] | [prod client] | N/A | Different by design |

---

## 2. RDS PostgreSQL

| Attribute | Dev | Prod | Match | Risk Level |
|-----------|-----|------|-------|------------|
| Instance Class | db.t4g.micro | db.t4g.small | ⚠️ | Low - Intentional (prod needs more power) |
| Engine | postgres | postgres | ✅ | |
| Version | 15.17 | 15.17 | ✅ | |
| Storage (GB) | 20 | 50 | ⚠️ | Low - Intentional (prod needs more space) |
| Storage Type | gp3 | gp3 | ✅ | |
| Multi-AZ | false | true | ⚠️ | Low - Intentional (prod needs HA) |
| Publicly Accessible | true | true | ✅ | |
| Encrypted | true | true | ✅ | |
| Backup Retention (days) | 1 | 7 | ⚠️ | Low - Intentional (prod needs longer backups) |
| Auto Minor Upgrade | true | true | ✅ | |

**Verdict**: All differences are intentional. Prod is appropriately configured for production workloads.

---

## 3. Cognito User Pools

| Attribute | Dev | Prod | Match | Risk Level |
|-----------|-----|------|-------|------------|
| Pool Name | 4tango-dev | 4tango-prod | N/A | |
| MFA | OFF | OFF | ✅ | |
| Min Password Length | 8 | 8 | ✅ | |
| Require Uppercase | true | true | ✅ | |
| Require Lowercase | true | true | ✅ | |
| Require Numbers | true | true | ✅ | |
| **Require Symbols** | **false** | **true** | 🔴 | **HIGH - Users may fail to register!** |
| Auto Verify | email | email | ✅ | |
| Username Attributes | email | email | ✅ | |
| Deletion Protection | null | null | ✅ | |

### 🔴 CRITICAL ISSUE: Password Policy Mismatch

**Problem**: Prod requires symbols in passwords, but dev doesn't.

**Impact**:
- Users testing on dev can create passwords without symbols
- Same password will FAIL on prod
- Social login not affected (uses OAuth)
- Email/password dancer signup IS affected

**Fix Required**: Align password policies. Either:
1. Add symbol requirement to dev (recommended for testing parity)
2. Remove symbol requirement from prod (easier passwords)

---

## 4. S3 Buckets

| Attribute | Dev | Prod | Match | Risk Level |
|-----------|-----|------|-------|------------|
| Bucket Name | 4tango-dev-uploads | 4tango-prod-uploads | N/A | |
| Versioning | Suspended | Enabled | ⚠️ | Low - Intentional (prod protects against accidental deletes) |
| Encryption | AES256 | AES256 | ✅ | |
| Bucket Key | false | false | ✅ | |

**Verdict**: Versioning difference is intentional. Prod should have versioning enabled.

---

## 5. SES (Email)

| Attribute | Value | Notes |
|-----------|-------|-------|
| Domain | 4tango.com | Shared between dev and prod |
| From Email | noreply@4tango.com | Same for both |
| Region | eu-west-1 | Same for both |
| Sandbox Mode | No | Out of sandbox |

**Verdict**: SES is a shared service. No comparison needed.

---

## Configuration Checks Reference

### What We Check and Why

| Service | Attribute | Why It Matters |
|---------|-----------|----------------|
| **Amplify** | Build spec | Different builds = different behavior |
| **Amplify** | Env vars | Missing vars = app crashes |
| **Amplify** | Platform | Different platform = different runtime |
| **RDS** | Engine version | Version mismatch = SQL compatibility issues |
| **RDS** | Instance class | Undersized = performance issues |
| **RDS** | Multi-AZ | No Multi-AZ = downtime risk |
| **RDS** | Backup retention | Short retention = data loss risk |
| **RDS** | Encryption | No encryption = security risk |
| **Cognito** | Password policy | Mismatch = login failures |
| **Cognito** | MFA config | Mismatch = auth flow differences |
| **Cognito** | Identity providers | Missing = social login fails |
| **S3** | Encryption | No encryption = security risk |
| **S3** | Versioning | No versioning = accidental deletion risk |
| **S3** | CORS | Wrong CORS = upload failures |

---

## Action Items

### 🔴 Must Fix Before Production Launch
1. **Cognito Password Policy**: Align dev and prod (remove symbol requirement from prod OR add to dev)

### 🟡 Should Review
1. Consider enabling S3 versioning on dev for testing parity
2. Consider increasing dev backup retention from 1 to 3 days

### ✅ No Action Needed
- Amplify build specs are aligned
- RDS differences are intentional
- SES is properly shared
