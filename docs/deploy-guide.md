# StyleMate 部署指南

## 架构

```
用户 → Vercel（前端 Next.js）→ 阿里云服务器（后端 NestJS API + PostgreSQL + Redis）
```

---

## 一、后端部署（阿里云服务器）

### 前提条件

- Ubuntu 20.04/22.04 服务器
- SSH 账号密码
- 服务器已开放端口：`80`、`443`（如需 HTTPS）

### 步骤

#### 1. SSH 登录服务器

```bash
ssh root@你的服务器IP
```

#### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | bash
```

#### 3. 克隆代码

```bash
git clone https://github.com/你的用户名/cleanfit.git /opt/stylemate
cd /opt/stylemate
```

#### 4. 配置环境变量

```bash
cp .env.example .env
nano .env
```

必须填写的配置项：

| 变量 | 说明 | 必填 |
|------|------|------|
| `JWT_SECRET` | JWT 签名密钥，生成一个随机字符串 | ✅ |
| `ANTHROPIC_API_KEY` | Claude API Key（评分功能） | 至少填一个 |
| `OPENAI_API_KEY` | OpenAI API Key（评分功能） | 至少填一个 |
| `DB_PASSWORD` | 数据库密码，改成一个复杂的 | ✅ |

#### 5. 启动服务

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### 6. 验证服务

```bash
# 查看容器状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f api

# 测试 API
curl http://localhost:4000/api/v1
```

#### 7. 配置 Nginx 反向代理（自动）

```bash
bash scripts/deploy.sh
```

#### 8. （可选）配置域名和 HTTPS

```bash
# 修改 Nginx 配置中的 server_name
nano /etc/nginx/sites-available/stylemate

# 申请 SSL 证书
certbot --nginx -d your-api-domain.com
```

### 常用命令

```bash
# 查看日志
docker compose -f docker-compose.prod.yml logs -f api

# 重启 API
docker compose -f docker-compose.prod.yml restart api

# 更新代码后重新部署
cd /opt/stylemate && git pull && docker compose -f docker-compose.prod.yml up -d --build

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 备份数据库
docker exec stylemate-db pg_dump -U stylemate stylemate > backup.sql
```

---

## 二、前端部署（Vercel）

### 方式一：通过 Vercel Dashboard（推荐）

1. 打开 [vercel.com](https://vercel.com) 并登录（用 GitHub 账号）
2. 点击 **Add New → Project**
3. 导入你的 GitHub 仓库 `cleanfit`
4. 配置：

   | 配置项 | 值 |
   |-------|-----|
   | **Framework Preset** | Next.js（自动检测） |
   | **Root Directory** | `apps/web` |
   | **Build Command** | `cd ../.. && npm run build --workspace=@stylemate/web` |
   | **Output Directory** | `.next`（自动检测） |
   | **Install Command** | `cd ../.. && npm ci` |

5. 添加环境变量：

   | 变量 | 值 |
   |------|-----|
   | `NEXT_PUBLIC_API_URL` | `https://你的服务器IP/api/v1`（或你的域名） |

6. 点击 **Deploy**

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd apps/web
vercel --prod
```

### 更新前端

推送到 GitHub 主分支后，Vercel 会自动重新部署。

---

## 三、环境变量对照表

### 前端（Vercel）

| 变量 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `https://api.your-domain.com/api/v1` |

### 后端（服务器 .env）

| 变量 | 说明 |
|------|------|
| `DB_USERNAME` | 数据库用户名 |
| `DB_PASSWORD` | 数据库密码 |
| `DB_NAME` | 数据库名 |
| `JWT_SECRET` | JWT 密钥 |
| `ANTHROPIC_API_KEY` | Claude API Key |
| `OPENAI_API_KEY` | OpenAI API Key |
| `DASHSCOPE_API_KEY` | 阿里通义千问 API Key |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS AccessKey |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS Secret |
| `OSS_BUCKET` | OSS Bucket 名称 |
| `OSS_REGION` | OSS 区域 |
| `OSS_ENDPOINT` | OSS 端点 |

---

## 四、常见问题

### Q: 后端启动后 API 返回 502

检查 Nginx 是否配置正确，以及 API 容器是否在运行：

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs api
```

### Q: 前端请求后端跨域

Vercel 上的前端域名和服务器域名不一致时，需要在后端 `main.ts` 中配置 CORS。当前配置 `origin: true` 已支持跨域。

### Q: 数据库连接失败

检查 `.env` 中的数据库配置是否与 `docker-compose.prod.yml` 一致。

### Q: 如何更新代码？

```bash
# 后端
cd /opt/stylemate
git pull
docker compose -f docker-compose.prod.yml up -d --build

# 前端
# 推送到 GitHub 即可，Vercel 自动部署
```