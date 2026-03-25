# 4Tango Terraform Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name (prod, dev)"
  type        = string
  validation {
    condition     = contains(["prod", "dev"], var.environment)
    error_message = "Environment must be 'prod' or 'dev'."
  }
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "4tango.com"
}

variable "github_repository" {
  description = "GitHub repository URL for Amplify"
  type        = string
  default     = "https://github.com/your-org/4tango"
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro" # Smallest ARM instance, cost-effective
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "tango"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "tangoadmin"
  sensitive   = true
}

# Amplify
variable "amplify_framework" {
  description = "Amplify framework"
  type        = string
  default     = "Next.js - SSR"
}

# SES
variable "ses_email_identity" {
  description = "Email domain for SES"
  type        = string
  default     = "4tango.com"
}

# Environment-specific sizing
variable "environment_config" {
  description = "Environment-specific configuration"
  type = map(object({
    db_instance_class      = string
    db_allocated_storage   = number
    db_multi_az            = bool
    waf_enabled            = bool
    cloudfront_price_class = string
  }))
  default = {
    prod = {
      db_instance_class      = "db.t4g.small"
      db_allocated_storage   = 50
      db_multi_az            = true
      waf_enabled            = true
      cloudfront_price_class = "PriceClass_100" # US, Canada, Europe
    }
    dev = {
      db_instance_class      = "db.t4g.micro"
      db_allocated_storage   = 20
      db_multi_az            = false
      waf_enabled            = false
      cloudfront_price_class = "PriceClass_100"
    }
  }
}
