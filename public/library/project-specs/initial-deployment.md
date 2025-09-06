# Initial Deployment Guide

## Overview
This guide walks through the complete process of performing the initial deployment of the Whitepine Full-Stack Application to production using the configured S3 + CloudFront infrastructure.

## Prerequisites
- [ ] AWS infrastructure configured (S3, CloudFront, IAM)
- [ ] GitHub repository secrets configured
- [ ] Local build test successful
- [ ] All team members notified of deployment

## Pre-Deployment Checklist

### Infrastructure Verification
- [ ] S3 bucket `whitepine-fullstack-app` exists and is accessible
- [ ] CloudFront distribution is deployed and active
- [ ] IAM role `github-actions-deploy-s3-cloudfront` is configured
- [ ] OIDC provider is set up correctly
- [ ] GitHub repository secrets are configured

### Code Verification
- [ ] All tests pass locally
- [ ] Build completes successfully: `npm run build`
- [ ] Static files generated in `out/` directory
- [ ] No critical linting errors (ESLint disabled for build)
- [ ] Environment variables are configured correctly

### GitHub Configuration
- [ ] Repository secrets configured:
  - `AWS_REGION` = `us-east-2`
  - `S3_BUCKET` = `whitepine-fullstack-app`
  - `CF_DIST_ID` = `YOUR_DISTRIBUTION_ID`
  - `AWS_ACCOUNT_ID` = `YOUR_ACCOUNT_ID`
- [ ] Workflow file `.github/workflows/deploy.yml` is committed
- [ ] Branch protection rules configured (if applicable)

## Step 1: Final Pre-Deployment Testing

### Local Build Test
```bash
# Clean previous builds
rm -rf .next out

# Install dependencies
npm ci

# Run build
npm run build

# Verify build output
ls -la out/
du -sh out/

# Test static files locally
npx serve out/
```

### Verify Build Output
- [ ] `out/index.html` exists
- [ ] `out/_next/` directory contains static assets
- [ ] All CSS and JS files are present
- [ ] No broken links or missing resources

## Step 2: Prepare for Deployment

### Create Deployment Branch (Optional)
```bash
# Create deployment branch
git checkout -b deploy/initial-production

# Commit any final changes
git add .
git commit -m "Prepare for initial production deployment"

# Push to remote
git push origin deploy/initial-production
```

### Update Version Information
- [ ] Update version in `package.json` if needed
- [ ] Update deployment documentation
- [ ] Tag the release if using semantic versioning

## Step 3: Trigger Deployment

### Method 1: Push to Main Branch
```bash
# Switch to main branch
git checkout main

# Merge deployment branch (if created)
git merge deploy/initial-production

# Push to trigger deployment
git push origin main
```

### Method 2: Manual Workflow Trigger
1. **Navigate to GitHub Actions**
   - Go to repository → Actions tab
   - Select "Deploy to S3 + CloudFront" workflow
   - Click "Run workflow"

2. **Configure Manual Run**
   ```
   Branch: main
   Use workflow from: main
   ```

3. **Trigger Deployment**
   - Click "Run workflow"

## Step 4: Monitor Deployment

### GitHub Actions Monitoring
1. **Watch Workflow Progress**
   - Monitor each step in the workflow
   - Check for any failures or warnings
   - Verify all steps complete successfully

2. **Key Steps to Monitor**
   - [ ] "Install dependencies" - Should complete quickly
   - [ ] "Build (Next.js)" - Should complete without errors
   - [ ] "Configure AWS credentials (OIDC)" - Should authenticate successfully
   - [ ] "Verify caller identity" - Should show correct role
   - [ ] "Ensure build output exists" - Should list files in `out/` directory
   - [ ] "Sync static assets" - Should upload files to S3
   - [ ] "Upload HTML" - Should upload HTML files with correct headers
   - [ ] "Invalidate CloudFront" - Should create invalidation

### Expected Workflow Output
```
✓ Install dependencies
✓ Build (Next.js)
✓ Configure AWS credentials (OIDC)
✓ Verify caller identity
  {
    "UserId": "AROA...:botocore-session-...",
    "Account": "123456789012",
    "Arn": "arn:aws:sts::123456789012:assumed-role/github-actions-deploy-s3-cloudfront/..."
  }
✓ Ensure build output exists
  out/
  out/_next/
  out/index.html
  ...
✓ Sync static assets (long cache)
  upload: out/_next/static/css/... to s3://whitepine-fullstack-app/_next/static/css/...
✓ Upload HTML (no-cache + correct MIME)
  upload: out/index.html to s3://whitepine-fullstack-app/index.html
✓ Invalidate CloudFront
  {
    "Invalidation": {
      "Id": "I...",
      "Status": "InProgress",
      "CreateTime": "..."
    }
  }
```

## Step 5: Verify Deployment

### Check S3 Bucket
```bash
# List uploaded files
aws s3 ls s3://whitepine-fullstack-app --recursive

# Check specific files
aws s3 ls s3://whitepine-fullstack-app/index.html
aws s3 ls s3://whitepine-fullstack-app/_next/static/
```

### Check CloudFront Distribution
1. **Verify Distribution Status**
   - Go to CloudFront console
   - Check distribution status is "Deployed"
   - Note the domain name

2. **Test CloudFront Access**
   ```bash
   # Test main page
   curl -I https://YOUR_DISTRIBUTION_ID.cloudfront.net/
   
   # Test static assets
   curl -I https://YOUR_DISTRIBUTION_ID.cloudfront.net/_next/static/css/app.css
   ```

### Browser Testing
1. **Access Production URL**
   - Navigate to your CloudFront domain
   - Test all major pages and functionality
   - Verify responsive design on different devices

2. **Check Browser Developer Tools**
   - Verify all resources load correctly
   - Check for any 404 errors
   - Verify cache headers are set correctly

## Step 6: Post-Deployment Verification

### Functional Testing
- [ ] Home page loads correctly
- [ ] Navigation works properly
- [ ] All interactive components function
- [ ] Forms and API calls work (if applicable)
- [ ] Images and assets display correctly
- [ ] Mobile responsiveness works

### Performance Testing
- [ ] Page load times are acceptable
- [ ] Static assets are cached properly
- [ ] CloudFront edge locations are working
- [ ] No major performance regressions

### Security Verification
- [ ] HTTPS is enforced
- [ ] Security headers are present
- [ ] No sensitive information exposed
- [ ] CORS is configured correctly

## Step 7: Monitor and Alert

### Set Up Monitoring
1. **CloudWatch Alarms**
   - High error rates
   - Low cache hit ratios
   - Unusual traffic patterns

2. **Application Monitoring**
   - Set up error tracking (if applicable)
   - Monitor user experience metrics
   - Track performance metrics

### Configure Alerts
- [ ] Deployment success/failure notifications
- [ ] Performance degradation alerts
- [ ] Security incident notifications
- [ ] Cost optimization alerts

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs
   npm run build --verbose
   
   # Fix linting issues
   npm run lint --fix
   ```

2. **AWS Authentication Failures**
   - Verify IAM role configuration
   - Check OIDC provider setup
   - Ensure repository secrets are correct

3. **S3 Upload Failures**
   - Check bucket permissions
   - Verify bucket name in secrets
   - Ensure bucket exists and is accessible

4. **CloudFront Issues**
   - Check distribution status
   - Verify origin configuration
   - Monitor cache invalidation status

### Rollback Procedures
1. **Quick Rollback**
   - Revert to previous commit
   - Push to trigger new deployment
   - Monitor rollback deployment

2. **Manual Rollback**
   - Upload previous version to S3
   - Invalidate CloudFront cache
   - Verify rollback success

## Post-Deployment Tasks

### Documentation
- [ ] Update deployment documentation
- [ ] Document any issues encountered
- [ ] Update runbooks and procedures
- [ ] Share lessons learned with team

### Team Communication
- [ ] Notify team of successful deployment
- [ ] Share production URL
- [ ] Document any configuration changes
- [ ] Schedule post-deployment review

### Monitoring Setup
- [ ] Configure ongoing monitoring
- [ ] Set up alerting rules
- [ ] Schedule regular health checks
- [ ] Plan for future deployments

## Success Criteria

### Technical Success
- [ ] All files uploaded to S3 successfully
- [ ] CloudFront distribution serves content correctly
- [ ] No critical errors in browser console
- [ ] Performance meets requirements

### Business Success
- [ ] Application is accessible to users
- [ ] Core functionality works as expected
- [ ] User experience is positive
- [ ] No data loss or corruption

## Next Steps

After successful initial deployment:
1. [Set up ongoing monitoring](./monitoring-setup.md)
2. [Configure automated testing](./automated-testing.md)
3. [Plan future deployment strategy](./deployment-strategy.md)
4. [Document production procedures](./production-procedures.md)

---

*Last Updated: $(date)*
*Version: 1.0*
*Maintainer: DevOps Team*
