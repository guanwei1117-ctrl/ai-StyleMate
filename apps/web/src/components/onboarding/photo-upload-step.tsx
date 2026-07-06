'use client';

import { useRef, useState, useCallback, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { OnboardingAnswers } from '@/lib/onboarding-types';

interface PhotoUploadStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
}

export default function PhotoUploadStep({ answers, onUpdate, onNext }: PhotoUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 同步上传状态
  useEffect(() => {
    setUploaded(!!answers.photo);
  }, [answers.photo]);

  // 组件卸载时释放 blob URL
  useEffect(() => {
    return () => {
      if (answers.photoPreview) {
        URL.revokeObjectURL(answers.photoPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((file: File) => {
    setError(null);

    // 校验文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（JPG、PNG、WebP）');
      return;
    }

    // 校验文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    // 释放旧 URL
    if (answers.photoPreview) URL.revokeObjectURL(answers.photoPreview);
    onUpdate({ photo: file, photoPreview: preview });
  }, [answers.photoPreview, onUpdate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // 重置 input 以便重复选择同一文件
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = () => {
    if (answers.photoPreview) URL.revokeObjectURL(answers.photoPreview);
    onUpdate({ photo: null, photoPreview: null });
    setUploaded(false);
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const canNext = !!answers.photo;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">上传你的大头照</h2>
      <p className="text-ink-500 font-light mb-6">
        上传一张清晰的正面照片，帮助我们分析你的肤色与脸型
      </p>

      {/* ======== 未上传 ======== */}
      {!answers.photoPreview && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileInput}
            className={cn(
              'mx-auto w-full h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300',
              dragOver
                ? 'border-ink-600 bg-ink-50 scale-[1.02]'
                : 'border-creme-300 hover:border-ink-300 hover:bg-creme-200/50',
            )}
          >
            <div className="w-16 h-16 rounded-full bg-creme-200/80 flex items-center justify-center text-3xl shadow-sm">
              📸
            </div>
            <div className="text-center">
              <p className="text-ink-600 font-medium">点击或拖拽上传照片</p>
              <p className="text-xs text-ink-400 mt-1">JPG / PNG / WebP · 最大 10MB</p>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-500 text-center">{error}</p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
            aria-hidden="true"
          />
        </>
      )}

      {/* ======== 已上传 — 预览 ======== */}
      {answers.photoPreview && (
        <div className="space-y-5 animate-fade-in">
          {/* 预览图 — 自适应，图片完整显示不裁切 */}
          <div className="relative mx-auto w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-2 border-creme-300 shadow-lg ring-2 ring-haze-pale/50 bg-white">
            <img
              src={answers.photoPreview}
              alt="头像预览"
              className="w-full h-full object-contain"
              onLoad={() => setUploaded(true)}
            />
            {/* 上传成功勾 */}
            {uploaded && (
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-olive-light flex items-center justify-center text-white text-xs shadow-md">
                ✓
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
            >
              重新选择
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              移除照片
            </Button>
          </div>

          {/* 成功提示 */}
          <div className="p-3 bg-olive-pale/40 rounded-xl border border-olive-pale text-center">
            <p className="text-xs text-olive-dark font-medium">
              ✓ 照片已就绪，无需等待，点击下一步继续
            </p>
            <p className="text-[10px] text-ink-400 mt-0.5">
              本地上传即时完成，不依赖 AI 接口
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canNext}
          size="lg"
        >
          {canNext ? '下一步 →' : '请先上传照片'}
        </Button>
      </div>
    </div>
  );
}
