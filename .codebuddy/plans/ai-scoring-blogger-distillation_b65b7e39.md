---
name: ai-scoring-blogger-distillation
overview: 构建 AI 穿搭自动评分系统（方案 A+D），蒸馏抖音博主「鱼仔不喝汤」的品味作为首个博主人格，支持用户上传穿搭照片后由 AI 按 8 个维度结构化评分，搭配 Claude 主引擎 + OpenAI fallback。
design:
  architecture:
    framework: react
  styleKeywords:
    - 极简米色
    - 专业分析感
    - 买手店氛围
    - 渐进数据可视化
  fontSystem:
    fontFamily: Playfair Display, Inter
    heading:
      size: 32px
      weight: 700
    subheading:
      size: 18px
      weight: 600
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - "#1a1a2e"
      - "#2d4a5c"
      - "#5a7d8c"
    background:
      - "#faf8f5"
      - "#ffffff"
      - "#f0ebe3"
    text:
      - "#1a1a2e"
      - "#5c5c5c"
      - "#8a8a8a"
    functional:
      - "#7a9e7e"
      - "#c4a35a"
      - "#c46564"
todos:
  - id: shared-types
    content: 新增共享评分类型：在 packages/shared/src/index.ts 中定义 BloggerPersona、ScoringDimension、EvaluateOutfitRequest/Response 等接口
    status: completed
  - id: blogger-persona
    content: 构建「鱼仔不喝汤」博主人格档案：在 services/api/src/modules/scoring/bloggers/ 下创建完整人格 JSON，含风格偏好、话术风格、维度权重
    status: completed
    dependencies:
      - shared-types
  - id: scoring-dimensions
    content: 定义 8 维评分标准：创建 scoring-dimensions.ts，每个维度定义 key/中文名/满分 rubric/评分指引
    status: completed
    dependencies:
      - shared-types
  - id: llm-providers
    content: 实现双 LLM Provider + Factory：ClaudeProvider + OpenAIProvider + LLMFactory（自动 fallback），含接口抽象和 30s 超时
    status: completed
  - id: scoring-service
    content: 实现 ScoringService 核心逻辑：构建 system prompt → 调 LLM → 解析 JSON 结果 → 校验归一化
    status: completed
    dependencies:
      - llm-providers
      - blogger-persona
      - scoring-dimensions
  - id: scoring-module
    content: 创建 Scoring 模块并注册到 AppModule：module + controller（POST /evaluate, GET /bloggers）+ DTO
    status: completed
    dependencies:
      - scoring-service
  - id: frontend-api-types
    content: 前端 API 层：scoring-api.ts 封装 evaluateOutfit 调用 + scoring-types.ts 前端类型
    status: completed
    dependencies:
      - shared-types
  - id: frontend-page
    content: 构建评分主页面 score-outfit/page.tsx：三态切换（上传→选博主→结果），整合各子组件，复用项目色系
    status: completed
    dependencies:
      - frontend-api-types
  - id: frontend-components
    content: 实现评分子组件：photo-upload（拖拽上传）、blogger-selector（博主卡片）、score-result（雷达图+维度卡片+改良建议）、dimension-card（渐进条）
    status: completed
    dependencies:
      - frontend-api-types
---

## 产品概述

为 CleanFit (StyleMate) 穿搭推荐平台新增 AI 自动评分系统。用户上传穿搭照片后，可选择抖音穿搭博主「鱼仔不喝汤」作为评分顾问，AI 像服装店服务员一样逐件分析穿搭、从 8 个维度进行结构化评分，并给出具体的改良建议。系统不展示总分，而是拆解每个维度的得分与专家点评，让用户看到"分析"而非"敷衍"。

## 核心功能

- **穿搭照片上传**：支持拖拽/点击上传穿搭照片，预览确认后提交分析
- **博主选择**：提供可扩展的博主人格列表，首期只有「鱼仔不喝汤」，后续可新增更多博主
- **8 维结构化评分**：比例与廓形、色彩协调、场合适配、风格一致性、潮流度、创意度、体型适配、实穿性，每维度 0-100 分 + 一句话点评
- **服务员式交互**：AI 开场打招呼、逐件分析穿搭单品、逐维度打分点评、给出改良建议、收尾总结
- **维度雷达图可视化**：8 维度结果以雷达图 + 卡片列表形式展示，直观呈现穿搭优劣势
- **双 LLM 容错**：主用 Anthropic Claude，Claude 不可用时自动 fallback 到 OpenAI

## 技术栈

- **后端框架**：NestJS + TypeScript（复用现有 services/api 项目）
- **前端框架**：Next.js 14 App Router + TypeScript（复用现有 apps/web 项目）
- **样式方案**：Tailwind CSS，复用项目 ink/creme 色系 + Playfair Display / Inter 字体
- **AI LLM**：Anthropic Claude API 为主，OpenAI API 为 fallback
- **数据存储**：PostgreSQL + TypeORM（复用现有）
- **文件上传**：NestJS multipart/file-upload 内置能力

## 实现方案

### 整体策略

新建独立 NestJS scoring 模块，不修改已有 recommendation/style-engine 模块，保持低耦合。评分核心逻辑完全在后端进行：接收照片 → 可选调用视觉模型分析穿搭 → 注入博主人格 system prompt → LLM 结构化评分 → 返回归一化结果。前端新建独立页面 `/score-outfit`，8 维结果用雷达图（Chart.js）可视化。

### 三层评分架构

```
请求进入 → Controller
              ↓
         ScoringService
              ↓
    ┌─────────┼─────────┐
    ↓         ↓          ↓
 照片分析   Prompt构建  LLM调用
 (预留)   (博主+维度)  (Claude→OpenAI)
```

1. **Prompt 构建层**：将博主人格档案 + 8 维度评分 rubric 组装为 system prompt
2. **LLM 调用层**：LLM Factory 先尝试 Claude，失败自动 fallback OpenAI
3. **结果解析层**：LLM 返回结构化 JSON → 校验 → 归一化 → 返回前端

### 8 维度评分 Rubric

每个维度定义在独立的 scoring-dimensions.ts 中，包含字段名、中文名、满分标准、评分指引，作为 system prompt 的一部分注入给 LLM，确保输出可预期。

### LLM Fallback 机制

Factory 模式：`LLMFactory` 维护两个 provider（ClaudeProvider、OpenAIProvider）。默认先调用 Claude，若抛出异常（网络超时/配额不足/5xx）则自动切换到 OpenAI。两种情况都失败才向上抛出异常。超时时间设定 30s。

### 博主人格系统

每位博主定义为 `BloggerPersona` 接口的一个 JSON 对象，存储在 `blogger-profiles.ts` 注册表中。添加新博主只需新增一个档案文件并注册，无需修改评分引擎代码。

### 性能与可靠性

- LLM 调用是性能瓶颈：设置 30s 超时，前端展示 loading 动画
- 结果缓存：暂时不做，保持每次评分新鲜
- 代码隔离：scoring 模块独立，不影响已有推荐/风格引擎功能
- prompt 输出强制 JSON 格式，解析失败有兜底错误处理

## 实现细节

### 目录结构

```
services/api/src/modules/scoring/
├── scoring.module.ts              # [NEW] NestJS 模块，导入 ConfigModule，注册 controller+service
├── scoring.controller.ts          # [NEW] POST /api/v1/scoring/evaluate，GET /api/v1/scoring/bloggers
├── scoring.service.ts             # [NEW] 核心：接收照片→调LLM打分→解析结果→返回
├── dto/
│   └── evaluate-outfit.dto.ts     # [NEW] EvaluateOutfitRequest + EvaluateOutfitResponse DTO
├── bloggers/
│   ├── blogger-profiles.ts        # [NEW] 博主注册表 + BloggerPersona 接口定义
│   └── yuzai-buhetang.ts          # [NEW] 「鱼仔不喝汤」完整人格档案
├── prompts/
│   ├── system-prompts.ts          # [NEW] 构建 system prompt：博主角色 + 评分任务 + 输出格式
│   └── scoring-dimensions.ts      # [NEW] 8 维度定义：字段名/中文名/评分标准/rubric
└── llm/
    ├── llm-provider.interface.ts  # [NEW] LLMProvider 抽象接口
    ├── claude.provider.ts         # [NEW] Anthropic Claude 实现
    ├── openai.provider.ts         # [NEW] OpenAI fallback 实现
    └── llm-factory.ts             # [NEW] LLM Factory：优先级 Claude → OpenAI，自动 fallback

apps/web/src/
├── app/
│   └── score-outfit/
│       └── page.tsx               # [NEW] 评分主页面：上传区→博主选择→结果展示，三态切换
├── components/
│   └── score-outfit/
│       ├── photo-upload.tsx       # [NEW] 照片上传组件：拖拽区+预览图+重新上传按钮
│       ├── blogger-selector.tsx   # [NEW] 博主选择组件：卡片列表，单选高亮
│       ├── score-result.tsx       # [NEW] 结果展示组件：开场白+雷达图+8维度卡片+改良建议
│       └── dimension-card.tsx     # [NEW] 单维度评分卡片：进度条+得分+点评文案
├── lib/
│   ├── scoring-api.ts             # [NEW] 前端 API 封装：evaluateOutfit()/getBloggers()
│   └── scoring-types.ts           # [NEW] 前端评分类型定义

packages/shared/src/
└── index.ts                        # [MODIFY] 新增评分相关类型定义
```

### 关键代码结构

```typescript
// BloggerPersona 接口
interface BloggerPersona {
  id: string;
  name: string;
  platform: string;
  styleSignature: string;
  toneProfile: {
    personality: string;
    greeting: string;
    praiseStyle: string;
    critiqueStyle: string;
    signaturePhrases: string[];
  };
  dimensionWeights: Record<string, number>;
  preferences: {
    lovedElements: string[];
    dislikedElements: string[];
    colorPalette: string[];
    keySilhouettes: string[];
  };
}

// LLMProvider 接口
interface LLMProvider {
  name: string;
  chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
}

// 8 维度定义
interface ScoringDimension {
  key: string;
  label: string;
  description: string;
  maxScore: number;
  rubric: string; // 满分标准描述
}

// API 请求/响应
interface EvaluateOutfitRequest {
  imageBase64: string;
  bloggerId: string;
  userContext?: { bodyShape?: string; gender?: string };
}

interface EvaluateOutfitResponse {
  bloggerName: string;
  greeting: string;
  overallComment: string;
  dimensions: DimensionScore[];
  itemComments: string[];
  improvements: string[];
}

interface DimensionScore {
  key: string;
  label: string;
  score: number; // 0-100
  comment: string;
}
```

### 寄存器 / AppModule 注册

在 `app.module.ts` 中新增 `ScoringModule` 导入。scoring 模块不依赖其他子模块（User/Wardrobe），只依赖 NestJS 内置 `ConfigModule` 读取 API Key。

### 日志

复用 NestJS Logger，LLM 调用记录耗时和 token 用量，评分异常记录完整错误上下文，不记录图片 base64 避免日志膨胀。

## 设计风格

延续 CleanFit 现有的极简米色系美学（ink/creme），页面采用居中单栏布局，整体氛围如同高端买手店的私人搭配顾问服务。评分结果使用雷达图 + 维度卡片双视图，蓝色系点缀（haze/olive）用于得分可视化，营造专业可信赖的分析感。

## 页面设计

### 评分主页面 — 三态切换

页面根据当前阶段展示三种视图：

**状态一：上传照片**

顶部标题"你的穿搭，AI 来评分"，副标题"上传一张穿搭照片，让博主帮你分析"。中央大尺寸虚线边框拖拽上传区（400×500px），支持拖拽或点击上传。上传后显示正方形裁剪预览图，底部"开始分析"按钮。整体居中、留白充足。

**状态二：选择博主**

标题"选择你的搭配顾问"。博主卡片横排居中展示，当前仅「鱼仔不喝汤」一个。每张卡片显示头像占位图 + 博主名 + 风格标签（街头/美式 drip）+ 一句话介绍。选中态 ink 深色边框。底部"开始评分"按钮。

**状态三：评分结果**

顶部 AI 开场白文字气泡（博主风格语气）。随后是 8 维度雷达图（Chart.js 渲染，haze-500 填充色）。下方 8 张维度卡片纵向排列，每张卡片含维度名、0-100 渐进度条（olive 绿色系）、一句点评。再下方"改良建议"列表（3-5条）。底部"重新评分"按钮。

## 技能

### writing-plans

- 用途：编写 AI 评分系统的详细实现计划，确保任务分解合理、技术方案完整
- 预期产出：包含任务依赖关系、文件路径、接口定义的完整实现计划

### brainstorming

- 用途：在设计博主人格档案和 8 维度评分 rubric 时进行创意发散，确保「鱼仔不喝汤」人格档案真实还原博主风格
- 预期产出：精准的博主人格参数和维度评分标准定义