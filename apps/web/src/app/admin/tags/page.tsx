'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type StyleTag } from '@/lib/admin-api';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<StyleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; tag?: StyleTag } | null>(null);
  const [formName, setFormName] = useState('');
  const [formLabel, setFormLabel] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setFormName('');
    setFormLabel('');
    setModal({ type: 'create' });
  };

  const openEdit = (tag: StyleTag) => {
    setFormName(tag.name);
    setFormLabel(tag.label);
    setModal({ type: 'edit', tag });
  };

  const handleSave = async () => {
    if (!formName.trim() || !formLabel.trim()) return;
    try {
      if (modal?.type === 'create') {
        await adminApi.createTag(formName.trim(), formLabel.trim());
      } else if (modal?.type === 'edit' && modal.tag) {
        await adminApi.updateTag(modal.tag.name, formName.trim(), formLabel.trim());
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除标签「${name}」？`)) return;
    try {
      await adminApi.deleteTag(name);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">标签管理</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          新增标签
        </button>
      </div>

      {error && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm py-10 text-center">加载中...</p>
      ) : tags.length === 0 ? (
        <p className="text-gray-400 text-sm py-10 text-center">暂无标签</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">名称</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">显示标签</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">{tag.name}</td>
                  <td className="px-4 py-3 text-gray-700">{tag.label}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(tag)}
                      className="text-xs text-gray-500 hover:text-gray-700 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(tag.name)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              {modal.type === 'create' ? '新增标签' : '编辑标签'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">名称（英文标识）</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：minimalist"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">显示标签</label>
                <input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="例如：极简主义"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!formName.trim() || !formLabel.trim()}
                className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}