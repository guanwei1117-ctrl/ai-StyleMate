'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { pickRoastStickers, type RoastSticker } from '@/lib/tone-mode';

interface StickerPopProps {
  /** 每次变化（+1）触发一轮弹窗；0 表示从未触发 */
  trigger: number;
  /** 一次弹几个贴纸，默认 4 */
  count?: number;
  /** 贴纸停留时间（ms），默认 3500 */
  duration?: number;
}

interface PlacedSticker extends RoastSticker {
  top: number;     // %
  left: number;    // %
  rotate: number;  // deg
  scale: number;
  leaving: boolean;
}

export default function StickerPop({
  trigger,
  count = 4,
  duration = 3500,
}: StickerPopProps) {
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [visible, setVisible] = useState(false);

  // 挑选贴纸 + 随机布局 —— trigger 变化时重新生成
  const layout = useMemo<PlacedSticker[]>(() => {
    if (trigger === 0) return [];
    const picked = pickRoastStickers(count);
    return picked.map((s, i) => ({
      ...s,
      // 错开位置，避免重叠；限制在视口安全区内
      top: 18 + ((i * 17) % 50) + Math.random() * 8,
      left: 8 + ((i * 23) % 70) + Math.random() * 10,
      rotate: (Math.random() * 24 - 12),
      scale: 0.85 + Math.random() * 0.5,
      leaving: false,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, count]);

  useEffect(() => {
    if (trigger === 0 || layout.length === 0) {
      setVisible(false);
      setStickers([]);
      return;
    }

    setVisible(true);
    setStickers(layout);

    // 分批让贴纸飘走，营造"逐个消失"的层次感
    const leaveTimers: ReturnType<typeof setTimeout>[] = [];
    layout.forEach((_, i) => {
      const leaveAt = duration - 500 + i * 120;
      leaveTimers.push(
        setTimeout(() => {
          setStickers((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, leaving: true } : s)),
          );
        }, leaveAt),
      );
    });

    const clearAll = setTimeout(() => {
      setVisible(false);
      setStickers([]);
    }, duration + layout.length * 120 + 200);

    return () => {
      leaveTimers.forEach(clearTimeout);
      clearTimeout(clearAll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  if (!visible || stickers.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {stickers.map((s) => (
        <div
          key={s.id}
          className={cn(
            'absolute',
            s.leaving ? 'anim-sticker-out' : 'anim-sticker-in',
          )}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            // @ts-expect-error CSS custom property
            '--sticker-rotate': `${s.rotate}deg`,
            transform: `scale(${s.scale})`,
          }}
        >
          {s.type === 'image' && s.src ? (
            // 图片/GIF 表情包
            <img
              src={s.src}
              alt={s.alt || ''}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
              draggable={false}
            />
          ) : (
            // 文字气泡贴纸 —— 纯 CSS，无需图片
            <div
              className={cn(
                'relative px-3.5 py-2 rounded-2xl text-sm font-bold whitespace-nowrap',
                'bg-ink-900 text-creme-100 shadow-xl',
                'border-2 border-ink-700',
              )}
            >
              {s.text}
              {/* 小三角尾巴 */}
              <span className="absolute -bottom-1.5 left-5 w-3 h-3 bg-ink-900 rotate-45 border-r-2 border-b-2 border-ink-700" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
