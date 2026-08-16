'use client';

import Link from 'next/link';
import { WardrobeItem, CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/wardrobe-types';

interface Props {
  item: WardrobeItem;
}

/**
 * 衣物卡片
 */
export default function WardrobeItemCard({ item }: Props) {
  const emoji = CATEGORY_EMOJI[item.category as keyof typeof CATEGORY_EMOJI] ?? '👕';
  const label = CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category;

  return (
    <Link
      href={`/wardrobe/items/${item.id}`}
      className="group block rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-50 text-4xl overflow-hidden">
          {item.imageUrls?.length > 0 ? (
            <img
              src={item.imageUrls[0]}
              alt={label}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            emoji
          )}
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {item.styleTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink-50 px-2 py-0.5 text-xs text-ink-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          {item.subCategory && (
            <span className="text-xs text-gray-400">{item.subCategory}</span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {[item.color, item.material].filter(Boolean).join(' · ') || '未标注'}
        </p>
        {item.aiSummary && (
          <p className="mt-2 line-clamp-1 text-xs text-gray-400">{item.aiSummary}</p>
        )}
        <div className="mt-3 flex items-center justify-end text-xs text-gray-400">
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            查看详情 →
          </span>
        </div>
      </div>
    </Link>
  );
}
