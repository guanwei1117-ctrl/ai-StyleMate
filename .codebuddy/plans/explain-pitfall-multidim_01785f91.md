---
name: explain-pitfall-multidim
overview: 在已完成的三支柱打分体系基础上，新增三大结果增强功能：推荐解释机制（自然语言解释体型/颜色/廓形推荐原因）、避雷建议（不适合的风格/廓形/颜色 + 替代方案）、多维评分结果（核心风格/次级风格/慎选风格 + 最佳版型/配色 + 场景风险提示），将产品从"工具"升级为"顾问"。
design:
  architecture:
    framework: react
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 13px
      weight: 400
  colorSystem:
    primary:
      - "#1A1A1A"
      - "#2D2D2D"
    background:
      - "#FAF8F3"
      - "#FFFFFF"
      - "#F0EBE0"
    text:
      - "#1A1A1A"
      - "#6B6B6B"
      - "#9CA3AF"
    functional:
      - "#1A1A1A"
      - "#F0EBE0"
      - "#E8D5C0"
      - "#A8C4A2"
todos:
  - id: explain-types
    content: 在 onboarding-types.ts 中新增 BodyExplain、AvoidanceAdvice、MultiDimensionScore 等输出类型定义
    status: completed
  - id: explain-engine
    content: 新建 style-explain.ts 解释引擎，实现体型解读生成、避雷建议生成、多维评分聚合三大功能
    status: completed
    dependencies:
      - explain-types
  - id: result-rebuild
    content: 重构 result-view.tsx，新增体型解读卡片、避雷专区、多维评分面板三个区块
    status: completed
    dependencies:
      - explain-engine
  - id: code-review
    content: 使用 [subagent:code-reviewer] 审查解释引擎规则完整性和结果页展示正确性
    status: completed
    dependencies:
      - result-rebuild
---

## 产品概述

在三支柱打分体系已完整落地的基座上，新增三层"顾问级"输出能力，将产品从"风格匹配工具"升级为"穿搭顾问"：自然语言解释机制让用户理解每一条推荐背后的体型/色彩/场景逻辑；避雷建议主动告知不适合的版型+雷区+替代方案；多维评分结果替代单一标签，输出核心风格/次级尝试/慎选风格+最佳版型/配色等结构化维度。

## 核心功能

### 1. 推荐解释机制（自然语言生成）

- **体型解释**：根据用户体型（梨形/苹果形/沙漏形/H形/倒三角），生成身体特征描述和适配原理，例如"你的肩线较平、下半身重心略明显，因此更适合强调上半身结构感、弱化胯部量感的搭配"
- **版型解释**：为什么推荐某些廓形（如高腰线、A字裙），为什么不建议其他廓形
- **配色解释**：基于肤色/年龄/场景，解释推荐的配色方向
- **气质描述**：根据年龄段和穿衣目标，生成匹配的气质定位文案

### 2. 避雷建议

- **体型雷区**：每种体型对应的雷区廓形+单品种类，附具体原因和替代方案
- **通用误区**：常见穿搭误区列表（如过长上衣压身高、过紧针织暴露短板、高饱和撞色显土）
- **预算雷区**：预算与实际风格难度不匹配时给出提示
- **替代方案**：每个雷区配1-2个替换建议，如"🔴 不建议过长上衣压身高 → 🟢 替换为短款外套或高腰内搭"

### 3. 多维评分结果

- **风格分层**：根据三支柱总分，将Top8风格分为核心风格（Top2，综合>75分）、次级可尝试（Top3-5）、慎选风格（Top6-8中低分项）
- **维度评分**：色彩适配度、廓形适配度、场景适配度，每项0-100 + 标签描述
- **最佳版型/配色**：从匹配结果中聚合推荐的最佳廓形列表和配色方向
- **风格风险提示**：对高分但有隐患的风格（预算不匹配、接受度低）标注风险

## 技术栈

- 前端逻辑层：TypeScript（规则引擎，纯前端计算）
- 修改范围：`style-matcher.ts`、`onboarding-types.ts`、`result-view.tsx`，新增 `style-explain.ts`
- 设计体系：复用现有 `ink-*` / `creme-*` 暖色调 Tailwind 色系

## 架构设计

### 新增文件与修改范围

```mermaid
graph TD
    A[OnboardingAnswers] --> B[style-matcher.ts<br/>匹配引擎-不改动]
    B --> C[StyleMatchResult[]]
    C --> D[style-explain.ts NEW<br/>解释引擎]
    A --> D
    D --> E1[体型描述+优势]
    D --> E2[避雷清单+替代方案]
    D --> E3[多维评分聚合]
    E1 --> F[result-view.tsx<br/>重构展示层]
    E2 --> F
    E3 --> F
    F --> G[解释卡片]
    F --> H[避雷专区]
    F --> I[多维评分面板]
```

### 模块划分

**新增模块 `style-explain.ts`（解释引擎）**：

- 输入：`StyleMatchResult[]`（匹配结果）+ `OnboardingAnswers`（用户答案）+ `BodyShape`（体型）
- 输出结构：
- `BodyExplain`：体型特征描述、版型推荐理由、配色建议、气质定位
- `AvoidanceAdvice[]`：雷区列表，含原因、替代方案
- `MultiDimensionScore`：核心/次级/慎选风格分组、色彩/廓形/场景适配度、最佳版型/配色聚合

**修改 `onboarding-types.ts`**：新增输出类型定义（BodyExplain、AvoidanceAdvice、MultiDimensionScore、color/category 键值类型）

**修改 `result-view.tsx`**：在画像卡片下方新增三个区块（解释+避雷+多维评分），每个区块采用卡片式布局

### 数据流

```
用户答题完成 → matchStyles() 得到 Top8 → style-explain.ts 分析体质+匹配结果
→ 生成 BodyExplain（体型解读）
→ 生成 AvoidanceAdvice[]（避雷建议）
→ 生成 MultiDimensionScore（多维评分）
→ result-view.tsx 分区块渲染
```

### 实现细节

**体型→自然语言映射策略**：

- 为每种体型预定义"体貌特征"+"优势"+"风险"描述模板
- 已有 BODY_SILHOUETTE_MAP 提供适配廓形列表，反向推导不适用廓形
- 版型推荐理由：从匹配结果中提取 top1 风格的 silhouette，与体型适配映射解释

**避雷建议生成策略**：

- 体型雷区：预定义每种体型对应的不适用廓形+单品+原因（复用 BODY_SILHOUETTE_MAP 反向映射）
- 通用误区：固定列表，根据用户性别过滤
- 预算雷区：对比用户预算与推荐风格难度，不匹配时生成
- 每条雷区附替代方案：从匹配结果中提取适配风格的关键单品

**多维评分聚合策略**：

- 风格分层：score >= 75 → 核心风格（2个），其余按分数分次级和慎选
- 色彩适配度：从匹配结果 SKIN_TONE_COLOR_MAP 匹配度推算
- 廓形适配度：从 matchBreakdown.bodyShape 归一化
- 场景适配度：从 matchBreakdown.scene 归一化
- 最佳版型/配色：从 Top3 风格中聚合最常见 silhouette + colorPalette

### 性能分析

- 解释引擎为纯规则计算，O(1) 复杂度——所有映射表预定义，运行时仅做查表和模板拼接
- 最多生成 ~15 条自然语言文本，内存无压力
- 不新增异步操作，不影响页面渲染

## 目录结构

```
cleanfit/
├── apps/web/src/lib/
│   ├── onboarding-types.ts    # [MODIFY] 新增 BodyExplain、AvoidanceAdvice、MultiDimensionScore 等输出类型定义
│   └── style-explain.ts       # [NEW] 解释引擎核心：体型解读生成、避雷建议生成、多维评分聚合
├── apps/web/src/components/onboarding/
│   └── result-view.tsx        # [MODIFY] 重构结果页：新增"体型解读""避雷专区""多维评分"三个区块，重组页面布局
```

## 关键代码结构

### 输出类型定义（onboarding-types.ts 新增）

```typescript
/** 身体特征描述 */
export interface BodyExplain {
  featureDesc: string;       // 体貌特征描述，如"肩线较平、下半身重心略明显"
  advantages: string[];       // 身材优势 2-3条
  silhouetteAdvice: string;   // 版型建议理由
  colorAdvice: string;        // 配色建议
  auraDescription: string;    // 气质定位描述
}

/** 避雷建议 */
export interface AvoidanceAdvice {
  category: 'silhouette' | 'item' | 'color' | 'budget' | 'general';
  warning: string;            // 雷区描述
  reason: string;             // 原因
  alternatives: string[];     // 替代方案 1-2条
}

/** 多维评分结果 */
export interface MultiDimensionScore {
  coreStyles: StyleMatchResult[];      // 核心风格 Top1-2
  secondaryStyles: StyleMatchResult[]; // 次级可尝试 Top3-5
  cautionStyles: StyleMatchResult[];   // 慎选风格 Top6-8
  colorScore: number;       // 色彩适配度 0-100
  silhouetteScore: number;  // 廓形适配度 0-100
  sceneScore: number;       // 场景适配度 0-100
  bestSilhouettes: string[];// 推荐最佳版型列表
  bestColors: string[];     // 推荐最佳配色列表
  riskFlags: string[];      // 风险提示
}
```

## 设计策略

在现有结果页三支柱画像卡片下方，新增三个顾问级区块。保持现有的 ink/creme 暖色调、圆角卡片、font-display 标题字体体系。

### 页面区块设计（结果页重构后从上到下）

1. **顶部摘要（保留）**：标题"你的穿搭风格分析" + 副标题
2. **用户画像卡片（保留）**：三支柱分组（审美/现实/偏好）
3. **体型解读卡片（NEW）**：顶部为自然语言体型描述（如"你肩线较平、下半身重心略明显"），下方分两列展示优势和适配原理，用小图标引导视觉
4. **多维评分面板（NEW）**：核心风格/次级可尝试/慎选风格三行分组，每行横向滑动卡片。右侧或下方配"色彩/廓形/场景"三根进度条，每根条附分数和标签
5. **避雷专区（NEW）**：醒目的警示色卡片（creme-200 背景 + ink-800 字体），每条雷区用"🔴 警告 → 🟢 替代方案"格式排列，最多5条
6. **最佳匹配卡片（保留+增强）**：原有三支柱汇总条 + 9维 MiniBar 保留，新增"为什么推荐"自然语言段落在推荐理由区
7. **更多推荐（保留）**：网格卡片，追加三支柱小点
8. **操作区（保留）**：去衣橱/浏览风格库/重新测试

### 设计风格

温润、可信赖的顾问感。体型解读用柔和的排版和分段，避雷区用 creme-200 背景区分于其他白底卡片，多维评分面板用清晰的分组标签和进度条传递专业感。字体复用 PingFang SC，字号层次清晰（标题24px、区域标题14px、正文13px）。

## 子代理

### code-reviewer

- **用途**：审查新增的 style-explain.ts 解释引擎中体型映射表完整性、避雷规则覆盖率、多维评分聚合逻辑的自洽性
- **预期结果**：确认所有5种体型均有完整的解释模板和避雷规则，多维评分计算公式正确，类型定义前后端对齐