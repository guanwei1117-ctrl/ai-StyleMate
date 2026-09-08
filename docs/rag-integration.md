# RAG 集成与可解释性 — 设计说明

> 本文档面向工程师与面试官，说明 StyleMate 中 RAG（检索增强生成）模块从"孤儿模块"到"业务接线 + 缓存 + 可解释性"的完整改造过程。

---

## 1. 背景与问题

RAG 模块（`services/api/src/modules/rag/`）**从项目初始就有完整实现**：

- 文本向量化：`EmbeddingService`（OpenAI `text-embedding-3-small` + 哈希降级）
- 向量检索：`RagRetrieverService`（pgvector cosine 距离 + LIKE 关键词降级）
- 知识库管理：`KnowledgeBaseService`（CRUD + 重新索引）
- 场景化组装：`RagService`（含 `augmentForRecommendation` / `augmentForOutfitScoring` / `augmentForStyleAnalysis` 三个场景化接口）
- 4 个知识领域种子：体型（body_type）/ 色彩理论（color_theory）/ 场合着装（occasion）/ 风格百科（style_encyclopedia）

**但有一个根本问题**：`RagModule` 从未被任何 `*.module.ts` `import`。整个 RAG 能力在 Nest DI 容器中**根本不存在**，更没有被任何业务调用过。

---

## 2. 改造方案

### 2.1 模块注册（修复"未加载"）

在 `app.module.ts` 的 `dbEnabled` 分支内注册 `RagModule`：

```ts
const { RagModule } = require('./modules/rag/rag.module');
// ...
dbModules.push(
  // ...
  RagModule,  // 依赖 TypeOrm 实体，仅在 DB 启用时加载
);
```

为什么放在 `dbEnabled` 分支：`RagModule` 依赖 `TypeOrmModule.forFeature([KnowledgeDocument, KnowledgeChunk])`，与项目"无 DB 也能启动"模式保持一致（`ENABLE_DB=false` 时 RAG 整体不加载）。

### 2.2 业务接线（修复"未调用"）

#### 第一个场景：`outfit-recommendation`（每日推荐）

- 构造函数注入 `@Optional() RagService`
- 新增 `retrieveKnowledge()` 私有方法
- 在 `recommend()` 与 `recommendStarter()` 两条路径中调用，把知识文本注入 system prompt
- 返回结果增加 `knowledgeUsed?: string[]` 字段（可解释性证据）

#### 第二个场景：`item-styling`（单品搭配）

复用 `RagService.augmentForOutfitScoring`（领域组合：body_type + occasion + color_theory + style_encyclopedia），因为这个组合**正好匹配"单品搭配"场景**。复用而非新写方法，避免领域重复。

---

## 3. 三层降级保护（核心设计）

为保证 RAG 接入**零风险**（不影响任何已稳定的调用方），每一处接线都包含三层保护：

```
┌─────────────────────────────────────────────┐
│  Layer 1: @Optional() 注入                  │
│  RagModule 未加载时 ragService = undefined   │
│  → Nest 不抛 "No provider" 错误              │
├─────────────────────────────────────────────┤
│  Layer 2: 短路（@Optional 失败 / 无证据）    │
│  if (!this.ragService) return { text:'', titles:[] } │
│  if (!text) return { text:'', titles:[] }   │
├─────────────────────────────────────────────┤
│  Layer 3: try/catch（DB / pgvector 异常）    │
│  catch → 降级为无知识推荐                    │
│  → 主流程 100% 正常返回                      │
└─────────────────────────────────────────────┘
```

每个 skill 都有完整测试覆盖三种场景：
1. 正常调用（mock 真实知识返回）
2. RAG 抛错（mock 抛 `Error`）
3. `@Optional` 降级（传 `undefined` 作为 ragService）

---

## 4. 文本缓存（性能优化）

`AiResponseCache` 是为"图片评分"设计的，key 形如 `SHA256(imageBase64 + context)`。**RAG 是文本检索场景**，硬塞文本 query 会污染 key 语义。

因此在 `RagService` 内部自带一个独立的轻量文本缓存：

| 维度 | 配置 |
|---|---|
| Key | `SHA256(query + JSON.stringify(options))` |
| TTL | 5 分钟（穿搭知识不像新闻，5 分钟内可重复用） |
| 上限 | 200 条 |
| 淘汰 | LRU（`Map` 保持插入顺序，删除后重新插入即更新为最新） |
| 空结果缓存 | ✅（"未命中"也是稳定结果，5 分钟内同样短路） |

**监控 API**：
- `RagService.clearCache()`：清除所有缓存（管理后台用）
- `RagService.cacheSize`：当前条目数（监控用）

---

## 5. 可解释性：knowledgeUsed 字段

后端 `OutfitRecommendationResult` 与 `ItemStylingResult` 都增加可选字段：

```ts
interface OutfitRecommendationResult {
  plans: OutfitRecommendationPlan[];
  // ...
  /** 本次推荐引用的 RAG 知识标题（可解释性，未命中为空数组） */
  knowledgeUsed?: string[];
}
```

**前端展示**：在 `apps/web/src/app/daily-recommend/page.tsx` 的推荐结果区顶部，新增 `KnowledgeUsedPanel` 组件（默认折叠，点击展开为 chip 列表）。空数组时组件 `return null`，不显示。

这样用户在看到 3 套推荐时，可以展开看到"AI 引用了 X 条专业知识"——**AI 建议"可追溯"，是产品信任的关键**。

---

## 6. 测试覆盖

`npm test` 一键跑全部，**78/78 全绿**（截至本轮改造完成）。

| 文件 | 用例数 | 覆盖内容 |
|---|---|---|
| `outfit-recommendation.skill.test.ts` | 7 | RAG 调用 / 知识注入 / knowledgeUsed / 短路 / 降级 / @Optional |
| `item-styling.skill.test.ts` | 6 | 同上（单品搭配场景） |
| `rag.service.test.ts` | 7 | 缓存命中 / 不命中 / options 变化 / 空结果缓存 / clearCache / 推荐场景 |

**核心不变式**（用 mock 隔离外部依赖，单测覆盖）：
- ✅ RAG 真正被调用（参数正确）
- ✅ 知识注入到 LLM system prompt
- ✅ knowledgeUsed 字段透传
- ✅ 无证据短路不影响主流程
- ✅ RAG 抛错不影响主流程
- ✅ @Optional 降级不影响主流程
