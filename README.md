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
    <br/>
    <img src="https://img.shields.io/github/stars/guanwei1117-ctrl/cleanfit?style=social" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/guanwei1117-ctrl/cleanfit?style=social" alt="GitHub forks"/>
    <img src="https://img.shields.io/github/watchers/guanwei1117-ctrl/cleanfit?style=social" alt="GitHub watchers"/>
  </p>
  <br/>
</div>

## 💡 这个项目能做什么？

每天出门前站在衣柜前纠结穿什么——这是很多人的日常。

**StyleMate 就是为解决这个问题而生的。** 它是一个 AI 驱动的穿搭助手，能帮你：

- **找到你的风格** — 通过 AI 对话式测评，3 步生成专属风格画像，不再盲目跟风买衣服
- **诊断你的穿搭** — 上传穿搭照片，AI 从色彩、比例、场合适配等 8 个维度评分并给出改良建议
- **每天告诉你穿什么** — 结合实时天气、你的衣橱和风格偏好，每天自动生成 3 套穿搭方案
- **管理你的衣橱** — 拍照自动识别衣物品类/颜色/材质，AI 帮你分析衣橱缺口
- **一键比价购物** — 发现缺什么衣服，直接加入购物清单，支持淘宝/京东/拼多多多平台比价

简单说：**不知道自己适合什么风格 → 帮你测；不知道怎么搭 → 帮你评；每天不知道穿什么 → 帮你配。**

---

## ✨ 特性一览

<table>
<tr>
<td width="33%">

### 🎯 风格测评
三步完成风格画像：填基础信息 → AI 对话式深度了解 → 生成 80 种风格档案

</td>
<td width="33%">

### 📸 穿搭诊断
上传穿搭照片，AI 从 8 个维度评分 + 改良建议 + 衣橱替换方案

</td>
<td width="33%">

### 🌤️ 每日穿搭
结合实时天气、衣橱和风格记忆，AI 每天为你生成 3 套穿搭方案

</td>
</tr>
<tr>
<td width="33%">

### 👔 智能衣橱
拍照自动识别品类/颜色/材质/风格，AI 帮你搭、帮你分析缺口

</td>
<td width="33%">

### 🛒 购物清单
缺口分析 → 一键加入购物清单 → 多平台比价（淘宝/京东/拼多多）

</td>
<td width="33%">

### 🧠 记忆系统
长期画像 + 行为反馈 + 当前意图，AI 越来越懂你的风格偏好

</td>
</tr>
</table>

---

## 🎬 核心功能展示

### 🎯 风格测评 — 三步找到你的风格

```
Step 1: 基础信息     →    Step 2: AI 对话     →    Step 3: 风格档案
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ 性别 / 身高   │        │ AI 逐步了解    │        │ 80 种风格     │
│ 体重 / 职业   │ ────→  │ 风格偏好 / 雷区 │ ────→  │ 匹配 Top 3    │
│ 城市 / 场景   │        │ 预算 / 舒适度  │        │ 详细报告      │
└──────────────┘        └──────────────┘        └──────────────┘
```

### 📸 穿搭诊断 — 8 维 AI 评分

| 维度 | 说明 |
|------|------|
| 🎨 **色彩搭配** | 整体配色协调性分析 |
| 📐 **比例廓形** | 上下身比例、服装廓形匹配度 |
| 🏷️ **风格一致性** | 单品风格是否统一 |
| 👔 **单品匹配** | 各单品之间的搭配度 |
| 🌟 **场合适配** | 是否符合目标场景 |
| 🔄 **衣橱替换** | 问题单品 → 衣橱可替换选择 |
| 📊 **综合评分** | 整体穿搭评分 |
| 💡 **改良建议** | 具体可执行的改进方向 |

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

> 详细启动说明见下方 [📖 使用指南](#-使用指南)

---

## 📖 使用指南

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

## 🧪 测试

```bash
npm test          # 运行所有测试
npm run lint      # TypeScript 类型检查
npm run build     # 生产构建
```

---

## 🤝 贡献指南

欢迎贡献！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交变更：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

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