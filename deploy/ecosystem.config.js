// PM2 Ecosystem Configuration
// Advanced PM2 configuration for production deployment

module.exports = {
  apps: [
    {
      name: 'str-console',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/str-console',
      instances: 2, // Run 2 instances for load balancing
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Restart configuration
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Logging
      error_file: '/var/log/pm2/str-console-error.log',
      out_file: '/var/log/pm2/str-console-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced features
      watch: false, // Don't watch files in production
      ignore_watch: ['node_modules', '.next', 'logs'],
      
      // Startup
      wait_ready: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
