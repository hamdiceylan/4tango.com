# SES Configuration for 4Tango
# Email sending for registration confirmations, notifications

# SES Domain Identity
resource "aws_ses_domain_identity" "main" {
  domain = var.ses_email_identity
}

# DKIM for better deliverability
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Domain verification (outputs DNS records to add)
output "ses_verification_token" {
  description = "SES domain verification token - add as TXT record"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_tokens" {
  description = "DKIM tokens - add as CNAME records"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

# Mail FROM domain (for SPF)
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${aws_ses_domain_identity.main.domain}"
}

# SNS Topic for bounce/complaint notifications
resource "aws_sns_topic" "ses_notifications" {
  name = "4tango-${var.environment}-ses-notifications"

  tags = {
    Name = "4tango-${var.environment}-ses-notifications"
  }
}

# SES Configuration Set for tracking
resource "aws_ses_configuration_set" "main" {
  name = "4tango-${var.environment}"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
  sending_enabled            = true
}

# Event destination for tracking opens, clicks, bounces
resource "aws_ses_event_destination" "sns" {
  name                   = "sns-notifications"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true

  matching_types = ["bounce", "complaint", "reject", "send", "delivery"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_notifications.arn
  }
}

# CloudWatch destination for metrics
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-metrics"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true

  matching_types = ["send", "reject", "bounce", "complaint", "delivery", "open", "click"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses:source-ip"
    value_source   = "messageTag"
  }
}

# IAM Policy for Amplify to send emails
resource "aws_iam_policy" "ses_send" {
  name        = "4tango-${var.environment}-ses-send"
  description = "Allow sending emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ses:FromAddress" = [
              "noreply@${var.ses_email_identity}",
              "info@${var.ses_email_identity}",
              "support@${var.ses_email_identity}"
            ]
          }
        }
      }
    ]
  })
}

# Lambda for processing SES notifications (bounces, complaints)
resource "aws_lambda_function" "ses_webhook" {
  function_name = "4tango-${var.environment}-ses-webhook"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  role          = aws_iam_role.ses_webhook_lambda.arn
  timeout       = 30

  # Inline code - replace with proper deployment package
  filename         = data.archive_file.ses_webhook.output_path
  source_code_hash = data.archive_file.ses_webhook.output_base64sha256

  environment {
    variables = {
      DATABASE_SECRET_ARN = aws_secretsmanager_secret.db_password.arn
    }
  }

  tags = {
    Name = "4tango-${var.environment}-ses-webhook"
  }
}

# Lambda source code
data "archive_file" "ses_webhook" {
  type        = "zip"
  output_path = "${path.module}/lambda/ses-webhook.zip"

  source {
    content  = <<-EOT
      exports.handler = async (event) => {
        console.log('SES Event:', JSON.stringify(event, null, 2));

        for (const record of event.Records) {
          const message = JSON.parse(record.Sns.Message);
          const notificationType = message.notificationType;

          if (notificationType === 'Bounce') {
            console.log('Bounce:', message.bounce);
            // TODO: Mark email as invalid in database
          } else if (notificationType === 'Complaint') {
            console.log('Complaint:', message.complaint);
            // TODO: Mark user as opted out
          }
        }

        return { statusCode: 200 };
      };
    EOT
    filename = "index.js"
  }
}

# Lambda IAM Role
resource "aws_iam_role" "ses_webhook_lambda" {
  name = "4tango-${var.environment}-ses-webhook-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ses_webhook_lambda_basic" {
  role       = aws_iam_role.ses_webhook_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "ses_webhook_lambda_secrets" {
  name = "secrets-access"
  role = aws_iam_role.ses_webhook_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.db_password.arn
      }
    ]
  })
}

# SNS subscription to Lambda
resource "aws_sns_topic_subscription" "ses_to_lambda" {
  topic_arn = aws_sns_topic.ses_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.ses_webhook.arn
}

resource "aws_lambda_permission" "ses_sns" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ses_webhook.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.ses_notifications.arn
}

output "ses_configuration_set" {
  description = "SES Configuration Set name"
  value       = aws_ses_configuration_set.main.name
}

output "ses_domain" {
  description = "SES verified domain"
  value       = aws_ses_domain_identity.main.domain
}
