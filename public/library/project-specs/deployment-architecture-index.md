# Deployment Architecture Index

## Overview
This document provides a comprehensive index of the deployment architecture for the Whitepine Full-Stack Application, including AWS infrastructure setup, GitHub Actions configuration, and deployment procedures.

## Architecture Components

### Frontend Deployment
- **Technology**: Next.js 15 with static export
- **Hosting**: AWS S3 bucket with CloudFront CDN
- **Build Process**: GitHub Actions automated pipeline
- **Output**: Static files in `out/` directory

### Backend Services
- **API Server**: Express.js with MongoDB Atlas
- **Database**: MongoDB Atlas with Mongoose ODM
- **File Storage**: Local uploads directory (development)
- **Authentication**: Session-based with JWT tokens

### Infrastructure Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions │───▶│   AWS S3 + CF   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   AWS IAM OIDC  │
                       └─────────────────┘
```

## Deployment Flow

### 1. Code Push Trigger
- Push to `main` branch triggers GitHub Actions workflow
- Manual deployment available via GitHub Actions UI

### 2. Build Process
- Install Node.js dependencies
- Build Next.js application with static export
- Generate optimized static files in `out/` directory

### 3. AWS Deployment
- Authenticate using OIDC (no stored credentials)
- Sync static assets to S3 with long-term caching
- Upload HTML files with no-cache headers
- Invalidate CloudFront cache for immediate updates

### 4. CDN Distribution
- CloudFront serves content globally
- Automatic HTTPS and DDoS protection
- Edge caching for optimal performance

## Setup Documentation

### AWS Infrastructure Setup
- [S3 Bucket Configuration](./aws-s3-setup.md)
- [CloudFront Distribution Setup](./aws-cloudfront-setup.md)
- [IAM Role and Policy Configuration](./aws-iam-setup.md)
- [OIDC Provider Configuration](./aws-oidc-setup.md)

### GitHub Configuration
- [Repository Secrets Setup](./github-secrets-setup.md)
- [Workflow Configuration](./github-workflow-setup.md)
- [Branch Protection Rules](./github-branch-protection.md)

### Deployment Procedures
- [Initial Deployment](./initial-deployment.md)
- [Production Deployment](./production-deployment.md)
- [Rollback Procedures](./rollback-procedures.md)
- [Monitoring and Alerts](./monitoring-setup.md)

## Configuration Files

### Project Configuration
- `next.config.ts` - Next.js static export configuration
- `package.json` - Build scripts and dependencies
- `.github/workflows/deploy.yml` - GitHub Actions workflow

### AWS Configuration Templates
- `aws-iam-policy.json` - IAM permissions policy
- `aws-trust-policy.json` - OIDC trust policy
- `scripts/setup-deployment.sh` - Deployment setup script

## Environment Variables

### Required for Deployment
```bash
# AWS Configuration
AWS_REGION=us-east-2
S3_BUCKET=whitepine-fullstack-app
CF_DIST_ID=YOUR_CLOUDFRONT_DISTRIBUTION_ID

# GitHub Secrets
AWS_ACCOUNT_ID=YOUR_AWS_ACCOUNT_ID
GITHUB_REPOSITORY=YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
```

### Development vs Production
- **Development**: Local server on port 3000
- **Production**: CloudFront CDN with S3 origin
- **API Endpoints**: Separate backend deployment

## Security Considerations

### Authentication & Authorization
- OIDC-based AWS authentication (no stored credentials)
- Role-based access control (RBAC)
- Minimal required permissions principle

### Data Protection
- HTTPS enforcement via CloudFront
- S3 bucket policies for public read access
- No sensitive data in static files

### Network Security
- CloudFront DDoS protection
- S3 bucket access logging
- WAF rules (optional)

## Performance Optimization

### Caching Strategy
- **Static Assets**: 1-year cache with immutable flag
- **HTML Files**: No-cache for immediate updates
- **API Responses**: CloudFront edge caching

### Bundle Optimization
- Next.js automatic code splitting
- Static generation for optimal performance
- Optimized images and assets

### CDN Benefits
- Global edge locations
- Automatic compression
- Intelligent routing

## Monitoring & Maintenance

### Health Checks
- CloudFront distribution metrics
- S3 bucket access logs
- GitHub Actions deployment history
- Application performance monitoring

### Maintenance Tasks
- Regular dependency updates
- Security patches
- Performance optimization
- Cost monitoring

### Troubleshooting
- Build failure diagnostics
- Deployment issue resolution
- Cache invalidation problems
- Performance bottlenecks

## Cost Optimization

### AWS Services Pricing
- S3 storage and requests
- CloudFront data transfer
- IAM and CloudWatch (minimal cost)

### Optimization Strategies
- Efficient caching policies
- Asset compression
- CDN edge location selection
- Storage class optimization

## Compliance & Governance

### Data Residency
- AWS region selection
- CloudFront edge location compliance
- Data retention policies

### Audit Requirements
- Access logging
- Deployment audit trails
- Security event monitoring

## Disaster Recovery

### Backup Strategy
- S3 versioning for static assets
- GitHub repository backup
- Configuration documentation

### Recovery Procedures
- S3 bucket restoration
- CloudFront distribution recovery
- Application rollback procedures

## Related Documentation

- [S3 + CloudFront Deployment Guide](./s3-cloudfront-deployment.md)
- [AWS Infrastructure Templates](../aws-templates/)
- [GitHub Actions Workflows](../github-workflows/)
- [Monitoring and Alerting](../monitoring/)

## Quick Start Checklist

### Pre-Deployment
- [ ] AWS account configured
- [ ] S3 bucket created and configured
- [ ] CloudFront distribution set up
- [ ] IAM role and policies created
- [ ] OIDC provider configured
- [ ] GitHub repository secrets added
- [ ] Local build test successful

### Deployment
- [ ] Push code to main branch
- [ ] Monitor GitHub Actions workflow
- [ ] Verify S3 upload success
- [ ] Check CloudFront cache invalidation
- [ ] Test production URL
- [ ] Monitor application performance

### Post-Deployment
- [ ] Set up monitoring and alerts
- [ ] Configure backup procedures
- [ ] Document deployment process
- [ ] Train team on procedures
- [ ] Schedule regular maintenance

## Support & Resources

### Documentation
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

### Community Resources
- AWS Developer Forums
- GitHub Actions Community
- Next.js Community
- Stack Overflow Tags

---

*Last Updated: $(date)*
*Version: 1.0*
*Maintainer: Development Team*
