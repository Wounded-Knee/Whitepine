# AWS IAM Role and Policy Setup Guide

## Overview
This guide walks through creating the necessary IAM roles and policies for GitHub Actions to deploy to S3 and manage CloudFront distributions securely using OIDC authentication.

## Prerequisites
- AWS account with administrator access
- GitHub repository with Actions enabled
- S3 bucket and CloudFront distribution already created

## Step 1: Create OIDC Identity Provider

### Via AWS Console
1. **Navigate to IAM Service**
   - Go to AWS Console → IAM
   - Click "Identity providers" in the left sidebar

2. **Create Identity Provider**
   - Click "Add provider"
   - Select "OpenID Connect"

3. **Configure Provider Settings**
   ```
   Provider URL: https://token.actions.githubusercontent.com
   Audience: sts.amazonaws.com
   ```

4. **Add Provider**
   - Click "Add provider"
   - Note the provider ARN

### Via AWS CLI
```bash
# Create OIDC identity provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## Step 2: Create IAM Role

### Via AWS Console
1. **Navigate to Roles**
   - Go to IAM → Roles
   - Click "Create role"

2. **Select Trusted Entity**
   - Choose "Web identity"
   - Select the GitHub Actions OIDC provider
   - Audience: `sts.amazonaws.com`

3. **Configure Conditions**
   ```json
   {
     "StringEquals": {
       "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
     },
     "StringLike": {
       "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
     }
   }
   ```

4. **Attach Permissions**
   - Skip permissions for now (we'll add them in the next step)

5. **Configure Role**
   ```
   Role name: github-actions-deploy-s3-cloudfront
   Description: Role for GitHub Actions to deploy to S3 and CloudFront
   ```

6. **Create Role**
   - Click "Create role"

### Via AWS CLI
```bash
# Create trust policy file
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name github-actions-deploy-s3-cloudfront \
  --assume-role-policy-document file://trust-policy.json \
  --description "Role for GitHub Actions to deploy to S3 and CloudFront"
```

## Step 3: Create IAM Policy

### Via AWS Console
1. **Navigate to Policies**
   - Go to IAM → Policies
   - Click "Create policy"

2. **Use JSON Editor**
   - Click "JSON" tab
   - Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::whitepine-fullstack-app",
        "arn:aws:s3:::whitepine-fullstack-app/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/*"
    }
  ]
}
```

3. **Configure Policy**
   ```
   Policy name: GitHubActionsDeployPolicy
   Description: Policy for GitHub Actions deployment to S3 and CloudFront
   ```

4. **Create Policy**
   - Click "Create policy"

### Via AWS CLI
```bash
# Create policy file
cat > deploy-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::whitepine-fullstack-app",
        "arn:aws:s3:::whitepine-fullstack-app/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/*"
    }
  ]
}
EOF

# Create policy
aws iam create-policy \
  --policy-name GitHubActionsDeployPolicy \
  --policy-document file://deploy-policy.json \
  --description "Policy for GitHub Actions deployment to S3 and CloudFront"
```

## Step 4: Attach Policy to Role

### Via AWS Console
1. **Navigate to Role**
   - Go to IAM → Roles
   - Click on `github-actions-deploy-s3-cloudfront`

2. **Attach Policy**
   - Click "Attach policies"
   - Search for `GitHubActionsDeployPolicy`
   - Select the policy and click "Attach policy"

### Via AWS CLI
```bash
# Attach policy to role
aws iam attach-role-policy \
  --role-name github-actions-deploy-s3-cloudfront \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitHubActionsDeployPolicy
```

## Step 5: Update GitHub Workflow

1. **Update Workflow File**
   - Edit `.github/workflows/deploy.yml`
   - Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID

```yaml
- name: Configure AWS credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy-s3-cloudfront
    aws-region: ${{ env.AWS_REGION }}
```

## Step 6: Test IAM Configuration

### Via AWS CLI
```bash
# Test role assumption (requires AWS CLI configured)
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/github-actions-deploy-s3-cloudfront \
  --role-session-name test-session \
  --web-identity-token YOUR_TOKEN
```

### Via GitHub Actions
1. **Trigger Test Workflow**
   - Push a test commit to trigger the workflow
   - Monitor the "Verify caller identity" step

2. **Check Workflow Logs**
   - Verify the role assumption is successful
   - Check that the caller identity shows the correct role

## Step 7: Configure GitHub Secrets

1. **Add AWS Account ID**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add secret: `AWS_ACCOUNT_ID` = `YOUR_ACCOUNT_ID`

2. **Verify Existing Secrets**
   - `AWS_REGION` = `us-east-2`
   - `S3_BUCKET` = `whitepine-fullstack-app`
   - `CF_DIST_ID` = `YOUR_DISTRIBUTION_ID`

## Step 8: Security Best Practices

### Role Permissions
1. **Principle of Least Privilege**
   - Only grant necessary permissions
   - Review permissions regularly
   - Remove unused permissions

2. **Conditional Access**
   - Use conditions to restrict access
   - Limit to specific repositories
   - Use branch-based conditions if needed

### Monitoring
1. **CloudTrail Logging**
   - Enable CloudTrail for API logging
   - Monitor role assumption events
   - Set up alerts for unusual activity

2. **IAM Access Analyzer**
   - Run access analyzer regularly
   - Review unused permissions
   - Optimize policy permissions

## Troubleshooting

### Common Issues

1. **Role Assumption Fails**
   - Verify OIDC provider configuration
   - Check trust policy conditions
   - Ensure repository name matches exactly

2. **Permission Denied**
   - Verify policy is attached to role
   - Check resource ARNs in policy
   - Ensure bucket and distribution names match

3. **GitHub Actions Authentication Fails**
   - Verify workflow file configuration
   - Check GitHub secrets are set correctly
   - Ensure role ARN is correct

### Verification Commands

```bash
# Check role exists
aws iam get-role --role-name github-actions-deploy-s3-cloudfront

# Check attached policies
aws iam list-attached-role-policies --role-name github-actions-deploy-s3-cloudfront

# Check trust policy
aws iam get-role --role-name github-actions-deploy-s3-cloudfront --query 'Role.AssumeRolePolicyDocument'

# Test S3 access
aws s3 ls s3://whitepine-fullstack-app --profile assumed-role

# Test CloudFront access
aws cloudfront list-distributions --profile assumed-role
```

## Advanced Configuration

### Branch-Specific Access
```json
{
  "StringLike": {
    "token.actions.githubusercontent.com:sub": [
      "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:ref:refs/heads/main",
      "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:ref:refs/heads/develop"
    ]
  }
}
```

### Environment-Specific Roles
- Create separate roles for different environments
- Use different S3 buckets for staging/production
- Configure environment-specific policies

### Cross-Account Access
- Configure cross-account role assumption
- Use external IDs for additional security
- Implement proper audit logging

## Cost Considerations

### IAM Service Costs
- IAM is free to use
- CloudTrail logging may incur costs
- Monitor API call usage

### Optimization
- Use managed policies when possible
- Minimize custom policy complexity
- Regular permission reviews

## Next Steps

After completing IAM setup:
1. [Configure GitHub Actions Workflow](./github-workflow-setup.md)
2. [Test Complete Deployment](./initial-deployment.md)
3. [Set up Monitoring and Alerts](./monitoring-setup.md)

---

*Last Updated: $(date)*
*Version: 1.0*
*Maintainer: DevOps Team*
