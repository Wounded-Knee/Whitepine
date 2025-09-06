#!/bin/bash

# Simple Deployment Script for Personal Development Project
# This script handles both infrastructure and application deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    echo "Usage: $0 <environment> [action]"
    echo ""
    echo "Environments:"
    echo "  dev        - Development environment"
    echo "  production - Production environment"
    echo ""
    echo "Actions:"
    echo "  plan       - Plan the infrastructure changes (default)"
    echo "  apply      - Apply the infrastructure changes"
    echo "  destroy    - Destroy the infrastructure"
    echo "  deploy     - Deploy the application (after infrastructure is ready)"
    echo ""
    echo "Examples:"
    echo "  $0 dev plan"
    echo "  $0 dev apply"
    echo "  $0 dev deploy"
}

# Check if environment is provided
if [ $# -lt 1 ]; then
    print_error "Environment is required"
    show_usage
    exit 1
fi

ENVIRONMENT=$1
ACTION=${2:-plan}

# Validate environment
case $ENVIRONMENT in
    dev|development)
        ENVIRONMENT="dev"
        ;;
    prod|production)
        ENVIRONMENT="production"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        show_usage
        exit 1
        ;;
esac

# Set paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform"
ENV_FILE="$TERRAFORM_DIR/simple-environments/$ENVIRONMENT.tfvars"

# Check if Terraform directory exists
if [ ! -d "$TERRAFORM_DIR" ]; then
    print_error "Terraform directory not found: $TERRAFORM_DIR"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file not found: $ENV_FILE"
    exit 1
fi

# Change to Terraform directory
cd "$TERRAFORM_DIR"

print_status "Deploying to environment: $ENVIRONMENT"
print_status "Action: $ACTION"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI is not configured or credentials are invalid"
    print_status "Please run 'aws configure' or set up AWS credentials"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_status "AWS Account ID: $AWS_ACCOUNT_ID"

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    print_status "Initializing Terraform..."
    terraform init
    print_success "Terraform initialized"
fi

# Set Terraform variables
export TF_VAR_environment="$ENVIRONMENT"
export TF_VAR_aws_region="us-east-1"

# Execute Terraform command
case $ACTION in
    plan)
        print_status "Planning infrastructure changes..."
        terraform plan -var-file="simple-environments/$ENVIRONMENT.tfvars" -out="tfplan-$ENVIRONMENT"
        print_success "Plan completed. Review the changes above."
        print_status "To apply changes, run: $0 $ENVIRONMENT apply"
        ;;
    apply)
        print_status "Applying infrastructure changes..."
        if [ -f "tfplan-$ENVIRONMENT" ]; then
            terraform apply "tfplan-$ENVIRONMENT"
        else
            terraform apply -var-file="simple-environments/$ENVIRONMENT.tfvars" -auto-approve
        fi
        print_success "Infrastructure deployed successfully!"
        
        # Show outputs
        print_status "Infrastructure outputs:"
        terraform output
        
        # Clean up plan file
        rm -f "tfplan-$ENVIRONMENT"
        ;;
    destroy)
        print_warning "This will destroy all infrastructure for environment: $ENVIRONMENT"
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [ "$confirm" = "yes" ]; then
            print_status "Destroying infrastructure..."
            terraform destroy -var-file="simple-environments/$ENVIRONMENT.tfvars" -auto-approve
            print_success "Infrastructure destroyed successfully!"
        else
            print_status "Destroy cancelled"
        fi
        ;;
    deploy)
        print_status "Deploying application..."
        
        # Build the application
        cd "$PROJECT_ROOT"
        print_status "Building application..."
        npm run build
        
        # Get ECR repository URL
        ECR_REPO=$(cd "$TERRAFORM_DIR" && terraform output -raw ecr_repository_url 2>/dev/null || echo "")
        if [ -z "$ECR_REPO" ]; then
            print_error "ECR repository not found. Please run 'terraform apply' first."
            exit 1
        fi
        
        # Build and push Docker image
        print_status "Building and pushing Docker image..."
        docker build -t "$ECR_REPO:latest" .
        docker push "$ECR_REPO:latest"
        
        # Update ECS service
        print_status "Updating ECS service..."
        CLUSTER_NAME=$(cd "$TERRAFORM_DIR" && terraform output -raw ecs_cluster_name 2>/dev/null || echo "")
        SERVICE_NAME="whitepine-$ENVIRONMENT-service"
        
        aws ecs update-service \
            --cluster "$CLUSTER_NAME" \
            --service "$SERVICE_NAME" \
            --force-new-deployment
        
        print_success "Application deployment initiated!"
        print_status "Check ECS console for deployment status"
        ;;
    *)
        print_error "Invalid action: $ACTION"
        show_usage
        exit 1
        ;;
esac

print_success "Operation completed for $ENVIRONMENT environment"
