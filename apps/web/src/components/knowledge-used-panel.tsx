'use client';

import { useState } from 'react';

interface KnowledgeUsedPanelProps {
  /** RAG 检索命中的知识标题列表（来自后端 knowledgeUsed 字段） */
  titles: string[];
}

/**
 * AI 推荐依据面板（可解释性）
 *
 * 设计动机：
 * - 用户看到 3 套推荐时，最大的疑问是"AI 凭什么这么说"
 * - 展示 RAG 检索到的专业知识标题，让推荐"可追溯"
 * - 默认折叠：不打扰主流程；用户主动展开时一目了然
 *
 * 安全降级：titles 为空数组时不渲染（避免显示空面板）。
 */
export function KnowledgeUsedPanel({ titles }: KnowledgeUsedPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!titles || titles.length === 0) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📚</span>
          <span className="text-sm font-medium text-ink/80">
            AI 引用了 {titles.length} 条专业知识
          </span>
        </div>
        <span className="text-xs text-ink/50">{expanded ? '收起' : '展开'}</span>
      </button>

      {expanded && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {titles.map((t, i) => (
            <li
              key={`${t}-${i}`}
              className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/70"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
