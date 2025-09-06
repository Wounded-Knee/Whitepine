#!/bin/bash

# Simple Setup Script for Personal Development Project
# This script sets up the minimal AWS infrastructure needed

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

print_status "🚀 Setting up Simple AWS Deployment for Whitepine Personal Development Project"

# Check prerequisites
print_status "📋 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check Terraform
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install it first:"
    echo "   https://developer.hashicorp.com/terraform/downloads"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first:"
    echo "   https://nodejs.org/"
    exit 1
fi

print_success "✅ Prerequisites check passed"

# Get AWS account information
print_status "🔍 Getting AWS account information..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

print_status "AWS Account ID: $AWS_ACCOUNT_ID"
print_status "AWS Region: $AWS_REGION"

# Test build
print_status "🔨 Testing local build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "✅ Local build successful"
else
    print_error "❌ Local build failed. Please fix build issues before deployment."
    exit 1
fi

# Create GitHub OIDC provider (if not exists)
print_status "🔐 Setting up GitHub OIDC provider..."
OIDC_PROVIDER_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"

if ! aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_PROVIDER_ARN" &> /dev/null; then
    print_status "Creating GitHub OIDC provider..."
    aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --client-id-list sts.amazonaws.com \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
    print_success "✅ GitHub OIDC provider created"
else
    print_status "✅ GitHub OIDC provider already exists"
fi

# Create IAM roles for GitHub Actions (simplified)
print_status "👥 Creating IAM roles for GitHub Actions..."

# Function to create IAM role
create_github_role() {
    local env=$1
    local role_name="github-actions-deploy-$env"
    
    print_status "Creating IAM role: $role_name"
    
    # Create trust policy
    cat > "/tmp/trust-policy-$env.json" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
EOF

    # Create IAM policy (simplified)
    cat > "/tmp/policy-$env.json" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::whitepine-$env-frontend",
        "arn:aws:s3:::whitepine-$env-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
EOF

    # Create role if it doesn't exist
    if ! aws iam get-role --role-name "$role_name" &> /dev/null; then
        aws iam create-role \
            --role-name "$role_name" \
            --assume-role-policy-document "file:///tmp/trust-policy-$env.json"
        print_success "✅ Created IAM role: $role_name"
    else
        print_status "✅ IAM role already exists: $role_name"
    fi

    # Attach policy
    aws iam put-role-policy \
        --role-name "$role_name" \
        --policy-name "GitHubActionsDeployPolicy" \
        --policy-document "file:///tmp/policy-$env.json"
    
    # Clean up temp files
    rm -f "/tmp/trust-policy-$env.json" "/tmp/policy-$env.json"
}

# Create roles for each environment
create_github_role "dev"
create_github_role "production"

print_success "✅ IAM roles created successfully"

# Display configuration summary
echo ""
print_status "📋 Simple Deployment Configuration Summary:"
echo "=================================================="
echo "• AWS Account ID: $AWS_ACCOUNT_ID"
echo "• AWS Region: $AWS_REGION"
echo "• Environments: dev, production"
echo "• Frontend: S3 + CloudFront per environment"
echo "• Backend: ECS Fargate per environment"
echo "• Database: MongoDB Atlas (shared)"
echo "• CI/CD: GitHub Actions with OIDC"
echo "• Cost Optimized: Minimal resources, no VPC complexity"
echo ""

print_status "🔧 Next Steps:"
echo "1. Update GitHub repository secrets:"
echo "   - AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "   - CF_DIST_ID_DEV: (will be created by Terraform)"
echo "   - CF_DIST_ID_PRODUCTION: (will be created by Terraform)"
echo ""
echo "2. Update IAM role trust policies with your GitHub repository:"
echo "   - Replace 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME' in the trust policies"
echo ""
echo "3. Deploy infrastructure:"
echo "   ./scripts/simple-deploy.sh dev apply"
echo "   ./scripts/simple-deploy.sh production apply"
echo ""
echo "4. Configure MongoDB Atlas connection strings in AWS Secrets Manager"
echo ""
echo "5. Deploy applications:"
echo "   ./scripts/simple-deploy.sh dev deploy"
echo "   ./scripts/simple-deploy.sh production deploy"
echo ""

print_status "📚 Documentation:"
echo "• Infrastructure: infrastructure/terraform/simple-main.tf"
echo "• CI/CD: .github/workflows/simple-deploy.yml"
echo "• Environment configs: shared/config.js"
echo ""

print_success "🎉 Simple deployment setup complete!"
print_warning "⚠️  Remember to update GitHub secrets and IAM trust policies before deploying!"
print_status "💰 This setup is optimized for personal development with minimal costs!"
