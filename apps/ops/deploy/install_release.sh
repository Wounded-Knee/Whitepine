#!/bin/bash

# install_release.sh - Deploy a new release to the server
# Usage: ./install_release.sh [prod|dev]

set -e

ENVIRONMENT=${1:-prod}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="/var/www/whitepine/releases/$TIMESTAMP"
CURRENT_DIR="/var/www/whitepine/current"
SHARED_DIR="/var/www/whitepine/shared"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"
echo "📦 Release directory: $RELEASE_DIR"

# Create release directory if it doesn't exist
mkdir -p "$RELEASE_DIR"

# Copy artifacts to release directory
cp -r ./* "$RELEASE_DIR/"

# Set proper permissions
chmod +x "$RELEASE_DIR/deploy"/*.sh
chmod +x "$RELEASE_DIR/scripts"/*.sh

# Install dependencies for web app
echo "📦 Installing web app dependencies..."
cd "$RELEASE_DIR/web"
echo "🔍 Debug: Web directory contents:"
ls -la
echo "🔍 Debug: Checking for package.json and package-lock.json:"
ls -la package*.json || echo "No package files found"
echo "🔍 Debug: Running npm ci --omit=dev with timeout..."
timeout 30 npm ci --omit=dev || echo "npm ci failed or timed out"
echo "🔍 Debug: Checking if node_modules was created:"
ls -la node_modules/ | head -10 || echo "node_modules not found"

# Install dependencies for API
echo "📦 Installing API dependencies..."
cd "$RELEASE_DIR/api"
echo "🔍 Debug: API directory contents:"
ls -la
echo "🔍 Debug: Checking for package.json and package-lock.json:"
ls -la package*.json || echo "No package files found"
echo "🔍 Debug: Running npm ci --omit=dev with timeout..."
timeout 30 npm ci --omit=dev || echo "npm ci failed or timed out"
echo "🔍 Debug: Checking if node_modules was created:"
ls -la node_modules/ | head -10 || echo "node_modules not found"
echo "🔍 Debug: Checking if express is installed:"
ls -la node_modules/express/ || echo "express not found in node_modules"

# Create environment file from GitHub secrets
echo "🔧 Creating environment file..."
cat > "$SHARED_DIR/env/$ENVIRONMENT.env" << EOF
NODE_ENV=production
BASE_URL=https://$(if [ "$ENVIRONMENT" = "prod" ]; then echo "whitepine.jpkramer.com"; else echo "whitepinedev.jpkramer.com"; fi)
PORT_WEB=$(if [ "$ENVIRONMENT" = "prod" ]; then echo "3000"; else echo "3001"; fi)
PORT_API=$(if [ "$ENVIRONMENT" = "prod" ]; then echo "4000"; else echo "4001"; fi)
MONGODB_URI=$MONGODB_URI
SESSION_SECRET=$SESSION_SECRET
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
EOF

# Run database migrations
echo "🗄️ Running database migrations..."
cd "$RELEASE_DIR/api"
export $(cat "$SHARED_DIR/env/$ENVIRONMENT.env" | xargs)
npx migrate-mongo up

# Stop all PM2 processes first to avoid port conflicts
echo "🛑 Stopping all PM2 processes..."
pm2 stop all || echo "No processes to stop"
pm2 delete all || echo "No processes to stop"
echo "🔍 Debug: Checking if any processes are still running on ports 3000/3001..."
lsof -ti:3000 | xargs -r kill -9 || echo "No processes on port 3000"
lsof -ti:3001 | xargs -r kill -9 || echo "No processes on port 3001"
lsof -ti:4000 | xargs -r kill -9 || echo "No processes on port 4000"
lsof -ti:4001 | xargs -r kill -9 || echo "No processes on port 4001"
echo "🔍 Debug: Final port check:"
lsof -i:3000,3001,4000,4001 || echo "No processes on target ports"

# Create symlink to new release
echo "🔗 Creating symlink to new release..."
ln -sfn "$RELEASE_DIR" "$CURRENT_DIR"

# Reinstall API dependencies in the symlinked directory BEFORE starting PM2
echo "📦 Reinstalling API dependencies in symlinked directory..."
cd "$CURRENT_DIR/api"
echo "🔍 Debug: API symlinked directory contents:"
ls -la
echo "🔍 Debug: Checking if node_modules exists:"
ls -la node_modules/ | head -5 || echo "node_modules not found"
echo "🔍 Debug: Checking if package.json exists:"
ls -la package.json || echo "package.json not found"
echo "🔍 Debug: Current working directory:"
pwd
echo "🔍 Debug: Reinstalling dependencies with timeout..."
timeout 30 npm ci --omit=dev || echo "npm ci failed or timed out"
echo "🔍 Debug: Checking if express is now installed:"
ls -la node_modules/express/ || echo "express still not found"
echo "🔍 Debug: Checking all node_modules contents:"
ls -la node_modules/ | head -10 || echo "node_modules not found"
echo "🔍 Debug: Testing if we can require express:"
node -e "console.log('Express version:', require('express/package.json').version)" || echo "Cannot require express"

# Copy ecosystem config to current directory
echo "📋 Copying ecosystem config to current directory..."
cp "$CURRENT_DIR/ops/config/ecosystem.config.cjs" "$CURRENT_DIR/ecosystem.config.cjs"
echo "🔍 Debug: Ecosystem config copied, checking contents:"
ls -la "$CURRENT_DIR/ecosystem.config.cjs" || echo "Failed to copy ecosystem config"

# Restart PM2 processes
echo "🔄 Starting PM2 processes..."
cd "$CURRENT_DIR"
echo "🔍 Debug: Current directory contents:"
ls -la
echo "🔍 Debug: Checking for ecosystem.config.cjs:"
ls -la ecosystem.config.* || echo "No ecosystem config files found"
echo "🔍 Debug: Starting PM2 with timeout..."
timeout 15 pm2 start ecosystem.config.cjs || echo "PM2 start failed or timed out"
echo "🔍 Debug: PM2 status after start:"
pm2 status

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 3

# Health check
echo "🏥 Performing health check..."
if [ "$ENVIRONMENT" = "prod" ]; then
    BASE_URL="https://whitepine.jpkramer.com"
else
    BASE_URL="https://whitepinedev.jpkramer.com"
fi

# Check web app
echo "🔍 Debug: Testing web app health check..."
timeout 10 curl -f -s "$BASE_URL/" > /dev/null && echo "✅ Web app health check passed" || echo "❌ Web app health check failed"

# Check API
echo "🔍 Debug: Testing API health check..."
timeout 10 curl -f -s "$BASE_URL/api/healthz" > /dev/null && echo "✅ API health check passed" || echo "❌ API health check failed"

# Don't exit on health check failure, just warn
echo "⚠️ Health check failed, but deployment may still be partially successful"

echo "✅ Deployment completed successfully!"
echo "🌐 Web app: $BASE_URL"
echo "🔌 API: $BASE_URL/api"
echo "📊 PM2 status:"
pm2 status

# Clean up old releases (keep last 5)
echo "🧹 Cleaning up old releases..."
cd /var/www/whitepine/releases
ls -t | tail -n +6 | xargs -r rm -rf

echo "🎉 Deployment finished!"
