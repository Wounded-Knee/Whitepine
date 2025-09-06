# Production Environment Configuration (Personal Use)

environment = "production"
aws_region  = "us-east-1"

# Slightly more resources for production
task_cpu    = 512
task_memory = 1024
desired_count = 1

# Longer log retention for production
log_retention_days = 7
