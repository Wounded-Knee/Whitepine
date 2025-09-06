# S3 + CloudFront Deployment Guide

This document outlines the deployment process for the Whitepine Full-Stack Application to AWS S3 with CloudFront CDN.

## Prerequisites

- AWS CLI installed and configured
- AWS credentials with appropriate permissions for S3 and CloudFront
- Node.js and npm installed

## Configuration

The deployment uses the following configuration:

- **S3 Bucket**: `whitepine`
- **CloudFront Distribution ID**: `E224EA6ZP3GGQH`
- **AWS Region**: `us-east-1`

## Quick Deployment

### Option 1: Using npm scripts

```bash
# Build and deploy everything
npm run deploy:full

# Or step by step:
npm run deploy:build    # Build the Next.js app
npm run deploy:s3       # Deploy to S3
npm run deploy:html     # Upload HTML files
npm run deploy:invalidate # Invalidate CloudFront
```

### Option 2: Using the deployment script

```bash
# Make the script executable
chmod +x scripts/deploy.js

# Run deployment
node scripts/deploy.js
```

## Manual Deployment Steps

### 1. Build the Application

```bash
npm run build
```

This creates a static export in the `out/` directory.

### 2. Deploy to S3

```bash
# Sync static assets (with long cache)
aws s3 sync out s3://whitepine/ \
  --delete \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable" \
  --region us-east-1

# Upload HTML files (no cache)
find out -name "*.html" -exec sh -c '
  key="${1#out/}"
  aws s3 cp "$1" "s3://whitepine/$key" \
    --cache-control "no-cache" \
    --content-type "text/html; charset=utf-8" \
    --region us-east-1
' _ {} \;
```

### 3. Invalidate CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id E224EA6ZP3GGQH \
  --paths "/*" \
  --region us-east-1
```

## GitHub Actions Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys on pushes to the `main` branch.

### Required GitHub Secrets

- `AWS_ROLE_ARN`: ARN of the IAM role for GitHub Actions
- AWS OIDC provider configured for the repository

### Workflow Steps

1. **Build**: Creates static export using `npm run build`
2. **Deploy to S3**: Syncs files with appropriate cache headers
3. **Invalidate CloudFront**: Clears CDN cache for immediate updates

## Cache Strategy

- **Static Assets** (JS, CSS, images): 1 year cache with immutable flag
- **HTML Files**: No cache for immediate updates
- **CloudFront**: Global invalidation on each deployment

## File Structure After Build

```
out/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── images/
└── ...
```

## Troubleshooting

### Common Issues

1. **Build Output Missing**: Ensure `npm run build` completed successfully
2. **AWS Permissions**: Verify IAM role has S3 and CloudFront permissions
3. **Cache Issues**: Check CloudFront invalidation status in AWS Console

### Debug Mode

Set `dryRun: true` in `deploy.config.js` to test without actual deployment.

### Manual Verification

```bash
# Check S3 contents
aws s3 ls s3://whitepine/ --recursive

# Check CloudFront invalidation status
aws cloudfront list-invalidations --distribution-id E224EA6ZP3GGQH
```

## Security Considerations

- Use IAM roles instead of access keys
- Enable S3 bucket versioning for rollback capability
- Configure CloudFront security headers
- Use HTTPS only for production

## Performance Optimization

- Static assets are cached for 1 year
- HTML files are served fresh on each request
- CloudFront provides global CDN distribution
- S3 serves as origin with high availability

## Rollback Strategy

1. **S3 Versioning**: Enable bucket versioning for file-level rollback
2. **CloudFront**: Previous versions remain cached until invalidation
3. **Git**: Use git tags for deployment tracking

## Monitoring

- Monitor CloudFront metrics in AWS Console
- Set up S3 access logging
- Configure CloudWatch alarms for errors
- Monitor deployment success/failure rates
