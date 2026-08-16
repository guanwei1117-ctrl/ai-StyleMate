'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Loader2, UserRound, ArrowRight, RefreshCw } from 'lucide-react';
import { chatWithStylist, type StyleChatBasicInfo, type StyleChatTurn, type StyleChatResult } from '@/lib/style-chat-api';
import type { OnboardingAnswers } from '@/lib/onboarding-types';
import { AGE_GROUP_LABELS, OCCUPATION_LABELS } from '@/lib/onboarding-types';

interface ChatStepProps {
  answers: OnboardingAnswers;
  /** 对话结束（AI 总结出画像）后，携带总结的自述交给父级生成结果 */
  onFinalize: (statement: string) => void;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

/** 从 OnboardingAnswers 构建对话用的基础信息 */
function buildBasicInfo(answers: OnboardingAnswers): StyleChatBasicInfo {
  return {
    gender:
      answers.gender === 'female' ? '女性' : answers.gender === 'male' ? '男性' : answers.gender === 'other' ? '不限定性别表达' : undefined,
    height: answers.height,
    weight: answers.weight,
    ageGroup: answers.ageGroup ? AGE_GROUP_LABELS[answers.ageGroup] : null,
    occupation: answers.occupation ? OCCUPATION_LABELS[answers.occupation] : null,
    city: answers.city || null,
  };
}

export default function ChatStep({ answers, onFinalize }: ChatStepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneResult, setDoneResult] = useState<StyleChatResult | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // 把首轮（AI 开场）也作为历史的一部分传给后端
  const sendTurn = useCallback(
    async (userMessage: string | undefined, forceFinalize: boolean) => {
      setTyping(true);
      setError(null);
      try {
        // history：当前消息列表（不含本轮新用户消息）
        const history: StyleChatTurn[] = messages.map((m) => ({ role: m.role, content: m.content }));
        const result = await chatWithStylist({
          basicInfo: buildBasicInfo(answers),
          history,
          userMessage,
          forceFinalize,
        });
        const assistantMsg: ChatMessage = { role: 'assistant', content: result.reply };
        setMessages((prev) => [...prev, assistantMsg]);
        if (result.done) {
          setDoneResult(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '对话失败，请重试');
      } finally {
        setTyping(false);
      }
    },
    // messages 变化会导致 sendTurn 重建，但这里我们以函数执行时的最新值通过 ref 保证
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, messages],
  );

  // 首轮：AI 主动开场（结合基础信息问第一个问题）
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    sendTurn(undefined, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing || doneResult) return;
    setInput('');
    setTurnCount((n) => n + 1);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    await sendTurn(text, false);
  };

  const handleForceFinalize = async () => {
    if (typing || doneResult || messages.length === 0) return;
    await sendTurn(undefined, true);
  };

  const handleRetry = async () => {
    // 重试最近一次：重新发送上一条用户消息或重新开场
    setError(null);
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    await sendTurn(lastUser?.content, false);
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-ink-900/10 px-6 py-5 sm:px-8">
        <p className="text-xs tracking-[0.3em] text-ink-400">AI STYLIST</p>
        <h2 className="mt-1 font-display text-2xl text-ink-900">和 AI 顾问聊聊你的偏好</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          不用写小作文——AI 会一个问题一个问题地了解你，你可以随时纠正它的理解。
        </p>
      </div>

      {/* 对话区 */}
      <div ref={scrollRef} className="max-h-[440px] space-y-4 overflow-y-auto bg-[#f4f1ea]/40 px-6 py-6 sm:px-8">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {message.role === 'assistant' ? (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-creme-100">
                <Sparkles size={15} />
              </span>
            ) : (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8ece8] text-ink-700">
                <UserRound size={15} />
              </span>
            )}
            <div
              className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === 'assistant'
                  ? 'rounded-tl-sm border border-ink-900/10 bg-white text-ink-700'
                  : 'rounded-tr-sm bg-ink-900 text-creme-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-creme-100">
              <Sparkles size={15} />
            </span>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-ink-900/10 bg-white px-4 py-3">
              <span className="size-1.5 animate-bounce rounded-full bg-ink-400" />
              <span className="size-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:120ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:240ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button type="button" onClick={handleRetry} className="ml-3 inline-flex items-center gap-1 underline">
              <RefreshCw size={13} />
              重试
            </button>
          </div>
        )}
      </div>

      {/* 总结卡 / 输入区 */}
      <div className="border-t border-ink-900/10 p-5 sm:p-6">
        {doneResult ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-olive-900/20 bg-[#e8ece8] p-5">
              <p className="text-xs tracking-[0.22em] text-ink-500">AI 已为你总结画像</p>
              {doneResult.statement && (
                <p className="mt-3 text-sm leading-7 text-ink-700">{doneResult.statement}</p>
              )}
              {doneResult.likedKeywords && doneResult.likedKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doneResult.likedKeywords.map((k) => (
                    <span key={k} className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-ink-600">{k}</span>
                  ))}
                </div>
              )}
              {doneResult.dislikedKeywords && doneResult.dislikedKeywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {doneResult.dislikedKeywords.map((k) => (
                    <span key={k} className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600">避开 {k}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => doneResult.statement && onFinalize(doneResult.statement)}
              disabled={!doneResult.statement}
              className="flex w-full items-center justify-center gap-2 bg-ink-900 px-6 py-3.5 text-sm font-medium text-creme-100 transition hover:bg-ink-800 disabled:opacity-60"
            >
              对照风格库生成风格档案
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="回复 AI 顾问…（Enter 发送）"
                disabled={typing}
                className="flex-1 rounded-full border border-ink-900/15 bg-white px-5 py-3 text-sm outline-none focus:border-ink-900/40 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={typing || !input.trim()}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink-900 text-creme-100 transition hover:bg-ink-700 disabled:opacity-40"
              >
                {typing ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleForceFinalize}
                disabled={typing}
                className="w-full text-center text-xs text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline disabled:opacity-50"
              >
                聊得差不多了，直接生成结果
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
