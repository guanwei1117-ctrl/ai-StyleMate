"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ACCEPTED_IMAGE_MIME_TYPES, IMAGE_UPLOAD_SIZE_LABEL, validateImageFile } from "@/lib/image-upload-rules";

interface PhotoUploadProps {
  onPhotoReady: (base64: string) => void;
}

export default function PhotoUpload({ onPhotoReady }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        setError(validation.message);
        onPhotoReady("");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onPhotoReady(base64);
      };
      reader.onerror = () => {
        setError('图片读取失败，请重新选择。');
        onPhotoReady('');
      };
      reader.readAsDataURL(file);
    },
    [onPhotoReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  const handleRemove = () => {
    setPreview(null);
    onPhotoReady("");
  };

  return (
    <div className="w-full">
      {!preview ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative min-h-[420px] border border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-ink-900 bg-[#e8ece8]"
              : "border-ink-900/20 hover:border-ink-900/45 bg-[#f4f1ea]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_48%,rgba(10,10,10,0.07)_49%,rgba(10,10,10,0.07)_51%,transparent_52%)] bg-[length:32px_32px]" />
          <div className="relative z-10 flex min-h-[340px] flex-col items-center justify-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center border border-ink-900/15 bg-white/60">
              <Upload className="w-7 h-7 text-ink-600" />
            </div>
            <div>
              <p className="font-display text-3xl text-ink-900">
                上传完整 Look
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-500">
                支持 JPG / PNG / WebP，单张不超过 {IMAGE_UPLOAD_SIZE_LABEL}。建议使用自然光全身照，鞋子和外套边界尽量完整。
              </p>
              {error && (
                <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_MIME_TYPES}
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden border border-ink-900/10 bg-[#f4f1ea]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="穿搭预览"
            className="w-full h-[520px] object-contain bg-[#ebe7df]"
          />
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
          >
            <X className="w-4 h-4 text-ink-900" />
          </button>
          <div className="flex items-center gap-2 border-t border-ink-900/10 p-3 text-sm text-ink-500">
            <ImageIcon className="w-4 h-4" />
            <span>照片已就绪，点击右上角可重新选择</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
