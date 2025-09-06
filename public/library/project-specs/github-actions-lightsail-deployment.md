# GitHub Actions + AWS Lightsail Deployment Guide

## 🎯 **Overview**

This guide covers the complete CI/CD setup for deploying your Whitepine project to AWS Lightsail using GitHub Actions. The setup provides automated deployment, management, and monitoring capabilities.

## 📋 **Architecture**

### **GitHub Actions Workflows**
- **`lightsail-deploy.yml`** - Automated deployment on code push
- **`lightsail-setup.yml`** - Infrastructure setup (manual trigger)
- **`lightsail-manage.yml`** - Instance management (manual trigger)
- **`lightsail-ssl.yml`** - SSL certificate setup (manual trigger)

### **Deployment Flow**
1. **Code Push** → Triggers automatic deployment
2. **Tests** → Run linting and build tests
3. **Deploy** → Deploy to Lightsail instance
4. **Health Check** → Verify deployment success

## 🚀 **Quick Start**

### **Step 1: Configure GitHub Secrets**

Add these secrets to your GitHub repository:

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"

2. **Add AWS Credentials**
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

3. **Optional: Add Notification Secrets**
   - `SLACK_WEBHOOK_URL`: For Slack notifications

### **Step 2: Setup Infrastructure**

1. **Go to Actions Tab**
   - Click "Actions" in your GitHub repository
   - Select "Setup AWS Lightsail Infrastructure"

2. **Run Workflow**
   - Click "Run workflow"
   - Choose environment: `dev` or `production`
   - Click "Run workflow"

3. **Wait for Completion**
   - Infrastructure setup takes 5-10 minutes
   - Check workflow logs for progress

### **Step 3: Deploy Application**

1. **Push Code**
   - Push to `main` branch for production
   - Push to `develop` branch for development

2. **Automatic Deployment**
   - GitHub Actions will automatically deploy
   - Check workflow logs for progress

3. **Verify Deployment**
   - Check instance IP in workflow logs
   - Test endpoints: `http://your-instance-ip/health`

## 🔧 **Workflow Details**

### **1. lightsail-deploy.yml**

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` (tests only)

**Steps:**
1. **Test** - Run linting and build tests
2. **Build** - Create deployment package
3. **Deploy** - Upload and deploy to Lightsail
4. **Health Check** - Verify deployment success

**Environment Variables:**
- `LIGHTSAIL_INSTANCE`: Instance name
- `AWS_REGION`: AWS region

### **2. lightsail-setup.yml**

**Triggers:**
- Manual workflow dispatch

**Inputs:**
- `environment`: dev or production
- `action`: setup

**Steps:**
1. **Create Instance** - Create Lightsail instance
2. **Configure Software** - Install Node.js, PM2, Nginx
3. **Setup Networking** - Create static IP
4. **Verify Setup** - Confirm instance is ready

### **3. lightsail-manage.yml**

**Triggers:**
- Manual workflow dispatch

**Inputs:**
- `action`: status, logs, restart, stop, start, monitor, backup, update, destroy
- `environment`: dev or production

**Available Actions:**
- **status** - Show instance and application status
- **logs** - View application logs
- **restart** - Restart application
- **stop** - Stop application
- **start** - Start application
- **monitor** - Show system monitoring
- **backup** - Create backup
- **update** - Update application
- **destroy** - Destroy instance

### **4. lightsail-ssl.yml**

**Triggers:**
- Manual workflow dispatch

**Inputs:**
- `domain`: Domain name for SSL
- `environment`: dev or production

**Steps:**
1. **Verify DNS** - Check domain points to instance
2. **Install Certbot** - Install SSL certificate tool
3. **Configure SSL** - Set up Let's Encrypt certificate
4. **Update Config** - Update application configuration

## 💰 **Cost Breakdown**

### **Monthly Costs**
- **Lightsail Instance**: $5.00
- **Static IP**: Free (when attached)
- **Data Transfer**: Included (1 TB)
- **Storage**: Included (20 GB)
- **GitHub Actions**: Free (2,000 minutes/month)
- **Total**: **$5.00/month**

### **Cost Optimization**
- **Stop Development Instance**: When not in use
- **Use Spot Instances**: For non-critical workloads
- **Monitor Usage**: Set up billing alerts

## 🔒 **Security Features**

### **GitHub Actions Security**
- **Secrets Management** - Encrypted secrets storage
- **Workflow Permissions** - Minimal required permissions
- **Audit Logging** - All actions logged

### **AWS Security**
- **IAM Roles** - Least privilege access
- **VPC Isolation** - Network security
- **SSL/TLS** - Encrypted communications

### **Application Security**
- **Environment Variables** - Secure configuration
- **Process Isolation** - PM2 process management
- **Log Management** - Centralized logging

## 📊 **Monitoring & Alerts**

### **Built-in Monitoring**
- **GitHub Actions** - Workflow status and logs
- **AWS Lightsail** - Instance metrics and logs
- **Application** - PM2 process monitoring

### **Custom Monitoring**
```bash
# Check instance status
# Run lightsail-manage.yml with action: status

# View application logs
# Run lightsail-manage.yml with action: logs

# System monitoring
# Run lightsail-manage.yml with action: monitor
```

### **Alerting Options**
- **GitHub Notifications** - Email notifications
- **Slack Integration** - Real-time notifications
- **AWS CloudWatch** - Custom metrics and alarms

## 🛠️ **Management Commands**

### **GitHub Actions Management**

#### **Infrastructure Setup**
```bash
# Go to Actions → Setup AWS Lightsail Infrastructure
# Choose environment: dev or production
# Click "Run workflow"
```

#### **Application Deployment**
```bash
# Push to main branch (production)
git push origin main

# Push to develop branch (development)
git push origin develop
```

#### **Instance Management**
```bash
# Go to Actions → Manage AWS Lightsail Instance
# Choose action: status, logs, restart, etc.
# Choose environment: dev or production
# Click "Run workflow"
```

#### **SSL Setup**
```bash
# Go to Actions → Setup SSL Certificate
# Enter domain name
# Choose environment: dev or production
# Click "Run workflow"
```

### **Direct Instance Access**

#### **SSH to Instance**
```bash
# Get instance IP from AWS Lightsail console
ssh ubuntu@your-instance-ip

# Or use GitHub Actions management workflow
# Run lightsail-manage.yml with action: ssh
```

#### **Check Application Status**
```bash
# PM2 status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart all
```

## 🔄 **Deployment Workflow**

### **Development Workflow**
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop and Test**
   ```bash
   npm run dev
   # Test locally
   ```

3. **Push to Develop**
   ```bash
   git push origin feature/new-feature
   # Create pull request to develop
   ```

4. **Automatic Deployment**
   - Merge to develop triggers deployment
   - Check GitHub Actions for deployment status

### **Production Workflow**
1. **Merge to Main**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Automatic Deployment**
   - Push to main triggers production deployment
   - Check GitHub Actions for deployment status

3. **Verify Production**
   - Test production endpoints
   - Check application logs
   - Monitor system resources

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Deployment Failures**
- **Check GitHub Actions logs**
- **Verify AWS credentials**
- **Check instance status**

#### **2. Application Not Starting**
- **Check PM2 status**
- **View application logs**
- **Verify environment variables**

#### **3. SSL Certificate Issues**
- **Verify DNS configuration**
- **Check domain points to instance**
- **Review Certbot logs**

#### **4. Network Issues**
- **Check Lightsail firewall**
- **Verify security groups**
- **Test network connectivity**

### **Debug Commands**

#### **Check Instance Status**
```bash
# Run lightsail-manage.yml with action: status
```

#### **View Application Logs**
```bash
# Run lightsail-manage.yml with action: logs
```

#### **System Monitoring**
```bash
# Run lightsail-manage.yml with action: monitor
```

## 📚 **Best Practices**

### **Development**
1. **Test Locally** - Always test before pushing
2. **Use Branches** - Feature branches for development
3. **Review Code** - Pull request reviews
4. **Monitor Deployments** - Check workflow status

### **Security**
1. **Rotate Credentials** - Regular key rotation
2. **Monitor Access** - Review access logs
3. **Update Dependencies** - Keep software updated
4. **Backup Regularly** - Automated backups

### **Performance**
1. **Monitor Resources** - Check CPU/memory usage
2. **Optimize Code** - Minimize resource usage
3. **Cache Static Assets** - Use Nginx caching
4. **Database Optimization** - Index frequently queried fields

## 🎯 **Success Metrics**

### **Deployment Metrics**
- **Deployment Time**: < 5 minutes
- **Success Rate**: > 95%
- **Rollback Time**: < 2 minutes

### **Performance Metrics**
- **Response Time**: < 2 seconds
- **Uptime**: > 99%
- **Resource Usage**: < 80% CPU/Memory

### **Cost Metrics**
- **Monthly Cost**: $5.00
- **Cost per Deployment**: $0.01
- **Cost per Access**: $0.25

## 🚀 **Getting Started Checklist**

### **Prerequisites**
- [ ] AWS account with Lightsail access
- [ ] GitHub repository
- [ ] Domain name (optional)

### **Setup Steps**
- [ ] Configure GitHub secrets
- [ ] Run infrastructure setup workflow
- [ ] Test deployment workflow
- [ ] Configure domain and SSL (optional)
- [ ] Set up monitoring and alerts

### **Verification**
- [ ] Application accessible via HTTP
- [ ] Health check endpoint working
- [ ] Logs accessible and readable
- [ ] Backup system working
- [ ] SSL certificate valid (if configured)

## 📞 **Support**

### **GitHub Actions**
- Check workflow logs in Actions tab
- Review error messages and stack traces
- Consult GitHub Actions documentation

### **AWS Lightsail**
- Check AWS Lightsail console
- Review instance logs and metrics
- Consult AWS Lightsail documentation

### **Application Issues**
- Check PM2 logs on instance
- Review application logs
- Test endpoints manually

---

**Last Updated**: $(date)
**Version**: 1.0
**Cost**: $5.00/month
**Perfect for**: Personal development projects with CI/CD
