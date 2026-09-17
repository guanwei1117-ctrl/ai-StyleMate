'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, Check, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OutfitUploadDialog from './outfit-upload-dialog';
import type { AnalyzeOutfitResponse } from '@/lib/wardrobe-types';

interface Props {
  onUploaded: () => void;
  requireAuth?: (msg?: string) => boolean;
}

/** 将 dataURL 转成 File，供 recognizeAndAddItem 使用 */
function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

export default function WardrobeUploader({ onUploaded, requireAuth }: Props) {
  const singleInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // 穿搭照多件模式
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [outfitAnalysis, setOutfitAnalysis] = useState<AnalyzeOutfitResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSingleClick = () => {
    if (requireAuth && !requireAuth('请先登录后再上传衣物')) return;
    singleInputRef.current?.click();
  };

  const handleOutfitClick = () => {
    if (requireAuth && !requireAuth('请先登录后再上传穿搭照')) return;
    outfitInputRef.current?.click();
  };

  const processFile = async (file: File): Promise<void> => {
    if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" 不是图片文件`);
    if (file.size > 8 * 1024 * 1024) throw new Error(`"${file.name}" 超过 8MB 限制`);
    const { recognizeAndAddItem } = await import('@/lib/wardrobe-api');
    await recognizeAndAddItem(file);
  };

  const handleSingleFiles = async (files: FileList) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setError(null);
    setUploading(true);
    setProgress({ current: 0, total: fileArr.length });
    setPreviews(fileArr.map((f) => URL.createObjectURL(f)));

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
    else {
      setPreviews([]);
      setError(null);
    }

    setUploading(false);
    if (singleInputRef.current) singleInputRef.current.value = '';
  };

  // 穿搭照：先分析出多件衣物及 bbox，再弹确认框
  const handleOutfitFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('图片超过 8MB 限制');
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const { analyzeOutfitPhoto } = await import('@/lib/wardrobe-api');
      const analysis = await analyzeOutfitPhoto(file);
      if (analysis.items.length === 0) {
        setError('没有识别到衣物，请换一张更清晰的穿搭照重试。');
        setOutfitFile(null);
      } else {
        setOutfitFile(file);
        setOutfitAnalysis(analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '穿搭照分析失败');
      setOutfitFile(null);
    } finally {
      setAnalyzing(false);
      if (outfitInputRef.current) outfitInputRef.current.value = '';
    }
  };

  const closeOutfitDialog = () => {
    setOutfitFile(null);
    setOutfitAnalysis(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSingleClick} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              识别中 {progress.current}/{progress.total}
            </>
          ) : (
            <>
              <Upload size={18} />
              添加衣物
            </>
          )}
        </Button>

        <Button variant="outline" onClick={handleOutfitClick} disabled={analyzing}>
          {analyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              分析穿搭照…
            </>
          ) : (
            <>
              <Shirt size={18} />
              上传穿搭照（可识别多件）
            </>
          )}
        </Button>

        <input
          ref={singleInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleSingleFiles(e.target.files);
          }}
        />
        <input
          ref={outfitInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleOutfitFiles(e.target.files);
          }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {previews.length > 0 && uploading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`预览${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
              {i < progress.current && (
                <span className="absolute -top-1 -right-1 rounded-full bg-green-500 p-0.5">
                  <Check size={12} className="text-white" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {outfitFile && outfitAnalysis && (
        <OutfitUploadDialog
          file={outfitFile}
          analysis={outfitAnalysis}
          onUploaded={onUploaded}
          onCancel={closeOutfitDialog}
        />
      )}
    </div>
  );
}
