# AWS Cognito User Pool for 4Tango Authentication
# Email/password authentication for organizers only

# ==============================================================================
# USER POOL
# ==============================================================================

resource "aws_cognito_user_pool" "main" {
  name = "4tango-${var.environment}"

  # Ignore schema changes - these are set at creation time and can't be modified
  lifecycle {
    ignore_changes = [schema]
  }

  # Username configuration - allow email as username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Password policy for organizers
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # MFA configuration (optional for now)
  mfa_configuration = "OFF"

  # Note: Schema attributes (email, name, custom:organizerId, custom:userType)
  # are already defined on existing user pools. Schema blocks are only needed
  # for new user pool creation and are omitted here to avoid conflicts with
  # imported user pools.

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Verification message
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your 4Tango verification code"
    email_message        = "Your verification code is {####}"
  }

  # Device tracking (optional)
  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = false
  }

  # Admin create user settings
  admin_create_user_config {
    allow_admin_create_user_only = false

    invite_message_template {
      email_subject = "Welcome to 4Tango"
      email_message = "Your username is {username} and temporary password is {####}. Please login at https://${var.environment == "prod" ? "" : "${var.environment}."}4tango.com/login"
      sms_message   = "Your 4Tango username is {username} and temporary password is {####}"
    }
  }

  # Lambda triggers (can be added later for custom logic)
  # lambda_config {
  #   pre_sign_up = aws_lambda_function.pre_sign_up.arn
  # }

  tags = {
    Environment = var.environment
    Project     = "4tango"
  }
}

# ==============================================================================
# USER POOL GROUPS
# ==============================================================================

resource "aws_cognito_user_group" "organizers" {
  name         = "Organizers"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Event organizers who create and manage events"
}

resource "aws_cognito_user_group" "dancers" {
  name         = "Dancers"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Dancers who register for events"
}

# ==============================================================================
# USER POOL DOMAIN
# ==============================================================================

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "4tango-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# ==============================================================================
# USER POOL CLIENT - Web Application
# ==============================================================================

resource "aws_cognito_user_pool_client" "web" {
  name         = "4tango-web-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  # Generate client secret for server-side apps
  generate_secret = false

  # Token validity
  access_token_validity  = 1  # hours
  id_token_validity      = 1  # hours
  refresh_token_validity = 30 # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # OAuth configuration
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  # Callback URLs
  callback_urls = var.environment == "prod" ? [
    "https://4tango.com/api/auth/cognito/callback",
    "http://localhost:3000/api/auth/cognito/callback"
    ] : [
    "https://dev.4tango.com/api/auth/cognito/callback",
    "http://localhost:3000/api/auth/cognito/callback"
  ]

  logout_urls = var.environment == "prod" ? [
    "https://4tango.com/login",
    "http://localhost:3000/login"
    ] : [
    "https://dev.4tango.com/login",
    "http://localhost:3000/login"
  ]

  # Supported identity providers (email/password only, no social login)
  supported_identity_providers = ["COGNITO"]

  # Prevent user existence errors (security)
  prevent_user_existence_errors = "ENABLED"

  # Auth flows - PKCE for public clients
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  # Read/write attributes
  read_attributes = [
    "email",
    "name",
    "custom:organizerId",
    "custom:userType"
  ]

  write_attributes = [
    "email",
    "name",
    "custom:organizerId",
    "custom:userType"
  ]
}

# ==============================================================================
# IDENTITY POOL (for AWS credentials if needed)
# ==============================================================================

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "4tango_${var.environment}"
  allow_unauthenticated_identities = false
  allow_classic_flow               = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.web.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }

  tags = {
    Environment = var.environment
    Project     = "4tango"
  }
}

# IAM roles for Identity Pool
resource "aws_iam_role" "cognito_authenticated" {
  name = "4tango-cognito-authenticated-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = "4tango"
  }
}

resource "aws_iam_role_policy" "cognito_authenticated" {
  name = "4tango-cognito-authenticated-policy-${var.environment}"
  role = aws_iam_role.cognito_authenticated.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-sync:*",
          "cognito-identity:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::4tango-uploads-${var.environment}/*"
      }
    ]
  })
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    "authenticated" = aws_iam_role.cognito_authenticated.arn
  }
}

# ==============================================================================
# OUTPUTS
# ==============================================================================

output "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_arn" {
  description = "The ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.arn
}

output "cognito_user_pool_endpoint" {
  description = "The endpoint of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.endpoint
}

output "cognito_user_pool_domain" {
  description = "The Cognito hosted UI domain"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_client_id" {
  description = "The ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.web.id
}

output "cognito_identity_pool_id" {
  description = "The ID of the Cognito Identity Pool"
  value       = aws_cognito_identity_pool.main.id
}
