'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';

interface Props {
  onUploaded: () => void;
}

/**
 * 衣物上传识别组件
 *
 * 用户选择图片后调用 AI 识别接口，识别成功后回调刷新列表。
 */
export default function WardrobeUploader({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('图片不能超过 8MB');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const { recognizeAndAddItem } = await import('@/lib/wardrobe-api');
      await recognizeAndAddItem(file);
      onUploaded();
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-2.5 font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            AI 识别中…
          </>
        ) : (
          <>
            <Upload size={18} />
            添加衣物
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {preview && uploading && (
        <div className="mt-4 inline-block relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="上传预览"
            className="h-32 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 rounded-full bg-white p-1 shadow"
            onClick={() => {
              setPreview(null);
              setUploading(false);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
