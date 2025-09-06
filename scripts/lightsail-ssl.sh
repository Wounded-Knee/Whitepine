#!/bin/bash

# AWS Lightsail SSL Certificate Setup Script
# This script sets up SSL certificates for your Lightsail instance

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
    echo "Usage: $0 <domain>"
    echo ""
    echo "This script sets up SSL certificates for your Lightsail instance"
    echo "using Let's Encrypt and Certbot."
    echo ""
    echo "Example:"
    echo "  $0 yourdomain.com"
    echo ""
    echo "Prerequisites:"
    echo "  - Domain name pointing to your Lightsail instance"
    echo "  - Instance must be running and accessible"
}

# Check if domain is provided
if [ $# -lt 1 ]; then
    print_error "Domain is required"
    show_usage
    exit 1
fi

DOMAIN=$1

# Get instance details
print_status "📊 Getting instance details..."
INSTANCE_IP=$(aws lightsail get-instance --instance-name whitepine-dev --query 'instance.publicIpAddress' --output text 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    print_error "Instance 'whitepine-dev' not found. Please run lightsail-setup.sh first."
    exit 1
fi

print_status "Instance IP: $INSTANCE_IP"
print_status "Domain: $DOMAIN"

# Verify domain points to instance
print_status "🔍 Verifying domain DNS..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
if [ "$DOMAIN_IP" != "$INSTANCE_IP" ]; then
    print_warning "Domain $DOMAIN does not point to instance IP $INSTANCE_IP"
    print_warning "Current domain IP: $DOMAIN_IP"
    print_warning "Please update your DNS records before continuing."
    read -p "Continue anyway? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        exit 1
    fi
fi

# Install Certbot and configure SSL
print_status "🔐 Setting up SSL certificate..."
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << EOF
    set -e
    
    echo "📦 Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    
    echo "🔧 Configuring Nginx for domain..."
    sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/whitepine
    
    echo "🔄 Reloading Nginx..."
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo "🔐 Obtaining SSL certificate..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    echo "✅ SSL certificate installed successfully!"
    
    echo "🔄 Setting up automatic renewal..."
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    echo "✅ SSL setup complete!"
EOF

# Update application configuration
print_status "🔧 Updating application configuration..."
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << EOF
    set -e
    
    echo "📝 Updating environment variables..."
    cd /opt/whitepine
    
    # Update .env file with HTTPS URLs
    if [ -f .env ]; then
        sed -i "s|NEXT_PUBLIC_API_URL=http://localhost:5000|NEXT_PUBLIC_API_URL=https://$DOMAIN/api|" .env
        sed -i "s|NODE_ENV=production|NODE_ENV=production|" .env
    fi
    
    echo "🔄 Restarting application..."
    pm2 restart all
    
    echo "✅ Application configuration updated!"
EOF

# Display summary
echo ""
print_status "📋 SSL Setup Summary:"
echo "========================"
echo "• Domain: $DOMAIN"
echo "• SSL Certificate: Let's Encrypt"
echo "• Auto-renewal: Enabled"
echo "• Frontend: https://$DOMAIN"
echo "• Backend API: https://$DOMAIN/api"
echo "• Health Check: https://$DOMAIN/health"
echo ""

print_status "🔧 Management Commands:"
echo "• Check certificate status: ssh ubuntu@$INSTANCE_IP 'sudo certbot certificates'"
echo "• Renew certificate: ssh ubuntu@$INSTANCE_IP 'sudo certbot renew'"
echo "• View Nginx config: ssh ubuntu@$INSTANCE_IP 'sudo nginx -t'"
echo ""

print_success "🎉 SSL setup complete!"
print_status "🌐 Your application is now accessible at https://$DOMAIN"
print_warning "⚠️  Remember to update your DNS records if you haven't already!"
