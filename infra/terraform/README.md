# 4Tango AWS Infrastructure

Terraform configuration for deploying 4Tango to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Route 53                             │
│                    (DNS: 4tango.com)                         │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│   AWS Amplify       │  │   CloudFront + WAF  │
│   (Next.js App)     │  │   (CDN for S3)      │
│   4tango.com        │  │   cdn.4tango.com    │
└─────────┬───────────┘  └──────────┬──────────┘
          │                         │
          │                         ▼
          │              ┌─────────────────────┐
          │              │        S3           │
          │              │   (Image uploads)   │
          │              └─────────────────────┘
          │
          ▼
┌─────────────────────┐  ┌─────────────────────┐
│    RDS PostgreSQL   │  │      AWS SES        │
│   (Database)        │  │   (Email sending)   │
│   Private subnet    │  │   + SNS + Lambda    │
└─────────────────────┘  └─────────────────────┘
```

## Environments

| Environment | Branch   | URL                    | Database          |
|-------------|----------|------------------------|-------------------|
| Production  | main     | https://4tango.com     | db.t4g.small, Multi-AZ |
| Development | develop  | https://dev.4tango.com | db.t4g.micro      |

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.5.0
3. **GitHub** repository with 4tango code
4. **Domain** 4tango.com registered

## Quick Start

```bash
# 1. Initialize Terraform
cd infra/terraform
terraform init

# 2. Deploy Development Environment
terraform workspace new dev || terraform workspace select dev
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars

# 3. Deploy Production Environment
terraform workspace new prod || terraform workspace select prod
terraform plan -var-file=environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars
```

## Using Make (Recommended)

```bash
# Deploy dev
make plan-dev
make apply-dev

# Deploy prod
make plan-prod
make apply-prod

# Destroy (careful!)
make destroy-dev
```

## Post-Deployment Steps

### 1. Update GitHub Repository URL

Edit `environments/*/terraform.tfvars`:
```hcl
github_repository = "https://github.com/YOUR_ORG/4tango"
```

### 2. Connect Amplify to GitHub

After first `terraform apply`:
1. Go to AWS Amplify Console
2. Click on the app
3. Connect to GitHub repository
4. Authorize AWS Amplify

### 3. Configure Domain Nameservers

If using Route 53, update your domain registrar with the nameservers from output:
```bash
terraform output nameservers
```

### 4. Set Database URL in Amplify

Get the DATABASE_URL from Secrets Manager:
```bash
aws secretsmanager get-secret-value \
  --secret-id 4tango/prod/db-password \
  --query SecretString \
  --output text | jq -r .url
```

Add to Amplify environment variables in the console.

### 5. Request SES Production Access

By default, SES is in sandbox mode. To send emails to any address:
1. Go to AWS SES Console
2. Click "Request production access"
3. Fill out the form (takes 24-48 hours)

### 6. Verify SES Domain

DNS records are created automatically if using Route 53. Otherwise, add these records manually:
```bash
terraform output dns_records_required
```

## Estimated Costs

### Development (~$25-35/month)
- RDS db.t4g.micro: ~$15
- Amplify: ~$5
- S3 + CloudFront: ~$2
- SES: ~$1
- Route 53: ~$1

### Production (~$80-120/month)
- RDS db.t4g.small (Multi-AZ): ~$50
- Amplify: ~$15
- S3 + CloudFront: ~$5
- WAF: ~$10
- SES (100k emails): ~$10
- Route 53: ~$1

## Terraform State

For team collaboration, enable remote state:

1. Create S3 bucket for state:
```bash
aws s3 mb s3://4tango-terraform-state --region eu-west-1
```

2. Create DynamoDB table for locking:
```bash
aws dynamodb create-table \
  --table-name 4tango-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

3. Uncomment the backend configuration in `main.tf`

4. Run `terraform init` to migrate state

## Useful Commands

```bash
# View current state
terraform show

# View specific outputs
terraform output summary
terraform output -json nextjs_env_vars

# Import existing resources
terraform import aws_s3_bucket.uploads 4tango-prod-uploads

# Refresh state
terraform refresh -var-file=environments/prod/terraform.tfvars

# Target specific resource
terraform apply -target=aws_amplify_app.main -var-file=environments/prod/terraform.tfvars
```

## Troubleshooting

### Amplify Build Fails
Check build logs in Amplify Console. Common issues:
- Missing environment variables
- Node.js version mismatch
- Build command errors

### SES Emails Not Sending
- Check if still in sandbox mode
- Verify domain in SES console
- Check bounce/complaint rates

### Database Connection Issues
- Ensure security group allows connections
- Check if publicly accessible is enabled
- Verify DATABASE_URL format

## Security Notes

- Database passwords stored in Secrets Manager
- RDS encrypted at rest
- CloudFront uses HTTPS only
- WAF protects against common attacks (prod only)
- S3 bucket not publicly accessible (via CloudFront only)
