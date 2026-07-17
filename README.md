# StyleMate — AI 穿搭助手

> 从风格灵感、个人测评到今日 Look 诊断，帮助用户找到更适合自己的穿搭方式。

## 项目简介

`StyleMate` 是一个智能穿搭与个人风格顾问 Web 产品。当前 MVP 已实现风格库、风格测评、AI 风格档案和今日穿搭诊断；衣橱、推荐、社区和移动端能力仍处于规划或雏形阶段。

## 当前已实现

- **首页与导航**：进入风格库、测评和诊断主流程。
- **风格库**：80 种穿搭风格，按地域文化、视觉元素、场景圈层、人物原型组织。
- **风格详情**：展示理念、适合人群、难度、避雷点、核心单品、廓形和颜色体系。
- **风格测评**：采集基础画像、偏好、自述和可选照片，生成个人风格档案。
- **本地风格匹配**：AI 不可用时按三支柱规则回退生成 Top 风格。
- **AI 风格档案**：调用后端 AI 接口综合分析照片、自述和候选风格。
- **今日穿搭诊断**：上传 Look、选择诊断视角，获得 8 维评分和改良建议。
- **图片安全基础限制**：前后端均限制 JPG / PNG / WebP，单张图片不超过 8MB。
- **AI 基础限流**：默认每个来源 10 分钟最多 10 次 AI 分析请求。

## 规划中 / 未完整实现

- 登录注册与用户鉴权。
- 服务端用户风格档案同步。
- 完整衣橱 CRUD、拍照识别和搭配管理。
- 天气 + 场合的每日穿搭推荐。
- 诊断历史与报告分享图。
- 社区、购物推荐、会员系统。
- 小程序 / App / 虚拟试穿。

## 技术栈

| 层级 | 技术 |
|---|---|
| Web 前端 | Next.js 14 + TypeScript + TailwindCSS |
| 后端 API | NestJS + TypeScript |
| 数据库能力 | PostgreSQL + TypeORM（通过 `ENABLE_DB=true` 启用） |
| AI 推理 | Claude / OpenAI / DashScope Qwen-VL 兼容接口 |
| Monorepo | npm workspaces + Turborepo |

## 项目结构

```text
cleanfit/
├── apps/
│   └── web/                # Next.js Web 前端
├── packages/
│   └── shared/             # 共享类型定义
├── services/
│   └── api/                # NestJS 后端 API
├── docs/                   # PRD 与下一步任务文档
├── docker-compose.yml      # PostgreSQL 等开发基础设施
└── turbo.json              # Turborepo 配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，按需填写：

```bash
cp .env.example .env
```

AI 相关变量按实际 provider 选择配置：

```env
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
DASHSCOPE_API_KEY=
AI_RATE_LIMIT_MAX_REQUESTS=10
AI_RATE_LIMIT_WINDOW_MS=600000
```

### 3. 启动开发服务

无数据库模式可直接启动 Web + API 核心功能：

```bash
npm run dev
```

如需启用用户、衣橱和推荐等数据库模块：

```bash
docker compose up -d
# .env 中设置 ENABLE_DB=true
npm run dev
```

### 4. 访问地址

- Web 前端：http://localhost:3000
- API 文档：http://localhost:4000/api/docs
- API 健康检查：http://localhost:4000/api/v1/health

## 常用命令

```bash
npm run build   # 构建 Web 和 API
npm run lint    # TypeScript 类型检查
npm test        # 运行当前单元测试
npm run dev     # 启动开发服务
```

## 安全与隐私说明

- 上传图片仅用于穿搭、比例、色彩和风格分析，不用于身份识别。
- AI 分析可能会将图片发送给已配置的第三方 AI 服务。
- 当前风格档案默认保存在本机浏览器 `localStorage`，可在诊断页清除。
- 衣橱和用户相关接口上线前必须补齐鉴权与资源归属校验。

## 文档

- `docs/stylemate-prd.md`：完整产品需求文档。
- `docs/mvp-next-steps.md`：MVP 下一步开发任务清单。

## 许可证

MIT
