/**
 * RagService 缓存测试
 *
 * 验证目标：
 * 1. 相同 (query, options) 第二次调用走 cache，retriever 不被调用
 * 2. 不同 query 不命中 cache
 * 3. 空结果也缓存
 * 4. options 变化不命中
 * 5. clearCache / cacheSize 监控 API
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RagService } from './rag.service';
import type { RagRetrieverService, RetrievedKnowledge } from './rag-retriever.service';

function makeMockRetriever(): RagRetrieverService & { callCount: number; lastQuery: string; lastOptions: any; returnEmpty: boolean } {
  const retriever: any = {
    callCount: 0,
    lastQuery: '',
    lastOptions: undefined,
    returnEmpty: false,
    async retrieve(query: string, options?: any): Promise<RetrievedKnowledge[]> {
      this.callCount++;
      this.lastQuery = query;
      this.lastOptions = options;
      if (this.returnEmpty) return [];
      return [
        {
          id: 'chunk-1',
          content: '通勤场合建议简约单品',
          title: '通勤穿搭',
          domain: 'occasion',
          similarity: 0.9,
          metadata: null,
        },
      ];
    },
  };
  return retriever;
}

test('augmentWithContext: 相同 query+options 第二次命中 cache', async () => {
  const retriever = makeMockRetriever();
  const service = new RagService(retriever);

  const r1 = await service.augmentWithContext('通勤穿搭', { domains: ['occasion'], topK: 3 });
  const r2 = await service.augmentWithContext('通勤穿搭', { domains: ['occasion'], topK: 3 });

  assert.equal(retriever.callCount, 1, 'retriever 应只被调用 1 次');
  assert.equal(r1, r2, '两次返回应完全相同');
  assert.ok(r1.includes('通勤穿搭'), '应包含检索到的知识标题');
  assert.equal(service.cacheSize, 1, 'cache 应有 1 条');
});

test('augmentWithContext: 不同 query 不命中 cache', async () => {
  const retriever = makeMockRetriever();
  const service = new RagService(retriever);

  await service.augmentWithContext('通勤穿搭', { domains: ['occasion'] });
  await service.augmentWithContext('约会穿搭', { domains: ['occasion'] });

  assert.equal(retriever.callCount, 2);
  assert.equal(service.cacheSize, 2);
});

test('augmentWithContext: options 变化（即使 query 相同）也不命中', async () => {
  const retriever = makeMockRetriever();
  const service = new RagService(retriever);

  await service.augmentWithContext('通勤穿搭', { domains: ['occasion'] });
  await service.augmentWithContext('通勤穿搭', { domains: ['body_type'] });

  assert.equal(retriever.callCount, 2);
  assert.equal(service.cacheSize, 2);
});

test('augmentWithContext: 空结果也被缓存（短路稳定结果）', async () => {
  const retriever = makeMockRetriever();
  retriever.returnEmpty = true;
  const service = new RagService(retriever);

  const r1 = await service.augmentWithContext('不存在的查询', { domains: ['occasion'] });
  const r2 = await service.augmentWithContext('不存在的查询', { domains: ['occasion'] });

  assert.equal(retriever.callCount, 1, '空结果也应缓存');
  assert.equal(r1, '');
  assert.equal(r2, '');
  assert.equal(service.cacheSize, 1);
});

test('augmentForRecommendation: 相同 context 第二次命中 cache', async () => {
  const retriever = makeMockRetriever();
  retriever.returnEmpty = true;
  const service = new RagService(retriever);

  const ctx = { occasion: '通勤', weather: '18°C 晴', styleTags: ['极简'] };
  const r1 = await service.augmentForRecommendation(ctx);
  const afterFirst = retriever.callCount;
  assert.ok(afterFirst > 0, '第一次调用应至少触发一次 retriever.retrieve');

  const r2 = await service.augmentForRecommendation(ctx);
  assert.equal(retriever.callCount, afterFirst, '第二次同 context 命中 cache，callCount 不再增加');
  assert.equal(r1, r2);
});

test('augmentForRecommendation: 不同 context 不命中 cache', async () => {
  const retriever = makeMockRetriever();
  retriever.returnEmpty = true;
  const service = new RagService(retriever);

  await service.augmentForRecommendation({ occasion: '通勤', weather: '18°C 晴', styleTags: ['极简'] });
  const afterFirst = retriever.callCount;
  await service.augmentForRecommendation({ occasion: '约会', weather: '20°C 晴', styleTags: ['浪漫'] });
  assert.ok(retriever.callCount > afterFirst, '不同 context 应重新检索');
  assert.equal(service.cacheSize, 2, 'cache 应有 2 条不同 key');
});

test('clearCache: 清除后重新检索', async () => {
  const retriever = makeMockRetriever();
  const service = new RagService(retriever);

  await service.augmentWithContext('通勤穿搭', { domains: ['occasion'] });
  assert.equal(service.cacheSize, 1);

  service.clearCache();
  assert.equal(service.cacheSize, 0, 'clearCache 后应清空');

  await service.augmentWithContext('通勤穿搭', { domains: ['occasion'] });
  assert.equal(retriever.callCount, 2, '清空后应重新检索');
});
