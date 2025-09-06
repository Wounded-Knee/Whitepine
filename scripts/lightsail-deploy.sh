#!/bin/bash

# AWS Lightsail Application Deployment Script
# This script deploys the Whitepine application to the Lightsail instance

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

print_status "🚀 Deploying Whitepine Application to AWS Lightsail"

# Check if deployment package exists
if [ ! -f "whitepine-deployment.tar.gz" ]; then
    print_error "Deployment package not found. Please run lightsail-setup.sh first."
    exit 1
fi

# Get instance details
print_status "📊 Getting instance details..."
INSTANCE_IP=$(aws lightsail get-instance --instance-name whitepine-dev --query 'instance.publicIpAddress' --output text 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    print_error "Instance 'whitepine-dev' not found. Please run lightsail-setup.sh first."
    exit 1
fi

print_status "Instance IP: $INSTANCE_IP"

# Check if instance is running
INSTANCE_STATE=$(aws lightsail get-instance --instance-name whitepine-dev --query 'instance.state.name' --output text)
if [ "$INSTANCE_STATE" != "running" ]; then
    print_error "Instance is not running. Current state: $INSTANCE_STATE"
    exit 1
fi

print_success "✅ Instance is running"

# Wait for instance setup to complete
print_status "⏳ Waiting for instance setup to complete..."
sleep 30

# Test SSH connection
print_status "🔐 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "echo 'SSH connection successful'" > /dev/null 2>&1; then
    print_warning "SSH connection failed. This is normal for new instances."
    print_status "Please wait a few more minutes for the instance setup to complete."
    print_status "You can check the instance status in the AWS Lightsail console."
    exit 1
fi

print_success "✅ SSH connection successful"

# Upload deployment package
print_status "📦 Uploading deployment package..."
scp -o StrictHostKeyChecking=no whitepine-deployment.tar.gz ubuntu@$INSTANCE_IP:/tmp/

# Deploy application
print_status "🚀 Deploying application..."
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'EOF'
    set -e
    
    echo "📁 Extracting deployment package..."
    cd /opt/whitepine
    tar -xzf /tmp/whitepine-deployment.tar.gz
    
    echo "🔧 Setting up environment..."
    if [ ! -f .env ]; then
        cp .env.template .env
        echo "⚠️  Please configure your .env file with your MongoDB connection string and JWT secret"
    fi
    
    echo "📦 Installing dependencies..."
    npm ci --production
    
    echo "🏗️ Building application..."
    npm run build
    
    echo "🚀 Starting application..."
    ./deploy.sh
    
    echo "✅ Application deployed successfully!"
EOF

# Test application
print_status "🧪 Testing application..."
sleep 10

# Test backend health endpoint
if curl -f http://$INSTANCE_IP/health > /dev/null 2>&1; then
    print_success "✅ Backend health check passed"
else
    print_warning "⚠️  Backend health check failed. Application may still be starting up."
fi

# Test frontend
if curl -f http://$INSTANCE_IP/ > /dev/null 2>&1; then
    print_success "✅ Frontend is accessible"
else
    print_warning "⚠️  Frontend check failed. Application may still be starting up."
fi

# Display deployment summary
echo ""
print_status "📋 Deployment Summary:"
echo "========================"
echo "• Instance: whitepine-dev"
echo "• IP Address: $INSTANCE_IP"
echo "• Frontend: http://$INSTANCE_IP"
echo "• Backend API: http://$INSTANCE_IP/api"
echo "• Health Check: http://$INSTANCE_IP/health"
echo ""

print_status "🔧 Management Commands:"
echo "• SSH to instance: ssh ubuntu@$INSTANCE_IP"
echo "• Check PM2 status: ssh ubuntu@$INSTANCE_IP 'pm2 status'"
echo "• View logs: ssh ubuntu@$INSTANCE_IP 'pm2 logs'"
echo "• Restart app: ssh ubuntu@$INSTANCE_IP 'pm2 restart all'"
echo "• Monitor system: ssh ubuntu@$INSTANCE_IP './monitor.sh'"
echo ""

print_status "📚 Next Steps:"
echo "1. Configure your .env file with MongoDB connection string"
echo "2. Test your application at http://$INSTANCE_IP"
echo "3. Set up domain name and SSL certificate (optional)"
echo "4. Configure monitoring and alerts (optional)"
echo ""

print_success "🎉 Deployment complete!"
print_status "💰 Monthly cost: $5.00 (well under your $20 budget!)"
print_warning "⚠️  Remember to configure your MongoDB Atlas connection string!"
