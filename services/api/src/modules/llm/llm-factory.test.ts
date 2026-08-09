import assert from 'node:assert/strict';
import test from 'node:test';
import { LLMFactory } from './llm-factory';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

/** Creates a mock LLMProvider for testing */
function mockProvider(
  name: string,
  supportsVision: boolean,
  available: boolean,
  response?: LLMResponse,
  shouldError?: boolean,
): LLMProvider {
  return {
    name,
    supportsVision,
    chat: async (_messages: ChatMessage[], _options?: LLMOptions): Promise<LLMResponse> => {
      if (shouldError) throw new Error(`${name} simulated failure`);
      return response ?? { content: `response from ${name}`, model: name };
    },
    isAvailable: async () => available,
  };
}

/** Creates a mock LLMFactory injecting custom providers (bypasses constructor DI) */
function createFactory(providers: LLMProvider[]): LLMFactory {
  const factory = Object.create(LLMFactory.prototype) as LLMFactory;
  // Access the private field via prototype assignment
  (factory as any).allProviders = providers;
  (factory as any).logger = { log: () => {}, warn: () => {}, error: () => {} };
  return factory;
}

test('returns result from first available provider when no images', async () => {
  const p1 = mockProvider('p1', false, true, { content: 'first', model: 'p1' });
  const p2 = mockProvider('p2', false, true, { content: 'second', model: 'p2' });

  const factory = createFactory([p1, p2]);
  const result = await factory.chat([{ role: 'user', content: 'hello' }]);

  assert.equal(result.content, 'first');
  assert.equal(result.model, 'p1');
});

test('falls back to next provider when first fails', async () => {
  const p1 = mockProvider('p1', false, true, undefined, true); // will error
  const p2 = mockProvider('p2', false, true, { content: 'fallback', model: 'p2' });

  const factory = createFactory([p1, p2]);
  const result = await factory.chat([{ role: 'user', content: 'hello' }]);

  assert.equal(result.content, 'fallback');
  assert.equal(result.model, 'p2');
});

test('skips unavailable providers', async () => {
  const p1 = mockProvider('p1', false, false); // unavailable
  const p2 = mockProvider('p2', false, true, { content: 'available', model: 'p2' });

  const factory = createFactory([p1, p2]);
  const result = await factory.chat([{ role: 'user', content: 'hello' }]);

  assert.equal(result.model, 'p2');
});

test('filters out non-vision providers when messages contain images', async () => {
  const noVision = mockProvider('no-vision', false, true, { content: 'text-only', model: 'no-vision' });
  const vision = mockProvider('vision', true, true, { content: 'vision-result', model: 'vision' });

  const factory = createFactory([noVision, vision]);
  const result = await factory.chat([
    { role: 'user', content: 'analyze', imageBase64: 'fake-base64' },
  ]);

  assert.equal(result.model, 'vision');
});

test('throws when all providers fail', async () => {
  const p1 = mockProvider('p1', false, true, undefined, true);
  const p2 = mockProvider('p2', false, true, undefined, true);

  const factory = createFactory([p1, p2]);

  await assert.rejects(
    () => factory.chat([{ role: 'user', content: 'hello' }]),
    /所有 LLM Provider 均不可用/,
  );
});

test('throws when no vision-capable providers configured for image request', async () => {
  const noVision = mockProvider('no-vision', false, true);

  const factory = createFactory([noVision]);

  await assert.rejects(
    () => factory.chat([{ role: 'user', content: 'hi', imageBase64: 'fake' }]),
    /没有可用的 Provider/,
  );
});

test('getAvailableProviders returns names of available providers', async () => {
  const p1 = mockProvider('available-a', false, true);
  const p2 = mockProvider('unavailable', false, false);
  const p3 = mockProvider('available-b', false, true);

  const factory = createFactory([p1, p2, p3]);
  const available = await factory.getAvailableProviders();

  assert.deepEqual(available, ['available-a', 'available-b']);
});
