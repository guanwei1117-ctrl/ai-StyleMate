'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitSuggestion, type SuggestionCategory } from '@/lib/suggestion-api';

const CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  bug: '问题反馈',
  feature: '功能建议',
  other: '其他',
};

export function SuggestionFab() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SuggestionCategory>('other');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim()) {
      setError('请输入建议内容');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitSuggestion({ content: content.trim(), category });
      setDone(true);
      setContent('');
      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-primary-700"
        aria-label="提建议"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8 2 5 5 5 9c0 2.5 1.5 4.5 3 5.5V18h8v-3.5c1.5-1 3-3 3-5.5 0-4-3-7-7-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          {done ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-2xl">✓</div>
              <p className="text-sm text-gray-600">感谢你的建议！</p>
            </div>
          ) : (
            <>
              <h3 className="mb-3 text-base font-semibold text-gray-900">提建议</h3>

              <div className="mb-3 flex gap-2">
                {(Object.keys(CATEGORY_LABELS) as SuggestionCategory[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                      category === key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {CATEGORY_LABELS[key]}
                  </button>
                ))}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="说点什么吧... 你的想法对我们很重要"
                rows={4}
                className="mb-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />

              {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                size="sm"
              >
                {submitting ? '提交中...' : '提交'}
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
