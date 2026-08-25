#!/bin/bash
# ============================================
# StyleMate 一键部署脚本
# 用法: bash scripts/deploy.sh
# 前提: 在阿里云服务器上执行
# ============================================

set -e

echo "========================================"
echo "  StyleMate 部署脚本"
echo "========================================"

# ---------- 配置（根据需要修改）----------
REPO_URL="https://github.com/your-username/cleanfit.git"
BRANCH="main"
APP_DIR="/opt/stylemate"
# ---------- 配置结束 ----------

# 1. 安装系统依赖
echo "[1/6] 安装系统依赖..."
apt-get update -qq
apt-get install -y -qq \
    curl git docker.io docker-compose-v2 nginx certbot python3-certbot-nginx \
    > /dev/null 2>&1

# 2. 启动 Docker
echo "[2/6] 启动 Docker..."
systemctl enable docker > /dev/null 2>&1
systemctl start docker > /dev/null 2>&1

# 3. 克隆/拉取代码
echo "[3/6] 获取代码..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin "$BRANCH"
else
    git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 4. 创建 .env 文件（如不存在）
echo "[4/6] 配置环境变量..."
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
# === 数据库 ===
DB_USERNAME=stylemate
DB_PASSWORD=stylemate
DB_NAME=stylemate

# === JWT ===
JWT_SECRET=your-jwt-secret-change-me-in-production

# === AI API Keys（评分功能必需）===
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
DASHSCOPE_API_KEY=

# === 阿里云 OSS（图片存储）===
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=stylemate-images
OSS_REGION=oss-cn-hangzhou
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
ENVEOF
    echo "  ⚠️  请编辑 .env 文件填写真实配置"
fi

# 5. 构建并启动
echo "[5/6] 构建并启动服务..."
docker compose -f docker-compose.prod.yml up -d --build

# 6. 配置 Nginx 反向代理
echo "[6/6] 配置 Nginx..."
SERVER_IP=$(curl -s ifconfig.me)

cat > /etc/nginx/sites-available/stylemate << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 50m;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location / {
        root /opt/stylemate/apps/web/out;
        try_files $uri $uri.html $uri/ =404;
        index index.html;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/stylemate /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "========================================"
echo "  ✅ 部署完成！"
echo "  API 地址: http://$SERVER_IP/api/v1"
echo "  API 文档: http://$SERVER_IP/api/docs"
echo "========================================"
echo ""
echo "下一步:"
echo "  1. 编辑 .env 文件: nano /opt/stylemate/.env"
echo "  2. 重启服务: cd /opt/stylemate && docker compose -f docker-compose.prod.yml restart"
echo "  3. 配置域名: 修改 /etc/nginx/sites-available/stylemate 中的 server_name"
echo "  4. 配置 HTTPS: certbot --nginx -d your-domain.com"
echo ""