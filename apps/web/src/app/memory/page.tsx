'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getUserMemory,
  updateStyleProfile,
  removeProfileField,
  clearAllMemory,
  updateCurrentIntent,
  refreshMemorySummary,
  FEEDBACK_TYPE_LABELS,
  type UserMemory,
  type UserStyleProfile,
} from '@/lib/memory-api';

type TabKey = 'profile' | 'intent' | 'feedback' | 'summary';

const ARRAY_FIELDS: Array<{
  key: keyof UserStyleProfile;
  label: string;
  type: 'positive' | 'negative';
}> = [
  { key: 'suitableStyles', label: '适合的风格', type: 'positive' },
  { key: 'likedStyles', label: '喜欢的风格', type: 'positive' },
  { key: 'dislikedStyles', label: '不喜欢的风格', type: 'negative' },
  { key: 'preferredColors', label: '偏好的颜色', type: 'positive' },
  { key: 'dislikedColors', label: '不喜欢的颜色', type: 'negative' },
  { key: 'bodyConcerns', label: '身材顾虑', type: 'negative' },
  { key: 'dressGoals', label: '穿搭目标', type: 'positive' },
  { key: 'commonOccasions', label: '常见场景', type: 'positive' },
];

export default function MemoryPage() {
  const [memory, setMemory] = useState<UserMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadMemory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserMemory();
      setMemory(data);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  async function handleAddValue(field: string) {
    if (!newValue.trim()) return;
    setSaving(true);
    try {
      const currentArr =
        (memory?.styleProfile?.[field as keyof UserStyleProfile] as string[]) ?? [];
      await updateStyleProfile({
        [field]: [...new Set([...currentArr, newValue.trim()])],
      });
      setNewValue('');
      setEditingField(null);
      await loadMemory();
    } catch (e: any) {
      setError(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveValue(field: string, value: string) {
    setSaving(true);
    try {
      await removeProfileField(field, value);
      await loadMemory();
    } catch (e: any) {
      setError(e?.message || '删除失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearAll() {
    setSaving(true);
    try {
      await clearAllMemory();
      setShowClearConfirm(false);
      await loadMemory();
    } catch (e: any) {
      setError(e?.message || '清空失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleRefreshSummary() {
    setSaving(true);
    try {
      await refreshMemorySummary();
      await loadMemory();
    } catch (e: any) {
      setError(e?.message || '刷新总结失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateIntent(field: string, value: string) {
    setSaving(true);
    try {
      await updateCurrentIntent({ [field]: value });
      await loadMemory();
    } catch (e: any) {
      setError(e?.message || '更新意图失败');
    } finally {
      setSaving(false);
    }
  }

  const profile = memory?.styleProfile;
  const intent = memory?.currentIntent;
  const summary = memory?.memorySummary;
  const feedbacks = memory?.recentFeedbacks ?? [];

  return (
    <main className="min-h-screen bg-creme text-ink">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <p className="text-sm font-medium text-ink/60">首页 · 长期记忆</p>
          <h1 className="mt-2 text-3xl font-bold">AI 记住了什么</h1>
          <p className="mt-2 text-ink/70">
            系统会长期记住你的风格偏好、身材特点、衣柜情况和历史反馈，
            以便越来越懂你。你可以随时查看、编辑或删除这些记忆。
          </p>
        </header>

        {/* 隐私提示 */}
        <div className="mb-6 rounded-xl border border-haze-pale bg-haze-pale/30 p-4 text-sm text-ink/70">
          <p className="font-medium text-ink/80">隐私说明</p>
          <p className="mt-1">
            以下信息会长期保存在你的账户中，用于提升 AI 推荐质量。
            敏感图片不会在无感知情况下长期保存。你可以随时编辑、删除单条记忆或一键清空全部画像。
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-ink/50">加载中…</div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-ink/10">
              {([
                ['profile', '风格画像'],
                ['intent', '当前意图'],
                ['feedback', '历史反馈'],
                ['summary', 'AI 总结'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === key
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/50 hover:text-ink/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: 风格画像 */}
            {activeTab === 'profile' && (
              <section className="space-y-6">
                {ARRAY_FIELDS.map((field) => {
                  const values =
                    (profile?.[field.key] as string[]) ?? [];
                  return (
                    <div
                      key={field.key}
                      className="rounded-2xl border border-ink/10 bg-white p-5"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          {field.label}
                          {field.type === 'negative' && (
                            <span className="ml-2 text-xs text-ink/40">（避坑）</span>
                          )}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {values.length === 0 && (
                          <span className="text-sm text-ink/40">暂无</span>
                        )}
                        {values.map((v) => (
                          <span
                            key={v}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                              field.type === 'negative'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-olive-pale text-olive-dark'
                            }`}
                          >
                            {v}
                            <button
                              onClick={() => handleRemoveValue(field.key as string, v)}
                              disabled={saving}
                              className="ml-1 text-xs opacity-60 hover:opacity-100"
                              aria-label={`删除 ${v}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      {editingField === field.key ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddValue(field.key as string);
                              if (e.key === 'Escape') {
                                setEditingField(null);
                                setNewValue('');
                              }
                            }}
                            placeholder={`输入${field.label}…`}
                            className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddValue(field.key as string)}
                            disabled={saving || !newValue.trim()}
                            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                          >
                            添加
                          </button>
                          <button
                            onClick={() => {
                              setEditingField(null);
                              setNewValue('');
                            }}
                            className="rounded-lg bg-ink/5 px-4 py-2 text-sm"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingField(field.key as string);
                            setNewValue('');
                          }}
                          className="mt-3 text-sm text-haze-dark hover:text-haze"
                        >
                          + 添加{field.label}
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* 避坑规则 */}
                {profile?.avoidRules && profile.avoidRules.length > 0 && (
                  <div className="rounded-2xl border border-ink/10 bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold">
                      避坑规则
                      <span className="ml-2 text-xs text-ink/40">
                        （基于历史反馈自动生成）
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {profile.avoidRules
                        .filter((r) => r.weight > 0)
                        .map((rule, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
                          >
                            <span>{rule.rule}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-600">
                                权重 {rule.weight}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveValue('avoidRules', rule.rule)
                                }
                                disabled={saving}
                                className="text-xs opacity-60 hover:opacity-100"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 一键清空 */}
                <div className="rounded-2xl border border-red/20 bg-red-50/30 p-5">
                  <h3 className="mb-2 text-sm font-semibold text-red-700">
                    危险操作
                  </h3>
                  <p className="mb-3 text-sm text-ink/60">
                    清空全部用户画像、意图和 AI 总结。此操作不可撤销。
                  </p>
                  {showClearConfirm ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearAll}
                        disabled={saving}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {saving ? '清空中…' : '确认清空全部记忆'}
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="rounded-lg bg-ink/5 px-4 py-2 text-sm"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      一键清空画像
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Tab: 当前意图 */}
            {activeTab === 'intent' && (
              <section className="space-y-4">
                <IntentEditor
                  label="正在寻找"
                  value={intent?.lookingFor ?? ''}
                  placeholder="如：通勤裤、白色衬衫"
                  onSave={(v) => handleUpdateIntent('lookingFor', v)}
                  saving={saving}
                />
                <IntentEditor
                  label="目标场景"
                  value={intent?.targetOccasion ?? ''}
                  placeholder="如：通勤、约会"
                  onSave={(v) => handleUpdateIntent('targetOccasion', v)}
                  saving={saving}
                />
                <IntentEditor
                  label="预算上限"
                  value={intent?.budgetRange?.max?.toString() ?? ''}
                  placeholder="如：500"
                  onSave={(v) =>
                    handleUpdateIntent('budgetRange', {
                      ...(intent?.budgetRange ?? {}),
                      max: v ? Number(v) : undefined,
                    })
                  }
                  saving={saving}
                />

                {intent?.recentRejectedItems &&
                  intent.recentRejectedItems.length > 0 && (
                    <div className="rounded-2xl border border-ink/10 bg-white p-5">
                      <h3 className="mb-3 text-sm font-semibold">近期拒绝的商品</h3>
                      <div className="space-y-2">
                        {intent.recentRejectedItems.map((item, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-ink/5 px-3 py-2 text-sm"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="ml-2 text-ink/50">{item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </section>
            )}

            {/* Tab: 历史反馈 */}
            {activeTab === 'feedback' && (
              <section>
                {feedbacks.length === 0 ? (
                  <div className="py-12 text-center text-ink/40">
                    还没有反馈记录
                  </div>
                ) : (
                  <div className="space-y-2">
                    {feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="rounded-xl border border-ink/10 bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              fb.feedbackType === 'like'
                                ? 'bg-green-50 text-green-700'
                                : fb.feedbackType === 'worn_today'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {FEEDBACK_TYPE_LABELS[fb.feedbackType] ?? fb.feedbackType}
                          </span>
                          <span className="text-xs text-ink/40">
                            {new Date(fb.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {fb.reason && (
                          <p className="mt-2 text-sm text-ink/70">{fb.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Tab: AI 总结 */}
            {activeTab === 'summary' && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-ink/60">
                    AI 基于你的长期行为生成的摘要，每次刷新会重新计算。
                  </p>
                  <button
                    onClick={handleRefreshSummary}
                    disabled={saving}
                    className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving ? '刷新中…' : '刷新总结'}
                  </button>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white p-6">
                  {summary ? (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs text-ink/50">置信度</span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-ink/10">
                          <div
                            className="h-full bg-olive"
                            style={{
                              width: `${Math.round(Number(summary.confidence) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {Math.round(Number(summary.confidence) * 100)}%
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                        {summary.summary}
                      </p>
                      {summary.updatedAt && (
                        <p className="mt-4 text-xs text-ink/40">
                          最后更新：{new Date(summary.updatedAt).toLocaleString('zh-CN')}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-ink/40">
                      暂无 AI 总结，点击"刷新总结"生成
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ==================== 子组件 ====================

function IntentEditor({
  label,
  value,
  placeholder,
  onSave,
  saving,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <h3 className="mb-2 text-sm font-semibold">{label}</h3>
      {editing ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm"
            autoFocus
          />
          <button
            onClick={() => {
              onSave(draft);
              setEditing(false);
            }}
            disabled={saving}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            保存
          </button>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            className="rounded-lg bg-ink/5 px-4 py-2 text-sm"
          >
            取消
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink/80">
            {value || <span className="text-ink/40">未设置</span>}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-haze-dark hover:text-haze"
          >
            编辑
          </button>
        </div>
      )}
    </div>
  );
}
