# AI 衣橱助理 Phase 1 设计文档

日期：2026-07-23
分支：ai-style-profile-upload

## 目标

将项目从"上传图片调 AI 评分"工具，升级为"AI 私人衣橱助理"的第一阶段：数据层 + 衣柜核心。

## 本次范围（Phase 1）

1. 改造现有 AI 图片分析接口，返回结构化 JSON（items / body_suggestions / style_tags / problems / improvements）。
2. 新增 AI 衣物识别能力：上传单件衣服图片，AI 自动识别品类、颜色、材质、风格、季节、厚薄、正式程度、百搭程度等，写入数据库。
3. 新增"我的衣柜"页面：上传识别 + 网格展示 + 分类筛选。
4. 新增"单品详情"页面：标签展示 + 编辑 + "帮我搭这件"占位入口。
5. AI 能力拆成独立 skill 模块（garment-recognition-skill / structured-outfit-skill）。
6. 启用 DB 持久化，默认开启 ENABLE_DB。

不在本次范围（Phase 2+）：今天穿什么推荐、买前判断、单品拯救实装、衣柜缺口分析、用户反馈偏好记忆、MCP。

## 架构变更

### 后端模块结构

```
services/api/src/modules/
  ai-skills/                      # 新增：独立 AI 能力模块
    shared/
      llm-provider.constants.ts   # LLMFactory 导入路径常量
    garment-recognition/
      garment-recognition.skill.ts
      garment-recognition.dto.ts
      prompts.ts
    structured-outfit/
      structured-outfit.skill.ts
      structured-outfit.dto.ts
      prompts.ts
    ai-skills.module.ts
  scoring/                        # 改造：evaluate 调用 structured-outfit skill
  wardrobe/                       # 改造：新增 recognize 接口，调用 garment-recognition skill
```

### LLMFactory 共享问题

当前 LLMFactory 在 scoring.module 内声明。ai-skills 需要复用。
方案：将 LLMFactory 及 4 个 provider 的注册提取到一个新的 `LlmModule`（providers + exports），scoring.module 和 ai-skills.module 都 import 它。这样避免循环依赖，且不破坏现有 scoring 调用。

### WardrobeItem 实体扩展

现有字段保留，新增：

```ts
styleTags: string[]         // simple-array
occasionTags: string[]      // simple-array, 适合场合
formalityScore: number      // 1-5 正式程度
warmthScore: number         // 1-5 厚薄/保暖
matchabilityScore: number   // 1-10 百搭程度
lastWornAt: Date | null
aiSummary: string           // AI 生成的一句话描述
```

### AI 结构化穿搭分析返回格式

`POST /scoring/evaluate` 在现有 EvaluateOutfitResponse 基础上新增 `structured` 字段：

```ts
interface StructuredOutfitAnalysis {
  items: Array<{
    type: 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory';
    name: string;
    color: string;
    style: string[];
    season: string[];
    formality: number;       // 1-5
    matchability: number;    // 1-10
  }>;
  body_suggestions: string[];
  style_tags: string[];
  problems: string[];
  improvements: string[];
}
```

保持向后兼容：原有 dimensions/itemComments/improvements 字段保留。

### 衣物识别返回格式

`POST /wardrobe/items/recognize` 请求 `{ imageBase64, userId }`，返回：

```ts
interface GarmentRecognitionResult {
  category: string;
  subCategory: string;
  color: string;
  colorHex: string;
  pattern: string;
  material: string;
  season: string[];
  styleTags: string[];
  occasionTags: string[];
  formalityScore: number;    // 1-5
  warmthScore: number;       // 1-5
  matchabilityScore: number; // 1-10
  aiSummary: string;
}
```

调用方（前端）拿到结果后调 `POST /wardrobe/items` 持久化，或 recognize 接口直接落库（本方案选直接落库，返回创建好的 WardrobeItem）。

## 前端变更

### 新增文件
- `apps/web/src/lib/wardrobe-api.ts` — 衣柜 API 客户端
- `apps/web/src/lib/wardrobe-types.ts` — 类型定义
- `apps/web/src/app/wardrobe/items/[id]/page.tsx` — 单品详情页
- `apps/web/src/components/wardrobe/` — 衣柜相关组件（上传、网格、标签等）

### 改造文件
- `apps/web/src/app/wardrobe/page.tsx` — 从空状态占位改为可用页面
- `apps/web/src/components/home/navigation.tsx` — 衣橱入口已存在，保持

### userId 处理
当前无登录系统。沿用现有 onboarding 的 localStorage 方案：前端生成/读取一个本地 userId 存 localStorage，所有衣柜请求带上。后端不做鉴权，userId 由前端传入。

## DB 启用策略

`app.module.ts` 当前 `ENABLE_DB !== 'true'` 时跳过 DB 模块。本次：
- 在 `.env` 设置 `ENABLE_DB=true`（如果用户本地无 PG，需自行启动）。
- 保留守卫逻辑，但将 wardrobe/scoring 新增的 AI skill 调用不依赖 DB（skill 本身只调 LLM），落库逻辑在 service 层。DB 不可用时 recognize 接口返回 AI 结果但不落库，给出 warning。

## 风险
- 本地无 PostgreSQL 时衣柜数据无法持久化 → 提供 docker-compose.yml 已有，提示用户启动。
- LLM provider 需配置 API key → 沿用现有 .env 配置。
