# WhitePine Deployment Guide

This guide walks you through setting up GitHub Actions CI/CD for the WhitePine project.

## Overview

The deployment system uses:
- **GitHub Actions** for CI/CD
- **Lightsail** for hosting
- **PM2** for process management
- **Nginx** for reverse proxy and SSL
- **MongoDB Atlas** for database
- **AWS S3** for file storage

## Prerequisites

1. **Lightsail Instance** - Ubuntu 22.04 LTS with static IP
2. **Domain Names** - `whitepine.jpkramer.com` and `whitepinedev.jpkramer.com`
3. **MongoDB Atlas** - Database cluster with separate databases for prod/dev
4. **AWS S3** - Buckets for file uploads
5. **Google OAuth** - Client ID and secret for authentication

## Step 1: Server Setup

### 1.1 Initial Server Configuration
```bash
# Connect to your Lightsail instance
ssh ubuntu@your-lightsail-ip

# Run the setup script
curl -fsSL https://raw.githubusercontent.com/your-username/whitepine/main/apps/ops/scripts/setup-server.sh | bash
```

### 1.2 Manual Setup (Alternative)
If you prefer manual setup, follow these steps:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx certbot python3-certbot-nginx nodejs npm git apache2-utils fail2ban ufw

# Install pnpm and PM2
npm install -g pnpm pm2

# Create directory structure
sudo mkdir -p /var/www/whitepine/{releases,current,shared/env}
sudo mkdir -p /var/log/whitepine

# Create deploy user
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# Set permissions
sudo chown -R deploy:deploy /var/www/whitepine
sudo chown -R deploy:deploy /var/log/whitepine
```

### 1.3 SSH Key Setup
```bash
# Generate SSH key pair (on your local machine)
ssh-keygen -t ed25519 -C "github-actions@whitepine" -f ~/.ssh/whitepine-deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/whitepine-deploy.pub deploy@your-lightsail-ip

# Test connection
ssh -i ~/.ssh/whitepine-deploy deploy@your-lightsail-ip
```

## Step 2: DNS Configuration

### 2.1 Route 53 Setup
1. Create hosted zone for `jpkramer.com`
2. Create A records:
   - `whitepine.jpkramer.com` → Your Lightsail IP
   - `whitepinedev.jpkramer.com` → Your Lightsail IP
3. Set TTL to 300 seconds

### 2.2 SSL Certificate Setup
```bash
# On your Lightsail instance
sudo certbot --nginx -d whitepine.jpkramer.com -d whitepinedev.jpkramer.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 3: GitHub Configuration

### 3.1 Repository Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository-level secrets:
- `SSH_PRIVATE_KEY` - Content of `~/.ssh/whitepine-deploy`
- `LIGHTSAIL_HOST` - Your Lightsail IP address
- `LIGHTSAIL_USER` - `deploy`

### 3.2 Environment Secrets
Create two environments in GitHub:
1. `production` - For main branch deployments
2. `development` - For develop branch deployments

Add environment-specific secrets to each:

**Production Environment:**
- `MONGODB_URI` - Production MongoDB connection string
- `SESSION_SECRET` - Production session secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `S3_BUCKET` - Production S3 bucket name
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

**Development Environment:**
- `MONGODB_URI` - Development MongoDB connection string
- `SESSION_SECRET` - Development session secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (can be same as production)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (can be same as production)
- `S3_BUCKET` - Development S3 bucket name
- `AWS_REGION` - AWS region (same as production)
- `AWS_ACCESS_KEY_ID` - AWS access key ID (can be same as production)
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key (can be same as production)

## Step 4: First Deployment

### 4.1 Deploy to Development
```bash
# Push to develop branch
git checkout develop
git push origin develop
```

This will trigger the development deployment workflow.

### 4.2 Deploy to Production
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

This will trigger the production deployment workflow.

## Step 5: Verification

### 5.1 Check Deployment Status
```bash
# SSH to server
ssh -i ~/.ssh/whitepine-deploy deploy@your-lightsail-ip

# Check PM2 status
pm2 status

# Check nginx status
sudo systemctl status nginx

# View application logs
pm2 logs
```

### 5.2 Test Endpoints
```bash
# Test production
curl -f https://whitepine.jpkramer.com/
curl -f https://whitepine.jpkramer.com/api/healthz

# Test development (with basic auth)
curl -f -u dev:dev123 https://whitepinedev.jpkramer.com/
curl -f -u dev:dev123 https://whitepinedev.jpkramer.com/api/healthz
```

## Step 6: Monitoring and Maintenance

### 6.1 Health Checks
The deployment includes automatic health checks:
- Web application responds on `/`
- API responds on `/api/healthz`
- PM2 processes are running
- Nginx is serving requests

### 6.2 Log Monitoring
```bash
# View PM2 logs
pm2 logs

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
tail -f /var/log/whitepine/*.log
```

### 6.3 SSL Certificate Renewal
Certificates are automatically renewed via certbot. Monitor with:
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

### 6.4 Updates and Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
pm2 restart all
sudo systemctl restart nginx

# Clean up old releases
cd /var/www/whitepine/releases
ls -t | tail -n +6 | xargs -r rm -rf
```

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify secrets are set correctly
   - Check server connectivity

2. **Services Not Starting**
   - Check PM2 status: `pm2 status`
   - View logs: `pm2 logs`
   - Check environment files: `cat /var/www/whitepine/shared/env/*.env`

3. **SSL Issues**
   - Verify DNS is pointing to correct IP
   - Check certificate status: `sudo certbot certificates`
   - Test nginx config: `sudo nginx -t`

4. **Database Connection Issues**
   - Verify MongoDB URI in environment files
   - Check network connectivity to MongoDB Atlas
   - Verify database user permissions

### Rollback Procedure
```bash
# List available releases
ls -la /var/www/whitepine/releases/

# Rollback to previous release
sudo -u deploy ln -sfn /var/www/whitepine/releases/PREVIOUS_TIMESTAMP /var/www/whitepine/current

# Restart services
pm2 restart all
```

## Security Considerations

1. **SSH Keys** - Rotate regularly and use strong keys
2. **Secrets** - Use different secrets for production and development
3. **Firewall** - Only open necessary ports (22, 80, 443)
4. **Updates** - Keep system and dependencies updated
5. **Monitoring** - Monitor for unusual activity and failed deployments

## Cost Optimization

1. **Lightsail** - Use appropriate instance size for your traffic
2. **MongoDB Atlas** - Choose appropriate cluster size
3. **S3** - Use lifecycle policies for old files
4. **Monitoring** - Set up alerts for cost thresholds

## Support

For issues with this deployment guide:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Check server logs
4. Verify configuration files
5. Test connectivity and permissions
