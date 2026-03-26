# 4Tango Development Guidelines

## Project Overview
4Tango is a tango event management platform built with Next.js 14 (App Router), Prisma ORM, PostgreSQL, and deployed on AWS Amplify.

## Architecture

### Infrastructure (AWS)
- **Hosting**: AWS Amplify (SSR compute)
- **Database**: Amazon RDS PostgreSQL (tango-prod)
- **Email**: Amazon SES (eu-west-1, from noreply@4tango.com)
- **DNS**: Route53 (4tango.com)
- **CDN/SSL**: CloudFront
- **Infrastructure as Code**: Terraform in `/infra/terraform/`

### Environments
| Environment | Branch | Domain | Amplify App ID |
|-------------|--------|--------|----------------|
| Production | main | 4tango.com | d3jwiy3qjkzx5q |
| Development | develop | dev.4tango.com | d35qopwzo3l31w |

## Development Rules

### 0. Local Development

**Always run the dev server on port 3000**:
```bash
npm run dev
```
- If port 3000 is in use, kill the process first: `lsof -ti:3000 | xargs kill -9`
- Never run on alternate ports (3001, 3002, etc.)

### 1. Keep Dev and Prod Aligned

**Database Schema**:
- Always run migrations on BOTH environments after schema changes
- Command: `npx prisma migrate deploy`
- Test migrations on dev first, then apply to prod

**Environment Variables**:
Both Amplify apps MUST have the same environment variables:
- `DATABASE_URL` - PostgreSQL connection string (URL-encoded password)
- `NEXT_PUBLIC_URL` - Public URL (https://4tango.com or https://dev.4tango.com)
- `SES_REGION` - eu-west-1
- `SES_FROM_EMAIL` - noreply@4tango.com
- `SES_ACCESS_KEY_ID` - IAM user access key for SES
- `SES_SECRET_ACCESS_KEY` - IAM user secret key for SES

**Build Spec**:
Keep build specs identical between dev and prod. Update via AWS CLI:
```bash
aws amplify update-app --app-id <APP_ID> --region eu-west-1 --build-spec "$(cat amplify-buildspec.yml)"
```

### 2. Terraform Infrastructure

Terraform manages all AWS infrastructure in `/infra/terraform/`.

**Before making infrastructure changes**:
1. Run `terraform plan` to see changes
2. Apply to dev environment first: `terraform apply -var-file=environments/dev.tfvars`
3. Test thoroughly on dev.4tango.com
4. Apply to prod: `terraform apply -var-file=environments/prod.tfvars`

**Do NOT manually create resources in AWS Console** - always use Terraform to ensure reproducibility.

### 3. Database Conventions

**Prisma Schema** (`prisma/schema.prisma`):
- Use `cuid()` for all primary keys
- Use `@updatedAt` for updatedAt fields
- Always add appropriate indexes for foreign keys
- Use enums for status fields

**Migrations**:
```bash
# Create migration (dev)
npx prisma migrate dev --name <migration_name>

# Deploy migration (prod)
DATABASE_URL="<prod_url>" npx prisma migrate deploy
```

### 4. API Route Patterns

- Public APIs: `/api/public/*` - No authentication required
- Protected APIs: `/api/*` - Require authentication
- Always validate input data
- Return consistent error format: `{ error: string, details?: string }`
- Use proper HTTP status codes

### 5. Event Page Structure

Events are accessible at `/{lang}/{slug}` URLs (e.g., `/en/summer-tango-2024`).
Supported languages: en, es, de, fr, it, pl, tr.

**Reserved slugs** (cannot be used as event names):
- dashboard, events, settings, registrations
- login, signup, check-email
- privacy, terms, contact
- registration, api

### 6. Testing Checklist

Before deploying to production:
- [ ] Test registration flow end-to-end
- [ ] Verify emails are sent (check SES metrics)
- [ ] Test on both mobile and desktop
- [ ] Verify database records are created correctly
- [ ] Check health endpoint: `/api/health`

### 7. Deployment Process

**Automatic Deployments**:
- Push to `main` → Deploys to production (4tango.com)
- Push to `develop` → Deploys to dev (dev.4tango.com)

**Manual Deployment**:
```bash
aws amplify start-job --app-id <APP_ID> --branch-name <BRANCH> --job-type RELEASE --region eu-west-1
```

**Check build status**:
```bash
aws amplify list-jobs --app-id <APP_ID> --branch-name <BRANCH> --region eu-west-1 --query 'jobSummaries[0]'
```

### 8. Troubleshooting

**Database Connection Issues**:
1. Check RDS security group allows inbound from Amplify
2. Verify DATABASE_URL is URL-encoded (special chars in password)
3. Check RDS is publicly accessible with correct subnet routing

**Email Not Sending**:
1. Check SES credentials in Amplify env vars
2. Verify domain is verified in SES console
3. Check SES is out of sandbox mode
4. Review CloudWatch logs: `/aws/amplify/<APP_ID>`

**Build Failures**:
1. Check Amplify console for build logs
2. Verify environment variables are set
3. Run `npm run build` locally to catch errors early

### 9. Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/email.ts` | SES email client |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/app/api/public/events/[slug]/register/route.ts` | Registration API |
| `src/app/[lang]/[slug]/page.tsx` | Public event page (i18n) |

### 10. AWS Resource Reference

| Resource | Value |
|----------|-------|
| RDS Endpoint | tango-prod.cbucqu4yajzz.eu-west-1.rds.amazonaws.com |
| RDS Database | tango |
| RDS User | tangoadmin |
| SES Identity | 4tango.com (verified) |
| Route53 Zone | 4tango.com |
| IAM User (SES) | 4tango-ses-sender |
