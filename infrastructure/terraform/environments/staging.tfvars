# Staging Environment Configuration

environment = "staging"
aws_region  = "us-east-1"

# Medium resources for staging
task_cpu    = 512
task_memory = 1024
desired_count = 2
min_capacity  = 1
max_capacity  = 5

# Standard log retention
log_retention_days = 7

# Staging domain (optional)
# domain_name = "staging.whitepine.com"
