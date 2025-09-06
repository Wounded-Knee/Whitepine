# Simple AWS Deployment for Personal Development

## Overview

This document describes a simplified AWS deployment architecture for the Whitepine personal development project. The setup is optimized for cost-effectiveness and ease of maintenance while providing a solid foundation for development and production use.

## Simplified Architecture

### What We Removed (Complexity Reduction)
- ❌ **VPC Complexity**: Uses default VPC instead of custom VPC
- ❌ **Multiple Environments**: Only dev and production (no staging)
- ❌ **Auto-scaling**: Fixed 1 instance per environment
- ❌ **SSL Certificates**: Uses CloudFront default certificates
- ❌ **Custom Domains**: Uses CloudFront default domains
- ❌ **Advanced Monitoring**: Basic CloudWatch logs only
- ❌ **Blue/Green Deployments**: Simple rolling updates

### What We Kept (Essential Features)
- ✅ **ECS Fargate**: Containerized backend deployment
- ✅ **S3 + CloudFront**: Static frontend hosting
- ✅ **MongoDB Atlas**: Managed database
- ✅ **GitHub Actions**: Automated CI/CD
- ✅ **Secrets Management**: AWS Secrets Manager
- ✅ **Health Checks**: Basic application monitoring

## Architecture Components

### Frontend (Next.js)
- **S3 Buckets**: `whitepine-{env}-frontend`
- **CloudFront**: Global CDN with default SSL
- **Cache Strategy**: 1-year cache for assets, no-cache for HTML

### Backend (Express.js)
- **ECS Fargate**: Single container per environment
- **Application Load Balancer**: HTTP only (no HTTPS complexity)
- **Health Checks**: `/health` endpoint monitoring

### Database
- **MongoDB Atlas**: Shared across environments
- **Connection Strings**: Stored in AWS Secrets Manager

## Environment Configuration

### Development
- **Resources**: 256 CPU, 512 MB RAM
- **Instances**: 1 container
- **Log Retention**: 3 days
- **Cost**: ~$10-15/month

### Production
- **Resources**: 512 CPU, 1 GB RAM
- **Instances**: 1 container
- **Log Retention**: 7 days
- **Cost**: ~$20-25/month

## Cost Optimization

### Resource Sizing
- **Minimal CPU/Memory**: Just enough for personal use
- **Single Instance**: No auto-scaling overhead
- **Short Log Retention**: Reduced CloudWatch costs
- **CloudFront Price Class**: Cheapest option (PriceClass_100)

### Estimated Monthly Costs
- **Development**: $10-15
- **Production**: $20-25
- **Total**: $30-40/month

## Deployment Process

### 1. Initial Setup
```bash
# Run the setup script
./scripts/simple-setup.sh
```

### 2. Deploy Infrastructure
```bash
# Deploy development environment
./scripts/simple-deploy.sh dev apply

# Deploy production environment
./scripts/simple-deploy.sh production apply
```

### 3. Deploy Applications
```bash
# Deploy to development
./scripts/simple-deploy.sh dev deploy

# Deploy to production
./scripts/simple-deploy.sh production deploy
```

### 4. Automated Deployments
- **Push to `develop`** → Development deployment
- **Push to `main`** → Production deployment

## File Structure

```
usa/
├── infrastructure/
│   └── terraform/
│       ├── simple-main.tf              # Simplified infrastructure
│       ├── simple-variables.tf         # Variable definitions
│       └── simple-environments/
│           ├── dev.tfvars              # Dev environment config
│           └── production.tfvars       # Production environment config
├── .github/
│   └── workflows/
│       └── simple-deploy.yml           # Single deployment workflow
├── scripts/
│   ├── simple-deploy.sh                # Deployment script
│   └── simple-setup.sh                 # Initial setup script
└── Dockerfile                          # Container configuration
```

## Required GitHub Secrets

### Repository Secrets
- `AWS_ACCOUNT_ID`: AWS account identifier
- `CF_DIST_ID_DEV`: CloudFront distribution ID for dev
- `CF_DIST_ID_PRODUCTION`: CloudFront distribution ID for production

### Environment Secrets (per environment)
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing secret

## Getting Started

### 1. Prerequisites
- AWS CLI configured
- Terraform installed
- Docker installed
- Node.js installed

### 2. Initial Setup
```bash
# Run the setup script
./scripts/simple-setup.sh
```

### 3. Configure GitHub
- Add required secrets to GitHub repository
- Update IAM role trust policies with repository name

### 4. Deploy Infrastructure
```bash
# Deploy both environments
./scripts/simple-deploy.sh dev apply
./scripts/simple-deploy.sh production apply
```

### 5. Configure Secrets
- Add MongoDB connection strings to AWS Secrets Manager
- Add JWT secrets to AWS Secrets Manager

### 6. Deploy Applications
```bash
# Deploy both environments
./scripts/simple-deploy.sh dev deploy
./scripts/simple-deploy.sh production deploy
```

## Maintenance

### Regular Tasks
- **Monthly**: Review costs and usage
- **Quarterly**: Update dependencies
- **As Needed**: Deploy new features

### Scaling (If Needed)
- **Vertical Scaling**: Update task definitions for more CPU/memory
- **Horizontal Scaling**: Add more ECS tasks (requires infrastructure changes)
- **Database Scaling**: MongoDB Atlas handles this automatically

## Troubleshooting

### Common Issues
1. **Deployment Failures**: Check ECS service events
2. **Health Check Failures**: Verify application health endpoint
3. **Database Connection**: Check Secrets Manager configuration
4. **Frontend Issues**: Verify CloudFront invalidation

### Debug Commands
```bash
# Check ECS service status
aws ecs describe-services --cluster whitepine-dev-cluster --services whitepine-dev-service

# Check application logs
aws logs tail /ecs/whitepine-dev-app --follow

# Check CloudFront invalidation
aws cloudfront list-invalidations --distribution-id DISTRIBUTION_ID
```

## Benefits of Simplified Approach

### Cost Benefits
- **Lower Infrastructure Costs**: No VPC, minimal resources
- **Reduced Complexity**: Fewer AWS services to manage
- **Predictable Pricing**: Fixed resource allocation

### Maintenance Benefits
- **Easier Debugging**: Fewer moving parts
- **Faster Deployments**: Simplified pipeline
- **Less Configuration**: Default AWS settings where possible

### Development Benefits
- **Quick Setup**: Single script to get started
- **Local Development**: Same Docker setup as production
- **Easy Testing**: Simple environment switching

## Limitations

### What You Give Up
- **High Availability**: Single instance per environment
- **Advanced Security**: No VPC isolation
- **Custom Domains**: Uses CloudFront default domains
- **SSL Certificates**: No custom SSL setup
- **Auto-scaling**: Fixed resource allocation

### When to Upgrade
Consider upgrading to the full architecture if you need:
- **High Availability**: Multiple instances per environment
- **Custom Domains**: Your own domain names
- **Advanced Security**: VPC isolation and custom SSL
- **Auto-scaling**: Dynamic resource allocation
- **Advanced Monitoring**: Detailed metrics and alerting

## Support

For issues or questions:
1. Check CloudWatch logs for application errors
2. Review GitHub Actions workflow logs
3. Consult AWS documentation for service-specific issues
4. Review this documentation for configuration guidance

---

**Last Updated**: $(date)
**Version**: 1.0
**Environment**: Simple Personal Development Deployment
