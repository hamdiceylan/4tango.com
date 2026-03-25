# AWS Amplify Configuration for 4Tango
# Hosts the Next.js application with automatic CI/CD

# Amplify App
# Note: Connect to GitHub manually in AWS Console after creation
# Or provide access_token variable for automatic connection
resource "aws_amplify_app" "main" {
  name = "4tango-${var.environment}"
  # repository = var.github_repository  # Requires GitHub OAuth token

  # Build settings for Next.js
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
  EOT

  # Environment variables
  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = ""
    _LIVE_UPDATES = jsonencode([
      {
        pkg     = "next-version"
        type    = "internal"
        version = "latest"
      }
    ])
  }

  # Enable auto branch creation for feature branches
  enable_auto_branch_creation = var.environment == "dev"
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = var.environment == "dev"

  # Auto branch creation patterns
  auto_branch_creation_patterns = var.environment == "dev" ? ["feature/*", "fix/*"] : []

  auto_branch_creation_config {
    enable_auto_build           = true
    enable_pull_request_preview = var.environment == "dev"
  }

  # Custom rules for Next.js routing
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  # Platform for SSR
  platform = "WEB_COMPUTE"

  tags = {
    Name = "4tango-${var.environment}"
  }
}

# Branch configuration
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = var.environment == "prod" ? "main" : "develop"

  framework = "Next.js - SSR"

  # Environment variables for this branch
  environment_variables = {
    NODE_ENV        = var.environment == "prod" ? "production" : "development"
    NEXT_PUBLIC_ENV = var.environment
    NEXT_PUBLIC_URL = var.environment == "prod" ? "https://4tango.com" : "https://dev.4tango.com"

    # Database URL will be set via AWS Secrets Manager
    # These are placeholders - actual values from secrets
    DATABASE_URL = "PLACEHOLDER_SET_VIA_SECRETS"

    # AWS region for SES
    SES_REGION     = var.aws_region
    SES_FROM_EMAIL = var.environment == "prod" ? "noreply@4tango.com" : "dev-noreply@4tango.com"
  }

  enable_auto_build = true

  tags = {
    Name = "4tango-${var.environment}-branch"
  }
}

# Domain association (for custom domain)
resource "aws_amplify_domain_association" "main" {
  count = var.environment == "prod" ? 1 : 0

  app_id      = aws_amplify_app.main.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }

  # Wait for SSL certificate validation
  wait_for_verification = true
}

# Dev subdomain
resource "aws_amplify_domain_association" "dev" {
  count = var.environment == "dev" ? 1 : 0

  app_id      = aws_amplify_app.main.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "dev"
  }

  wait_for_verification = true
}

# Webhook for GitHub (manual trigger if needed)
resource "aws_amplify_webhook" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "Webhook for ${var.environment} deployments"
}

# Outputs
output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.main.id
}

output "amplify_default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.main.default_domain
}

output "amplify_branch_url" {
  description = "Branch URL"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}"
}

output "amplify_webhook_url" {
  description = "Webhook URL for manual triggers"
  value       = aws_amplify_webhook.main.url
  sensitive   = true
}
