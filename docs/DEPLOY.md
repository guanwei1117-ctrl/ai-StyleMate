# StyleMate 部署指南

本指南描述如何把本地代码推送到服务器，实现「本地 commit + push → 服务器自动拉取 + 重启」。

## 整体流程

```
┌─────────────┐    git push     ┌──────────────────┐    SSH    ┌─────────────────┐
│  本地开发   │ ──────────────► │ GitHub Actions   │ ────────► │ 服务器（生产）   │
│ (Windows)   │                 │ 自动触发部署     │           │ pm2 守护进程    │
└─────────────┘                 └──────────────────┘           └─────────────────┘
```

**两种使用方式**：
- **A. 全自动**（推荐）：push 到 `main` → GitHub Actions 自动 SSH 部署
- **B. 半自动**：服务器上 SSH 登录后 `bash scripts/deploy.sh`

---

## 1. 服务器首次环境准备

> 以下命令在服务器上以 root 或 sudo 权限执行一次。完成后即可重复部署。

### 1.1 安装基础工具

```bash
# Ubuntu / Debian
apt update && apt install -y curl git nginx certbot python3-certbot-nginx

# 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 pm2（进程守护）
npm i -g pm2
```

### 1.2 创建部署用户与目录

```bash
# 创建专用用户（推荐，避免直接用 root）
useradd -m -s /bin/bash deploy
mkdir -p /srv/stylemate
chown -R deploy:deploy /srv/stylemate

# 配置 SSH 公钥（用于 GitHub Actions 登录）
mkdir -p /home/deploy/.ssh
echo "<你的公钥内容>" >> /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

### 1.3 拉取代码（首次）

```bash
sudo -u deploy bash -c '
  cd /srv
  git clone https://github.com/<your-org>/cleanfit.git stylemate
  cd stylemate
  cp .env.example .env
  # 编辑 .env，填入生产环境真实的 DB / AI Keys / OSS 等
  vim .env
'
```

### 1.4 启动数据库

**方式 A：用项目自带的 docker compose（推荐）**

```bash
cd /srv/stylemate
docker compose up -d postgres redis
# 修改 .env：DB_HOST=127.0.0.1  DB_PASSWORD=<你设置的密码>
```

**方式 B：直接用云数据库（RDS）**

跳过 docker，把 `.env` 中的 `DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME` 指向 RDS 实例即可。

### 1.5 首次部署（手动）

```bash
cd /srv/stylemate
bash scripts/deploy.sh
```

成功后进程状态：

```bash
pm2 status
# ┌────┬──────────────────────┬─────────┬──────┐
# │ id │ name                 │ status  │ ↺    │
# ├────┼──────────────────────┼─────────┼──────┤
# │ 0  │ stylemate-api        │ online  │ 0    │
# │ 1  │ stylemate-web        │ online  │ 0    │
# └────┴──────────────────────┴─────────┴──────┘
```

### 1.6 配置 pm2 开机自启

```bash
pm2 startup          # 会打印一段 systemd 命令，复制粘贴执行
pm2 save             # 保存当前进程状态
```

---

## 2. 配置 GitHub Actions 自动部署（可选）

### 2.1 添加 GitHub Secrets

进入仓库 `Settings → Secrets and variables → Actions → New repository secret`，添加：

| Secret 名 | 值 | 说明 |
|---|---|---|
| `SSH_HOST` | `your-server-ip` 或 `style.example.com` | 服务器 IP / 域名 |
| `SSH_USER` | `deploy` | 服务器登录用户名 |
| `SSH_PRIVATE_KEY` | SSH 私钥**整段内容** | 从 `~/.ssh/id_ed25519` 复制（含 `-----BEGIN...-----`） |
| `DEPLOY_PATH` | `/srv/stylemate` | 部署目录 |

### 2.2 测试

```bash
git push origin main
```

进入仓库的 `Actions` 标签页可看到部署进度。失败时查看日志排查。

---

## 3. 配置 Nginx 反向代理 + HTTPS（生产推荐）

### 3.1 反向代理配置

创建 `/etc/nginx/sites-available/stylemate`：

```nginx
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name style.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 反代
server {
    listen 443 ssl http2;
    server_name style.example.com;

    ssl_certificate     /etc/letsencrypt/live/style.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/style.example.com/privkey.pem;

    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket / 流式 AI 响应需要
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # 上传图片大小（AI 评分照片可能较大）
    client_max_body_size 20m;
}
```

启用：

```bash
ln -s /etc/nginx/sites-available/stylemate /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 申请 HTTPS 证书
certbot --nginx -d style.example.com
```

### 3.2 修改前端环境变量

编辑 `/srv/stylemate/.env` 与前端构建时的 API URL：

```bash
# ecosystem.config.js 里 NEXT_PUBLIC_API_URL 改为：
NEXT_PUBLIC_API_URL=/api/v1
# 这样前端走同源反代，无需配置 CORS
```

然后重新部署：

```bash
bash scripts/deploy.sh
```

---

## 4. 日常运维

### 4.1 常用命令

```bash
# 进程
pm2 status                    # 进程状态
pm2 logs                     # 实时日志（所有 app）
pm2 logs stylemate-api       # 仅后端
pm2 logs stylemate-web       # 仅前端

# 部署
bash scripts/deploy.sh                           # 手动触发部署
git push origin main                             # 触发自动部署（已配 GH Actions）

# 数据库
docker compose ps                # 查看 PG/Redis 状态
docker compose logs -f postgres  # PG 日志
docker compose restart postgres  # 重启 PG

# 备份（建议每日 cron）
docker exec stylemate-db pg_dump -U stylemate stylemate | \
  gzip > /backup/db-$(date +%F).sql.gz
```

### 4.2 故障排查

| 现象 | 检查 |
|---|---|
| API 起不来 | `pm2 logs stylemate-api`，看 NestJS 启动日志；最常见：DB 连不上 → 检查 `.env` 中 `DB_HOST/PORT/PASSWORD` |
| Web 502 | nginx → 检查 `proxy_pass http://127.0.0.1:3000` 对应进程是否在；`pm2 restart stylemate-web` |
| 部署失败 | 看 Actions 日志；服务器侧 `pm2 logs --lines 200`；失败回滚：`git reset --hard <prev-commit> && bash scripts/deploy.sh` |
| AI 接口超时 | 检查 `.env` 中 `ANTHROPIC_API_KEY / DASHSCOPE_API_KEY` 是否过期 |

### 4.3 监控建议

- **UptimeRobot**（免费）：每 5 分钟 ping `https://style.example.com/api/v1/health`，宕机邮件告警
- **pm2 监控**：`pm2 monitor`（需注册 pm2 账号，免费额度够小项目）
- **服务器基础监控**：用云厂商自带的云监控

---

## 5. 安全 checklist

- [ ] `.env` 中 `JWT_SECRET` 已改为强随机字符串（≥32 字符）
- [ ] DB 密码与 `.env` 中的 `DB_PASSWORD` 不一致 → **必须修改**
- [ ] 服务器 SSH 禁用密码登录：`PasswordAuthentication no` in `/etc/ssh/sshd_config`
- [ ] 服务器防火墙只开 80/443：`ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] 已创建管理员账号：`node services/api/scripts/make-admin.js <手机号> <强密码>`
- [ ] 已申请 HTTPS 证书（certbot / 云厂商免费证书）
- [ ] 数据库每日自动备份到 OSS / 异地存储