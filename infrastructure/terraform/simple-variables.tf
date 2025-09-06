# Simplified Variables for Personal Development Project

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev or production)"
  type        = string
  validation {
    condition     = contains(["dev", "production"], var.environment)
    error_message = "Environment must be either 'dev' or 'production'."
  }
}

# Application Configuration
variable "app_port" {
  description = "Port exposed by the application"
  type        = number
  default     = 5000
}

variable "task_cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory for the ECS task"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 3
}