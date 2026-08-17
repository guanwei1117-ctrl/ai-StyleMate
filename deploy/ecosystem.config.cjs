// ============================================================
// StyleMate 生产进程管理（pm2）
// 用法：pm2 start deploy/ecosystem.config.cjs
// 重启：pm2 reload stylemate-api stylemate-web
// ============================================================

module.exports = {
  apps: [
    {
      name: 'stylemate-api',
      cwd: './services/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      max_memory_restart: '512M',
      out_file: './logs/api-out.log',
      error_file: './logs/api-err.log',
      merge_logs: true,
    },
    {
      name: 'stylemate-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      out_file: './logs/web-out.log',
      error_file: './logs/web-err.log',
      merge_logs: true,
    },
  ],
};
