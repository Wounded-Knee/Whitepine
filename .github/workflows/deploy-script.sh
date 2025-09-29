#!/bin/bash
set -e

# Deployment script for multi-job workflow
# This script runs on the server after files are uploaded

ENVIRONMENT=prod
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="/var/www/whitepine/releases/$TIMESTAMP"
CURRENT_DIR="/var/www/whitepine/current"
SHARED_DIR="/var/www/whitepine/shared"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"
echo "📦 Release directory: $RELEASE_DIR"
echo "🔍 Debug: Deployment script version: $(date)"

# Create release directory
mkdir -p "$RELEASE_DIR"

# Copy web app files
echo "🔧 Copying web app files..."
mkdir -p "$RELEASE_DIR/web"
cp -r web-next "$RELEASE_DIR/web/.next"
cp -r web-public "$RELEASE_DIR/web/public"
cp web-package.json "$RELEASE_DIR/web/package.json"
cp web-package-lock.json "$RELEASE_DIR/web/package-lock.json"

# Copy API files
echo "🔧 Copying API files..."
mkdir -p "$RELEASE_DIR/api"
cp -r api-dist "$RELEASE_DIR/api/dist"
cp -r api-migrations "$RELEASE_DIR/api/migrations"
cp api-package.json "$RELEASE_DIR/api/package.json"
cp api-package-lock.json "$RELEASE_DIR/api/package-lock.json"
cp migrate-mongo-config.cjs "$RELEASE_DIR/api/migrate-mongo-config.cjs"

# Copy packages
echo "🔧 Copying packages..."
cp -r packages "$RELEASE_DIR/packages"

# Copy ops
echo "🔧 Copying ops..."
cp -r ops "$RELEASE_DIR/ops"

# Install web app dependencies
echo "📦 Installing web app dependencies..."
cd "$RELEASE_DIR/web"

# Create workspace configuration
cat > ../pnpm-workspace.yaml << 'EOF'
packages:
  - 'web'
  - 'packages/*'
EOF

# Install dependencies
pnpm install --prod --frozen-lockfile=false

# Create @whitepine/types symlink
echo "🔧 Creating @whitepine/types symlink..."
if [ -d "$RELEASE_DIR/packages/types" ]; then
  mkdir -p node_modules/@whitepine
  cd node_modules/@whitepine
  ln -sf ../../../packages/types types
  echo "✅ @whitepine/types symlink created"
  cd ../..
else
  echo "⚠️ packages/types directory not found, skipping symlink creation"
fi

# Install API dependencies
echo "📦 Installing API dependencies..."
cd "$RELEASE_DIR/api"
pnpm install --prod --frozen-lockfile=false

# Create environment file
echo "🔧 Creating environment file..."
FALLBACK_SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-$(date +%s)")
FALLBACK_JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-jwt-$(date +%s)")
SESSION_SECRET_VALUE=${SESSION_SECRET:-$FALLBACK_SESSION_SECRET}
JWT_SECRET_VALUE=${JWT_SECRET:-$FALLBACK_JWT_SECRET}

cat > "$RELEASE_DIR/.env" << ENVEOF
NODE_ENV=production
BASE_URL=https://whitepine.jpkramer.com
PORT_WEB=3000
PORT_API=4000
MONGODB_URI=$MONGODB_URI_PROD
SESSION_SECRET=$SESSION_SECRET_VALUE
JWT_SECRET=$JWT_SECRET_VALUE
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENVEOF

# Run database migrations
echo "🗄️ Running database migrations..."
cd "$RELEASE_DIR/api"
export MONGODB_URI=$MONGODB_URI_PROD
npx migrate-mongo up

# Create symlink to new release
echo "🔗 Creating symlink to new release..."
if [ -L "$CURRENT_DIR" ]; then
  rm "$CURRENT_DIR"
fi
ln -sf "$RELEASE_DIR" "$CURRENT_DIR"

# Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 stop all || echo "No processes to stop"
pm2 delete all || echo "No processes to delete"
pm2 start "$RELEASE_DIR/ops/config/ecosystem.config.cjs"

# Update NGINX configuration
echo "🔧 Updating NGINX configuration..."
sudo cp "$RELEASE_DIR/ops/config/nginx.conf" /etc/nginx/sites-available/whitepine
sudo ln -sf /etc/nginx/sites-available/whitepine /etc/nginx/sites-enabled/whitepine
sudo nginx -t && sudo systemctl reload nginx

# Clean up old releases
echo "🧹 Cleaning up old releases..."
cd /var/www/whitepine/releases
ls -t | tail -n +6 | xargs -r rm -rf

echo "✅ Deployment completed successfully!"
