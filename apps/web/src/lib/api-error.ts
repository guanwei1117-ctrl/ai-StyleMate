interface ErrorBody {
  message?: string | string[];
}

function normalizeServerMessage(message: ErrorBody['message']): string | null {
  if (Array.isArray(message)) return message.filter(Boolean).join('；') || null;
  return message || null;
}

export async function buildApiErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await response.json() as ErrorBody;
      const serverMessage = normalizeServerMessage(body.message);
      if (serverMessage) return serverMessage;
    }
  } catch {
  }

  if (response.status === 429) return 'AI 分析请求过于频繁，请稍后再试。';
  if (response.status === 408 || response.status === 504) return 'AI 分析超时，请稍后重试。';
  if (response.status === 413) return '图片或请求内容过大，请压缩图片后重试。';
  if (response.status >= 500) return 'AI 服务暂时不可用，请稍后重试。';

  return `${fallback}: ${response.status}`;
}
