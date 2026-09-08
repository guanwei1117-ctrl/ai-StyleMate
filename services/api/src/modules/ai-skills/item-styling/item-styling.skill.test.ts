/**
 * ItemStylingSkill RAG 接线测试
 *
 * 验证 4 个核心不变式：
 * 1. style() 调用 RagService.augmentForOutfitScoring（参数含 occasion + 焦点单品 styleTags）
 * 2. 检索知识注入到 LLM system prompt
 * 3. 返回 knowledgeUsed
 * 4. RAG 失败 / 未注入时优雅降级
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ItemStylingSkill } from './item-styling.skill';
import type { LLMFactory } from '../../llm/llm-factory';
import type { RagService } from '../../rag/rag.service';
import type { ItemStylingInput, ItemStylingResult } from './item-styling.dto';

function makeMockLLM(): LLMFactory & { lastSystemPrompt: string } {
  return {
    lastSystemPrompt: '',
    async chat(messages: any) {
      this.lastSystemPrompt = messages[0]?.content ?? '';
      return {
        content: JSON.stringify({
          focusItemName: '白色T恤',
          note: '百搭基础款',
          plans: [
            { type: 'safe', title: 't1', top: null, bottom: null, reason: 'r', scene: 's', riskWarning: '', score: 80 },
            { type: 'flattering', title: 'f', top: null, bottom: null, reason: 'r', scene: 's', riskWarning: '', score: 78 },
            { type: 'vibe', title: 'v', top: null, bottom: null, reason: 'r', scene: 's', riskWarning: '', score: 75 },
          ],
        }),
        model: 'mock-model',
      };
    },
  } as any;
}

function makeMockRag(text: string) {
  const ctx: any = { lastArgs: null, callCount: 0 };
  return {
    get lastArgs() { return ctx.lastArgs; },
    get callCount() { return ctx.callCount; },
    service: {
      async augmentForOutfitScoring(args: any) {
        ctx.lastArgs = args;
        ctx.callCount++;
        return text;
      },
      async augmentWithContext() { return ''; },
      async retrieve() { return []; },
      async retrieveAndFormat() { return ''; },
    },
  };
}

function baseInput(overrides: Partial<ItemStylingInput> = {}): ItemStylingInput {
  return {
    focusItem: {
      id: 'focus-1',
      category: 'top',
      subCategory: 't-shirt',
      color: '白色',
      material: '棉',
      season: ['summer'],
      styleTags: ['极简', '基础'],
      occasionTags: ['通勤', '日常'],
      formalityScore: 3,
      warmthScore: 2,
      matchabilityScore: 90,
      matchColors: ['黑色', '牛仔蓝'],
      matchCategories: ['bottom', 'outerwear'],
    },
    wardrobeItems: [],
    occasion: '通勤',
    memoryContext: { snapshot: { likedStyles: ['极简'] } } as any,
    ...overrides,
  };
}

const KNOWLEDGE = '## 参考知识（RAG 检索）\n[1] 【白T搭配】搭配深色下装更显层次\n[2] 【通勤场合】简约单品显专业';

test('style(): RAG 真正被调用，参数含 occasion + 焦点单品 styleTags', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE);
  const skill = new ItemStylingSkill(llm, rag.service as any);

  await skill.style(baseInput());

  assert.equal(rag.callCount, 1);
  assert.equal(rag.lastArgs.occasion, '通勤');
  assert.deepEqual(rag.lastArgs.styleTags, ['极简', '基础'], '应优先用焦点单品 styleTags');
});

test('style(): 知识注入到 LLM system prompt', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE);
  const skill = new ItemStylingSkill(llm, rag.service as any);

  await skill.style(baseInput());

  assert.ok(llm.lastSystemPrompt.includes('深色下装更显层次'), '应注入 RAG 内容');
  assert.ok(llm.lastSystemPrompt.includes('简约单品显专业'), '应注入第二条');
  assert.ok(llm.lastSystemPrompt.includes('白T搭配'), '应注入知识标题');
});

test('style(): 返回 knowledgeUsed 字段', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag(KNOWLEDGE);
  const skill = new ItemStylingSkill(llm, rag.service as any);

  const result: ItemStylingResult = await skill.style(baseInput());

  assert.deepEqual(result.knowledgeUsed, ['白T搭配', '通勤场合']);
});

test('style(): RAG 抛错时优雅降级', async () => {
  const llm = makeMockLLM();
  const rag: any = {
    async augmentForOutfitScoring() { throw new Error('pg down'); },
    async augmentWithContext() { return ''; },
    async retrieve() { return []; },
    async retrieveAndFormat() { return ''; },
  };
  const skill = new ItemStylingSkill(llm, rag);

  const result = await skill.style(baseInput());

  assert.equal(result.knowledgeUsed, undefined, '降级时 knowledgeUsed 不出现');
  assert.equal(result.plans.length, 3, '降级时主流程仍正常');
  assert.ok(!llm.lastSystemPrompt.includes('深色下装'), '降级时 prompt 不含 RAG 内容');
});

test('style(): @Optional 降级（RagService 未注入）', async () => {
  const llm = makeMockLLM();
  const skill = new ItemStylingSkill(llm, undefined as any);

  const result = await skill.style(baseInput());

  assert.equal(result.plans.length, 3);
  assert.equal(result.knowledgeUsed, undefined);
  assert.ok(!llm.lastSystemPrompt.includes('深色下装'));
});

test('style(): 无证据短路（RAG 返回空）', async () => {
  const llm = makeMockLLM();
  const rag = makeMockRag('');
  const skill = new ItemStylingSkill(llm, rag.service as any);

  const result = await skill.style(baseInput());

  assert.equal(result.knowledgeUsed, undefined);
  assert.ok(!llm.lastSystemPrompt.includes('深色下装'));
  assert.equal(result.plans.length, 3);
});
