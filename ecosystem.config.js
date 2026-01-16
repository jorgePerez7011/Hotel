// ecosystem.config.js
// Configuración de PM2 para Hotel Management System

module.exports = {
  apps: [
    {
      name: 'hotel-api',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'public'],
    },
    {
      name: 'hotel-web',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'public'],
    }
  ],

  // Variables globales
  env: {
    NODE_ENV: 'production',
  },

  // Configuración de deploy
  deploy: {
    production: {
      user: 'usuario_hosttiger',
      host: 'tu.servidor.hosttiger.com',
      ref: 'origin/main',
      repo: 'https://github.com/tuusuario/hotel-management.git',
      path: '/home/usuario/public_html',
      'post-deploy': 'npm install --production && npm run build && pm2 restart ecosystem.config.js --env production'
    }
  }
};
