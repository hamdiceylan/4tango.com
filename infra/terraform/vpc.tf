# VPC Configuration for 4Tango
# Provides isolated network for RDS and other resources

locals {
  vpc_cidr = var.environment == "prod" ? "10.0.0.0/16" : "10.1.0.0/16"
  azs      = ["${var.aws_region}a", "${var.aws_region}b"]
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = local.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "4tango-${var.environment}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "4tango-${var.environment}-igw"
  }
}

# Public Subnets (for NAT Gateway, ALB if needed)
resource "aws_subnet" "public" {
  count                   = length(local.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(local.vpc_cidr, 8, count.index)
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "4tango-${var.environment}-public-${local.azs[count.index]}"
    Type = "public"
  }
}

# Private Subnets (for RDS)
resource "aws_subnet" "private" {
  count             = length(local.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(local.vpc_cidr, 8, count.index + 10)
  availability_zone = local.azs[count.index]

  tags = {
    Name = "4tango-${var.environment}-private-${local.azs[count.index]}"
    Type = "private"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "4tango-${var.environment}-public-rt"
  }
}

# Associate Public Subnets with Route Table
resource "aws_route_table_association" "public" {
  count          = length(local.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route Table for Private Subnets (no internet access for security)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "4tango-${var.environment}-private-rt"
  }
}

# Associate Private Subnets with Route Table
resource "aws_route_table_association" "private" {
  count          = length(local.azs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# DB Subnet Group for RDS
resource "aws_db_subnet_group" "main" {
  name       = "tango-${var.environment}-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "tango-${var.environment}-db-subnet-group"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "4tango-${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # Allow PostgreSQL from Amplify (via internet for serverless)
  # In production, consider VPC peering or PrivateLink
  ingress {
    description = "PostgreSQL from anywhere (restrict in production)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.environment == "dev" ? ["0.0.0.0/0"] : ["0.0.0.0/0"] # Amplify needs public access
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "4tango-${var.environment}-rds-sg"
  }
}
