# StyleMate 阿里云服务器部署指南

> 目标架构：Nginx(80/443) → Next.js(3000) + NestJS(4000)，PostgreSQL/Redis 跑在服务器 Docker 里，进程用 pm2 守护。

---

## 0. 部署前必须想清楚的两件事

### 域名与 ICP 备案（国内服务器绕不开）
- 大陆服务器对外提供 Web 服务（80/443 端口），**域名必须完成 ICP 备案**，否则会被阿里云拦截。
- 流程：阿里云买域名 → 域名实名（1-2 天）→ 阿里云「备案」控制台提交（约 1-3 周）。
- **过渡期方案**：备案没下来前，可以先用 `http://服务器公网IP:3000` 直接测试功能（安全组放行 3000/4000，不走 Nginx/域名），备案完成后再切正式域名。

### 免费 SSL 证书
- 备案通过后，在阿里云「数字证书管理服务」申请**免费 DV 证书**（每年 20 张，3 个月有效期），下载 Nginx 版，上传到服务器。

---

## 1. 服务器初始化（一次性）

以 Ubuntu 22.04 为例（CentOS/阿里云 Linux 用 yum 同理）：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y git curl build-essential nginx

# 安装 Node.js 20（Next.js 14 官方推荐）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Docker（跑 PostgreSQL / Redis）
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # 重新登录后生效

# 安装 pm2（进程守护）
sudo npm install -g pm2

node -v && docker --version && nginx -v   # 验证
```

> 内存建议 ≥ 2GB。1GB 机器构建前端可能内存不足，可先加 2GB swap：
> ```bash
> sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
> sudo mkswap /swapfile && sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

### 阿里云安全组（控制台操作）
放行入方向端口：`22`（SSH）、`80`、`443`。**测试期**可临时再放 `3000`、`4000`，正式切域名后建议关闭这两个端口（只走 Nginx）。

---

## 2. 拉取代码

```bash
cd /opt
git clone <你的仓库地址> stylemate
cd stylemate
```

---

## 3. 配置环境变量

```bash
# 复制模板并填写（数据库密码、JWT_SECRET、AI Key 必填）
cp .env.production.example .env
vi .env
```

关键项：

| 变量 | 说明 |
|---|---|
| `DB_PASSWORD` | 与下面 docker compose 里的密码保持一致 |
| `JWT_SECRET` | 用 `openssl rand -hex 32` 生成 |
| `OPENAI_API_KEY` / `DASHSCOPE_API_KEY` | 至少配一个 |
| `NODE_ENV` | `production`（关闭 TypeORM 自动同步，避免误改表） |

---

## 4. 启动数据库

项目自带 `docker-compose.yml`：

```bash
docker compose up -d postgres redis
docker compose ps          # 确认 running
```

> 首次启动前检查 `docker-compose.yml` 里 Postgres 的密码是否与 `.env` 一致，改一处即可（改完 `docker compose up -d --force-recreate postgres`）。

---

## 5. 安装依赖并构建

```bash
npm install

# 前端构建时把 API 地址写死为同域反代路径：
#   NEXT_PUBLIC_API_URL=https://你的域名/api/v1
# （备案前用 IP 测试则填 http://服务器IP:4000/api/v1）
export NEXT_PUBLIC_API_URL=https://stylemate.example.com/api/v1
npm run build
```

> 构建产物：`apps/web/.next`（前端）、`services/api/dist`（后端）。
> 每次改代码重新部署都要带上同一个 `NEXT_PUBLIC_API_URL` 再 build。

---

## 6. 创建数据库表（仅首次）

生产环境关闭了 TypeORM 自动同步，用一次性脚本建表：

```bash
npm run schema:sync --workspace @stylemate/api
```

看到 `[schema:sync] 表结构已同步完成 ✓` 即成功。以后如果加了新实体，重新跑一次即可。

---

## 7. 用 pm2 启动前后端

```bash
# 后端环境变量来自项目根 .env（NestJS ConfigModule 会读 ../../.env）
pm2 start deploy/ecosystem.config.cjs
pm2 save                       # 保存进程列表
pm2 startup                    # 生成开机自启命令，按提示复制执行

pm2 status                     # 看到 stylemate-api / stylemate-web 两个 online
curl http://127.0.0.1:4000/api/v1/health   # 后端健康检查
curl -I http://127.0.0.1:3000               # 前端 200
```

---

## 8. 配置 Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/conf.d/stylemate.conf
# 把文件里的 stylemate.example.com 换成你的域名
sudo vi /etc/nginx/conf.d/stylemate.conf
sudo nginx -t && sudo systemctl reload nginx
```

配好 SSL 证书后，按 `nginx.conf` 末尾注释追加 443 段并把 80 段改为 301 跳转。

---

## 9. 上线验证清单

- [ ] `https://你的域名` 打开首页
- [ ] 走一遍 AI 对话测评（验证 AI Key 与后端连通）
- [ ] 上传图片做今日诊断（验证 30MB body 限制与 AI 超时 120s）
- [ ] 衣橱拍照识别、今天穿什么（验证数据库读写）
- [ ] 注册/登录（验证 JWT）
- [ ] 检查日志：`pm2 logs`

---

## 10. 日常更新流程

```bash
cd /opt/stylemate
git pull
npm install                              # 依赖有变化才需要
export NEXT_PUBLIC_API_URL=https://你的域名/api/v1
npm run build
npm run schema:sync --workspace @stylemate/api   # 有新实体/新表时才需要
pm2 reload stylemate-api stylemate-web
pm2 logs --lines 50
```

---

## 常见问题

| 现象 | 处理 |
|---|---|
| 前端 502 | 检查 3000 是否 online：`pm2 logs stylemate-web` |
| 图片上传 413 | Nginx `client_max_body_size` 已设 30m，确认 reload 生效 |
| AI 请求超时 | `proxy_read_timeout 120s` 已配；再慢需检查 AI Key/网络 |
| 内存不足构建失败 | 按第 1 节加 swap，或本地构建后只上传产物 |
| 数据库连不上 | `docker compose ps`、`.env` 密码一致性、PG 端口 5432 勿暴露公网 |
| 衣橱图片占库 | 当前图片以 base64 存库，量大后建议迁移对象存储（OSS） |
