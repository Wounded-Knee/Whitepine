#!/bin/bash

# AWS Lightsail Management Script
# This script provides common management tasks for the Lightsail instance

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
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  status      - Show instance status"
    echo "  logs        - View application logs"
    echo "  restart     - Restart application"
    echo "  stop        - Stop application"
    echo "  start       - Start application"
    echo "  monitor     - Show system monitoring"
    echo "  backup      - Create backup"
    echo "  ssh         - SSH to instance"
    echo "  update      - Update application"
    echo "  destroy     - Destroy instance"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs"
    echo "  $0 restart"
}

# Check if command is provided
if [ $# -lt 1 ]; then
    print_error "Command is required"
    show_usage
    exit 1
fi

COMMAND=$1

# Get instance details
print_status "📊 Getting instance details..."
INSTANCE_IP=$(aws lightsail get-instance --instance-name whitepine-dev --query 'instance.publicIpAddress' --output text 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    print_error "Instance 'whitepine-dev' not found. Please run lightsail-setup.sh first."
    exit 1
fi

print_status "Instance IP: $INSTANCE_IP"

# Execute command
case $COMMAND in
    status)
        print_status "📊 Instance Status:"
        aws lightsail get-instance --instance-name whitepine-dev --query 'instance.{Name:name,State:state.name,IP:publicIpAddress,Type:bundleId}' --output table
        
        print_status "📊 Application Status:"
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "pm2 status"
        ;;
    
    logs)
        print_status "📋 Application Logs:"
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "pm2 logs --lines 50"
        ;;
    
    restart)
        print_status "🔄 Restarting application..."
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "pm2 restart all"
        print_success "✅ Application restarted"
        ;;
    
    stop)
        print_status "⏹️ Stopping application..."
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "pm2 stop all"
        print_success "✅ Application stopped"
        ;;
    
    start)
        print_status "▶️ Starting application..."
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "pm2 start all"
        print_success "✅ Application started"
        ;;
    
    monitor)
        print_status "📊 System Monitoring:"
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "./monitor.sh"
        ;;
    
    backup)
        print_status "💾 Creating backup..."
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "./backup.sh"
        print_success "✅ Backup created"
        ;;
    
    ssh)
        print_status "🔐 Connecting to instance..."
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP
        ;;
    
    update)
        print_status "🔄 Updating application..."
        
        # Create new deployment package
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
        
        # Upload and deploy
        print_status "📤 Uploading deployment package..."
        scp -o StrictHostKeyChecking=no whitepine-deployment.tar.gz ubuntu@$INSTANCE_IP:/tmp/
        
        print_status "🚀 Deploying update..."
        ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'EOF'
            set -e
            
            echo "📁 Extracting deployment package..."
            cd /opt/whitepine
            tar -xzf /tmp/whitepine-deployment.tar.gz
            
            echo "📦 Installing dependencies..."
            npm ci --production
            
            echo "🏗️ Building application..."
            npm run build
            
            echo "🔄 Restarting application..."
            pm2 restart all
            
            echo "✅ Application updated successfully!"
        EOF
        
        print_success "✅ Application updated"
        ;;
    
    destroy)
        print_warning "⚠️  This will permanently destroy the Lightsail instance and all data!"
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [ "$confirm" = "yes" ]; then
            print_status "🗑️ Destroying instance..."
            
            # Delete static IP first
            if aws lightsail get-static-ip --static-ip-name whitepine-dev-ip > /dev/null 2>&1; then
                aws lightsail detach-static-ip --static-ip-name whitepine-dev-ip
                aws lightsail release-static-ip --static-ip-name whitepine-dev-ip
                print_status "✅ Static IP released"
            fi
            
            # Delete instance
            aws lightsail delete-instance --instance-name whitepine-dev
            print_success "✅ Instance destroyed"
        else
            print_status "Destroy cancelled"
        fi
        ;;
    
    *)
        print_error "Invalid command: $COMMAND"
        show_usage
        exit 1
        ;;
esac

print_success "Operation completed successfully"
