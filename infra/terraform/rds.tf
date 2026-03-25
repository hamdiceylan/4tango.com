# RDS PostgreSQL Configuration for 4Tango

locals {
  env_config = var.environment_config[var.environment]
}

# Generate random password for RDS
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "4tango/${var.environment}/db-password"
  description             = "RDS PostgreSQL password for 4tango ${var.environment}"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0

  tags = {
    Name = "4tango-${var.environment}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    host     = aws_db_instance.main.address
    port     = 5432
    database = var.db_name
    url      = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.main.address}:5432/${var.db_name}?schema=public"
  })
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "tango-${var.environment}"

  # Engine
  engine                = "postgres"
  engine_version        = "15.17"
  instance_class        = local.env_config.db_instance_class
  allocated_storage     = local.env_config.db_allocated_storage
  max_allocated_storage = local.env_config.db_allocated_storage * 2 # Auto-scaling

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true # Required for Amplify serverless access

  # High Availability
  multi_az = local.env_config.db_multi_az

  # Backup
  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Performance
  performance_insights_enabled = var.environment == "prod"
  storage_type                 = "gp3"
  storage_encrypted            = true

  # Deletion protection
  deletion_protection       = var.environment == "prod"
  skip_final_snapshot       = var.environment == "dev"
  final_snapshot_identifier = var.environment == "prod" ? "tango-${var.environment}-final-${formatdate("YYYY-MM-DD", timestamp())}" : null

  # Updates
  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false

  tags = {
    Name = "4tango-${var.environment}-postgres"
  }

  lifecycle {
    ignore_changes = [final_snapshot_identifier]
  }
}

# Outputs
output "db_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.address
}

output "db_secret_arn" {
  description = "ARN of the secret containing DB credentials"
  value       = aws_secretsmanager_secret.db_password.arn
}
