module.exports = {
  apps: [
    {
      name: 'web-prod',
      cwd: '/var/www/whitepine/current/web',
      script: 'npx',
      args: 'next start -p 3002',
      env_file: '/var/www/whitepine/shared/env/prod.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/whitepine/web-prod-error.log',
      out_file: '/var/log/whitepine/web-prod-out.log',
      log_file: '/var/log/whitepine/web-prod-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        PROD_WEB_PORT: 3002
      }
    },
    {
      name: 'api-prod',
      cwd: '/var/www/whitepine/current/api',
      script: 'dist/server.cjs',
      env_file: '/var/www/whitepine/shared/env/prod.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/whitepine/api-prod-error.log',
      out_file: '/var/log/whitepine/api-prod-out.log',
      log_file: '/var/log/whitepine/api-prod-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'web-dev',
      cwd: '/var/www/whitepine/current/web',
      script: 'npx',
      args: 'next start -p 3003',
      env_file: '/var/www/whitepine/shared/env/dev.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/whitepine/web-dev-error.log',
      out_file: '/var/log/whitepine/web-dev-out.log',
      log_file: '/var/log/whitepine/web-dev-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        DEV_WEB_PORT: 3003
      }
    },
    {
      name: 'api-dev',
      cwd: '/var/www/whitepine/current/api',
      script: 'dist/server.cjs',
      env_file: '/var/www/whitepine/shared/env/dev.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/whitepine/api-dev-error.log',
      out_file: '/var/log/whitepine/api-dev-out.log',
      log_file: '/var/log/whitepine/api-dev-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'development',
        PORT: 4001
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: process.env.LIGHTSAIL_HOST,
      ref: 'origin/main',
      repo: 'git@github.com:your-username/whitepine.git',
      path: '/var/www/whitepine',
      'pre-deploy-local': '',
      'post-deploy': 'pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    development: {
      user: 'deploy',
      host: process.env.LIGHTSAIL_HOST,
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/whitepine.git',
      path: '/var/www/whitepine',
      'pre-deploy-local': '',
      'post-deploy': 'pm2 reload ecosystem.config.js --env development',
      'pre-setup': ''
    }
  }
};
// Updated Sat Sep 27 21:17:35 PDT 2025
