# 4Tango Terraform Makefile

.PHONY: init plan-dev plan-prod apply-dev apply-prod destroy-dev destroy-prod fmt validate

# Initialize Terraform
init:
	terraform init

# Format code
fmt:
	terraform fmt -recursive

# Validate configuration
validate:
	terraform validate

# Development Environment
plan-dev:
	terraform workspace select dev || terraform workspace new dev
	terraform plan -var-file=environments/dev/terraform.tfvars

apply-dev:
	terraform workspace select dev || terraform workspace new dev
	terraform apply -var-file=environments/dev/terraform.tfvars

destroy-dev:
	terraform workspace select dev
	terraform destroy -var-file=environments/dev/terraform.tfvars

# Production Environment
plan-prod:
	terraform workspace select prod || terraform workspace new prod
	terraform plan -var-file=environments/prod/terraform.tfvars

apply-prod:
	terraform workspace select prod || terraform workspace new prod
	terraform apply -var-file=environments/prod/terraform.tfvars

destroy-prod:
	@echo "⚠️  WARNING: You are about to destroy PRODUCTION infrastructure!"
	@echo "Press Ctrl+C to cancel, or wait 10 seconds to continue..."
	@sleep 10
	terraform workspace select prod
	terraform destroy -var-file=environments/prod/terraform.tfvars

# Outputs
output-dev:
	terraform workspace select dev
	terraform output

output-prod:
	terraform workspace select prod
	terraform output

output-summary:
	terraform output summary

output-env-vars:
	terraform output -json nextjs_env_vars

# State management
refresh-dev:
	terraform workspace select dev
	terraform refresh -var-file=environments/dev/terraform.tfvars

refresh-prod:
	terraform workspace select prod
	terraform refresh -var-file=environments/prod/terraform.tfvars

# Clean up
clean:
	rm -rf .terraform
	rm -f .terraform.lock.hcl
	rm -f terraform.tfstate*
	rm -rf lambda/*.zip

# Help
help:
	@echo "4Tango Terraform Commands:"
	@echo ""
	@echo "  make init          - Initialize Terraform"
	@echo "  make fmt           - Format Terraform files"
	@echo "  make validate      - Validate configuration"
	@echo ""
	@echo "Development:"
	@echo "  make plan-dev      - Plan dev environment"
	@echo "  make apply-dev     - Apply dev environment"
	@echo "  make destroy-dev   - Destroy dev environment"
	@echo "  make output-dev    - Show dev outputs"
	@echo ""
	@echo "Production:"
	@echo "  make plan-prod     - Plan prod environment"
	@echo "  make apply-prod    - Apply prod environment"
	@echo "  make destroy-prod  - Destroy prod (with warning)"
	@echo "  make output-prod   - Show prod outputs"
	@echo ""
	@echo "Other:"
	@echo "  make output-summary    - Show infrastructure summary"
	@echo "  make output-env-vars   - Show Next.js env vars"
	@echo "  make clean             - Remove local Terraform files"
