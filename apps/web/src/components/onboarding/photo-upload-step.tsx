'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
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

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    // 释放旧 URL
    if (answers.photoPreview) URL.revokeObjectURL(answers.photoPreview);
    onUpdate({ photo: file, photoPreview: preview });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
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
  };

  const canNext = !!answers.photo;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">上传你的大头照</h2>
      <p className="text-ink-500 font-light mb-8">
        这将帮助我们分析你的肤色和脸型，为穿搭风格提供参考
      </p>

      {answers.photoPreview ? (
        /* 已上传 — 预览 */
        <div className="space-y-6">
          <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden border-2 border-creme-300 shadow-lg">
            <img
              src={answers.photoPreview}
              alt="头像预览"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
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
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </div>

          {/* AI 分析预留提示 */}
          <div className="p-4 bg-almond-pale/50 rounded-xl border border-almond-light">
            <p className="text-xs text-ink-400 font-light text-center">
              📷 照片将用于 AI 肤色与脸型分析，帮助你获得更精准的风格建议
            </p>
          </div>
        </div>
      ) : (
        /* 未上传 — 拖拽区 */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative mx-auto w-full max-w-sm h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
            dragOver
              ? 'border-ink-600 bg-ink-50'
              : 'border-creme-300 hover:border-ink-300 hover:bg-creme-200/50',
          )}
        >
          <div className="w-14 h-14 rounded-full bg-creme-200/80 flex items-center justify-center text-2xl">
            📸
          </div>
          <div className="text-center">
            <p className="text-ink-600 font-medium">点击或拖拽上传照片</p>
            <p className="text-xs text-ink-400 mt-1">支持 JPG、PNG、WebP 格式</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <Button onClick={onNext} disabled={!canNext}>
          {canNext ? '下一步 →' : '请先上传照片'}
        </Button>
      </div>
    </div>
  );
}
