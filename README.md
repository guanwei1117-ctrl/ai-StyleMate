# 👔 StyleMate — 穿搭助手

> 帮助每个人找到适合自己的穿搭方案

## 项目简介

StyleMate 是一款面向大众的智能穿搭推荐平台。通过 AI 技术分析用户的身材特征、肤色、风格偏好，结合天气和场合，为每个人提供量身定制的穿搭建议。

## 技术栈

| 层级 | 技术 |
|------|------|
| **Web 前端** | Next.js 14 + TypeScript + TailwindCSS + shadcn/ui |
| **移动端** | React Native (Expo) / Taro 小程序 |
| **后端 API** | NestJS + TypeScript + PostgreSQL + Redis |
| **AI 推理** | Python FastAPI + Claude/OpenAI API |
| **向量搜索** | Qdrant |
| **基础设施** | Docker + Kubernetes + GitHub Actions |

## 项目结构

```
stylemate/
├── apps/
│   └── web/                # Next.js Web 前端
├── packages/
│   └── shared/             # 共享类型定义
├── services/
│   └── api/                # NestJS 后端 API
├── docker-compose.yml      # 开发环境服务
└── turbo.json              # Turborepo 配置
```

## 快速开始

### 前置要求

- Node.js >= 18
- Docker & Docker Compose
- npm

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务

```bash
# 启动数据库、缓存等基础设施
docker compose up -d

# 启动所有应用（前端 + 后端）
npm run dev
```

### 3. 访问

- **Web 前端**：http://localhost:3000
- **API 文档 (Swagger)**：http://localhost:4000/api/docs
- **API 健康检查**：http://localhost:4000/api/v1/health

## 环境变量

复制 `.env.example` 为 `.env`，按需配置。

```bash
cp .env.example .env
```

## 核心功能

- 🧑‍🎨 **用户画像**：体型分析、肤色检测、风格偏好测试
- 🗄️ **智能衣橱**：AI 拍照识别、分类管理、胶囊衣橱
- 🤖 **AI 搭配推荐**：基于天气+场合的每日穿搭建议
- 🔍 **风格探索**：风格百科、趋势发现、AI 风格迁移
- 👥 **穿搭社区**：OOTD 分享、穿搭求助、挑战活动

## 开发路线

| 阶段 | 内容 | 周期 |
|------|------|------|
| Phase 1 | MVP — 用户画像 + 衣橱 + 基础推荐 | 4-6 周 |
| Phase 2 | AI 识别 + 虚拟试穿 + 移动端 | 4-6 周 |
| Phase 3 | 社区 + 购物推荐 + 商业化 | 4-6 周 |
| Phase 4 | 深度优化与国际化 | 持续 |

## 许可证

MIT

---

🤖 Built with [Claude Code](https://claude.com/claude-code)
