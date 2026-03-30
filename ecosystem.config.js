// PM2 Ecosystem Configuration - Data Room
// Ejecutar desde la raiz del proyecto: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    // ─────────────────────────────────────────────
    // BACKEND - NestJS (Puerto 3000)
    // ─────────────────────────────────────────────
    {
      name: 'dataroom-backend',
      cwd: './BACKEND',
      script: 'dist/main.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Las variables sensibles se cargan desde .env en el servidor
      env_file: './BACKEND/.env',
      // Logs
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Reinicio con delay para evitar loops
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
    },

    // ─────────────────────────────────────────────
    // FRONTEND - Next.js (Puerto 3001)
    // ─────────────────────────────────────────────
    {
      name: 'dataroom-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Logs
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Reinicio con delay para evitar loops
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
