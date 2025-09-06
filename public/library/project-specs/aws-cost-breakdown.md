# AWS Cost Breakdown for Whitepine Personal Development Project

## Overview

This document provides a detailed cost breakdown for the simplified AWS deployment architecture. All costs are estimated based on current AWS pricing (as of 2024) and assume minimal usage typical for personal development projects.

## Architecture Components & Costs

### 1. ECS Fargate (Backend Container)

#### Development Environment
- **vCPU**: 0.25 (256 CPU units)
- **Memory**: 0.5 GB (512 MB)
- **Pricing**: $0.04048 per vCPU per hour + $0.004445 per GB per hour
- **Monthly Cost**: 
  - vCPU: 0.25 × $0.04048 × 24 × 30 = **$7.29**
  - Memory: 0.5 × $0.004445 × 24 × 30 = **$1.60**
  - **Total**: **$8.89/month**

#### Production Environment
- **vCPU**: 0.5 (512 CPU units)
- **Memory**: 1 GB (1024 MB)
- **Pricing**: $0.04048 per vCPU per hour + $0.004445 per GB per hour
- **Monthly Cost**:
  - vCPU: 0.5 × $0.04048 × 24 × 30 = **$14.57**
  - Memory: 1 × $0.004445 × 24 × 30 = **$3.20**
  - **Total**: **$17.77/month**

### 2. Application Load Balancer (ALB)

#### Shared Cost (Both Environments)
- **ALB**: $0.0225 per hour
- **LCU**: $0.008 per LCU per hour (estimated 2 LCUs)
- **Monthly Cost**:
  - ALB: $0.0225 × 24 × 30 = **$16.20**
  - LCU: 2 × $0.008 × 24 × 30 = **$11.52**
  - **Total**: **$27.72/month**

### 3. S3 Storage (Frontend)

#### Development Environment
- **Storage**: 1 GB (estimated)
- **Requests**: 1,000 GET requests, 100 PUT requests
- **Pricing**: 
  - Storage: 1 GB × $0.023 = **$0.023**
  - GET requests: 1,000 × $0.0004 = **$0.40**
  - PUT requests: 100 × $0.005 = **$0.50**
  - **Total**: **$0.92/month**

#### Production Environment
- **Storage**: 2 GB (estimated)
- **Requests**: 10,000 GET requests, 200 PUT requests
- **Pricing**:
  - Storage: 2 GB × $0.023 = **$0.046**
  - GET requests: 10,000 × $0.0004 = **$4.00**
  - PUT requests: 200 × $0.005 = **$1.00**
  - **Total**: **$5.05/month**

### 4. CloudFront (CDN)

#### Development Environment
- **Data Transfer**: 10 GB/month
- **Requests**: 10,000 requests/month
- **Pricing**:
  - Data Transfer: 10 GB × $0.085 = **$0.85**
  - Requests: 10,000 × $0.0075 = **$0.075**
  - **Total**: **$0.93/month**

#### Production Environment
- **Data Transfer**: 100 GB/month
- **Requests**: 100,000 requests/month
- **Pricing**:
  - Data Transfer: 100 GB × $0.085 = **$8.50**
  - Requests: 100,000 × $0.0075 = **$0.75**
  - **Total**: **$9.25/month**

### 5. ECR (Container Registry)

#### Shared Cost (Both Environments)
- **Storage**: 2 GB (estimated)
- **Data Transfer**: 5 GB/month
- **Pricing**:
  - Storage: 2 GB × $0.10 = **$0.20**
  - Data Transfer: 5 GB × $0.09 = **$0.45**
  - **Total**: **$0.65/month**

### 6. CloudWatch Logs

#### Development Environment
- **Log Storage**: 1 GB/month
- **Pricing**: 1 GB × $0.50 = **$0.50/month**

#### Production Environment
- **Log Storage**: 2 GB/month
- **Pricing**: 2 GB × $0.50 = **$1.00/month**

### 7. Secrets Manager

#### Shared Cost (Both Environments)
- **Secrets**: 2 secrets
- **Pricing**: 2 × $0.40 = **$0.80/month**

### 8. Data Transfer

#### Estimated Monthly Cost
- **Outbound Data**: 50 GB/month
- **Pricing**: 50 GB × $0.09 = **$4.50/month**

## Monthly Cost Summary

### Development Environment
| Service | Cost |
|---------|------|
| ECS Fargate | $8.89 |
| S3 Storage | $0.92 |
| CloudFront | $0.93 |
| CloudWatch Logs | $0.50 |
| **Subtotal** | **$11.24** |

### Production Environment
| Service | Cost |
|---------|------|
| ECS Fargate | $17.77 |
| S3 Storage | $5.05 |
| CloudFront | $9.25 |
| CloudWatch Logs | $1.00 |
| **Subtotal** | **$33.07** |

### Shared Services
| Service | Cost |
|---------|------|
| Application Load Balancer | $27.72 |
| ECR Registry | $0.65 |
| Secrets Manager | $0.80 |
| Data Transfer | $4.50 |
| **Subtotal** | **$33.67** |

### **Total Monthly Cost: $77.98**

## Cost Optimization Strategies

### 1. Development Environment
- **Stop ECS Service**: Stop the development ECS service when not in use
- **Estimated Savings**: $8.89/month (when stopped)
- **New Total**: $69.09/month

### 2. Production Environment
- **Reserved Capacity**: Use ECS Fargate Spot pricing (up to 70% savings)
- **Estimated Savings**: $12.44/month
- **New Total**: $65.54/month

### 3. Additional Optimizations
- **S3 Intelligent Tiering**: Automatic cost optimization
- **CloudFront Price Class**: Use PriceClass_100 (cheapest)
- **Log Retention**: Reduce to 3 days (already implemented)

## Alternative Cost-Effective Options

### Option 1: AWS Lightsail
- **Instance**: $5/month (0.5 GB RAM, 1 vCPU)
- **Database**: $15/month (1 GB RAM, 40 GB SSD)
- **Total**: $20/month
- **Trade-offs**: Less flexibility, no auto-scaling

### Option 2: Vercel + Railway
- **Frontend (Vercel)**: Free tier
- **Backend (Railway)**: $5/month
- **Database (Railway)**: $5/month
- **Total**: $10/month
- **Trade-offs**: Vendor lock-in, less control

### Option 3: DigitalOcean App Platform
- **Frontend + Backend**: $12/month
- **Database**: $15/month
- **Total**: $27/month
- **Trade-offs**: Less AWS integration

## Cost Monitoring & Alerts

### AWS Cost Explorer
- Set up monthly budget alerts
- Monitor daily spending
- Review cost trends

### Recommended Budget Alerts
- **Warning**: $60/month (80% of budget)
- **Critical**: $75/month (100% of budget)

## Free Tier Benefits

### AWS Free Tier (First 12 Months)
- **EC2**: 750 hours/month (t2.micro)
- **S3**: 5 GB storage
- **CloudFront**: 1 TB data transfer
- **RDS**: 750 hours/month (db.t2.micro)

### Estimated Free Tier Savings
- **ECS Fargate**: No free tier
- **ALB**: No free tier
- **S3**: $0.12/month savings
- **CloudFront**: $0.09/month savings
- **Total Savings**: $0.21/month

## Conclusion

The simplified AWS deployment architecture costs approximately **$78/month** for both development and production environments. This is reasonable for a personal development project that provides:

- **Professional-grade infrastructure**
- **Scalability when needed**
- **Full control and flexibility**
- **AWS ecosystem integration**

### Cost Justification
- **Development Environment**: $11.24/month
- **Production Environment**: $33.07/month
- **Shared Infrastructure**: $33.67/month
- **Total**: $77.98/month

This cost provides significant value for a personal development project with professional-grade infrastructure, automated deployments, and room for growth.

---

**Last Updated**: $(date)
**Version**: 1.0
**Note**: AWS pricing is subject to change. Always check current pricing on the AWS website.
