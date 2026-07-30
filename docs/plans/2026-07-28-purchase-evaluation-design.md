# "这件值得买吗" 买前判断功能设计

## 概述

在衣橱页面新增"这件值得买吗"功能入口，用户上传商品截图/淘宝图/小红书图/品牌商品图，AI 结合用户已有衣橱数据进行综合判断，给出购买建议。

## 架构

沿用现有模式：前端 → NestJS Controller → Service → AI Skill → LLM Factory

### 后端

#### 1. 新增 AI Skill: `PurchaseEvaluationSkill`

- 位置：`services/api/src/modules/ai-skills/purchase-evaluation/`
- 文件：
  - `purchase-evaluation.dto.ts` — 输入/输出 DTO
  - `purchase-evaluation.skill.ts` — Skill 实现（调用 LLM + 解析 JSON）
  - `prompts.ts` — System Prompt 构建

**输入 DTO：**
```ts
interface PurchaseEvaluationInput {
  imageBase64: string;          // 用户上传的商品图片
  wardrobeItems: WardrobeItem[]; // 用户衣橱单品列表
  userProfile?: {               // 用户画像（可选）
    bodyShape?: string;
    stylePreferences?: string[];
    dressingGoals?: string[];
  };
}
```

**输出 DTO（按需求）：**
```ts
interface PurchaseEvaluationResult {
  decision: 'buy' | 'consider' | 'skip';
  score: number;                // 0-100 综合评分
  reasons: string[];            // 判断理由
  matchedWardrobeItems: Array<{ id: string; name: string; reason: string }>;
  possibleOutfits: string[];    // 可搭出的穿搭描述
  duplicateRisk: 'low' | 'medium' | 'high';
  idleRisk: 'low' | 'medium' | 'high';
  betterColors: string[];       // 更推荐的颜色
  recommendedCategory?: string; // 更值得补充的品类
}
```

**System Prompt 要点：**
- 要求 AI 扮演专业穿搭顾问
- 分析商品图片（品类、颜色、风格、材质）
- 结合用户衣橱进行 9 项判断（风格适配/身材适配/重复风险/搭配可能性/可搭套数/颜色选择/闲置风险/不建议原因/品类补充建议）
- 返回结构化 JSON

#### 2. 新增 Controller 端点

- 位置：`recommendation.controller.ts`
- 端点：`POST /recommendations/purchase-evaluate`
- 请求体：`{ userId: string; imageBase64: string }`
- 限流：使用 `AiRateLimiter`
- 流程：
  1. 获取用户衣橱单品
  2. 获取用户画像（体型、风格偏好）
  3. 调用 `PurchaseEvaluationSkill`
  4. 返回结果

#### 3. AiSkillsModule 注册新 Skill

- 在 `ai-skills.module.ts` 中添加 `PurchaseEvaluationSkill`

### 前端

#### 1. 衣橱页面新增入口

在"今天穿什么"按钮下方添加一个类似风格的入口卡片：

```
┌──────────────────────────────────────────────┐
│  🤔  这件值得买吗？                            │
│  上传商品截图，AI 结合你的衣橱判断是否值得入手   │
│                                        →      │
└──────────────────────────────────────────────┘
```

#### 2. 新增 `PurchaseEvaluationDialog` 组件

- 位置：`apps/web/src/components/wardrobe/purchase-evaluation-dialog.tsx`
- 功能：
  - 上传图片（预览）
  - 调用后端 API
  - 展示结果（决策标签、评分、理由列表、搭配建议等）
  - 加载状态、错误处理

#### 3. 新增 API 调用函数

- 位置：`apps/web/src/lib/wardrobe-api.ts` 或新建 `purchase-api.ts`
- 函数：`evaluatePurchase(file: File): Promise<PurchaseEvaluationResult>`

#### 4. 新增前端类型定义

- 位置：`apps/web/src/lib/wardrobe-types.ts`
- 添加 `PurchaseEvaluationResult` 接口

## 数据流

```
用户上传图片
    ↓
前端 → POST /api/v1/recommendations/purchase-evaluate
    ↓
RecommendationController.purchaseEvaluate()
    ↓
RecommendationService.purchaseEvaluate()
    ├── 获取用户衣橱单品 (WardrobeService.getUserItems)
    ├── 获取用户画像 (UserService)
    └── 调用 PurchaseEvaluationSkill.evaluate()
            ↓
        LLMFactory.chat()  ← 自动选择视觉模型
            ↓
        解析 JSON → 返回 PurchaseEvaluationResult
    ↓
返回前端
    ↓
PurchaseEvaluationDialog 展示结果
```

## 结果展示 UI

- 顶部：决策标签（✅ 值得买 / 🤔 可以考虑 / ❌ 不建议买）+ 综合评分
- 理由列表（带图标）
- 重复/闲置风险指示器
- 推荐颜色对比
- 可搭配衣柜单品列表
- 可搭穿搭描述
- 品类补充建议
