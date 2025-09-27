# WhitePine Server Setup Script

This document describes the `setup-server.sh` script, which provides an idempotent, verified server setup for WhitePine deployment on Ubuntu Lightsail instances.

## Overview

The `setup-server.sh` script automates the complete setup of a Ubuntu server for hosting the WhitePine application. It is designed to be:

- **Idempotent**: Can be run multiple times safely
- **Verified**: Checks each step and halts on errors
- **Self-contained**: Downloads required configurations from the repository
- **Configurable**: Supports environment variables and auto-detection

## Prerequisites

- Ubuntu 22.04 LTS (or compatible)
- Sudo privileges
- Internet connectivity
- Domain names configured (for SSL setup)

## Quick Start

### Basic Usage

```bash
# Set the GitHub repository URL and download the setup script
GITHUB_REPO_URL="https://raw.githubusercontent.com/Wounded-Knee/Whitepine/main"
curl -fsSL -H "Cache-Control: no-cache" "$GITHUB_REPO_URL/apps/ops/scripts/setup-server.sh?$(date +%s)" | bash
```

### With Environment Variables

```bash
# Override repository configuration
GITHUB_REPO_URL="https://raw.githubusercontent.com/your-username/your-repo/your-branch"
GITHUB_USERNAME="your-username" GITHUB_REPOSITORY="your-repo" GITHUB_BRANCH="your-branch"
curl -fsSL -H "Cache-Control: no-cache" "$GITHUB_REPO_URL/apps/ops/scripts/setup-server.sh?$(date +%s)" | bash
```

### One-liner Version

```bash
# Single command with environment variable
GITHUB_REPO_URL="https://raw.githubusercontent.com/Wounded-Knee/Whitepine/main" bash -c 'curl -fsSL -H "Cache-Control: no-cache" "$GITHUB_REPO_URL/apps/ops/scripts/setup-server.sh?$(date +%s)" | bash'
```

## What the Script Does

### 1. System Updates
- Updates package lists
- Upgrades system packages
- Verifies system is up to date

### 2. Package Installation
- Installs required system packages:
  - `nginx` - Web server
  - `certbot` - SSL certificate management
  - `python3-certbot-nginx` - Nginx integration for certbot
  - `nodejs` - Node.js runtime
  - `npm` - Node.js package manager
  - `git` - Version control
  - `apache2-utils` - HTTP Basic Auth utilities
  - `fail2ban` - Intrusion prevention
  - `ufw` - Firewall management
  - `curl`, `wget`, `unzip` - Utilities
  - `htop`, `vim` - System tools
  - `unattended-upgrades` - Automatic security updates

### 3. Global NPM Packages
- Installs `pnpm` - Fast package manager
- Installs `pm2` - Process manager
- Verifies installations

### 4. Directory Structure
Creates the following directory structure:
```
/var/www/whitepine/
├── releases/           # Timestamped release directories
├── current/           # Symlink to active release
└── shared/
    └── env/
        ├── prod.env   # Production environment variables
        └── dev.env    # Development environment variables

/var/log/whitepine/    # Application logs
```

### 5. User Management
- Creates `deploy` user with sudo privileges
- Sets up SSH directory with proper permissions
- Configures for GitHub Actions deployment

### 6. Configuration Downloads
- Downloads nginx configuration from repository
- Downloads PM2 ecosystem configuration
- Sets proper file permissions

### 7. Nginx Setup
- Removes default nginx site
- Configures production and development virtual hosts
- Sets up HTTP Basic Auth for development
- Tests nginx configuration

### 8. Security Configuration
- Configures UFW firewall (SSH, HTTP, HTTPS)
- Sets up fail2ban for intrusion prevention
- Configures automatic security updates
- Sets up log rotation

### 9. Process Management
- Configures PM2 for application management
- Sets up startup scripts
- Creates environment file templates

## Configuration

### Environment Variables

The script supports the following environment variables:

- `GITHUB_REPO_URL` - Base GitHub repository URL (required)
- `GITHUB_USERNAME` - GitHub username (auto-detected from URL)
- `GITHUB_REPOSITORY` - Repository name (auto-detected from URL)
- `GITHUB_BRANCH` - Branch name (auto-detected from URL)
- `GITHUB_REPOSITORY_URL` - Full repository URL (optional, for git detection)

### Auto-Detection

The script attempts to auto-detect repository information from:

1. **GITHUB_REPO_URL**: Primary method using the base repository URL
2. **Curl Command**: Extracts info from the download URL
3. **Environment Variables**: Uses provided configuration
4. **Git Repository**: If run from within a git repo

## Verification and Error Handling

### Verification Functions

The script includes comprehensive verification for each step:

- `verify_package_installed()` - Checks package installation
- `verify_service_running()` - Checks service status
- `verify_service_enabled()` - Checks service auto-start
- `verify_directory_exists()` - Checks directory creation
- `verify_file_exists()` - Checks file creation
- `verify_user_exists()` - Checks user creation
- `verify_permissions()` - Checks file permissions

### Error Handling

- Uses `set -euo pipefail` for strict error handling
- Traps errors with line numbers
- Provides clear error messages
- Exits immediately on failure

## Output and Logging

### Color-Coded Output

- 🔵 **Info** - General information
- ✅ **Success** - Successful operations
- ⚠️ **Warning** - Non-critical issues
- ❌ **Error** - Critical failures

### Logging Functions

- `log_info()` - Information messages
- `log_success()` - Success messages
- `log_warning()` - Warning messages
- `log_error()` - Error messages

## Post-Setup Steps

After running the script, you need to:

### 1. Add SSH Keys
```bash
# Add your public key to the deploy user
ssh-copy-id -i ~/.ssh/your-key.pub deploy@your-server-ip
```

### 2. Configure DNS
- Point your domains to the server IP
- `whitepine.jpkramer.com` → Production
- `whitepinedev.jpkramer.com` → Development

### 3. Set Up SSL Certificates
```bash
# On the server
sudo certbot --nginx -d whitepine.jpkramer.com -d whitepinedev.jpkramer.com
```

### 4. Deploy Application
Use GitHub Actions to deploy your application to the configured server.

## Troubleshooting

### Common Issues

#### 1. Package Installation Failures
```bash
# Check package availability
apt list --upgradable

# Update package lists
sudo apt update

# Fix broken packages
sudo apt --fix-broken install
```

#### 2. Nginx Configuration Errors
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 3. Permission Issues
```bash
# Check file permissions
ls -la /var/www/whitepine/
ls -la /home/deploy/.ssh/

# Fix permissions
sudo chown -R deploy:deploy /var/www/whitepine
sudo chmod 700 /home/deploy/.ssh
```

#### 4. Service Issues
```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status fail2ban

# Restart services
sudo systemctl restart nginx
sudo systemctl restart fail2ban
```

### Debug Commands

```bash
# Check script execution
bash -x setup-server.sh

# View system logs
sudo journalctl -u nginx
sudo journalctl -u fail2ban

# Check firewall status
sudo ufw status verbose

# Test connectivity
curl -I https://whitepine.jpkramer.com
curl -I https://whitepinedev.jpkramer.com
```

## Security Considerations

### Firewall Configuration
- Only SSH (22), HTTP (80), and HTTPS (443) ports are open
- All other ports are blocked by default

### User Permissions
- `deploy` user has sudo privileges for deployment
- SSH keys required for authentication
- No password authentication for deploy user

### SSL/TLS
- Let's Encrypt certificates for both domains
- HTTP Basic Auth for development environment
- Security headers configured in nginx

### Monitoring
- fail2ban for intrusion prevention
- Automatic security updates
- Log rotation configured

## Customization

### Modifying the Script

To customize the script for your needs:

1. **Update Configuration Section**
   ```bash
   # Change default values
   GITHUB_USERNAME="your-username"
   GITHUB_REPOSITORY="your-repo"
   GITHUB_BRANCH="your-branch"
   ```

2. **Add Custom Packages**
   ```bash
   # Add to system_packages array
   local system_packages=(
       "nginx"
       "your-custom-package"
       # ... other packages
   )
   ```

3. **Modify Directory Structure**
   ```bash
   # Update directories array
   local directories=(
       "/var/www/your-app"
       "/var/log/your-app"
       # ... other directories
   )
   ```

### Environment-Specific Configuration

Create environment-specific configurations by:

1. **Modifying Environment Templates**
   ```bash
   # Update prod.env and dev.env templates
   # Add your specific environment variables
   ```

2. **Customizing Nginx Configuration**
   - Download and modify nginx.conf
   - Update domain names and ports
   - Add custom security headers

3. **Adjusting PM2 Configuration**
   - Modify ecosystem.config.js
   - Update process names and configurations
   - Add custom environment variables

## Best Practices

### 1. Testing
- Test the script on a development server first
- Verify all services are running correctly
- Test SSL certificate generation
- Validate application deployment

### 2. Backup
- Backup existing configurations before running
- Document any custom modifications
- Keep track of environment variables

### 3. Monitoring
- Set up monitoring for services
- Configure log aggregation
- Monitor SSL certificate expiration
- Track system resource usage

### 4. Updates
- Keep the script updated with latest changes
- Test updates in development first
- Document any breaking changes
- Maintain backward compatibility

## Support

For issues with the setup script:

1. Check the troubleshooting section
2. Review the error messages carefully
3. Verify all prerequisites are met
4. Test individual components
5. Check system logs for details

## Contributing

To contribute to the setup script:

1. Test changes thoroughly
2. Maintain idempotency
3. Add verification for new steps
4. Update documentation
5. Follow the existing code style

## License

This script is part of the WhitePine project and follows the same license terms.
