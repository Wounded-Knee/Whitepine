# Development Environment Configuration

environment = "dev"
aws_region  = "us-east-1"

# Smaller resources for development
task_cpu    = 256
task_memory = 512
desired_count = 1
min_capacity  = 1
max_capacity  = 3

# Shorter log retention for dev
log_retention_days = 3

# Development domain (optional)
# domain_name = "dev.whitepine.com"
