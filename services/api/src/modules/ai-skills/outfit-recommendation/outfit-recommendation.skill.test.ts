/**
 * OutfitRecommendationSkill RAG 接线测试
 *
 * 验证目标（4 个核心断言）：
 * 1. recommend() / recommendStarter() 均会调用 RagService.augmentForRecommendation
 * 2. 检索到的知识会被注入到 LLM 的 system prompt
 * 3. 返回结果会带上 knowledgeUsed（可解释性）
 * 4. RagService 未注入（@Optional 降级）时功能不受影响
 *
 * 运行：npx tsx --test src/modules/ai-skills/outfit-recommendation/outfit-recommendation.skill.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OutfitRecommendationSkill } from './outfit-recommendation.skill';
import type { LLMFactory } from '../../llm/llm-factory';
import type { RagService } from '../../rag/rag.service';
import type {
  OutfitRecommendationInput,
  OutfitRecommendationResult,
} from './outfit-recommendation.dto';

// ============== Mocks ==============

interface MockRagService extends Pick<RagService, 'augmentForRecommendation' | 'augmentWithContext' | 'retrieve' | 'retrieveAndFormat'> {
  lastAugmentArgs: any;
  callCount: number;
}

function makeMockLLM(): LLMFactory & { lastSystemPrompt: string } {
  return {
    lastSystemPrompt: '',
    async chat(messages: any, _opts: any) {
      this.lastSystemPrompt = messages[0]?.content ?? '';
      return {
        content: JSON.stringify({
          plans: [
            {
              type: 'safe',
              title: '测试方案',
              hat: null,
              top: { itemId: 'item-1', category: 'top', description: '白色T恤' },
              bottom: { itemId: 'item-2', category: 'bottom', description: '黑色直筒裤' },
              outerwear: null,
              shoes: null,
              bag: null,
              accessory: null,
              reason: '通勤稳妥',
              scene: '办公室',
              riskWarning: '无',
              score: 85,
            },
            { type: 'flattering', title: 'f', hat: null, top: null, bottom: null, outerwear: null, shoes: null, bag: null, accessory: null, reason: 'r', scene: 's', riskWarning: '', score: 80 },
            { type: 'vibe', title: 'v', hat: null, top: null, bottom: null, outerwear: null, shoes: null, bag: null, accessory: null, reason: 'r', scene: 's', riskWarning: '', score: 78 },
          ],
        }),
        model: 'mock-model',
      };
    },
  } as any;
}

function makeMockRag(text: string, titles: string[]): MockRagService {
  return {
    lastAugmentArgs: null,
    callCount: 0,
    async augmentForRecommendation(ctx: any) {
      this.lastAugmentArgs = ctx;
      this.callCount++;
      return text;
    },
    async augmentWithContext() {
      return '';
    },
    async retrieve() {
      return [];
    },
    async retrieveAndFormat() {
      return '';
    },
  } as any;
}

// ============== Fixtures ==============

function baseInput(overrides: Partial<OutfitRecommendationInput> = {}): OutfitRecommendationInput {
  return {
    wardrobeItems: [
      {
        id: 'item-1',
        category: 'top',
        subCategory: 't-shirt',
        color: '白色',
        material: '棉',
        season: ['summer'],
        styleTags: ['极简'],
        occasionTags: ['通勤'],
        formalityScore: 3,
        warmthScore: 2,
        matchabilityScore: 80,
        matchColors: ['黑色'],
        matchCategories: ['bottom'],
      },
      {
        id: 'item-2',
        category: 'bottom',
        subCategory: 'pants',
        color: '黑色',
        material: '棉',
        season: ['all'],
        styleTags: ['极简'],
        occasionTags: ['通勤'],
        formalityScore: 4,
        warmthScore: 2,
        matchabilityScore: 85,
        matchColors: ['白色'],
        matchCategories: ['top'],
      },
    ],
    weather: {
      city: '上海',
      condition: '晴',
      temperature: 18,
      apparentTemperature: 16,
      windSpeed: 10,
      humidity: 60,
      isRaining: false,
    },
    occasion: '通勤',
    styleGoal: '专业',
    constraints: [],
    memoryContext: {
      snapshot: {
        summary: '',
        likedStyles: ['极简', '通勤风'],
        dislikedStyles: [],
        preferredColors: [],
        dislikedColors: [],
        dressGoals: [],
        bodyConcerns: [],
        avoidRules: [],
        currentIntent: null as any,
      },
    } as any,
    ...overrides,
  };
}

const KNOWLEDGE_TEXT = `## 参考知识（RAG 检索）
[1] 【通勤场合穿搭】建议选择简约单品，黑色系更显专业
[2] 【梨形身材搭配】高腰下装能拉长比例`;

// ============== Tests ==============

test('recommend(): RAG 真正被调用，参数正确（occasion/weather/styleTags）', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE_TEXT, ['通勤场合穿搭', '梨形身材搭配']);
  const skill = new OutfitRecommendationSkill(llm, rag as any);

  await skill.recommend(baseInput());

  assert.equal(rag.callCount, 1, 'RAG 应被调用 1 次');
  assert.equal(rag.lastAugmentArgs.occasion, '通勤', 'RAG 应收到 occasion=通勤');
  assert.ok(rag.lastAugmentArgs.weather.includes('18°C'), 'RAG 应收到温度');
  assert.deepEqual(rag.lastAugmentArgs.styleTags, ['极简', '通勤风'], 'RAG 应收到 likedStyles');
});

test('recommend(): 知识注入到 LLM 的 system prompt', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE_TEXT, ['通勤场合穿搭', '梨形身材搭配']);
  const skill = new OutfitRecommendationSkill(llm, rag as any);

  await skill.recommend(baseInput());

  const prompt = llm.lastSystemPrompt;
  // 用 mock 返回的唯一特征内容做断言（rulesSummary 不会含这些字）
  assert.ok(prompt.includes('黑色系更显专业'), 'prompt 应包含 RAG 检索到的具体知识内容');
  assert.ok(prompt.includes('高腰下装能拉长比例'), 'prompt 应包含第二条知识内容');
  assert.ok(prompt.includes('通勤场合穿搭'), 'prompt 应包含知识标题');
});

test('recommend(): 返回结果带 knowledgeUsed（可解释性）', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE_TEXT, ['通勤场合穿搭', '梨形身材搭配']);
  const skill = new OutfitRecommendationSkill(llm, rag as any);

  const result: OutfitRecommendationResult = await skill.recommend(baseInput());

  assert.deepEqual(result.knowledgeUsed, ['通勤场合穿搭', '梨形身材搭配']);
});

test('recommend(): 无证据短路（RAG 返回空）时 knowledgeUsed 不出现', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag('', []);
  const skill = new OutfitRecommendationSkill(llm, rag as any);

  const result = await skill.recommend(baseInput());

  assert.equal(rag.callCount, 1, 'RAG 仍被调用（短路发生在 RagService 内部）');
  assert.equal(result.knowledgeUsed, undefined, '无证据时 knowledgeUsed 不应出现');
  assert.ok(!llm.lastSystemPrompt.includes('黑色系更显专业'), '无证据时 prompt 不应注入具体知识内容');
  assert.equal(result.plans.length, 3, '主流程仍正常返回方案');
});

test('recommendStarter(): 空衣橱路径也调用 RAG 并注入知识', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE_TEXT, ['通勤场合穿搭', '梨形身材搭配']);
  const skill = new OutfitRecommendationSkill(llm, rag as any);

  const result = await skill.recommend(baseInput({ wardrobeItems: [] }));

  assert.equal(rag.callCount, 1, '起步方案也应调用 RAG');
  assert.ok(llm.lastSystemPrompt.includes('黑色系更显专业'), '起步方案 prompt 应注入 RAG 知识');
  assert.deepEqual(result.knowledgeUsed, ['通勤场合穿搭', '梨形身材搭配']);
  assert.equal(result.isStarter, true, 'isStarter 标记保留');
});

test('RAG 抛错时优雅降级：不影响推荐主流程', async () => {
  const llm = makeMockLLM();
  const rag: MockRagService = {
    lastAugmentArgs: null,
    callCount: 0,
    async augmentForRecommendation() {
      this.callCount++;
      throw new Error('pgvector 不可用');
    },
    async augmentWithContext() { return ''; },
    async retrieve() { return []; },
    async retrieveAndFormat() { return ''; },
  } as any;
  const skill = new OutfitRecommendationSkill(llm, rag as any);

  const result = await skill.recommend(baseInput());

  assert.equal(rag.callCount, 1, 'RAG 被尝试调用');
  assert.equal(result.knowledgeUsed, undefined, '降级时 knowledgeUsed 不出现');
  assert.equal(result.plans.length, 3, '降级时主流程仍正常返回 3 套方案');
  assert.ok(!llm.lastSystemPrompt.includes('黑色系更显专业'), '降级时 prompt 不含 RAG 知识内容');
});

test('@Optional 降级：RagService 未注入时功能完全正常', async () => {
  const llm = makeMockLLM();
  // 第二个参数（ragService）传 undefined，模拟 @Optional 未注入
  const skill = new OutfitRecommendationSkill(llm, undefined as any);

  const result = await skill.recommend(baseInput());

  assert.equal(result.plans.length, 3, '无 RAG 时仍能推荐');
  assert.equal(result.knowledgeUsed, undefined);
  assert.ok(!llm.lastSystemPrompt.includes('黑色系更显专业'), '@Optional 降级时 prompt 不含 RAG 内容');
});
