# Route 53 Configuration for 4Tango
# DNS management for 4tango.com

# Hosted Zone (create if managing DNS in AWS)
resource "aws_route53_zone" "main" {
  count = var.environment == "prod" ? 1 : 0

  name    = var.domain_name
  comment = "4Tango production domain"

  tags = {
    Name = "4tango-zone"
  }
}

# A record for root domain (points to Amplify)
# Note: Amplify handles this automatically via domain association

# CDN subdomain
resource "aws_route53_record" "cdn" {
  count = var.environment == "prod" ? 1 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = "cdn.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# SES Domain Verification
resource "aws_route53_record" "ses_verification" {
  count = var.environment == "prod" ? 1 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# SES DKIM Records
resource "aws_route53_record" "ses_dkim" {
  count = var.environment == "prod" ? 3 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# Mail FROM (SPF)
resource "aws_route53_record" "ses_mail_from_mx" {
  count = var.environment == "prod" ? 1 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = "mail.${var.domain_name}"
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

resource "aws_route53_record" "ses_mail_from_spf" {
  count = var.environment == "prod" ? 1 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = "mail.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# DMARC record for email authentication
resource "aws_route53_record" "dmarc" {
  count = var.environment == "prod" ? 1 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = ["v=DMARC1; p=quarantine; rua=mailto:dmarc@${var.domain_name}"]
}

# ACM Certificate Validation (for CDN cert)
resource "aws_route53_record" "cdn_cert_validation" {
  for_each = var.environment == "prod" ? {
    for dvo in aws_acm_certificate.cdn.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = aws_route53_zone.main[0].zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "cdn" {
  provider = aws.us_east_1
  count    = var.environment == "prod" ? 1 : 0

  certificate_arn         = aws_acm_certificate.cdn.arn
  validation_record_fqdns = [for record in aws_route53_record.cdn_cert_validation : record.fqdn]
}

# Outputs
output "nameservers" {
  description = "Nameservers for the domain (update at registrar)"
  value       = var.environment == "prod" ? aws_route53_zone.main[0].name_servers : null
}

output "route53_zone_id" {
  description = "Route 53 Hosted Zone ID"
  value       = var.environment == "prod" ? aws_route53_zone.main[0].zone_id : null
}
