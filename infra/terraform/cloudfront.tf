# CloudFront Configuration for 4Tango
# CDN for S3 uploads (images, files)

# SSL Certificate (must be in us-east-1)
resource "aws_acm_certificate" "cdn" {
  provider = aws.us_east_1

  domain_name               = "cdn.${var.domain_name}"
  subject_alternative_names = ["cdn.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "4tango-${var.environment}-cdn-cert"
  }
}

# CloudFront Distribution for uploads
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "4tango ${var.environment} CDN"
  default_root_object = "index.html"
  price_class         = local.env_config.cloudfront_price_class

  # Custom domain (only in prod)
  aliases = var.environment == "prod" ? ["cdn.${var.domain_name}"] : []

  # S3 Origin
  origin {
    domain_name              = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_id                = "S3-uploads"
    origin_access_control_id = aws_cloudfront_origin_access_control.uploads.id
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-uploads"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year

    compress = true
  }

  # Cache behavior for images (long cache)
  ordered_cache_behavior {
    path_pattern     = "images/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-uploads"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 86400    # 1 day
    default_ttl            = 604800   # 1 week
    max_ttl                = 31536000 # 1 year

    compress = true
  }

  # Geo restriction (none for now)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate
  viewer_certificate {
    cloudfront_default_certificate = var.environment == "dev"
    acm_certificate_arn            = var.environment == "prod" ? aws_acm_certificate.cdn.arn : null
    ssl_support_method             = var.environment == "prod" ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  # WAF (only in prod)
  web_acl_id = local.env_config.waf_enabled ? aws_wafv2_web_acl.main[0].arn : null

  tags = {
    Name = "4tango-${var.environment}-cdn"
  }
}

# Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cdn_url" {
  description = "CDN URL for uploads"
  value       = var.environment == "prod" ? "https://cdn.${var.domain_name}" : "https://${aws_cloudfront_distribution.main.domain_name}"
}
