#!/bin/bash

# AWS Lightsail Deployment Setup Script
# This script sets up a complete Lightsail instance for the Whitepine project

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

print_status "🚀 Setting up AWS Lightsail for Whitepine Personal Development Project"

# Check prerequisites
print_status "📋 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI is not configured. Please run 'aws configure' first"
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

# Create Lightsail instance
print_status "🏗️ Creating Lightsail instance..."

# Check if instance already exists
if aws lightsail get-instance --instance-name whitepine-dev > /dev/null 2>&1; then
    print_warning "Instance 'whitepine-dev' already exists. Skipping creation."
else
    print_status "Creating Lightsail instance 'whitepine-dev'..."
    aws lightsail create-instances \
        --instance-names whitepine-dev \
        --availability-zone ${AWS_REGION}a \
        --blueprint-id ubuntu_20_04 \
        --bundle-id nano_2_0 \
        --user-data file://scripts/lightsail-user-data.sh
    
    print_success "✅ Lightsail instance created"
    
    # Wait for instance to be running
    print_status "⏳ Waiting for instance to be running..."
    aws lightsail wait instance-running --instance-name whitepine-dev
    print_success "✅ Instance is running"
fi

# Get instance details
print_status "📊 Getting instance details..."
INSTANCE_IP=$(aws lightsail get-instance --instance-name whitepine-dev --query 'instance.publicIpAddress' --output text)
INSTANCE_STATE=$(aws lightsail get-instance --instance-name whitepine-dev --query 'instance.state.name' --output text)

print_status "Instance IP: $INSTANCE_IP"
print_status "Instance State: $INSTANCE_STATE"

# Create static IP
print_status "🌐 Creating static IP..."
if aws lightsail get-static-ip --static-ip-name whitepine-dev-ip > /dev/null 2>&1; then
    print_warning "Static IP 'whitepine-dev-ip' already exists."
else
    aws lightsail allocate-static-ip --static-ip-name whitepine-dev-ip
    aws lightsail attach-static-ip --static-ip-name whitepine-dev-ip --instance-name whitepine-dev
    print_success "✅ Static IP created and attached"
fi

# Get static IP
STATIC_IP=$(aws lightsail get-static-ip --static-ip-name whitepine-dev-ip --query 'staticIp.ipAddress' --output text)
print_status "Static IP: $STATIC_IP"

# Create deployment package
print_status "📦 Creating deployment package..."
tar -czf whitepine-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=out \
    --exclude=infrastructure \
    --exclude=scripts \
    --exclude=*.log \
    .

print_success "✅ Deployment package created"

# Display configuration summary
echo ""
print_status "📋 Lightsail Deployment Configuration Summary:"
echo "=================================================="
echo "• Instance Name: whitepine-dev"
echo "• Instance IP: $STATIC_IP"
echo "• Instance Type: nano_2_0 (0.5 GB RAM, 1 vCPU)"
echo "• Monthly Cost: $5.00"
echo "• Operating System: Ubuntu 20.04"
echo "• Region: $AWS_REGION"
echo ""

print_status "🔧 Next Steps:"
echo "1. Wait 5-10 minutes for instance setup to complete"
echo "2. Deploy your application:"
echo "   ./scripts/lightsail-deploy.sh"
echo ""
echo "3. Access your application:"
echo "   Frontend: http://$STATIC_IP:3000"
echo "   Backend: http://$STATIC_IP:5000"
echo ""

print_status "📚 Documentation:"
echo "• Lightsail Console: https://lightsail.aws.amazon.com/"
echo "• Instance Management: aws lightsail get-instance --instance-name whitepine-dev"
echo "• Logs: aws lightsail get-instance-access-details --instance-name whitepine-dev"
echo ""

print_success "🎉 Lightsail setup complete!"
print_warning "⚠️  Remember to configure your MongoDB Atlas connection string!"
print_status "💰 Total monthly cost: $5.00 (well under your $20 budget!)"
