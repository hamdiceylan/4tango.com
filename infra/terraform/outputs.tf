# 4Tango Terraform Outputs

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

# Summary output
output "summary" {
  description = "Infrastructure summary"
  value = {
    environment = var.environment
    region      = var.aws_region

    # Application
    app_url     = var.environment == "prod" ? "https://${var.domain_name}" : "https://dev.${var.domain_name}"
    amplify_url = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}"

    # Database
    db_endpoint = aws_db_instance.main.address
    db_port     = aws_db_instance.main.port

    # Storage
    s3_bucket = aws_s3_bucket.uploads.id
    cdn_url   = var.environment == "prod" ? "https://cdn.${var.domain_name}" : "https://${aws_cloudfront_distribution.main.domain_name}"

    # Email
    ses_domain = aws_ses_domain_identity.main.domain
    ses_config = aws_ses_configuration_set.main.name
  }
}

# Environment variables for Next.js app
output "nextjs_env_vars" {
  description = "Environment variables to set in Amplify"
  sensitive   = true
  value = {
    DATABASE_URL          = "Set from Secrets Manager: ${aws_secretsmanager_secret.db_password.arn}"
    NEXT_PUBLIC_URL       = var.environment == "prod" ? "https://${var.domain_name}" : "https://dev.${var.domain_name}"
    NEXT_PUBLIC_CDN_URL   = var.environment == "prod" ? "https://cdn.${var.domain_name}" : "https://${aws_cloudfront_distribution.main.domain_name}"
    AWS_REGION            = var.aws_region
    SES_REGION            = var.aws_region
    SES_FROM_EMAIL        = "noreply@${var.domain_name}"
    SES_CONFIGURATION_SET = aws_ses_configuration_set.main.name
    S3_BUCKET             = aws_s3_bucket.uploads.id
  }
}

# DNS records to add (if not using Route 53)
output "dns_records_required" {
  description = "DNS records to add if not using Route 53"
  value = {
    ses_verification = {
      name  = "_amazonses.${var.domain_name}"
      type  = "TXT"
      value = aws_ses_domain_identity.main.verification_token
    }
    ses_dkim = [
      for i, token in aws_ses_domain_dkim.main.dkim_tokens : {
        name  = "${token}._domainkey.${var.domain_name}"
        type  = "CNAME"
        value = "${token}.dkim.amazonses.com"
      }
    ]
    ses_spf = {
      name  = "mail.${var.domain_name}"
      type  = "TXT"
      value = "v=spf1 include:amazonses.com ~all"
    }
    cdn = {
      name  = "cdn.${var.domain_name}"
      type  = "CNAME"
      value = aws_cloudfront_distribution.main.domain_name
    }
  }
}
