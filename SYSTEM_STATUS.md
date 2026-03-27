# 4Tango System Status & Operations Guide

## Quick Status Commands (NPM Scripts)

```bash
# Quick status check (health + deployments + git)
npm run status

# Full status check (includes database and env vars)
npm run status:full

# Individual checks
npm run status:health    # Check if sites are responding
npm run status:deploy    # Check deployment status
npm run status:git       # Check git branch status

# Database commands
npm run db:push          # Sync schema to database
npm run db:studio        # Open Prisma Studio (visual DB editor)
npm run db:status        # Check migration status
```

## Manual Commands (if npm scripts don't work)

```bash
# Check both deployments
aws amplify list-jobs --app-id d35qopwzo3l31w --branch-name develop --region eu-west-1 --query 'jobSummaries[0].{status:status}' --output text  # Dev
aws amplify list-jobs --app-id d3jwiy3qjkzx5q --branch-name main --region eu-west-1 --query 'jobSummaries[0].{status:status}' --output text     # Prod

# Check sites are up
curl -s -o /dev/null -w "%{http_code}" https://dev.4tango.com
curl -s -o /dev/null -w "%{http_code}" https://4tango.com

# Check API health
curl -s https://4tango.com/api/health | jq .
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│   Organizers (dashboard)    │    Dancers (event pages)          │
└──────────────┬──────────────┴────────────────┬──────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS AMPLIFY (SSR)                            │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ dev.4tango.com      │    │ 4tango.com          │            │
│  │ Branch: develop     │    │ Branch: main        │            │
│  │ App: d35qopwzo3l31w │    │ App: d3jwiy3qjkzx5q │            │
│  └─────────────────────┘    └─────────────────────┘            │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS RDS PostgreSQL                           │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ tango_dev           │    │ tango (prod)        │            │
│  │ tango-dev.xxx.rds   │    │ tango-prod.xxx.rds  │            │
│  └─────────────────────┘    └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS SES (Email)                              │
│                    noreply@4tango.com                           │
└─────────────────────────────────────────────────────────────────┘
```

## Environments

| Environment | Branch | URL | Amplify App ID | Database |
|-------------|--------|-----|----------------|----------|
| Development | develop | dev.4tango.com | d35qopwzo3l31w | tango_dev |
| Production | main | 4tango.com | d3jwiy3qjkzx5q | tango |

## Database Details

| Environment | Host | Database | User |
|-------------|------|----------|------|
| Dev | tango-dev.cbucqu4yajzz.eu-west-1.rds.amazonaws.com | tango_dev | tangoadmin |
| Prod | tango-prod.cbucqu4yajzz.eu-west-1.rds.amazonaws.com | tango | tangoadmin |

## Key Pages & Routes

### Public (No Auth)
- `/` - Landing page (marketing)
- `/login` - Organizer login
- `/signup` - Organizer signup
- `/dancer/login` - Dancer login
- `/dancer/signup` - Dancer signup
- `/en/{event-slug}` - Event landing page
- `/en/{event-slug}/register` - Event registration form
- `/privacy`, `/terms`, `/contact` - Static pages

### Organizer Dashboard (Auth Required)
- `/dashboard` - Main dashboard
- `/events` - Event list
- `/events/{id}` - Event details
- `/events/{id}/page-builder` - Visual page editor
- `/events/{id}/form-builder` - Registration form editor
- `/registrations` - All registrations
- `/settings` - Organization settings
- `/settings/team` - Team management
- `/settings/activity-log` - Audit trail

### Dancer (Auth Required)
- `/en/profile` - Dancer profile

## Deployment Process

### Automatic (Recommended)
```bash
# Deploy to dev
git push origin develop

# Deploy to prod (after testing on dev)
git checkout main
git merge develop
git push origin main
```

### Check Deployment Status
```bash
# Dev
aws amplify list-jobs --app-id d35qopwzo3l31w --branch-name develop --region eu-west-1 --query 'jobSummaries[0]'

# Prod
aws amplify list-jobs --app-id d3jwiy3qjkzx5q --branch-name main --region eu-west-1 --query 'jobSummaries[0]'
```

## Database Operations

### Sync Schema to Database
```bash
# Dev (uses .env DATABASE_URL)
npx prisma db push

# Prod
DATABASE_URL="postgresql://tangoadmin:PASSWORD@tango-prod.xxx.rds.amazonaws.com:5432/tango" npx prisma db push
```

### View Schema Diff
```bash
npx prisma db pull --print  # Shows current DB schema
```

## Environment Variables

### Required for Both Environments
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| NEXT_PUBLIC_URL | Public URL (https://4tango.com or https://dev.4tango.com) |
| SES_REGION | AWS SES region (eu-west-1) |
| SES_FROM_EMAIL | Sender email (noreply@4tango.com) |
| SES_ACCESS_KEY_ID | AWS IAM access key for SES |
| SES_SECRET_ACCESS_KEY | AWS IAM secret key for SES |

### Optional (Social Login)
| Variable | Description |
|----------|-------------|
| COGNITO_REGION | AWS Cognito region |
| COGNITO_USER_POOL_ID | Cognito user pool ID |
| COGNITO_CLIENT_ID | Cognito app client ID |
| NEXT_PUBLIC_COGNITO_DOMAIN | Cognito hosted UI domain |
| NEXT_PUBLIC_COGNITO_CLIENT_ID | Cognito client ID (public) |

## Common Issues & Fixes

### Build Fails on Amplify
1. Check build logs: `aws amplify get-job --app-id APP_ID --branch-name BRANCH --job-id JOB_ID`
2. Run `npm run build` locally first
3. Check for ESLint errors
4. Ensure all env vars are set in Amplify

### Database Connection Issues
1. Check DATABASE_URL is URL-encoded (special chars in password)
2. Verify RDS security group allows Amplify
3. Check RDS is publicly accessible

### Emails Not Sending
1. Verify SES credentials in Amplify
2. Check SES domain is verified
3. Ensure SES is out of sandbox mode
4. Check CloudWatch logs

## Pre-Release Checklist

- [ ] Both branches (develop/main) are in sync
- [ ] Latest deployment succeeded on both environments
- [ ] Test registration flow on dev.4tango.com
- [ ] Test email delivery (registration confirmation)
- [ ] Verify database has correct schema
- [ ] All environment variables set on prod
- [ ] Check error monitoring (CloudWatch logs)
