'use client';

import { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { useRequireAuth } from '@/lib/require-auth';
import { SubmitOotdDialog } from './style-actions';

/**
 * 穿搭灵感章节的"鼓励上传"横幅
 * 作用：吸引用户上传自己同款穿搭，成为页面内容供大家欣赏参考
 */
export default function StyleCtaUpload({
  styleId,
  styleName,
}: {
  styleId: string;
  styleName: string;
}) {
  const { requireAuth } = useRequireAuth();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!requireAuth('请先登录后再上传穿搭')) return;
    setOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 border border-ink-900/10 bg-[#fbfaf6] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="shrink-0 text-ink-500" />
          <p className="text-sm text-ink-700">
            <span className="font-semibold text-ink-900">晒出你的同款穿搭</span>
            <span className="text-ink-500">—— 上传后成为本页内容，供社区参考</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex shrink-0 items-center gap-1.5 bg-ink-700 px-4 py-2 text-sm text-creme-100 transition hover:bg-ink-800"
        >
          <Camera size={14} />
          上传
        </button>
      </div>

      {open && (
        <SubmitOotdDialog
          styleId={styleId}
          styleName={styleName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
