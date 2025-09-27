# GitHub Secrets Configuration

This document outlines the required GitHub secrets for the WhitePine CI/CD pipeline.

## Required Secrets

### Infrastructure Secrets
These secrets are used for deployment and should be set at the repository level:

- `SSH_PRIVATE_KEY` - Private SSH key for connecting to the Lightsail instance
- `LIGHTSAIL_HOST` - IP address or hostname of the Lightsail instance
- `LIGHTSAIL_USER` - SSH username (typically `deploy`)

### Environment Variables
These should be set as environment-specific secrets in GitHub Environments:

#### Production Environment (`production`)
- `MONGODB_URI_PROD` - MongoDB connection string for production
- `MONGODB_URI_DEV` - MongoDB connection string for development (used by CI)
- `SESSION_SECRET` - Session secret for production
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `S3_BUCKET` - S3 bucket name for production uploads
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

#### Development Environment (`development`)
- `MONGODB_URI_PROD` - MongoDB connection string for production (used by CI)
- `MONGODB_URI_DEV` - MongoDB connection string for development
- `SESSION_SECRET` - Session secret for development
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (can be same as production)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (can be same as production)
- `S3_BUCKET` - S3 bucket name for development uploads
- `AWS_REGION` - AWS region (same as production)
- `AWS_ACCESS_KEY_ID` - AWS access key ID (can be same as production)
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key (can be same as production)

## Setting Up Secrets

### 1. Repository-Level Secrets
1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each infrastructure secret

### 2. Environment-Specific Secrets
1. Go to your GitHub repository
2. Navigate to Settings → Environments
3. Create two environments: `production` and `development`
4. For each environment, add the environment-specific secrets

### 3. Environment Protection Rules
Consider adding protection rules to the `production` environment:
- Required reviewers for deployments
- Wait timer before deployment
- Restrict deployments to specific branches

## SSH Key Setup

### 1. Generate SSH Key Pair
```bash
ssh-keygen -t ed25519 -C "github-actions@whitepine" -f ~/.ssh/whitepine-deploy
```

### 2. Add Public Key to Server
```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/whitepine-deploy.pub deploy@your-lightsail-ip
```

### 3. Add Private Key to GitHub
```bash
# Copy private key content
cat ~/.ssh/whitepine-deploy
```
Add this content to the `SSH_PRIVATE_KEY` secret in GitHub.

## Environment File Structure

The deployment process creates environment files on the server at:
- `/var/www/whitepine/shared/env/prod.env` (production)
- `/var/www/whitepine/shared/env/dev.env` (development)

These files are created from the GitHub secrets during deployment.

## Security Best Practices

1. **Rotate secrets regularly** - Especially SSH keys and session secrets
2. **Use least privilege** - Only grant necessary permissions to AWS keys
3. **Monitor access** - Review GitHub Actions logs and server access logs
4. **Separate environments** - Use different secrets for production and development
5. **Backup secrets** - Store secrets securely outside of GitHub for disaster recovery

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify `SSH_PRIVATE_KEY` is correctly formatted
   - Check `LIGHTSAIL_HOST` and `LIGHTSAIL_USER`
   - Ensure SSH key is added to server's authorized_keys

2. **Environment Variables Not Set**
   - Verify secrets are set in the correct environment
   - Check that workflow uses the correct environment
   - Ensure secret names match exactly

3. **Deployment Fails**
   - Check PM2 status on server
   - Review application logs
   - Verify nginx configuration

### Debug Commands

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs

# Check nginx status
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Check SSL certificates
sudo certbot certificates
```

## Monitoring

Set up monitoring for:
- GitHub Actions workflow failures
- Server resource usage
- Application health endpoints
- SSL certificate expiration
- PM2 process status
