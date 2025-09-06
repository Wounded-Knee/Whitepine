# AWS CloudFront Distribution Setup Guide

## Overview
This guide walks through creating and configuring a CloudFront distribution to serve the Whitepine Full-Stack Application from the S3 bucket with global CDN capabilities.

## Prerequisites
- S3 bucket configured for static website hosting
- AWS account with appropriate permissions
- Domain name (optional, for custom domain setup)

## Step 1: Create CloudFront Distribution

### Via AWS Console
1. **Navigate to CloudFront Service**
   - Go to AWS Console → CloudFront
   - Click "Create distribution"

2. **Configure Origin Settings**
   ```
   Origin domain: whitepine-fullstack-app.s3-website-us-east-2.amazonaws.com
   Protocol: HTTP only
   Origin path: (leave blank)
   Name: whitepine-fullstack-app-origin
   ```

3. **Configure Origin Access**
   ```
   Origin access: Public
   Origin access control settings: Not required
   ```

## Step 2: Configure Default Cache Behavior

1. **Cache Policy Settings**
   ```
   Cache policy: CachingOptimized
   Origin request policy: CORS-S3Origin
   Response headers policy: (none)
   ```

2. **Viewer Protocol Policy**
   ```
   Viewer protocol policy: Redirect HTTP to HTTPS
   ```

3. **Allowed HTTP Methods**
   ```
   Allowed HTTP methods: GET, HEAD, OPTIONS
   Cache key and origin requests: Use cache policy
   ```

4. **Cache Key Settings**
   ```
   Compress objects automatically: Yes
   ```

## Step 3: Configure Distribution Settings

1. **Price Class**
   ```
   Price class: Use only North America and Europe
   (or Use all edge locations for best performance)
   ```

2. **Alternate Domain Names (CNAMEs)**
   ```
   Alternate domain names (CNAMEs): (leave blank for now)
   ```

3. **SSL Certificate**
   ```
   SSL certificate: Default CloudFront certificate
   ```

4. **Default Root Object**
   ```
   Default root object: index.html
   ```

5. **Custom Error Responses**
   ```
   Error pages: (use defaults)
   ```

## Step 4: Configure Additional Settings

1. **Logging**
   ```
   Logging: On
   Log bucket: whitepine-fullstack-app-logs
   Log prefix: cloudfront/
   ```

2. **Tags**
   ```
   Key: Environment
   Value: Production
   
   Key: Project
   Value: Whitepine-FullStack-App
   ```

3. **Create Distribution**
   - Click "Create distribution"
   - Note the Distribution ID and Domain Name

## Step 5: Configure Cache Behaviors

### For Static Assets
1. **Create Cache Behavior**
   - Go to "Behaviors" tab
   - Click "Create cache behavior"

2. **Path Pattern**
   ```
   Path pattern: /_next/static/*
   ```

3. **Cache Settings**
   ```
   Cache policy: CachingOptimized
   Origin request policy: CORS-S3Origin
   Viewer protocol policy: Redirect HTTP to HTTPS
   ```

4. **Cache Duration**
   ```
   Minimum TTL: 31536000 (1 year)
   Maximum TTL: 31536000 (1 year)
   Default TTL: 31536000 (1 year)
   ```

### For HTML Files
1. **Create Cache Behavior**
   - Click "Create cache behavior"

2. **Path Pattern**
   ```
   Path pattern: *.html
   ```

3. **Cache Settings**
   ```
   Cache policy: CachingDisabled
   Origin request policy: CORS-S3Origin
   Viewer protocol policy: Redirect HTTP to HTTPS
   ```

## Step 6: Configure Error Pages

1. **404 Error Page**
   - Go to "Error pages" tab
   - Click "Create custom error response"

2. **Configure 404**
   ```
   HTTP error code: 404
   Error caching minimum TTL: 0
   Customize error response: Yes
   Response page path: /404.html
   HTTP response code: 200
   ```

## Step 7: Test Distribution

### Via Browser
1. **Access Distribution**
   - Navigate to your CloudFront domain
   - Example: `https://d1234567890abc.cloudfront.net`

2. **Test Static Assets**
   - Verify CSS and JS files load correctly
   - Check browser developer tools for cache headers

3. **Test HTML Pages**
   - Navigate to different pages
   - Verify proper routing and content

### Via AWS CLI
```bash
# Test distribution access
curl -I https://YOUR_DISTRIBUTION_ID.cloudfront.net/

# Test cache headers
curl -I https://YOUR_DISTRIBUTION_ID.cloudfront.net/_next/static/css/app.css
```

## Step 8: Update GitHub Secrets

1. **Add CloudFront Distribution ID**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add secret: `CF_DIST_ID` = `YOUR_DISTRIBUTION_ID`

## Step 9: Configure Custom Domain (Optional)

### Via Route 53
1. **Create Hosted Zone**
   - Go to Route 53 → Hosted zones
   - Create hosted zone for your domain

2. **Create A Record**
   ```
   Record name: www
   Record type: A
   Alias: Yes
   Route traffic to: CloudFront distribution
   ```

3. **Create CNAME Record**
   ```
   Record name: (leave blank for root domain)
   Record type: CNAME
   Value: YOUR_DISTRIBUTION_ID.cloudfront.net
   ```

### Via CloudFront
1. **Add Alternate Domain Name**
   - Go to CloudFront distribution → General
   - Click "Edit"
   - Add your domain to "Alternate domain names (CNAMEs)"

2. **Request SSL Certificate**
   - Go to Certificate Manager
   - Request certificate for your domain
   - Validate via DNS or email

3. **Update Distribution**
   - Associate the certificate with your CloudFront distribution

## Step 10: Configure Security Headers

1. **Create Response Headers Policy**
   - Go to CloudFront → Policies → Response headers policies
   - Click "Create response headers policy"

2. **Configure Security Headers**
   ```json
   {
     "SecurityHeadersConfig": {
       "ContentSecurityPolicy": {
         "Override": true,
         "ContentSecurityPolicy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
       },
       "XFrameOptions": {
         "Override": true,
         "XFrameOptions": "DENY"
       },
       "XContentTypeOptions": {
         "Override": true,
         "XContentTypeOptions": "nosniff"
       },
       "ReferrerPolicy": {
         "Override": true,
         "ReferrerPolicy": "strict-origin-when-cross-origin"
       }
     }
   }
   ```

3. **Apply to Distribution**
   - Go to your distribution → Behaviors
   - Edit default cache behavior
   - Add the response headers policy

## Troubleshooting

### Common Issues

1. **Distribution Not Deployed**
   - Check distribution status in CloudFront console
   - Verify origin settings are correct
   - Ensure S3 bucket is accessible

2. **Cache Not Working**
   - Verify cache behaviors are configured correctly
   - Check cache policy settings
   - Test cache invalidation

3. **HTTPS Issues**
   - Verify SSL certificate is valid
   - Check viewer protocol policy
   - Ensure custom domain is configured correctly

### Verification Commands

```bash
# Check distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Test cache invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# Check distribution metrics
aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name Requests --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID
```

## Performance Optimization

### Cache Optimization
- Use appropriate cache policies for different content types
- Configure cache behaviors for optimal performance
- Monitor cache hit ratios

### Compression
- Enable automatic compression for text-based files
- Monitor compression ratios
- Optimize file sizes before upload

### Edge Locations
- Choose appropriate price class for your audience
- Monitor performance across different regions
- Consider using Lambda@Edge for custom logic

## Monitoring and Alerts

### CloudWatch Metrics
- Requests and data transfer
- Error rates and cache hit ratios
- Origin latency and response times

### Alerts
- High error rates
- Low cache hit ratios
- Unusual traffic patterns

## Cost Optimization

### Data Transfer
- Monitor data transfer costs
- Optimize file sizes
- Use appropriate cache policies

### Requests
- Minimize unnecessary requests
- Use cache effectively
- Monitor request patterns

## Security Considerations

### HTTPS Enforcement
- Redirect HTTP to HTTPS
- Use appropriate SSL certificates
- Configure security headers

### Access Control
- Use origin access control when possible
- Configure appropriate cache behaviors
- Monitor access logs

## Next Steps

After completing CloudFront setup:
1. [Configure IAM Role and Policies](./aws-iam-setup.md)
2. [Set up GitHub Actions Workflow](./github-workflow-setup.md)
3. [Test Complete Deployment](./initial-deployment.md)

---

*Last Updated: $(date)*
*Version: 1.0*
*Maintainer: DevOps Team*
