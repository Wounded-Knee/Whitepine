# Production Environment Configuration

environment = "production"
aws_region  = "us-east-1"

# Production-grade resources
task_cpu    = 1024
task_memory = 2048
desired_count = 3
min_capacity  = 2
max_capacity  = 20

# Extended log retention for production
log_retention_days = 30

# Production domain (configure with your actual domain)
# domain_name = "whitepine.com"
