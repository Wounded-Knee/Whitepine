# S3 + CloudFront Deployment Guide

## Overview
This project is configured for automated deployment to AWS S3 with CloudFront CDN using GitHub Actions.

## Prerequisites

### AWS Setup
1. **S3 Bucket**: Create an S3 bucket for hosting the static files
   - Bucket name: `whitepine-fullstack-app` (or your preferred name)
   - Configure for static website hosting
   - Set bucket policy for public read access

2. **CloudFront Distribution**: Create a CloudFront distribution
   - Origin: Your S3 bucket
   - Configure caching behaviors
   - Note the Distribution ID for the workflow

3. **IAM Role**: Create an IAM role for GitHub Actions
   - Role name: `github-actions-deploy-s3-cloudfront`
   - Trust policy for GitHub Actions OIDC
   - Permissions for S3 and CloudFront access

### GitHub Repository Setup
1. **Repository Secrets**: Configure the following secrets in your GitHub repository:
   - `AWS_REGION`: Your AWS region (e.g., `us-east-2`)
   - `S3_BUCKET`: Your S3 bucket name
   - `CF_DIST_ID`: Your CloudFront Distribution ID

## Configuration Files

### Next.js Configuration (`next.config.ts`)
The project is configured for static export:
- `output: 'export'` - Generates static files
- `trailingSlash: true` - Ensures proper routing
- `images.unoptimized: true` - Required for static export

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)
The workflow performs the following steps:
1. **Build**: Compiles Next.js to static files in `out/` directory
2. **AWS Authentication**: Uses OIDC for secure AWS access
3. **Deploy Static Assets**: Syncs files to S3 with appropriate cache headers
4. **Deploy HTML**: Uploads HTML files with no-cache headers
5. **Invalidate Cache**: Clears CloudFront cache for immediate updates

## Deployment Process

### Automatic Deployment
- Pushes to `main` branch trigger automatic deployment
- Manual deployment available via GitHub Actions UI

### Build Output
The build process generates:
- Static HTML files in `out/` directory
- Optimized CSS and JavaScript bundles
- Static assets (images, fonts, etc.)

## Environment Variables

### Required for Deployment
```bash
AWS_REGION=us-east-2
S3_BUCKET=whitepine-fullstack-app
CF_DIST_ID=YOUR_CLOUDFRONT_DISTRIBUTION_ID
```

### Development vs Production
- **Development**: Uses local server on port 3000
- **Production**: Served via CloudFront CDN

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Next.js configuration for static export compatibility
2. **Deployment Failures**: Verify AWS credentials and permissions
3. **Cache Issues**: CloudFront invalidation may take time to propagate

### Debugging Steps
1. Check GitHub Actions logs for detailed error messages
2. Verify S3 bucket permissions and configuration
3. Ensure CloudFront distribution is properly configured
4. Test static export locally: `npm run build && npx serve out`

## Security Considerations

### AWS Permissions
- Minimal required permissions for S3 and CloudFront
- OIDC authentication prevents credential exposure
- Role-based access control (RBAC)

### Content Security
- Static files served via HTTPS
- CloudFront provides DDoS protection
- S3 bucket policies restrict access appropriately

## Performance Optimization

### Caching Strategy
- Static assets: 1-year cache with immutable flag
- HTML files: No-cache for immediate updates
- CloudFront edge caching for global performance

### Bundle Optimization
- Next.js automatic code splitting
- Static generation for optimal performance
- Optimized images and assets

## Monitoring and Maintenance

### Health Checks
- Monitor CloudFront distribution metrics
- Check S3 bucket access logs
- Review GitHub Actions deployment history

### Updates and Maintenance
- Regular dependency updates
- Security patches and updates
- Performance monitoring and optimization
