'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, Check, X as XIcon } from 'lucide-react';

interface Props { onUploaded: () => void; }

export default function WardrobeUploader({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const processFile = async (file: File): Promise<void> => {
    if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" 不是图片文件`);
    if (file.size > 8 * 1024 * 1024) throw new Error(`"${file.name}" 超过 8MB 限制`);
    const { recognizeAndAddItem } = await import('@/lib/wardrobe-api');
    await recognizeAndAddItem(file);
  };

  const handleFiles = async (files: FileList) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setError(null);
    setUploading(true);
    setProgress({ current: 0, total: fileArr.length });
    setPreviews(fileArr.map(f => URL.createObjectURL(f)));

    let succeeded = 0;
    const errors: string[] = [];

    for (let i = 0; i < fileArr.length; i++) {
      try {
        await processFile(fileArr[i]);
        succeeded++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : '识别失败');
      }
      setProgress({ current: i + 1, total: fileArr.length });
    }

    if (succeeded > 0) onUploaded();
    if (errors.length > 0) setError(errors.join('；'));
    else { setPreviews([]); setError(null); }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />

      <button type="button" disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-2.5 font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60">
        {uploading ? (
          <><Loader2 size={18} className="animate-spin" />识别中 {progress.current}/{progress.total}</>
        ) : (
          <><Upload size={18} />添加衣物</>
        )}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {previews.length > 0 && uploading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`预览${i+1}`} className="h-20 w-20 rounded-lg object-cover" />
              {i < progress.current && (
                <span className="absolute -top-1 -right-1 rounded-full bg-green-500 p-0.5"><Check size={12} className="text-white" /></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
