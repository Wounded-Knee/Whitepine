# Multi-Environment AWS Deployment Architecture

## Overview

This document describes the complete multi-environment AWS deployment architecture for the Whitepine Full-Stack Application. The architecture supports three environments: **Development**, **Staging**, and **Production**, each with isolated infrastructure and automated CI/CD pipelines.

## Architecture Components

### Frontend (Next.js)
- **Static Export**: Next.js configured for static export to S3
- **S3 Buckets**: Separate bucket per environment (`usa-{env}-frontend`)
- **CloudFront**: Global CDN distribution per environment
- **Cache Strategy**: 1-year cache for static assets, no-cache for HTML

### Backend (Express.js)
- **ECS Fargate**: Containerized Express.js API server
- **Application Load Balancer**: SSL termination and routing
- **Auto Scaling**: CPU-based scaling (1-20 instances)
- **Health Checks**: `/health` endpoint monitoring

### Database
- **MongoDB Atlas**: Managed database service (shared across environments)
- **Connection Strings**: Stored in AWS Secrets Manager per environment

### Infrastructure
- **VPC**: Isolated network per environment
- **Subnets**: Public (ALB) and Private (ECS) subnets
- **Security Groups**: Restrictive firewall rules
- **IAM Roles**: Least-privilege access for GitHub Actions

## Environment Configuration

### Development
- **Resources**: 256 CPU, 512 MB RAM
- **Instances**: 1-3 containers
- **Log Retention**: 3 days
- **Domain**: `dev.whitepine.com` (optional)

### Staging
- **Resources**: 512 CPU, 1 GB RAM
- **Instances**: 1-5 containers
- **Log Retention**: 7 days
- **Domain**: `staging.whitepine.com` (optional)

### Production
- **Resources**: 1024 CPU, 2 GB RAM
- **Instances**: 2-20 containers
- **Log Retention**: 30 days
- **Domain**: `whitepine.com` (optional)

## CI/CD Pipeline

### GitHub Actions Workflows

#### Development (`deploy-dev.yml`)
- **Trigger**: Push to `develop` branch
- **Steps**: Test → Build → Deploy Backend → Deploy Frontend
- **Environment**: Development

#### Staging (`deploy-staging.yml`)
- **Trigger**: Push to `staging` branch
- **Steps**: Test → Security Scan → Deploy Backend → Deploy Frontend
- **Environment**: Staging

#### Production (`deploy-production.yml`)
- **Trigger**: Push to `main` branch
- **Steps**: Test → Security Scan → Performance Test → Deploy Backend → Deploy Frontend
- **Environment**: Production (with manual approval)

### Deployment Process

1. **Code Push**: Developer pushes to environment branch
2. **Automated Testing**: Linting, unit tests, security scans
3. **Build**: Docker image creation and Next.js static export
4. **Backend Deployment**: ECS service update with new container
5. **Frontend Deployment**: S3 sync and CloudFront invalidation
6. **Health Check**: Verify deployment success
7. **Notification**: Success/failure alerts

## Security Features

### Network Security
- **VPC Isolation**: Each environment in separate VPC
- **Private Subnets**: ECS tasks in private subnets only
- **Security Groups**: Restrictive ingress/egress rules
- **WAF**: Web Application Firewall (optional)

### Application Security
- **HTTPS Only**: SSL/TLS termination at ALB
- **Security Headers**: Helmet.js middleware
- **Rate Limiting**: Per-endpoint rate limits
- **CORS**: Environment-specific origins
- **Secrets Management**: AWS Secrets Manager

### Access Control
- **IAM Roles**: Least-privilege access
- **OIDC**: GitHub Actions authentication
- **MFA**: Required for production access
- **Audit Logging**: CloudTrail enabled

## Monitoring & Observability

### CloudWatch
- **Metrics**: CPU, memory, request count, error rate
- **Logs**: Application logs with structured logging
- **Alarms**: Automated alerting for critical metrics
- **Dashboards**: Environment-specific dashboards

### Health Monitoring
- **Health Checks**: ALB health checks on `/health`
- **Container Health**: ECS container health monitoring
- **Database Health**: MongoDB Atlas monitoring
- **CDN Health**: CloudFront distribution monitoring

## Cost Optimization

### Resource Sizing
- **Development**: Minimal resources for cost efficiency
- **Staging**: Medium resources for realistic testing
- **Production**: Auto-scaling based on demand

### Storage Optimization
- **S3 Intelligent Tiering**: Automatic storage class optimization
- **CloudFront**: Regional edge caches
- **Log Retention**: Environment-specific retention policies

## Disaster Recovery

### Backup Strategy
- **Database**: MongoDB Atlas automated backups
- **Application**: Git repository as source of truth
- **Infrastructure**: Terraform state management
- **Secrets**: AWS Secrets Manager versioning

### Recovery Procedures
- **Rollback**: ECS service rollback capability
- **Database Restore**: Point-in-time recovery
- **Infrastructure**: Terraform destroy/recreate
- **Secrets**: Secret version rollback

## Deployment Commands

### Infrastructure Deployment
```bash
# Deploy development environment
./scripts/deploy-infrastructure.sh dev apply

# Deploy staging environment
./scripts/deploy-infrastructure.sh staging apply

# Deploy production environment
./scripts/deploy-infrastructure.sh production apply
```

### Local Development
```bash
# Start development environment
npm run dev

# Build for production
npm run build

# Test deployment locally
docker build -t whitepine-app .
docker run -p 5000:5000 whitepine-app
```

## Required GitHub Secrets

### Repository Secrets
- `AWS_ACCOUNT_ID`: AWS account identifier
- `CF_DIST_ID_DEV`: CloudFront distribution ID for dev
- `CF_DIST_ID_STAGING`: CloudFront distribution ID for staging
- `CF_DIST_ID_PRODUCTION`: CloudFront distribution ID for production

### Environment Secrets (per environment)
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `NEXT_PUBLIC_API_URL`: API base URL for frontend

## File Structure

```
usa/
├── infrastructure/
│   └── terraform/
│       ├── main.tf                 # Main infrastructure
│       ├── variables.tf            # Variable definitions
│       └── environments/
│           ├── dev.tfvars          # Dev environment config
│           ├── staging.tfvars      # Staging environment config
│           └── production.tfvars   # Production environment config
├── .github/
│   └── workflows/
│       ├── deploy-dev.yml          # Development deployment
│       ├── deploy-staging.yml      # Staging deployment
│       └── deploy-production.yml   # Production deployment
├── scripts/
│   ├── deploy-infrastructure.sh    # Infrastructure deployment
│   └── setup-multi-env-deployment.sh # Initial setup
├── shared/
│   └── config/
│       └── config.js               # Environment configuration
├── Dockerfile                      # Container configuration
└── .dockerignore                   # Docker ignore rules
```

## Getting Started

### 1. Initial Setup
```bash
# Run the setup script
./scripts/setup-multi-env-deployment.sh
```

### 2. Configure GitHub Secrets
- Add required secrets to GitHub repository
- Update IAM role trust policies with repository name

### 3. Deploy Infrastructure
```bash
# Deploy all environments
./scripts/deploy-infrastructure.sh dev apply
./scripts/deploy-infrastructure.sh staging apply
./scripts/deploy-infrastructure.sh production apply
```

### 4. Configure Secrets
- Add MongoDB connection strings to AWS Secrets Manager
- Add JWT secrets to AWS Secrets Manager

### 5. Deploy Applications
- Push to `develop` branch for development deployment
- Push to `staging` branch for staging deployment
- Push to `main` branch for production deployment

## Maintenance

### Regular Tasks
- **Security Updates**: Monthly dependency updates
- **Infrastructure Updates**: Quarterly Terraform updates
- **Monitoring Review**: Weekly metric reviews
- **Cost Optimization**: Monthly cost analysis

### Scaling Considerations
- **Horizontal Scaling**: ECS auto-scaling handles traffic spikes
- **Vertical Scaling**: Update task definitions for resource changes
- **Database Scaling**: MongoDB Atlas handles database scaling
- **CDN Scaling**: CloudFront automatically scales globally

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

# Check CloudFront invalidation
aws cloudfront list-invalidations --distribution-id DISTRIBUTION_ID

# Check application logs
aws logs tail /ecs/whitepine-dev-app --follow
```

## Support

For issues or questions:
1. Check CloudWatch logs for application errors
2. Review GitHub Actions workflow logs
3. Consult AWS documentation for service-specific issues
4. Review this documentation for configuration guidance

---

**Last Updated**: $(date)
**Version**: 1.0
**Environment**: Multi-Environment AWS Deployment
