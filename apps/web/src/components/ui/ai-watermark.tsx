import { cn } from '@/lib/utils';

interface AiWatermarkProps {
  text?: string;
  className?: string;
}

/**
 * AI 生成图片统一水印：固定右下角、统一样式（globals.css .ai-watermark）
 * 父容器需为 relative
 */
export function AiWatermark({ text = 'AI 生成', className }: AiWatermarkProps) {
  return <span className={cn('ai-watermark', className)}>{text}</span>;
}
