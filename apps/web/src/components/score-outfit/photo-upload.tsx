"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface PhotoUploadProps {
  onPhotoReady: (base64: string) => void;
}

export default function PhotoUpload({ onPhotoReady }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onPhotoReady(base64);
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
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-[#1a1a2e] bg-[#f0ebe3]"
              : "border-[#d4cdc3] hover:border-[#8a8a8a] bg-[#faf8f5]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f0ebe3] flex items-center justify-center">
              <Upload className="w-7 h-7 text-[#5c5c5c]" />
            </div>
            <div>
              <p className="text-[#1a1a2e] font-semibold text-lg font-display">
                拖拽或点击上传穿搭照片
              </p>
              <p className="text-[#8a8a8a] text-sm mt-1">
                支持 JPG/PNG/WebP，建议全身照
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden bg-[#faf8f5]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="穿搭预览"
            className="w-full h-[420px] object-contain bg-[#f0ebe3]"
          />
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-all"
          >
            <X className="w-4 h-4 text-[#1a1a2e]" />
          </button>
          <div className="p-3 flex items-center gap-2 text-sm text-[#5c5c5c]">
            <ImageIcon className="w-4 h-4" />
            <span>照片已上传，点击右上角可重新选择</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
