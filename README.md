<div align="center">
  <br/>
  <img src="apps/web/public/images/home/image.png" alt="StyleMate" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12);"/>
  <br/>
  <h1>StyleMate · AI 穿搭助手</h1>
  <p>
    <strong>从风格灵感、个人测评到每日穿搭，帮你完成从买到穿的无痛闭环</strong>
  </p>
  <p>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14"/>
    </a>
    <a href="https://nestjs.com/">
      <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS 10"/>
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript" alt="TypeScript"/>
    </a>
    <a href="https://turbo.build/">
      <img src="https://img.shields.io/badge/Monorepo-Turborepo-8B5CF6?logo=turborepo" alt="Turborepo"/>
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS"/>
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
    </a>
    <br/>
    <img src="https://img.shields.io/github/stars/guanwei1117-ctrl/cleanfit?style=social" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/guanwei1117-ctrl/cleanfit?style=social" alt="GitHub forks"/>
    <img src="https://img.shields.io/github/watchers/guanwei1117-ctrl/cleanfit?style=social" alt="GitHub watchers"/>
  </p>
  <br/>
</div>

## 💡 这个项目能做什么？

早上站在衣柜前，还是不知道穿什么？买了不少衣服，真正常穿的却只有那几件？

**StyleMate 是一个 AI 穿搭助手，把「发现风格 → 测出画像 → 评估穿搭 → 管理衣橱 → 每天穿什么」串成一个闭环。**

它不只是"推荐衣服"：先弄清**你适合什么**（骨相 / 量感 / 体型 / 肤色 / 气质五维画像），再叠加**你的现实约束**（预算 / 场景 / 气候）与**行为偏好**，最后落到一件件真实单品上——因为「适合」并不等于「会穿」。

---

## ✨ 特性一览

<table>
<tr>
<td width="33%">

### 🎨 80 风格库
按 4 大维度（地域文化 / 视觉元素 / 场景圈层 / 人物原型）组织的 80 种风格档案：核心单品 / 廓形规则 / 颜色体系 / 季节穿搭 / 身材适配 / 相关风格 / 穿搭灵感

</td>
<td width="33%">

### 🤖 AI 风格测评
对话式深度测评，3 步生成专属风格画像，从 80 种风格中匹配 Top 3

</td>
<td width="33%">

### 📸 穿搭打分
上传穿搭照片，AI 从 8 个维度评分 + 改良建议 + 衣橱替换方案

</td>
</tr>
<tr>
<td width="33%">

### 👔 智能衣橱
拍照自动识别品类 / 颜色 / 材质 / 风格，AI 帮你搭、帮你分析缺口

</td>
<td width="33%">

### 👗 OOTD 社区
上传你的同款穿搭，互相欣赏参考；每个真实穿搭都让风格库更鲜活

</td>
<td width="33%">

### ☀️ 每日穿搭
结合实时天气 + 你的衣橱 + 风格记忆，AI 每天为你生成 3 套穿搭方案

</td>
</tr>
</table>

---

## 🔍 设计亮点

- **多模型自动降级** — DeepSeek / Qwen-VL / OpenAI / Claude 按可用性与优先级自动切换，带图请求自动跳过纯文本模型，单个服务商抖动不影响体验。
- **RAG 可解释** — 体型 / 色彩 / 场合 / 风格百科等知识经 pgvector 检索后注入 prompt，结果附带 `knowledgeUsed` 作为证据；向量库不可用时自动降级为关键词检索。
- **五维风格 DNA** — 骨相 / 量感 / 体型 / 肤色 / 气质五维给 80 种风格打分，再叠加「现实约束 + 行为偏好」，避免"好看但不常穿"的推荐。
- **衣橱前置过滤** — 推荐前把大件数衣橱压缩到 20 件候选，兼顾准确率与 token 成本。
- **无数据库也能跑** — 设置 `ENABLE_DB=false` 即可脱离 PostgreSQL 启动，方便前端独立开发。

---

## 🛠 技术栈

| 层 | 技术选型 |
|---|---|
| 前端 | Next.js 14（App Router）· React 18 · TypeScript · Tailwind CSS · Radix UI · Zustand · TanStack Query · Framer Motion · Recharts |
| 后端 | NestJS 10 · TypeORM · PostgreSQL 16 · Redis 7 · Swagger |
| AI | Claude · GPT-4o · DeepSeek · 通义千问 Qwen-VL（多模态）· RAG（pgvector） |
| 工程化 | Turborepo · npm workspaces · Docker Compose · Prettier |

---

## 🏗 项目结构

```
cleanfit/
├── apps/web/                 # Next.js 前端：营销页 / 测评 / 风格库 / 衣橱 / 评分 / OOTD / 记忆
├── services/api/             # NestJS 后端 API
│   └── src/modules/
│       ├── ai-skills/        # 7 个可复用 AI 能力（识别 / 搭配 / 推荐 / 评估 / 缺口分析）
│       ├── llm/              # 多 provider 工厂 + 自动 fallback
│       ├── rag/              # 知识库检索增强（pgvector + 缓存）
│       ├── scoring/          # 穿搭 8 维评分
│       ├── memory/           # 长期记忆：风格画像 / 当前意图 / 反馈
│       ├── wardrobe/         # 衣橱与搭配
│       ├── recommendation/   # 每日推荐
│       ├── ootd/             # OOTD 社区
│       └── shopping/         # 电商导购
├── packages/shared/          # 前后端共享类型（风格体系 / 用户画像 / 评分）
├── docs/                     # 设计文档：RAG 集成 / 部署指南 / 产品路线图
├── start.py                  # 一键启动脚本
└── docker-compose.yml        # PostgreSQL + Redis + Qdrant
```

---

## 🚀 快速开始

**前置条件：** [Docker Desktop](https://www.docker.com/products/docker-desktop/) · [Node.js](https://nodejs.org/) ≥ 18 · [Python](https://python.org/) ≥ 3.8

```bash
# 1. 安装依赖
npm install

# 2. 一键启动（自动拉起数据库 + 前后端）
python start.py
```

启动后访问：

| 服务 | 地址 |
|------|------|
| Web 前端 | http://localhost:3000 |
| API 文档 | http://localhost:4000/api/docs |

<details>
<summary><strong>🖥️ 手动启动（点击展开）</strong></summary>

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

AI 相关变量按需配置（至少一个即可）：

```env
ANTHROPIC_API_KEY=sk-ant-xxx      # Claude（推荐）
DASHSCOPE_API_KEY=sk-xxx          # 阿里云通义千问
OPENAI_API_KEY=sk-xxx             # OpenAI
```

数据库、Redis、JWT、OSS 等变量见 [`.env.example`](.env.example)。

### 3. 启动数据库

```bash
docker compose up -d postgres redis
```

### 4. 启动开发服务

```bash
npm run dev
```

> 无需数据库模式：在 `.env` 中设置 `ENABLE_DB=false` 即可。

</details>

---

## 🤝 贡献指南

欢迎贡献！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交变更：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

<div align="center">
  <br/>
  <h3>👋 关于作者</h3>
  <p>
    我是一名在校学生，这个项目是我利用课余时间独立开发的。<br/>
    目前还在不断完善中，如果你有任何建议或发现了问题，欢迎提 <a href="https://github.com/guanwei1117-ctrl/cleanfit/issues">Issue</a> 或直接联系我！
  </p>
  <p>
    如果 StyleMate 对你有帮助，请点击右上角 ⭐ <strong>Star</strong> 支持我，<br/>
    你的每一个 Star 都是我继续前进的动力 🙏
  </p>
  <br/>
  <sub>
    <a href="https://github.com/guanwei1117-ctrl/cleanfit/issues">报告 Bug</a>
    ·
    <a href="https://github.com/guanwei1117-ctrl/cleanfit/issues">功能建议</a>
  </sub>
</div>
