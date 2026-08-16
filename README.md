# StyleMate — AI 穿搭助手

> 从风格灵感、个人测评到今日 Look 诊断，再到"今天穿什么"与"该买什么"，帮助用户完成从买到穿的无痛穿搭闭环。

## 项目简介

`StyleMate` 是一个智能穿搭与个人风格顾问 Web 产品。围绕两个核心痛点——**不会穿搭**与**不会买**——提供从认识风格、认识自己、穿得对、穿什么、买到值得买的全流程能力。

## 当前已实现

- **首页与导航**：进入风格库、测评、诊断和衣橱主流程。
- **风格库**：80 种穿搭风格，按地域文化、视觉元素、场景圈层、人物原型组织。
- **风格详情**：展示理念、适合人群、难度、避雷点、核心单品、廓形和颜色体系。
- **风格测评**：采集基础画像、偏好、自述和可选照片，生成个人风格档案。
- **本地风格匹配**：AI 不可用时按三支柱规则回退生成 Top 风格。
- **AI 风格档案**：调用后端 AI 接口综合分析照片、自述和候选风格。
- **今日穿搭诊断**：上传 Look、选择诊断视角，获得 8 维评分和改良建议；诊断报告附带 **衣橱替换建议（WARDROBE SWAPS）**，把问题单品映射到衣橱里可直接替换的选择；支持 **生成报告分享图**（移动端系统分享 / 桌面端下载 PNG）与 **最近诊断历史**（本地保存 5 次，可回看）。
- **我的衣橱**：AI 拍照识别（品类/颜色/材质/风格/季节等自动落库）、手动录入、二级子类筛选与搜索、单品详情编辑。
- **帮我搭这件**：以衣橱中任意一件单品为核心，AI 生成 3 套搭配（衣橱已有单品 + 建议补充单品）。
- **今天穿什么**：结合实时天气（Open-Meteo）、衣橱与长期记忆生成 3 套方案（规则引擎 + AI + 记忆 4:4:2 混合评分）；**衣橱为空时自动生成"起步方案"**（建议购买单品 + 预算，不挡新手）。
- **周穿搭计划**：把保存的方案安排到一周任意一天，标记已穿，手动换单品。
- **衣橱缺口分析**：AI 结合风格档案、季节与预算给出个性化缺口清单（缺什么、为什么、先买什么），AI 失败回退规则分析。
- **购物清单**：缺口建议、起步方案与单品搭配的建议单品可一键加入清单；支持勾选已买、优先级排序、预算合计与去重。
- **电商导购（淘宝）**：搜索词**结合个人风格画像**——颜色+品类+适合风格+体型修饰（如梨形自动加"高腰"）+身高（小个子）+目标（显瘦）+预算（平价/轻奢），自动排除讨厌的关键词；入口覆盖购物清单、缺口报告、单品详情（找同款）、帮我搭这件与起步方案的建议单品；移动端唤起淘宝 App、桌面端打开搜索页；**预留淘宝客联盟 Provider**（配置 AppKey 后自动返回真实商品卡与佣金链接）。
- **值得买吗**：上传商品截图，AI 结合衣橱与风格档案给出买/考虑/跳过决策、理由、可搭组合；**衣橱为空也可用**。
- **智能记忆系统**：长期画像、行为反馈、当前意图、AI 记忆摘要四层记忆，所有 AI 推荐自动读取与更新记忆。
- **登录注册**：手机号 + 密码 JWT 鉴权；登录/注册时本地数据（衣橱、搭配、购物清单、记忆）自动迁移到账号，跨设备同步。
- **图片安全基础限制**：前后端均限制 JPG / PNG / WebP，单张图片不超过 8MB。

## 规划中 / 未完整实现

- 周计划与风格档案暂存本机（登录后可考虑服务端同步）。
- 社区、OOTD 分享、点赞收藏。
- 京东/拼多多等更多平台导购、会员系统。
- 小程序 / App / 虚拟试穿。

## 技术栈

| 层级 | 技术 |
|---|---|
| Web 前端 | Next.js 14 + TypeScript + TailwindCSS |
| 后端 API | NestJS + TypeScript |
| 数据库能力 | PostgreSQL + TypeORM（默认启用，设 `ENABLE_DB=false` 关闭） |
| AI 推理 | Claude / OpenAI / DashScope Qwen-VL 兼容接口 |
| Monorepo | npm workspaces + Turborepo |

## 项目结构

```text
stylemate/
├── apps/
│   └── web/                # Next.js Web 前端
├── packages/
│   └── shared/             # 共享类型定义
├── services/
│   └── api/                # NestJS 后端 API
├── docs/                   # PRD 与下一步任务文档
├── start.py                # 一键启动脚本（推荐）
├── docker-compose.yml      # PostgreSQL 等开发基础设施
└── turbo.json              # Turborepo 配置
```

## 快速开始

### 前置条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（提供 PostgreSQL + Redis）
- [Node.js](https://nodejs.org/) ≥ 18
- Python ≥ 3.8（用于一键启动脚本）

### 一键启动（推荐）

首次使用需先安装依赖：

```bash
npm install
```

然后运行一键启动脚本：

```bash
python start.py
```

脚本自动完成以下步骤：
1. 检查环境（Docker、Node.js、npm）
2. 启动 PostgreSQL + Redis 容器
3. 等待数据库就绪
4. 启动前后端开发服务（Next.js + NestJS）

按 `Ctrl+C` 停止服务，可选择是否同时停止数据库容器。

常用参数：

| 参数 | 说明 |
|------|------|
| `--no-docker` | 跳过容器启动/停止（数据库已在外部运行时使用） |
| `--timeout 180` | 调整 PostgreSQL 就绪等待秒数（默认 60） |
| `--no-db-wait` | 不等待 PostgreSQL 就绪 |
| `--down-on-exit` | 退出时直接停止容器，不询问 |
| `--no-down-on-exit` | 退出时不停容器，不询问 |

> **Windows 提示**：按 `Ctrl+C` 时如出现 "Terminate batch job (Y/N)?" 提示，输入 `Y` 即可正常退出。

### 手动启动

<details>
<summary>如需逐步启动，展开查看手动步骤</summary>

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量

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

#### 3. 启动开发服务

数据库模块默认启用，需要先启动 PostgreSQL：

```bash
docker compose up -d postgres redis
```

然后启动前后端：

```bash
npm run dev
```

如需无数据库模式（仅风格库/测评功能）：

```bash
# .env 中设置 ENABLE_DB=false
npm run dev
```

</details>

### 访问地址

| 服务 | 地址 |
|------|------|
| Web 前端 | http://localhost:3000 |
| API 文档 (Swagger) | http://localhost:4000/api/docs |
| API 健康检查 | http://localhost:4000/api/v1/health |

## 常用命令

```bash
npm run build   # 构建 Web 和 API
npm run lint    # TypeScript 类型检查
npm test        # 运行当前单元测试
npm run dev     # 启动开发服务
python start.py # 一键启动（推荐）
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
