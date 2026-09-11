'use client';

/**
 * M14-B：穿搭小课堂 — 教学卡片组件
 *
 * 设计目标：在用户使用产品的过程中，潜移默化地教穿搭基础规则
 * - 不强制学习、不打扰主线流程
 * - 根据用户当前推荐内容动态挑选最相关的卡片
 * - 折叠状态默认显示，用户可主动展开深入了解
 *
 * 集成位置：daily-recommend 顶部 banner 下方 / onboarding 完成页
 *
 * 触发规则：
 * - coach=shopping：每次显示 1 张"如何挑选单品"卡
 * - coach=occasion：每周显示 1 张"场合匹配"卡
 * - coach=combination：每次显示 1 张"搭配原理"卡
 * - coach=mixed：默认不显示（不打扰高水平用户）
 */

import type { CoachMode } from '@/lib/memory-api';
import { Sparkles } from 'lucide-react';

export interface TeachingCard {
  /** 唯一 ID（用作 React key） */
  id: string;
  /** 教学卡片分类 */
  category: 'color' | 'proportion' | 'style' | 'occasion' | 'body';
  /** 卡片标题（一句话） */
  title: string;
  /** 核心概念（1-2 句） */
  concept: string;
  /** 应用示例（与今日推荐相关） */
  applied: string;
  /** 难度 1=基础 2=中级 3=高级 */
  level: 1 | 2 | 3;
}

const TEACHING_CARDS: TeachingCard[] = [
  // ============ 颜色搭配 ============
  {
    id: 'color-3-rule',
    category: 'color',
    title: '三色原则',
    concept: '一身搭配的主色 + 辅色 + 点缀色，总共不超过 3 个色系，是基础安全线。',
    applied: '今天你的方案：白 + 米色 + 浅咖 = 同色系搭配，干净又显气质。',
    level: 1,
  },
  {
    id: 'color-skin',
    category: 'color',
    title: '肤色与冷暖色',
    concept: '暖黄皮更适合驼色/姜黄/酒红；冷白皮更适合雾蓝/紫/银灰。',
    applied: '根据你的肤色，今日避开了偏冷的薄荷绿，推荐了暖调的奶白。',
    level: 2,
  },
  {
    id: 'color-neutral-pop',
    category: 'color',
    title: '中性色 + 1 个亮色',
    concept: '全中性色（白/灰/黑/米/卡其）容易显得平淡，加 1 个亮色点缀会立刻有层次。',
    applied: '今天这套是米色 + 浅咖 + 1 个橘色包，正是这个思路。',
    level: 2,
  },

  // ============ 版型比例 ============
  {
    id: 'prop-up-down',
    category: 'proportion',
    title: '上宽下窄 / 上窄下宽',
    concept: '上半身宽松（如大毛衣）+ 下半身收紧（如直筒裤）= 显瘦显高的经典组合。',
    applied: '今日推荐：宽松针织衫 + 高腰直筒裤 = 上下对比，腿显得更长。',
    level: 1,
  },
  {
    id: 'prop-waist',
    category: 'proportion',
    title: '高腰线法则',
    concept: '把视觉腰线提到肚脐上方 2-3cm，是显腿长最直接的方法。',
    applied: '今日的阔腿裤 + 短款上衣 = 高腰线 1 套。',
    level: 1,
  },
  {
    id: 'prop-3-7',
    category: 'proportion',
    title: '3:7 比例',
    concept: '上短下长（如短上衣 + 长裤），能营造 3:7 的黄金比例，显高效果最好。',
    applied: '今天这双厚底鞋也是 3:7 思路的延伸，悄悄增加腿长比例。',
    level: 2,
  },

  // ============ 风格统一 ============
  {
    id: 'style-consistent',
    category: 'style',
    title: '风格呼应',
    concept: '一套搭配里所有单品的"风格调性"应该一致（如都偏极简、都偏复古），不要混搭太多。',
    applied: '今日推荐是极简通勤风，所有单品都"干净利落"，没有花哨元素。',
    level: 2,
  },
  {
    id: 'style-tone',
    category: 'style',
    title: '材质一致',
    concept: '一套搭配里材质要协调：全棉麻 = 文艺风，全丝绸缎 = 优雅风，全皮质 = 街头风。',
    applied: '今天的棉质 + 针织 = 文艺通勤风，材质呼应做得好。',
    level: 3,
  },

  // ============ 场合匹配 ============
  {
    id: 'occ-formal',
    category: 'occasion',
    title: '场合正式度',
    concept: '通勤 5-7 分正式；约会 3-5 分；逛街 1-3 分。正式度过高会显老气，过低会显不重视。',
    applied: '今天场合是通勤，推荐的是 5 分正式度（正式但不死板）。',
    level: 1,
  },
  {
    id: 'occ-season',
    category: 'occasion',
    title: '季节错位',
    concept: '冬天也可以穿"亮色 + 浅色"，不必全黑深灰（会显压抑）。',
    applied: '今日推荐了奶白单品，让冬天搭配立刻明亮。',
    level: 2,
  },

  // ============ 身材扬避 ============
  {
    id: 'body-waist',
    category: 'body',
    title: '梨形身材',
    concept: '梨形身材（臀围 > 胸围）应上浅下深 + 上紧下松，把视觉重心放在上半身。',
    applied: '今日推荐：浅色上衣 + 深色阔腿裤 = 经典梨形公式。',
    level: 2,
  },
  {
    id: 'body-apple',
    category: 'body',
    title: '苹果形身材',
    concept: '苹果形身材（腰围粗）应避免紧身上衣 + 腰间设计，用 V 领 + 垂感面料延长线条。',
    applied: '今日推荐：V 领针织 + 直筒裤，避开紧身款。',
    level: 2,
  },
  {
    id: 'body-petite',
    category: 'body',
    title: '小个子显高',
    concept: '小个子（< 160cm）选高腰 + 短款 + 同色系 + 尖头鞋，能立刻显高 3-5cm。',
    applied: '今日推荐的所有单品都是这个思路——你今天的搭配显高 5cm！',
    level: 1,
  },
];

/**
 * 根据 coach mode + 日期种子（保持稳定不闪烁），选 1 张最相关的卡片
 */
export function pickTeachingCard(coachMode: CoachMode, seed?: number): TeachingCard | null {
  // 综合模式不显示教学卡（不打扰高水平用户）
  if (coachMode === 'mixed') return null;

  // 根据 mode 选对应分类的卡片
  const categoryMap: Record<CoachMode, TeachingCard['category'][]> = {
    shopping: ['style', 'body'],
    occasion: ['occasion', 'color'],
    combination: ['proportion', 'color', 'style'],
    mixed: [],
  };
  const allowed = categoryMap[coachMode] ?? [];

  // 用 seed 选（默认用今天日期，确保稳定）
  const useSeed = seed ?? new Date().toISOString().slice(0, 10).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const candidates = TEACHING_CARDS.filter((c) => allowed.includes(c.category));
  if (candidates.length === 0) return null;
  return candidates[useSeed % candidates.length];
}

/**
 * 教学卡片展示组件
 */
export function TeachingCardView({ card }: { card: TeachingCard }) {
  const categoryEmoji: Record<TeachingCard['category'], string> = {
    color: '🎨',
    proportion: '📏',
    style: '🎭',
    occasion: '📅',
    body: '💃',
  };
  return (
    <details className="rounded-xl border border-ink/10 bg-creme-50/60 px-3 py-2 text-sm transition hover:bg-creme-50">
      <summary className="flex cursor-pointer items-center gap-2 text-ink/80">
        <Sparkles size={14} className="shrink-0 text-olive-dark" />
        <span className="font-medium">穿搭小课堂 · {categoryEmoji[card.category]} {card.title}</span>
        <span className="ml-auto text-[10px] text-ink/40">Lv.{card.level}</span>
      </summary>
      <div className="mt-2 space-y-1.5 border-t border-ink/10 pt-2 text-xs text-ink/70">
        <p>
          <span className="font-medium text-ink/90">是什么：</span>
          {card.concept}
        </p>
        <p>
          <span className="font-medium text-ink/90">今天怎么用：</span>
          {card.applied}
        </p>
      </div>
    </details>
  );
}