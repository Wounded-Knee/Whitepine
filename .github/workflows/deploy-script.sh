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

# Copy web app source directories (check if they exist first)
[ -d "web-app" ] && cp -r web-app "$RELEASE_DIR/web/app"
[ -d "web-lib" ] && cp -r web-lib "$RELEASE_DIR/web/lib"
[ -d "web-components" ] && cp -r web-components "$RELEASE_DIR/web/components"
[ -d "web-hooks" ] && cp -r web-hooks "$RELEASE_DIR/web/hooks"
[ -d "web-types" ] && cp -r web-types "$RELEASE_DIR/web/types"
[ -d "web-test" ] && cp -r web-test "$RELEASE_DIR/web/test"
[ -d "web-content" ] && cp -r web-content "$RELEASE_DIR/web/content"

# Copy web app configuration files
cp web-package.json "$RELEASE_DIR/web/package.json"
[ -f "web-next.config.js" ] && cp web-next.config.js "$RELEASE_DIR/web/next.config.js"
[ -f "web-tsconfig.json" ] && cp web-tsconfig.json "$RELEASE_DIR/web/tsconfig.json"
[ -f "web-vitest.config.ts" ] && cp web-vitest.config.ts "$RELEASE_DIR/web/vitest.config.ts"
[ -f "web-middleware.ts" ] && cp web-middleware.ts "$RELEASE_DIR/web/middleware.ts"
cp web-pnpm-lock.yaml "$RELEASE_DIR/web/pnpm-lock.yaml"

# Copy API files
echo "🔧 Copying API files..."
mkdir -p "$RELEASE_DIR/api"
cp -r api-dist "$RELEASE_DIR/api/dist"
cp -r api-migrations "$RELEASE_DIR/api/migrations"
cp api-package.json "$RELEASE_DIR/api/package.json"
cp api-pnpm-lock.yaml "$RELEASE_DIR/api/pnpm-lock.yaml"
cp migrate-mongo-config.js "$RELEASE_DIR/api/migrate-mongo-config.js"

# Create .cjs file for migrate-mongo compatibility
cd "$RELEASE_DIR/api"
cp migrate-mongo-config.js migrate-mongo-config.cjs
cd /tmp/deployment

# Copy packages
echo "🔧 Copying packages..."
cp -r packages "$RELEASE_DIR/packages"

# Copy ops
echo "🔧 Copying ops..."
cp -r ops "$RELEASE_DIR/ops"

# Create workspace root package.json
echo "📦 Setting up workspace structure..."
cd "$RELEASE_DIR"
cat > package.json << 'PKGEOF'
{
  "name": "whitepine-workspace",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "web",
    "api",
    "packages/types"
  ],
  "packageManager": "pnpm@10.15.0"
}
PKGEOF

# Install dependencies for each workspace package
echo "📦 Installing web app dependencies..."
cd "$RELEASE_DIR/web"
pnpm install --prod --frozen-lockfile=false

# Create .env file for web app (NextAuth configuration)
echo "🔧 Creating .env file for web app..."
cat > "$RELEASE_DIR/web/.env" << WEBENVEOF
NODE_ENV=production
NEXTAUTH_URL=https://whitepine.jpkramer.com
NEXTAUTH_SECRET=${JWT_SECRET_VALUE}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
NEXT_PUBLIC_API_URL=/api
WEBENVEOF

echo "✅ Web app .env file created"

echo "📦 Installing API dependencies..."
cd "$RELEASE_DIR/api"
pnpm install --prod --frozen-lockfile=false

# Create @whitepine/types symlink for web app
echo "🔧 Creating @whitepine/types symlink for web app..."
cd "$RELEASE_DIR/web"
if [ -d "$RELEASE_DIR/packages/types" ]; then
  mkdir -p node_modules/@whitepine
  cd node_modules/@whitepine
  ln -sf ../../../packages/types types
  echo "✅ @whitepine/types symlink created for web app"
  cd ../..
else
  echo "⚠️ packages/types directory not found, skipping symlink creation"
fi

# Create environment file for API server
echo "🔧 Creating environment file for API server..."
FALLBACK_SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-$(date +%s)")
FALLBACK_JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-jwt-$(date +%s)")
SESSION_SECRET_VALUE=${SESSION_SECRET:-$FALLBACK_SESSION_SECRET}
JWT_SECRET_VALUE=${JWT_SECRET:-$FALLBACK_JWT_SECRET}

# Create .env file in API directory where the server expects it
cat > "$RELEASE_DIR/api/.env" << ENVEOF
NODE_ENV=production
BASE_URL=https://whitepine.jpkramer.com
PORT_WEB=3000
PORT_API=4000
MONGODB_URI_DEV=$MONGODB_URI_PROD
SESSION_SECRET=$SESSION_SECRET_VALUE
JWT_SECRET=$JWT_SECRET_VALUE
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENVEOF

echo "✅ Environment file created at $RELEASE_DIR/api/.env"

# Run database migrations
echo "🗄️ Running database migrations..."
cd "$RELEASE_DIR/api"
export MONGODB_URI_PROD=$MONGODB_URI_PROD

# Temporarily remove "type": "module" from package.json for migration
echo "🔧 Temporarily modifying package.json for migration..."
cp package.json package.json.backup
node -e "
const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
delete pkg.type;
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Run migrations
echo "🚀 Running migrate-mongo..."
npx migrate-mongo up

# Restore the original package.json
echo "🔄 Restoring package.json..."
mv package.json.backup package.json

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

# Create shared environment file and load it (PM2 doesn't support env_file natively)
echo "🔧 Creating shared environment file..."
mkdir -p /var/www/whitepine/shared/env
cat > /var/www/whitepine/shared/env/prod.env << PRODENVEOF
NODE_ENV=production
BASE_URL=https://whitepine.jpkramer.com
PORT_WEB=3000
PORT_API=4000
MONGODB_URI=$MONGODB_URI_PROD
SESSION_SECRET=$SESSION_SECRET_VALUE
JWT_SECRET=$JWT_SECRET_VALUE
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
NEXTAUTH_URL=https://whitepine.jpkramer.com
NEXTAUTH_SECRET=$SESSION_SECRET_VALUE
NEXT_PUBLIC_API_URL=/api
S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
PRODENVEOF

# Load environment variables (set -a exports all variables)
echo "🔧 Loading environment variables..."
set -a
source /var/www/whitepine/shared/env/prod.env
set +a

pm2 start "$RELEASE_DIR/ops/config/ecosystem.config.cjs" --update-env

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
