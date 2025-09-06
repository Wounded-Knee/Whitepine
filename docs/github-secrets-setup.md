# GitHub Secrets Setup for AWS Lightsail Deployment

## Overview

This guide explains how to configure GitHub repository secrets for automated AWS Lightsail deployment via GitHub Actions.

## Required GitHub Secrets

### 1. AWS Access Credentials

You need to create an IAM user with the necessary permissions for Lightsail operations.

#### Create IAM User

1. **Go to AWS IAM Console**
   - Navigate to https://console.aws.amazon.com/iam/
   - Click "Users" → "Create user"

2. **User Details**
   - Username: `github-actions-lightsail`
   - Access type: Programmatic access

3. **Attach Policies**
   - `AmazonLightsailFullAccess` (for full Lightsail management)
   - Or create a custom policy with minimal permissions (see below)

#### Custom IAM Policy (Minimal Permissions)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lightsail:GetInstance",
                "lightsail:GetInstances",
                "lightsail:CreateInstance",
                "lightsail:DeleteInstance",
                "lightsail:StartInstance",
                "lightsail:StopInstance",
                "lightsail:RebootInstance",
                "lightsail:GetInstanceAccessDetails",
                "lightsail:GetStaticIp",
                "lightsail:GetStaticIps",
                "lightsail:AllocateStaticIp",
                "lightsail:ReleaseStaticIp",
                "lightsail:AttachStaticIp",
                "lightsail:DetachStaticIp",
                "lightsail:GetInstanceSnapshot",
                "lightsail:GetInstanceSnapshots",
                "lightsail:CreateInstanceSnapshot",
                "lightsail:DeleteInstanceSnapshot"
            ],
            "Resource": "*"
        }
    ]
}
```

#### Get Access Keys

1. **Create Access Key**
   - Go to the IAM user you created
   - Click "Security credentials" tab
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Download the CSV file with credentials

2. **Add to GitHub Secrets**
   - Go to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Add these secrets:

### GitHub Secrets to Add

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

## Optional Secrets

### Slack Notifications (Optional)

If you want to receive deployment notifications via Slack:

1. **Create Slack Webhook**
   - Go to https://api.slack.com/messaging/webhooks
   - Create a new webhook for your channel
   - Copy the webhook URL

2. **Add to GitHub Secrets**
   - Secret Name: `SLACK_WEBHOOK_URL`
   - Value: Your Slack webhook URL

### Email Notifications (Optional)

For email notifications, you can use services like:
- SendGrid
- Mailgun
- AWS SES

Add the appropriate secrets for your chosen service.

## Security Best Practices

### 1. Principle of Least Privilege
- Only grant the minimum permissions needed
- Use the custom IAM policy above instead of `AmazonLightsailFullAccess`

### 2. Rotate Access Keys
- Rotate access keys regularly (every 90 days)
- Update GitHub secrets when rotating keys

### 3. Monitor Usage
- Enable CloudTrail to monitor API calls
- Set up billing alerts for unexpected costs

### 4. Environment Separation
- Use different IAM users for different environments
- Consider using AWS IAM roles for cross-account access

## Testing the Setup

### 1. Verify Secrets
```bash
# Check if secrets are properly configured
# (This will be done automatically by the workflows)
```

### 2. Test Infrastructure Setup
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Setup AWS Lightsail Infrastructure"
4. Click "Run workflow"
5. Choose environment (dev or production)
6. Click "Run workflow"

### 3. Test Deployment
1. Make a small change to your code
2. Push to `main` or `develop` branch
3. Check the "Deploy to AWS Lightsail" workflow
4. Verify deployment in AWS Lightsail console

## Troubleshooting

### Common Issues

#### 1. "Access Denied" Errors
- **Cause**: Insufficient IAM permissions
- **Solution**: Add missing permissions to IAM policy

#### 2. "Instance Not Found" Errors
- **Cause**: Instance doesn't exist or wrong name
- **Solution**: Run infrastructure setup workflow first

#### 3. "SSH Connection Failed" Errors
- **Cause**: Instance not ready or network issues
- **Solution**: Wait for instance to be fully ready (5-10 minutes)

#### 4. "Build Failed" Errors
- **Cause**: Application build issues
- **Solution**: Check build logs and fix code issues

### Debug Commands

#### Check AWS Credentials
```bash
aws sts get-caller-identity
```

#### List Lightsail Instances
```bash
aws lightsail get-instances
```

#### Check Instance Status
```bash
aws lightsail get-instance --instance-name whitepine-dev
```

## Workflow Triggers

### Automatic Triggers
- **Push to `main`**: Deploys to production
- **Push to `develop`**: Deploys to development
- **Pull Request to `main`**: Runs tests only

### Manual Triggers
- **Infrastructure Setup**: Create new instances
- **Instance Management**: Manage existing instances
- **SSL Setup**: Configure SSL certificates

## Cost Monitoring

### Set Up Billing Alerts
1. Go to AWS Billing Console
2. Set up billing alerts for your account
3. Recommended thresholds:
   - Warning: $10/month
   - Critical: $15/month

### Monitor Usage
- Check AWS Lightsail console regularly
- Review GitHub Actions usage
- Monitor data transfer and storage usage

## Next Steps

1. **Configure Secrets**: Add AWS credentials to GitHub
2. **Setup Infrastructure**: Run the infrastructure setup workflow
3. **Deploy Application**: Push code to trigger deployment
4. **Configure Domain**: Set up SSL certificate (optional)
5. **Monitor**: Set up monitoring and alerts

## Support

### GitHub Actions
- Check workflow logs in the Actions tab
- Review error messages and stack traces
- Consult GitHub Actions documentation

### AWS Lightsail
- Check AWS Lightsail console
- Review instance logs and metrics
- Consult AWS Lightsail documentation

### Application Issues
- Check PM2 logs on the instance
- Review application logs
- Test endpoints manually

---

**Last Updated**: $(date)
**Version**: 1.0
**Cost**: $5.00/month per instance
