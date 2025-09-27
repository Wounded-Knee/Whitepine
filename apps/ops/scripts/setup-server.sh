#!/bin/bash

# setup-server.sh - Idempotent server setup for WhitePine deployment
# This script can be run multiple times safely and will verify each step

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Setup failed at line $line_number with exit code $exit_code"
    log_error "Please check the error above and fix it before running the script again"
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Verification functions
verify_package_installed() {
    local package=$1
    if dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q "install ok installed"; then
        log_success "Package $package is installed"
        return 0
    else
        log_error "Package $package is not installed"
        return 1
    fi
}

verify_service_running() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        log_success "Service $service is running"
        return 0
    else
        log_error "Service $service is not running"
        return 1
    fi
}

verify_service_enabled() {
    local service=$1
    if systemctl is-enabled --quiet "$service"; then
        log_success "Service $service is enabled"
        return 0
    else
        log_error "Service $service is not enabled"
        return 1
    fi
}

verify_directory_exists() {
    local dir=$1
    if [ -d "$dir" ]; then
        log_success "Directory $dir exists"
        return 0
    else
        log_error "Directory $dir does not exist"
        return 1
    fi
}

verify_file_exists() {
    local file=$1
    if [ -f "$file" ]; then
        log_success "File $file exists"
        return 0
    else
        log_error "File $file does not exist"
        return 1
    fi
}

verify_user_exists() {
    local user=$1
    if id "$user" &>/dev/null; then
        log_success "User $user exists"
        return 0
    else
        log_error "User $user does not exist"
        return 1
    fi
}

verify_permissions() {
    local path=$1
    local expected_owner=$2
    local expected_perms=$3
    
    local actual_owner=$(stat -c '%U:%G' "$path" 2>/dev/null || echo "unknown")
    local actual_perms=$(stat -c '%a' "$path" 2>/dev/null || echo "unknown")
    
    if [ "$actual_owner" = "$expected_owner" ] && [ "$actual_perms" = "$expected_perms" ]; then
        log_success "Permissions for $path are correct ($expected_owner, $expected_perms)"
        return 0
    else
        log_error "Permissions for $path are incorrect (expected: $expected_owner, $expected_perms, actual: $actual_owner, $actual_perms)"
        return 1
    fi
}

# Main setup functions
update_system() {
    log_info "Updating system packages..."
    
    if ! apt list --upgradable 2>/dev/null | grep -q "upgradable"; then
        log_success "System is already up to date"
        return 0
    fi
    
    if ! sudo apt update; then
        log_error "Failed to update package list"
        return 1
    fi
    
    if ! sudo apt upgrade -y; then
        log_error "Failed to upgrade packages"
        return 1
    fi
    
    log_success "System packages updated successfully"
}

install_packages() {
    log_info "Installing required packages..."
    
    # Install system packages first (excluding nodejs and npm)
    local system_packages=(
        "nginx"
        "certbot"
        "python3-certbot-nginx"
        "git"
        "apache2-utils"
        "fail2ban"
        "ufw"
        "curl"
        "wget"
        "unzip"
        "htop"
        "vim"
        "unattended-upgrades"
    )
    
    for package in "${system_packages[@]}"; do
        if verify_package_installed "$package"; then
            continue
        fi
        
        log_info "Installing $package..."
        if ! sudo apt install -y "$package"; then
            log_error "Failed to install $package"
            return 1
        fi
        
        if ! verify_package_installed "$package"; then
            log_error "Package $package installation verification failed"
            return 1
        fi
    done
    
    # Install Node.js and npm separately with better handling
    install_nodejs_and_npm
    
    log_success "All required packages installed successfully"
}

install_nodejs_and_npm() {
    log_info "Installing Node.js and npm..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_success "Node.js is already installed: $node_version"
    else
        log_info "Installing Node.js..."
        if ! sudo apt install -y nodejs; then
            log_error "Failed to install Node.js"
            return 1
        fi
    fi
    
    # Check if npm is already installed
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        log_success "npm is already installed: $npm_version"
    else
        log_info "Installing npm..."
        
        # Try to install npm from Ubuntu repositories first
        if sudo apt install -y npm; then
            log_success "npm installed from Ubuntu repositories"
        else
            log_warning "npm installation from Ubuntu repositories failed, trying alternative method..."
            
            # Alternative: Install npm using Node.js
            if command -v node &> /dev/null; then
                log_info "Installing npm using Node.js..."
                if ! sudo apt install -y nodejs-legacy; then
                    log_warning "nodejs-legacy not available, trying to install npm directly..."
                fi
                
                # Try to install npm using the Node.js package manager
                if ! sudo apt install -y npm --fix-missing; then
                    log_error "Failed to install npm"
                    return 1
                fi
            else
                log_error "Node.js is not available for npm installation"
                return 1
            fi
        fi
    fi
    
    # Verify installations
    if ! command -v node &> /dev/null; then
        log_error "Node.js installation verification failed"
        return 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm installation verification failed"
        return 1
    fi
    
    log_success "Node.js and npm installation completed successfully"
}

install_global_npm_packages() {
    log_info "Installing global npm packages..."
    
    # Install pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        if ! npm install -g pnpm; then
            log_error "Failed to install pnpm"
            return 1
        fi
    else
        log_success "pnpm is already installed"
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        log_info "Installing PM2..."
        if ! npm install -g pm2; then
            log_error "Failed to install PM2"
            return 1
        fi
    else
        log_success "PM2 is already installed"
    fi
    
    # Verify installations
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm installation verification failed"
        return 1
    fi
    
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 installation verification failed"
        return 1
    fi
    
    log_success "Global npm packages installed successfully"
}

create_directory_structure() {
    log_info "Creating directory structure..."
    
    local directories=(
        "/var/www/whitepine"
        "/var/www/whitepine/releases"
        "/var/www/whitepine/current"
        "/var/www/whitepine/shared"
        "/var/www/whitepine/shared/env"
        "/var/log/whitepine"
    )
    
    for dir in "${directories[@]}"; do
        if ! verify_directory_exists "$dir"; then
            log_info "Creating directory $dir..."
            if ! sudo mkdir -p "$dir"; then
                log_error "Failed to create directory $dir"
                return 1
            fi
        fi
    done
    
    log_success "Directory structure created successfully"
}

create_deploy_user() {
    log_info "Creating deploy user..."
    
    if verify_user_exists "deploy"; then
        log_success "Deploy user already exists"
    else
        log_info "Creating deploy user..."
        if ! sudo adduser --disabled-password --gecos "" deploy; then
            log_error "Failed to create deploy user"
            return 1
        fi
        
        if ! sudo usermod -aG sudo deploy; then
            log_error "Failed to add deploy user to sudo group"
            return 1
        fi
        
        if ! verify_user_exists "deploy"; then
            log_error "Deploy user creation verification failed"
            return 1
        fi
    fi
    
    # Create SSH directory
    local ssh_dir="/home/deploy/.ssh"
    if ! verify_directory_exists "$ssh_dir"; then
        log_info "Creating SSH directory for deploy user..."
        if ! sudo mkdir -p "$ssh_dir"; then
            log_error "Failed to create SSH directory"
            return 1
        fi
    fi
    
    # Set SSH directory permissions
    if ! verify_permissions "$ssh_dir" "deploy:deploy" "700"; then
        log_info "Setting SSH directory permissions..."
        if ! sudo chown deploy:deploy "$ssh_dir"; then
            log_error "Failed to set SSH directory ownership"
            return 1
        fi
        
        if ! sudo chmod 700 "$ssh_dir"; then
            log_error "Failed to set SSH directory permissions"
            return 1
        fi
    fi
    
    log_success "Deploy user setup completed successfully"
}

setup_nginx_http_only() {
    log_info "Setting up nginx (HTTP only for certificate generation)..."
    
    # Remove default site
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        log_info "Removing default nginx site..."
        if ! sudo rm -f /etc/nginx/sites-enabled/default; then
            log_error "Failed to remove default nginx site"
            return 1
        fi
    fi
    
    # Create HTTP-only nginx configuration
    local nginx_config_file="/etc/nginx/sites-available/whitepine"
    
    # Remove existing nginx configuration
    log_info "Removing existing nginx configuration..."
    sudo rm -f "$nginx_config_file"
    sudo rm -f "/etc/nginx/sites-enabled/whitepine"
    
    # Create HTTP-only configuration for certificate generation
    log_info "Creating HTTP-only nginx configuration..."
    if ! sudo tee "$nginx_config_file" > /dev/null << 'EOF'
# Nginx configuration for WhitePine (HTTP only for certificate generation)
# This file will be replaced with the full SSL configuration after certificates are generated

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;

# Upstream servers
upstream web_prod {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream api_prod {
    server 127.0.0.1:4000;
    keepalive 32;
}

upstream web_dev {
    server 127.0.0.1:3001;
    keepalive 32;
}

upstream api_dev {
    server 127.0.0.1:4001;
    keepalive 32;
}

# Production server (HTTP only)
server {
    listen 80;
    listen [::]:80;
    server_name whitepine.jpkramer.com;

    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_prod;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Web application
    location / {
        limit_req zone=web burst=50 nodelay;
        
        proxy_pass http://web_prod;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Development server (HTTP only)
server {
    listen 80;
    listen [::]:80;
    server_name whitepinedev.jpkramer.com;

    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_dev;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Web application
    location / {
        limit_req zone=web burst=50 nodelay;
        
        proxy_pass http://web_dev;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    then
        log_error "Failed to create HTTP-only nginx configuration"
        return 1
    fi
    
    # Enable site
    if ! [ -L "/etc/nginx/sites-enabled/whitepine" ]; then
        log_info "Enabling nginx site..."
        if ! sudo ln -sf /etc/nginx/sites-available/whitepine /etc/nginx/sites-enabled/; then
            log_error "Failed to enable nginx site"
            return 1
        fi
    fi
    
    # Test nginx configuration
    log_info "Testing nginx configuration..."
    if ! sudo nginx -t; then
        log_error "Nginx configuration test failed"
        return 1
    fi
    
    # Restart nginx
    log_info "Restarting nginx..."
    if ! sudo systemctl restart nginx; then
        log_error "Failed to restart nginx"
        return 1
    else
        log_success "Nginx restarted successfully"
    fi
    
    # Verify nginx is running
    if ! verify_service_running "nginx"; then
        log_error "Nginx is not running after restart"
        return 1
    fi
    
    log_success "Nginx HTTP-only setup completed successfully"
}

setup_nginx_ssl() {
    log_info "Setting up nginx with SSL configuration..."
    
    # Download full nginx configuration from repository
    log_info "Downloading full nginx configuration from repository..."
    local nginx_config_url="$GITHUB_REPO_URL/apps/ops/config/nginx.conf?$(date +%s)"
    local nginx_config_file="/etc/nginx/sites-available/whitepine"
    
    # Remove existing config file and symlink to ensure fresh download
    if [ -f "$nginx_config_file" ] || [ -L "/etc/nginx/sites-enabled/whitepine" ]; then
        log_info "Removing existing nginx configuration..."
        if ! sudo rm -f "$nginx_config_file"; then
            log_error "Failed to remove existing nginx configuration"
            return 1
        fi
        if ! sudo rm -f "/etc/nginx/sites-enabled/whitepine"; then
            log_error "Failed to remove nginx site symlink"
            return 1
        fi
    fi
    
    # Download fresh configuration
    log_info "Downloading from: $nginx_config_url"
    if ! sudo curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" -H "Expires: 0" "$nginx_config_url" -o "$nginx_config_file"; then
        log_error "Failed to download nginx configuration from repository"
        return 1
    fi
    
    # Verify download by checking file size
    local file_size=$(stat -c%s "$nginx_config_file" 2>/dev/null || echo "0")
    if [ "$file_size" -lt 1000 ]; then
        log_error "Downloaded nginx config file is too small ($file_size bytes) - likely a cache issue"
        return 1
    fi
    
    # Verify the downloaded file
    if ! verify_file_exists "$nginx_config_file"; then
        log_error "Nginx configuration file was not downloaded"
        return 1
    fi
    
    # Check if brotli directive is present in the downloaded file
    if grep -q "brotli" "$nginx_config_file"; then
        log_warning "Brotli directive found in downloaded nginx config - this may cause issues"
        log_info "First few lines of nginx config:"
        head -10 "$nginx_config_file"
    else
        log_success "No brotli directives found in downloaded nginx config"
    fi
    
    # Enable site
    if ! [ -L "/etc/nginx/sites-enabled/whitepine" ]; then
        log_info "Enabling nginx site..."
        if ! sudo ln -sf /etc/nginx/sites-available/whitepine /etc/nginx/sites-enabled/; then
            log_error "Failed to enable nginx site"
            return 1
        fi
    fi
    
    # Test nginx configuration
    log_info "Testing nginx configuration..."
    if ! sudo nginx -t; then
        log_error "Nginx configuration test failed"
        return 1
    fi
    
    # Restart nginx
    log_info "Restarting nginx..."
    if ! sudo systemctl restart nginx; then
        log_error "Failed to restart nginx"
        return 1
    else
        log_success "Nginx restarted successfully"
    fi
    
    # Verify nginx is running
    if ! verify_service_running "nginx"; then
        log_error "Nginx is not running after restart"
        return 1
    fi
    
    log_success "Nginx SSL setup completed successfully"
}

setup_http_basic_auth() {
    log_info "Setting up HTTP Basic Auth for development..."
    
    local htpasswd_file="/etc/nginx/.htpasswd"
    
    # Create htpasswd file if it doesn't exist
    if ! verify_file_exists "$htpasswd_file"; then
        log_info "Creating HTTP Basic Auth file..."
        if ! sudo htpasswd -cb "$htpasswd_file" dev dev123; then
            log_error "Failed to create HTTP Basic Auth file"
            return 1
        fi
    else
        log_success "HTTP Basic Auth file already exists"
    fi
    
    # Set permissions
    if ! verify_permissions "$htpasswd_file" "root:www-data" "640"; then
        log_info "Setting HTTP Basic Auth file permissions..."
        if ! sudo chown root:www-data "$htpasswd_file"; then
            log_error "Failed to set HTTP Basic Auth file ownership"
            return 1
        fi
        
        if ! sudo chmod 640 "$htpasswd_file"; then
            log_error "Failed to set HTTP Basic Auth file permissions"
            return 1
        fi
    fi
    
    log_success "HTTP Basic Auth setup completed successfully"
}

setup_firewall() {
    log_info "Setting up firewall..."
    
    # Enable UFW
    if ! sudo ufw status | grep -q "Status: active"; then
        log_info "Enabling UFW firewall..."
        if ! sudo ufw --force enable; then
            log_error "Failed to enable UFW firewall"
            return 1
        fi
    else
        log_success "UFW firewall is already enabled"
    fi
    
    # Allow SSH
    if ! sudo ufw status | grep -q "22/tcp"; then
        log_info "Allowing SSH through firewall..."
        if ! sudo ufw allow ssh; then
            log_error "Failed to allow SSH through firewall"
            return 1
        fi
    else
        log_success "SSH is already allowed through firewall"
    fi
    
    # Allow Nginx
    if ! sudo ufw status | grep -q "Nginx Full"; then
        log_info "Allowing Nginx through firewall..."
        if ! sudo ufw allow 'Nginx Full'; then
            log_error "Failed to allow Nginx through firewall"
            return 1
        fi
    else
        log_success "Nginx is already allowed through firewall"
    fi
    
    # Verify firewall status
    if ! sudo ufw status | grep -q "Status: active"; then
        log_error "Firewall is not active"
        return 1
    fi
    
    log_success "Firewall setup completed successfully"
}

setup_fail2ban() {
    log_info "Setting up fail2ban..."
    
    # Enable fail2ban service
    if ! verify_service_enabled "fail2ban"; then
        log_info "Enabling fail2ban service..."
        if ! sudo systemctl enable fail2ban; then
            log_error "Failed to enable fail2ban service"
            return 1
        fi
    fi
    
    # Start fail2ban service
    if ! verify_service_running "fail2ban"; then
        log_info "Starting fail2ban service..."
        if ! sudo systemctl start fail2ban; then
            log_error "Failed to start fail2ban service"
            return 1
        fi
    fi
    
    # Verify fail2ban is running
    if ! verify_service_running "fail2ban"; then
        log_error "Fail2ban service is not running"
        return 1
    fi
    
    log_success "Fail2ban setup completed successfully"
}

setup_automatic_updates() {
    log_info "Setting up automatic security updates..."
    
    # Install unattended-upgrades if not already installed
    if ! verify_package_installed "unattended-upgrades"; then
        log_info "Installing unattended-upgrades..."
        if ! sudo apt install -y unattended-upgrades; then
            log_error "Failed to install unattended-upgrades"
            return 1
        fi
    fi
    
    # Configure unattended-upgrades
    log_info "Configuring unattended-upgrades..."
    if ! sudo dpkg-reconfigure -plow unattended-upgrades; then
        log_error "Failed to configure unattended-upgrades"
        return 1
    fi
    
    log_success "Automatic security updates setup completed successfully"
}

setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    local logrotate_file="/etc/logrotate.d/whitepine"
    
    # Create logrotate configuration
    if ! verify_file_exists "$logrotate_file"; then
        log_info "Creating logrotate configuration..."
        if ! sudo tee "$logrotate_file" > /dev/null << 'EOF'
/var/log/whitepine/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
        then
            log_error "Failed to create logrotate configuration"
            return 1
        fi
    else
        log_success "Logrotate configuration already exists"
    fi
    
    log_success "Log rotation setup completed successfully"
}

set_permissions() {
    log_info "Setting permissions..."
    
    # Set ownership for whitepine directories
    local whitepine_dirs=("/var/www/whitepine" "/var/log/whitepine")
    
    for dir in "${whitepine_dirs[@]}"; do
        if ! verify_permissions "$dir" "deploy:deploy" "755"; then
            log_info "Setting permissions for $dir..."
            if ! sudo chown -R deploy:deploy "$dir"; then
                log_error "Failed to set ownership for $dir"
                return 1
            fi
        fi
    done
    
    log_success "Permissions set successfully"
}

setup_pm2_startup() {
    log_info "Setting up PM2 startup..."
    
    # Check if PM2 startup is already configured
    if sudo -u deploy pm2 startup | grep -q "already"; then
        log_success "PM2 startup is already configured"
        return 0
    fi
    
    # Get PM2 startup command
    local startup_cmd
    startup_cmd=$(sudo -u deploy pm2 startup | grep "sudo" | head -1)
    
    if [ -z "$startup_cmd" ]; then
        log_error "Failed to get PM2 startup command"
        return 1
    fi
    
    log_warning "PM2 startup command: $startup_cmd"
    log_warning "Please run this command manually to enable PM2 startup:"
    echo "$startup_cmd"
    
    log_success "PM2 startup setup completed (manual step required)"
}

download_pm2_config() {
    log_info "Downloading PM2 ecosystem configuration..."
    
    # Create PM2 config directory
    local pm2_config_dir="/var/www/whitepine/current/ops/config"
    if ! verify_directory_exists "$pm2_config_dir"; then
        log_info "Creating PM2 config directory..."
        if ! sudo mkdir -p "$pm2_config_dir"; then
            log_error "Failed to create PM2 config directory"
            return 1
        fi
    fi
    
    # Download PM2 ecosystem configuration
    local pm2_config_url="$GITHUB_REPO_URL/apps/ops/config/ecosystem.config.js?$(date +%s)"
    local pm2_config_file="$pm2_config_dir/ecosystem.config.js"
    
    if ! sudo curl -fsSL -H "Cache-Control: no-cache" "$pm2_config_url" -o "$pm2_config_file"; then
        log_error "Failed to download PM2 ecosystem configuration from repository"
        return 1
    fi
    
    # Set proper permissions
    if ! sudo chown deploy:deploy "$pm2_config_file"; then
        log_error "Failed to set PM2 config file ownership"
        return 1
    fi
    
    # Verify the downloaded file
    if ! verify_file_exists "$pm2_config_file"; then
        log_error "PM2 ecosystem configuration file was not downloaded"
        return 1
    fi
    
    log_success "PM2 ecosystem configuration downloaded successfully"
}

setup_letsencrypt_files() {
    log_info "Setting up Let's Encrypt configuration files..."
    
    # Create Let's Encrypt directory structure
    local letsencrypt_dir="/etc/letsencrypt"
    local live_dir="$letsencrypt_dir/live"
    local options_file="$letsencrypt_dir/options-ssl-nginx.conf"
    local dhparams_file="$letsencrypt_dir/ssl-dhparams.pem"
    
    # Create directories
    if ! verify_directory_exists "$letsencrypt_dir"; then
        log_info "Creating Let's Encrypt directory..."
        if ! sudo mkdir -p "$letsencrypt_dir"; then
            log_error "Failed to create Let's Encrypt directory"
            return 1
        fi
    fi
    
    if ! verify_directory_exists "$live_dir"; then
        log_info "Creating Let's Encrypt live directory..."
        if ! sudo mkdir -p "$live_dir"; then
            log_error "Failed to create Let's Encrypt live directory"
            return 1
        fi
    fi
    
    # Create options-ssl-nginx.conf if it doesn't exist
    if ! verify_file_exists "$options_file"; then
        log_info "Creating Let's Encrypt nginx options file..."
        if ! sudo tee "$options_file" > /dev/null << 'EOF'
# This file contains important security parameters. If you modify this file
# manually, Certbot will be unable to automatically provide future security
# updates. Instead, Certbot will print and log an error message with a path to
# the up-to-date file that you will need to refer to when manually updating
# this file.

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
EOF
        then
            log_error "Failed to create Let's Encrypt nginx options file"
            return 1
        fi
    else
        log_success "Let's Encrypt nginx options file already exists"
    fi
    
    # Create ssl-dhparams.pem if it doesn't exist
    if ! verify_file_exists "$dhparams_file"; then
        log_info "Creating Let's Encrypt DH parameters file..."
        if ! sudo openssl dhparam -out "$dhparams_file" 2048; then
            log_error "Failed to create Let's Encrypt DH parameters file"
            return 1
        fi
    else
        log_success "Let's Encrypt DH parameters file already exists"
    fi
    
    # Create placeholder certificate directories for both domains
    local domains=("whitepine.jpkramer.com" "whitepinedev.jpkramer.com")
    
    for domain in "${domains[@]}"; do
        local domain_dir="$live_dir/$domain"
        
        if ! verify_directory_exists "$domain_dir"; then
            log_info "Creating Let's Encrypt directory for $domain..."
            if ! sudo mkdir -p "$domain_dir"; then
                log_error "Failed to create Let's Encrypt directory for $domain"
                return 1
            fi
        fi
        
        # Remove any placeholder certificates and check for real Let's Encrypt certificates
        local cert_file="$domain_dir/fullchain.pem"
        local key_file="$domain_dir/privkey.pem"
        
        # Remove placeholder certificates if they exist
        if [ -f "$cert_file" ]; then
            if head -1 "$cert_file" | grep -q "placeholder"; then
                log_info "Removing placeholder certificate for $domain..."
                sudo rm -f "$cert_file"
            fi
        fi
        
        if [ -f "$key_file" ]; then
            if head -1 "$key_file" | grep -q "placeholder"; then
                log_info "Removing placeholder key for $domain..."
                sudo rm -f "$key_file"
            fi
        fi
        
        # Check if real Let's Encrypt certificates exist
        if [ ! -f "$cert_file" ] || [ ! -f "$key_file" ]; then
            log_warning "Let's Encrypt certificates not found for $domain"
            log_info "Certificates will be generated after nginx HTTP-only configuration is set up"
        fi
    done
    
    log_success "Let's Encrypt configuration files created successfully"
}

setup_ssl_certificates() {
    log_info "Generating SSL certificates..."
    
    # Generate Let's Encrypt certificates for both domains
    local domains=("whitepine.jpkramer.com" "whitepinedev.jpkramer.com")
    
    for domain in "${domains[@]}"; do
        local cert_file="/etc/letsencrypt/live/$domain/fullchain.pem"
        local key_file="/etc/letsencrypt/live/$domain/privkey.pem"
        
        # Check if certificates already exist and are valid (may have -0001 suffix)
        local existing_cert=""
        local existing_key=""
        
        # Check for valid certificates (symlinks with existing targets)
        local found_existing_cert=""
        local found_existing_key=""
        
        # Check for certificates without suffix first
        log_info "  Checking base domain directory: /etc/letsencrypt/live/$domain"
        if [ -L "/etc/letsencrypt/live/$domain/fullchain.pem" ] && ([ -e "/etc/letsencrypt/live/$domain/fullchain.pem" ] || sudo [ -e "/etc/letsencrypt/live/$domain/fullchain.pem" ]); then
            log_info "    Found valid certificate in base directory: YES"
            found_existing_cert="/etc/letsencrypt/live/$domain/fullchain.pem"
            found_existing_key="/etc/letsencrypt/live/$domain/privkey.pem"
        else
            log_info "    Found valid certificate in base directory: NO"
            # Check for certificates with any -000X suffix
            for cert_dir in "/etc/letsencrypt/live/$domain-"*; do
                if [ -d "$cert_dir" ] && [ -L "$cert_dir/fullchain.pem" ] && ([ -e "$cert_dir/fullchain.pem" ] || sudo [ -e "$cert_dir/fullchain.pem" ]); then
                    found_existing_cert="$cert_dir/fullchain.pem"
                    found_existing_key="$cert_dir/privkey.pem"
                    break
                elif [ -d "$cert_dir" ] && [ -L "$cert_dir/fullchain.pem" ] && [ ! -e "$cert_dir/fullchain.pem" ] && ! sudo [ -e "$cert_dir/fullchain.pem" ]; then
                    # Clean up broken symlink
                    log_info "Removing broken symlink for $(basename "$cert_dir")..."
                    sudo rm -f "$cert_dir/fullchain.pem"
                    sudo rm -f "$cert_dir/privkey.pem"
                fi
            done
        fi
        
        if [ -n "$found_existing_cert" ]; then
            existing_cert="$found_existing_cert"
            existing_key="$found_existing_key"
        fi
        
        if [ -n "$existing_cert" ] && ([ -e "$existing_cert" ] || sudo [ -e "$existing_cert" ]) && ([ -e "$existing_key" ] || sudo [ -e "$existing_key" ]) && (head -1 "$existing_cert" 2>/dev/null | grep -q "BEGIN CERTIFICATE" || sudo head -1 "$existing_cert" 2>/dev/null | grep -q "BEGIN CERTIFICATE"); then
            log_success "Valid Let's Encrypt certificate already exists for $domain"
            continue
        fi
        
        # Check for broken symlinks and clean them up
        if [ -L "/etc/letsencrypt/live/$domain/fullchain.pem" ] && [ ! -e "/etc/letsencrypt/live/$domain/fullchain.pem" ] && ! sudo [ -e "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
            log_info "Removing broken symlink for $domain..."
            sudo rm -f "/etc/letsencrypt/live/$domain/fullchain.pem"
            sudo rm -f "/etc/letsencrypt/live/$domain/privkey.pem"
        fi
        
        # Clean up broken symlinks with any -000X suffix
        for cert_dir in "/etc/letsencrypt/live/$domain-"*; do
            if [ -d "$cert_dir" ] && [ -L "$cert_dir/fullchain.pem" ] && [ ! -e "$cert_dir/fullchain.pem" ] && ! sudo [ -e "$cert_dir/fullchain.pem" ]; then
                log_info "Removing broken symlink for $(basename "$cert_dir")..."
                sudo rm -f "$cert_dir/fullchain.pem"
                sudo rm -f "$cert_dir/privkey.pem"
            fi
        done
        
        # Check if we have any valid certificates in archive that we can symlink
        local archive_dir="/etc/letsencrypt/archive/$domain"
        
        # Check for suffixed archive directories (e.g., domain-0001, domain-0002)
        local found_archive_dir=""
        log_info "Searching for suffixed archive directories..."
        for suffixed_archive in "/etc/letsencrypt/archive/$domain-"*; do
            log_info "  Checking: $suffixed_archive"
            if [ -d "$suffixed_archive" ]; then
                log_info "  Found suffixed archive directory: $suffixed_archive"
                found_archive_dir="$suffixed_archive"
                break
            fi
        done
        
        # Also check with sudo in case of permission issues
        if [ -z "$found_archive_dir" ]; then
            log_info "No suffixed directories found, checking with sudo..."
            for suffixed_archive in $(sudo find /etc/letsencrypt/archive/ -name "$domain-*" -type d 2>/dev/null); do
                log_info "  Found with sudo: $suffixed_archive"
                found_archive_dir="$suffixed_archive"
                break
            done
        fi
        
        # Use suffixed directory if found, otherwise try the base directory
        if [ -n "$found_archive_dir" ]; then
            archive_dir="$found_archive_dir"
            log_info "Using found archive directory: $archive_dir"
        fi
        
        if [ -d "$archive_dir" ] || sudo [ -d "$archive_dir" ]; then
            log_info "Found archive directory for $domain, checking for valid certificates..."
            # Look for the most recent certificate in archive
            local latest_cert_dir=""
            local latest_timestamp=0
            
            # Check if the archive directory itself contains certificate files
            log_info "Checking archive directory for certificate files: $archive_dir"
            if [ -f "$archive_dir/fullchain1.pem" ] && [ -f "$archive_dir/privkey1.pem" ] || sudo [ -f "$archive_dir/fullchain1.pem" ] && sudo [ -f "$archive_dir/privkey1.pem" ]; then
                log_info "  Found certificate files directly in archive directory: YES"
                local cert_timestamp=$(sudo stat -c %Y "$archive_dir/fullchain1.pem" 2>/dev/null || echo "0")
                latest_timestamp="$cert_timestamp"
                latest_cert_dir="$archive_dir"
                log_info "  Using certificate from archive directory: $archive_dir (timestamp: $cert_timestamp)"
            else
                log_info "  Found certificate files directly in archive directory: NO"
                # Look for subdirectories with certificate files
                for cert_version in $(sudo find "$archive_dir" -maxdepth 1 -type d 2>/dev/null | grep -v "^$archive_dir$"); do
                    log_info "Checking certificate version: $cert_version"
                    if [ -d "$cert_version" ] || sudo [ -d "$cert_version" ]; then
                        log_info "  Directory exists: YES"
                        log_info "  Contents: $(sudo ls -la "$cert_version" 2>/dev/null || echo "Could not list")"
                        if [ -f "$cert_version/fullchain1.pem" ] && [ -f "$cert_version/privkey1.pem" ] || sudo [ -f "$cert_version/fullchain1.pem" ] && sudo [ -f "$cert_version/privkey1.pem" ]; then
                            log_info "  Found valid certificate files: YES"
                            local cert_timestamp=$(sudo stat -c %Y "$cert_version/fullchain1.pem" 2>/dev/null || echo "0")
                            if [ "$cert_timestamp" -gt "$latest_timestamp" ]; then
                                latest_timestamp="$cert_timestamp"
                                latest_cert_dir="$cert_version"
                                log_info "  New latest certificate: $cert_version (timestamp: $cert_timestamp)"
                            fi
                        else
                            log_info "  Found valid certificate files: NO"
                        fi
                    else
                        log_info "  Directory exists: NO"
                    fi
                done
            fi
            
            if [ -n "$latest_cert_dir" ]; then
                log_info "Found valid certificate in archive: $latest_cert_dir"
                # Create symlinks to the latest certificate
                local live_dir="/etc/letsencrypt/live/$domain"
                sudo mkdir -p "$live_dir"
                sudo ln -sf "$latest_cert_dir/fullchain1.pem" "$live_dir/fullchain.pem"
                sudo ln -sf "$latest_cert_dir/privkey1.pem" "$live_dir/privkey.pem"
                log_success "Created symlinks to existing certificate for $domain"
                continue
            fi
        fi
        
        log_info "Generating Let's Encrypt certificate for $domain..."
        if ! sudo certbot certonly --nginx --non-interactive --agree-tos --email admin@$domain -d $domain 2>&1 | tee /tmp/certbot_output.log; then
            log_error "Failed to generate Let's Encrypt certificate for $domain"
            
            # Check if this is a rate limit error
            log_info "Checking certbot output for rate limit error..."
            if grep -q "too many certificates" /tmp/certbot_output.log 2>/dev/null; then
                log_warning "Rate limit exceeded for $domain"
                log_info "Let's Encrypt allows 5 certificates per domain per week"
                log_info "You can either:"
                echo "1. Wait for the rate limit to reset (usually 7 days)"
                echo "2. Use existing certificates if available"
                echo "3. Try again later"
                echo ""
                log_info "Checking for existing certificates in archive..."
                
                # Try to find and use existing certificates
                local archive_dir="/etc/letsencrypt/archive/$domain"
                log_info "Checking archive directory: $archive_dir"
                
                # Check for suffixed archive directories (e.g., domain-0001, domain-0002)
                local found_archive_dir=""
                log_info "Searching for suffixed archive directories..."
                for suffixed_archive in "/etc/letsencrypt/archive/$domain-"*; do
                    log_info "  Checking: $suffixed_archive"
                    if [ -d "$suffixed_archive" ]; then
                        log_info "  Found suffixed archive directory: $suffixed_archive"
                        found_archive_dir="$suffixed_archive"
                        break
                    fi
                done
                
                # Also check with sudo in case of permission issues
                if [ -z "$found_archive_dir" ]; then
                    log_info "No suffixed directories found, checking with sudo..."
                    for suffixed_archive in $(sudo find /etc/letsencrypt/archive/ -name "$domain-*" -type d 2>/dev/null); do
                        log_info "  Found with sudo: $suffixed_archive"
                        found_archive_dir="$suffixed_archive"
                        break
                    done
                fi
                
                # Use suffixed directory if found, otherwise try the base directory
                if [ -n "$found_archive_dir" ]; then
                    archive_dir="$found_archive_dir"
                    log_info "Using found archive directory: $archive_dir"
                fi
                
                if [ -d "$archive_dir" ] || sudo [ -d "$archive_dir" ]; then
                    log_info "Using archive directory: $archive_dir"
                    log_info "Archive directory contents: $(sudo ls -la "$archive_dir" 2>/dev/null || echo "Could not list")"
                    
                    # Check if the archive directory itself contains certificate files
                    log_info "Checking archive directory for certificate files: $archive_dir"
                    if [ -f "$archive_dir/fullchain1.pem" ] && [ -f "$archive_dir/privkey1.pem" ] || sudo [ -f "$archive_dir/fullchain1.pem" ] && sudo [ -f "$archive_dir/privkey1.pem" ]; then
                        log_info "  Found certificate files directly in archive directory: YES"
                        log_info "Found existing certificate: $archive_dir"
                        # Create symlinks to this certificate
                        local live_dir="/etc/letsencrypt/live/$domain"
                        sudo mkdir -p "$live_dir"
                        sudo ln -sf "$archive_dir/fullchain1.pem" "$live_dir/fullchain.pem"
                        sudo ln -sf "$archive_dir/privkey1.pem" "$live_dir/privkey.pem"
                        log_success "Using existing certificate for $domain"
                    else
                        log_info "  Found certificate files directly in archive directory: NO"
                        # Look for subdirectories with certificate files
                        for cert_version in $(sudo find "$archive_dir" -maxdepth 1 -type d 2>/dev/null | grep -v "^$archive_dir$"); do
                            log_info "Checking certificate version: $cert_version"
                            if [ -d "$cert_version" ] || sudo [ -d "$cert_version" ]; then
                                log_info "  Directory exists: YES"
                                log_info "  Contents: $(sudo ls -la "$cert_version" 2>/dev/null || echo "Could not list")"
                                if [ -f "$cert_version/fullchain1.pem" ] && [ -f "$cert_version/privkey1.pem" ] || sudo [ -f "$cert_version/fullchain1.pem" ] && sudo [ -f "$cert_version/privkey1.pem" ]; then
                                    log_info "  Found valid certificate files: YES"
                                    log_info "Found existing certificate: $cert_version"
                                    # Create symlinks to this certificate
                                    local live_dir="/etc/letsencrypt/live/$domain"
                                    sudo mkdir -p "$live_dir"
                                    sudo ln -sf "$cert_version/fullchain1.pem" "$live_dir/fullchain.pem"
                                    sudo ln -sf "$cert_version/privkey1.pem" "$live_dir/privkey.pem"
                                    log_success "Using existing certificate for $domain"
                                    break
                                else
                                    log_info "  Found valid certificate files: NO"
                                fi
                            else
                                log_info "  Directory exists: NO"
                            fi
                        done
                    fi
                else
                    log_error "No archive directory found for $domain"
                    log_info "Checking archive root contents:"
                    log_info "Archive root exists: $([ -d "/etc/letsencrypt/archive" ] && echo "YES" || echo "NO")"
                    log_info "Archive root permissions: $(ls -ld /etc/letsencrypt/archive 2>/dev/null || echo "Could not check permissions")"
                    log_info "Archive root contents: $(ls -la /etc/letsencrypt/archive/ 2>/dev/null || echo "Could not list")"
                    
                    # Check if we can access the archive directory with sudo
                    log_info "Checking archive with sudo:"
                    log_info "Archive root contents (sudo): $(sudo ls -la /etc/letsencrypt/archive/ 2>/dev/null || echo "Could not list with sudo")"
                    
                    # Check for any domain-related directories
                    log_info "Searching for domain-related directories:"
                    log_info "Domain search results: $(sudo find /etc/letsencrypt/archive/ -name "*$domain*" 2>/dev/null || echo "No domain directories found")"
                    
                    log_error "No existing certificates found and rate limit exceeded"
                    log_info "You must wait for the rate limit to reset before generating new certificates"
                    exit 1
                fi
            else
                log_info "Not a rate limit error, checking certbot output:"
                cat /tmp/certbot_output.log
                log_info "This is expected if the domain is not yet pointing to this server"
                echo ""
                log_info "To continue setup, you need to:"
                echo "1. Configure DNS to point $domain to this server's IP address"
                echo "2. Wait for DNS propagation (usually 5-15 minutes)"
                echo "3. Run: sudo certbot certonly --nginx -d $domain"
                echo "4. Then re-run this setup script"
                echo ""
                log_info "Current server IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Unable to determine')"
                echo ""
                log_error "Setup cannot continue without valid SSL certificates"
                exit 1
            fi
        else
            log_success "Let's Encrypt certificate generated for $domain"
        fi
        
        # Clean up temporary log file
        rm -f /tmp/certbot_output.log
    done
    
    # Validate all certificates exist and are valid
    local missing_certs=()
    local invalid_certs=()
    
    for domain in "${domains[@]}"; do
        # Check for certificate files (may have -0001 suffix)
        local cert_file=""
        local key_file=""
        
        # Look for certificate files with any suffix (check symlink targets)
        local found_cert=""
        local found_key=""
        
        # Check for certificates without suffix first
        log_info "  Checking base domain directory: /etc/letsencrypt/live/$domain"
        if [ -L "/etc/letsencrypt/live/$domain/fullchain.pem" ] && ([ -e "/etc/letsencrypt/live/$domain/fullchain.pem" ] || sudo [ -e "/etc/letsencrypt/live/$domain/fullchain.pem" ]); then
            log_info "    Found valid certificate in base directory: YES"
            found_cert="/etc/letsencrypt/live/$domain/fullchain.pem"
            found_key="/etc/letsencrypt/live/$domain/privkey.pem"
        else
            log_info "    Found valid certificate in base directory: NO"
            # Check for certificates with any -000X suffix
            log_info "  Checking for suffixed certificates..."
            for cert_dir in "/etc/letsencrypt/live/$domain-"*; do
                log_info "    Checking directory: $cert_dir"
                if [ -d "$cert_dir" ]; then
                    log_info "      Directory exists: YES"
                    if [ -L "$cert_dir/fullchain.pem" ]; then
                        log_info "      Symlink exists: YES"
                        local symlink_target=$(readlink "$cert_dir/fullchain.pem" 2>/dev/null || echo "")
                        log_info "      Symlink target: $symlink_target"
                        if [ -e "$cert_dir/fullchain.pem" ] || sudo [ -e "$cert_dir/fullchain.pem" ]; then
                            log_info "      Symlink target exists: YES"
                            found_cert="$cert_dir/fullchain.pem"
                            found_key="$cert_dir/privkey.pem"
                            log_info "      Found valid certificate: $found_cert"
                            break
                        else
                            log_info "      Symlink target exists: NO"
                            log_info "      Removing broken symlink: $cert_dir/fullchain.pem"
                            sudo rm -f "$cert_dir/fullchain.pem"
                            sudo rm -f "$cert_dir/privkey.pem"
                        fi
                    else
                        log_info "      Symlink exists: NO"
                    fi
                else
                    log_info "      Directory exists: NO"
                fi
            done
        fi
        
        if [ -n "$found_cert" ]; then
            cert_file="$found_cert"
            key_file="$found_key"
        fi
        
        # Debug: List what we found
        log_info "Checking certificates for $domain:"
        log_info "  Looking in: /etc/letsencrypt/live/"
        log_info "  Directory contents: $(ls -la "/etc/letsencrypt/live/" 2>/dev/null | grep "$domain" || echo "No $domain directories found")"
        
        # Check what the glob pattern expands to
        local glob_pattern="/etc/letsencrypt/live/$domain-"*
        log_info "  Glob pattern: $glob_pattern"
        log_info "  Glob expansion: $(echo $glob_pattern 2>/dev/null || echo "No matches")"
        
        # Check the base domain directory specifically
        log_info "  Base domain directory check:"
        log_info "    Directory exists: $([ -d "/etc/letsencrypt/live/$domain" ] && echo "YES" || echo "NO")"
        log_info "    Symlink exists: $([ -L "/etc/letsencrypt/live/$domain/fullchain.pem" ] && echo "YES" || echo "NO")"
        log_info "    Symlink target exists: $([ -e "/etc/letsencrypt/live/$domain/fullchain.pem" ] && echo "YES" || echo "NO")"
        if [ -L "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
            log_info "    Symlink target: $(readlink "/etc/letsencrypt/live/$domain/fullchain.pem" 2>/dev/null || echo "Could not read")"
        fi
        
        if [ -n "$cert_file" ]; then
            log_info "  Found certificate: $cert_file"
            log_info "  Found key: $key_file"
        else
            log_info "  No valid certificate found for $domain"
        fi
        
        if [ -z "$cert_file" ] || [ ! -e "$cert_file" ] && ! sudo [ -e "$cert_file" ] || [ ! -e "$key_file" ] && ! sudo [ -e "$key_file" ]; then
            missing_certs+=("$domain")
        elif ! head -1 "$cert_file" 2>/dev/null | grep -q "BEGIN CERTIFICATE" && ! sudo head -1 "$cert_file" 2>/dev/null | grep -q "BEGIN CERTIFICATE"; then
            invalid_certs+=("$domain")
        fi
    done
    
    if [ ${#missing_certs[@]} -gt 0 ] || [ ${#invalid_certs[@]} -gt 0 ]; then
        log_error "SSL certificate validation failed"
        echo ""
        
        if [ ${#missing_certs[@]} -gt 0 ]; then
            log_info "Missing certificates for: ${missing_certs[*]}"
        fi
        
        if [ ${#invalid_certs[@]} -gt 0 ]; then
            log_info "Invalid certificates for: ${invalid_certs[*]}"
        fi
        
        echo ""
        log_info "To fix this, run:"
        echo "sudo certbot certonly --nginx -d whitepine.jpkramer.com -d whitepinedev.jpkramer.com"
        echo ""
        log_info "Current server IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Unable to determine')"
        echo ""
        log_error "Setup cannot continue without valid SSL certificates"
        exit 1
    fi
    
    log_success "All Let's Encrypt certificates are valid"
}

create_environment_templates() {
    log_info "Creating environment file templates..."
    
    local prod_env="/var/www/whitepine/shared/env/prod.env"
    local dev_env="/var/www/whitepine/shared/env/dev.env"
    
    # Create production environment template
    if ! verify_file_exists "$prod_env"; then
        log_info "Creating production environment template..."
        if ! sudo -u deploy tee "$prod_env" > /dev/null << 'EOF'
NODE_ENV=production
BASE_URL=https://whitepine.jpkramer.com
PORT_WEB=3000
PORT_API=4000
# Add your production environment variables here
EOF
        then
            log_error "Failed to create production environment template"
            return 1
        fi
    else
        log_success "Production environment template already exists"
    fi
    
    # Create development environment template
    if ! verify_file_exists "$dev_env"; then
        log_info "Creating development environment template..."
        if ! sudo -u deploy tee "$dev_env" > /dev/null << 'EOF'
NODE_ENV=production
BASE_URL=https://whitepinedev.jpkramer.com
PORT_WEB=3001
PORT_API=4001
# Add your development environment variables here
EOF
        then
            log_error "Failed to create development environment template"
            return 1
        fi
    else
        log_success "Development environment template already exists"
    fi
    
    log_success "Environment file templates created successfully"
}

# Configuration - must be provided via environment variables or auto-detected
GITHUB_REPO_URL="${GITHUB_REPO_URL:-}"
GITHUB_USERNAME="${GITHUB_USERNAME:-}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}"
GITHUB_BRANCH="${GITHUB_BRANCH:-}"

# Function to detect GitHub repository from command line
detect_github_repo() {
    # Method 1: Use GITHUB_REPO_URL if provided
    if [[ -n "$GITHUB_REPO_URL" ]]; then
        if [[ "$GITHUB_REPO_URL" =~ https://raw\.githubusercontent\.com/([^/]+)/([^/]+)/([^/]+) ]]; then
            GITHUB_USERNAME="${BASH_REMATCH[1]}"
            GITHUB_REPOSITORY="${BASH_REMATCH[2]}"
            GITHUB_BRANCH="${BASH_REMATCH[3]}"
            log_info "Detected GitHub repository from GITHUB_REPO_URL: $GITHUB_USERNAME/$GITHUB_REPOSITORY@$GITHUB_BRANCH"
            return 0
        fi
    fi
    
    # Method 2: Check if we're running from a curl command
    local parent_cmd=$(ps -o comm= -p $PPID 2>/dev/null || echo "")
    
    if [[ "$parent_cmd" == "curl" ]]; then
        # Try to extract from the curl command line
        local curl_cmd=$(ps -o args= -p $PPID 2>/dev/null || echo "")
        
        # Extract GitHub URL from curl command
        if [[ "$curl_cmd" =~ https://raw\.githubusercontent\.com/([^/]+)/([^/]+)/([^/]+) ]]; then
            GITHUB_USERNAME="${BASH_REMATCH[1]}"
            GITHUB_REPOSITORY="${BASH_REMATCH[2]}"
            GITHUB_BRANCH="${BASH_REMATCH[3]}"
            # Set GITHUB_REPO_URL for use in downloads
            GITHUB_REPO_URL="https://raw.githubusercontent.com/$GITHUB_USERNAME/$GITHUB_REPOSITORY/$GITHUB_BRANCH"
            log_info "Detected GitHub repository from curl command: $GITHUB_USERNAME/$GITHUB_REPOSITORY@$GITHUB_BRANCH"
            return 0
        fi
    fi
    
    # Method 3: Check for environment variables that might indicate the source
    if [[ -n "${GITHUB_REPOSITORY_URL:-}" ]]; then
        if [[ "$GITHUB_REPOSITORY_URL" =~ github\.com/([^/]+)/([^/]+) ]]; then
            GITHUB_USERNAME="${BASH_REMATCH[1]}"
            GITHUB_REPOSITORY="${BASH_REMATCH[2]}"
            # Set GITHUB_REPO_URL for use in downloads
            GITHUB_REPO_URL="https://raw.githubusercontent.com/$GITHUB_USERNAME/$GITHUB_REPOSITORY/main"
            log_info "Detected GitHub repository from GITHUB_REPOSITORY_URL: $GITHUB_USERNAME/$GITHUB_REPOSITORY"
            return 0
        fi
    fi
    
    # Method 4: Check if we can find the repository info from the current working directory
    if [[ -d ".git" ]]; then
        local remote_url=$(git config --get remote.origin.url 2>/dev/null || echo "")
        if [[ "$remote_url" =~ github\.com[:/]([^/]+)/([^/]+) ]]; then
            GITHUB_USERNAME="${BASH_REMATCH[1]}"
            GITHUB_REPOSITORY="${BASH_REMATCH[2]%.git}"
            GITHUB_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
            # Set GITHUB_REPO_URL for use in downloads
            GITHUB_REPO_URL="https://raw.githubusercontent.com/$GITHUB_USERNAME/$GITHUB_REPOSITORY/$GITHUB_BRANCH"
            log_info "Detected GitHub repository from git remote: $GITHUB_USERNAME/$GITHUB_REPOSITORY@$GITHUB_BRANCH"
            return 0
        fi
    fi
    
    return 1
}

# Main execution
main() {
    log_info "Starting WhitePine server setup..."
    
    # Detect GitHub repository information
    detect_github_repo
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        log_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
    
    # Check sudo access
    if ! sudo -n true 2>/dev/null; then
        log_error "This script requires sudo privileges. Please ensure you can run sudo commands."
        exit 1
    fi
    
    # Validate configuration
    if [[ -z "$GITHUB_REPO_URL" || -z "$GITHUB_USERNAME" || -z "$GITHUB_REPOSITORY" || -z "$GITHUB_BRANCH" ]]; then
        log_error "GitHub repository configuration is incomplete:"
        echo "  GitHub Repo URL: ${GITHUB_REPO_URL:-'NOT SET'}"
        echo "  GitHub Username: ${GITHUB_USERNAME:-'NOT SET'}"
        echo "  Repository: ${GITHUB_REPOSITORY:-'NOT SET'}"
        echo "  Branch: ${GITHUB_BRANCH:-'NOT SET'}"
        echo ""
        log_error "Please provide the configuration via environment variables:"
        echo "  GITHUB_REPO_URL=https://raw.githubusercontent.com/your-username/your-repo/your-branch"
        echo "  GITHUB_USERNAME=your-username GITHUB_REPOSITORY=your-repo GITHUB_BRANCH=your-branch"
        echo ""
        log_error "Or ensure the script is run via curl from the correct GitHub repository URL."
        exit 1
    fi
    
    # Display configuration
    log_info "Configuration:"
    echo "  GitHub Repo URL: $GITHUB_REPO_URL"
    echo "  GitHub Username: $GITHUB_USERNAME"
    echo "  Repository: $GITHUB_REPOSITORY"
    echo "  Branch: $GITHUB_BRANCH"
    echo ""
    
    # Execute setup steps
    update_system
    install_packages
    install_global_npm_packages
    create_directory_structure
    create_deploy_user
    download_pm2_config
    setup_letsencrypt_files
    setup_nginx_http_only
    setup_ssl_certificates
    setup_nginx_ssl
    setup_http_basic_auth
    setup_firewall
    setup_fail2ban
    setup_automatic_updates
    setup_log_rotation
    set_permissions
    setup_pm2_startup
    create_environment_templates
    
    log_success "Server setup completed successfully!"
    echo ""
    log_info "Next steps:"
    echo "1. Add your SSH public key to /home/deploy/.ssh/authorized_keys"
    echo "2. Deploy your application using GitHub Actions"
    echo ""
    log_info "Useful commands:"
    echo "- Check nginx status: sudo systemctl status nginx"
    echo "- Check PM2 status: pm2 status"
    echo "- View logs: pm2 logs"
    echo "- Restart services: pm2 restart all"
}

# Run main function
main "$@"
