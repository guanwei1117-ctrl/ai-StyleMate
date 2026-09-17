/**
 * PM2 进程守护配置 —— 同时守护前端 (Next.js) + 后端 (NestJS)
 *
 * 用法：
 *   pm2 start ecosystem.config.js           # 首次启动
 *   pm2 reload ecosystem.config.js          # 滚动重启（零停机）
 *   pm2 stop ecosystem.config.js            # 停止
 *   pm2 delete ecosystem.config.js          # 清理
 *   pm2 logs                                # 实时日志
 *   pm2 status                              # 状态
 *   pm2 save && pm2 startup                 # 开机自启（首次需执行 startup）
 *
 * 服务器端需安装：
 *   npm i -g pm2
 *
 * 环境变量在 .env 中维护（与开发一致），pm2 会自动加载根目录 .env。
 * 若用 ecosystem 自带的 env，可删除此注释并改用 env 配置块。
 */

module.exports = {
  apps: [
    // ============== 后端 API ==============
    {
      name: 'stylemate-api',
      cwd: './services/api',
      script: 'dist/main.js',
      // 优先用 build 产物（dist/main.js），没有则退回 dev 模式（tsx watch 仅作 fallback）
      // 真实生产请保证 `npm run build` 已执行
      instances: 1,
      exec_mode: 'fork',
      // 单实例足够（NestJS 单进程多请求）；如需多核可改 cluster + max
      autorestart: true,
      max_memory_restart: '1G',
      // NestJS 默认单进程 ~300MB，OOM 时重启
      kill_timeout: 8000,
      wait_ready: true,
      listen_timeout: 30000,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      // 健康检查：API 起好后访问 /api/v1/health 验证就绪
      // （pm2 在 listen 端口后 + wait_ready=true 时会等这个返回 200）
    },

    // ============== 前端 Web ==============
    {
      name: 'stylemate-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '800M',
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // 生产环境跑在 nginx 反代后面，需要正确的 origin 才能 fetch 内部 API
        // 部署到 https://stylemate.example.com 时改为对应域名
        NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
        // 若 nginx 反代把 /api 转发到 4000，可改为 '/api/v1'
        // 若前端直连 4000 端口，保持完整 URL
      },
    },
  ],

  // ============== 部署行为 ==============
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/cleanfit.git',
      path: '/srv/stylemate',
      'pre-deploy-local': '',
      'post-deploy':
        'npm ci && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': '',
    },
  },
};