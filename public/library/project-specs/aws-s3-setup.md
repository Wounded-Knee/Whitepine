# AWS S3 Bucket Setup Guide

## Overview
This guide walks through creating and configuring an S3 bucket for hosting the static files of the Whitepine Full-Stack Application.

## Prerequisites
- AWS account with appropriate permissions
- AWS CLI installed and configured (optional but recommended)

## Step 1: Create S3 Bucket

### Via AWS Console
1. **Navigate to S3 Service**
   - Go to AWS Console → S3
   - Click "Create bucket"

2. **Configure Bucket Settings**
   ```
   Bucket name: whitepine-fullstack-app
   Region: us-east-2 (or your preferred region)
   ```

3. **Block Public Access Settings**
   - **Uncheck** "Block all public access"
   - This is required for static website hosting
   - Acknowledge the warning

4. **Bucket Versioning**
   - Enable versioning (recommended for backup purposes)

5. **Tags (Optional)**
   ```
   Key: Environment
   Value: Production
   
   Key: Project
   Value: Whitepine-FullStack-App
   ```

6. **Create Bucket**
   - Click "Create bucket"

## Step 2: Configure Static Website Hosting

1. **Select Your Bucket**
   - Click on the bucket name: `whitepine-fullstack-app`

2. **Enable Static Website Hosting**
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Click "Edit"

3. **Configure Hosting**
   ```
   Static website hosting: Enable
   Hosting type: Host a static website
   Index document: index.html
   Error document: 404.html
   ```

4. **Save Changes**
   - Click "Save changes"
   - Note the website endpoint URL

## Step 3: Configure Bucket Policy

1. **Navigate to Permissions**
   - Go to "Permissions" tab
   - Click "Bucket policy"

2. **Add Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::whitepine-fullstack-app/*"
       }
     ]
   }
   ```

3. **Save Policy**
   - Click "Save changes"

## Step 4: Configure CORS (if needed)

1. **Navigate to CORS**
   - Go to "Permissions" tab
   - Click "CORS"

2. **Add CORS Configuration**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Save CORS Configuration**
   - Click "Save changes"

## Step 5: Configure Lifecycle Rules (Optional)

1. **Navigate to Lifecycle**
   - Go to "Management" tab
   - Click "Lifecycle"

2. **Create Lifecycle Rule**
   ```
   Rule name: DeleteOldVersions
   Lifecycle rule scope: Apply to all objects in the bucket
   
   Lifecycle actions:
   - Transition current versions of objects
   - Delete previous versions of objects (after 30 days)
   ```

## Step 6: Enable Access Logging (Recommended)

1. **Navigate to Logging**
   - Go to "Properties" tab
   - Scroll to "Server access logging"
   - Click "Edit"

2. **Configure Logging**
   ```
   Enable logging: Yes
   Target bucket: whitepine-fullstack-app-logs (create new bucket)
   Target prefix: logs/
   ```

## Step 7: Configure Default Encryption

1. **Navigate to Default Encryption**
   - Go to "Properties" tab
   - Scroll to "Default encryption"
   - Click "Edit"

2. **Configure Encryption**
   ```
   Enable default encryption: Yes
   Encryption type: Amazon S3 managed keys (SSE-S3)
   ```

## Step 8: Test Configuration

### Via AWS CLI
```bash
# Test bucket access
aws s3 ls s3://whitepine-fullstack-app

# Upload test file
echo "<html><body><h1>Test</h1></body></html>" > test.html
aws s3 cp test.html s3://whitepine-fullstack-app/

# Access via website endpoint
curl http://whitepine-fullstack-app.s3-website-us-east-2.amazonaws.com/test.html
```

### Via Browser
- Navigate to your website endpoint
- Verify the test file is accessible

## Step 9: Update GitHub Secrets

1. **Add S3 Bucket Name**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add secret: `S3_BUCKET` = `whitepine-fullstack-app`

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Verify bucket policy allows public read access
   - Check that "Block public access" is disabled
   - Ensure bucket name matches policy

2. **CORS Errors**
   - Verify CORS configuration allows your domain
   - Check that CloudFront is configured correctly

3. **Website Not Loading**
   - Verify static website hosting is enabled
   - Check that index.html exists in bucket root
   - Ensure bucket policy is applied

### Verification Commands

```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket whitepine-fullstack-app

# Check website configuration
aws s3api get-bucket-website --bucket whitepine-fullstack-app

# List bucket contents
aws s3 ls s3://whitepine-fullstack-app --recursive
```

## Security Considerations

### Best Practices
- Enable bucket versioning for backup
- Configure access logging for audit trails
- Use bucket policies instead of ACLs
- Enable default encryption
- Regularly review access logs

### Monitoring
- Set up CloudWatch alarms for bucket metrics
- Monitor access patterns for anomalies
- Review access logs regularly

## Cost Optimization

### Storage Classes
- Use Standard storage for frequently accessed files
- Consider Intelligent-Tiering for cost optimization
- Use lifecycle policies to transition old versions

### Request Optimization
- Minimize unnecessary requests
- Use CloudFront for caching
- Optimize file sizes before upload

## Next Steps

After completing S3 setup:
1. [Configure CloudFront Distribution](./aws-cloudfront-setup.md)
2. [Set up IAM Role and Policies](./aws-iam-setup.md)
3. [Configure GitHub Actions Workflow](./github-workflow-setup.md)

---

*Last Updated: $(date)*
*Version: 1.0*
*Maintainer: DevOps Team*
