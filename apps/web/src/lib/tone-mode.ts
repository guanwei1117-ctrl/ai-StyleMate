// ============================================================
// 毒舌/夸夸双模式文案映射
// ============================================================

export type ToneMode = 'nice' | 'roast';

// ---------- 体型解读 ----------
export const BODY_EXPLAIN_TONE: Record<
  ToneMode,
  {
    title: string;
  }
> = {
  nice: {
    title: '你的身材说了什么',
  },
  roast: {
    title: '别玻璃心，身材不会说谎',
  },
};

// ---------- 避雷专区 ----------
export const AVOIDANCE_TONE: Record<
  ToneMode,
  {
    title: string;
    subtitle: string;
    warningPrefix: string;
    alternativePrefix: string;
  }
> = {
  nice: {
    title: '这些东西别碰 👇',
    subtitle: '穿错比不穿更可怕（没有冒犯的意思）',
    warningPrefix: '🔴',
    alternativePrefix: '🟢 替换为',
  },
  roast: {
    title: '踩过的雷替你炸了 💣',
    subtitle: '实话难听但能救命（不信你试试）',
    warningPrefix: '💀',
    alternativePrefix: '✅ 这样拯救你',
  },
};

// ---------- 多维评分 ----------
export const SCORE_TONE: Record<
  ToneMode,
  {
    title: string;
  }
> = {
  nice: {
    title: '拆解你的穿搭基因',
  },
  roast: {
    title: '技术流分析（纯数据，没感情）',
  },
};

// ---------- 用户画像区 ----------
export const PROFILE_TONE: Record<
  ToneMode,
  {
    title: string;
  }
> = {
  nice: {
    title: '你的画像',
  },
  roast: {
    title: '行了，先看看你自己',
  },
};

// ---------- 毒舌模式的 advice 文案替换 ----------
// 为已有的 avoidanceAdvice 添加毒舌版本的 warning 和 reason
// 这里只做 title/subtitle 层面的替换，具体条目的毒舌化由 AI 生成或后续扩展

export function getRoastWarning(warning: string): string {
  // 毒舌模式下给 warning 加一点"损友"语气
  const roastMap: Record<string, string> = {
    '避免过长上衣压身高': '这件大衣快把你吃掉了，脱了吧',
    '避免紧身裤暴露腿型缺点': '紧身裤跟你有仇，换掉它',
    '避免高领压迫颈部': '脖子呢？被高领吃了？',
    '避免横条纹拉宽身形': '横条纹是你的敌人，别问为什么',
    '避免过于宽松模糊曲线': '你是在穿衣服还是披床单？',
    '避免深V领暴露胸部': '深V不是问题，问题是不合适',
    '避免过短上衣暴露腰腹': '露腰是别人的事，你先遮上',
    '避免过亮颜色显黑': '这颜色把你衬得像刚熬了夜',
    '避免过于暗沉显老': '不是所有黑色都显瘦，这件只会显老',
    '避免廉价材质显低档': '省钱不是这么省的，换件好料子吧',
  };
  return roastMap[warning] || `说真的，${warning}——你自己照镜子也看得出来吧？`;
}

export function getRoastReason(reason: string): string {
  return reason;
}

export function getRoastAlternative(alternatives: string[]): string {
  return `换 ${alternatives.join(' / ')} 试试，信我一次又不会少块肉`;
}

// ============================================================
// 毒舌贴纸数据
// ============================================================
// type: 'text' = 纯文字气泡贴纸（CSS 渲染，无需图片）
// type: 'image' = 图片/GIF 贴纸（从 public/stickers/ 引用）
// emotion: 用于在结果页根据得分/风格挑选贴纸

export interface RoastSticker {
  id: string;
  type: 'text' | 'image';
  text?: string;        // type=text 时的文字
  src?: string;         // type=image 时的图片路径，相对 public/，如 /stickers/xingxing.gif
  alt?: string;         // 图片 alt
  emotion: 'savage' | 'shock' | 'laugh' | 'speechless' | 'support';
}

// 内置文字贴纸 —— 不需要任何图片资源，开箱即用
export const ROAST_STICKERS_TEXT: RoastSticker[] = [
  { id: 't1', type: 'text', text: '你认真的？', emotion: 'speechless' },
  { id: 't2', type: 'text', text: '这也行？', emotion: 'shock' },
  { id: 't3', type: 'text', text: '我看不懂但我大受震撼', emotion: 'shock' },
  { id: 't4', type: 'text', text: '醒醒吧', emotion: 'savage' },
  { id: 't5', type: 'text', text: '就这？', emotion: 'savage' },
  { id: 't6', type: 'text', text: '谢邀，人在衣柜，刚想骂人', emotion: 'savage' },
  { id: 't7', type: 'text', text: '建议重新投胎', emotion: 'savage' },
  { id: 't8', type: 'text', text: '我替你尴尬', emotion: 'speechless' },
  { id: 't9', type: 'text', text: '好家伙', emotion: 'shock' },
  { id: 't10', type: 'text', text: '离谱给离谱开门', emotion: 'laugh' },
  { id: 't11', type: 'text', text: '有点东西（不多）', emotion: 'laugh' },
  { id: 't12', type: 'text', text: '还能救', emotion: 'support' },
];

// 图片/GIF 贴纸占位 —— 把下载的表情包放到 public/stickers/ 下，改这里的 src 即可
// 留空数组时组件会自动只用上面的文字贴纸
export const ROAST_STICKERS_IMAGE: RoastSticker[] = [
  // 示例（取消注释并放好图片后生效）：
  // { id: 'img1', type: 'image', src: '/stickers/xingxing.gif', alt: '星星眼', emotion: 'shock' },
  // { id: 'img2', type: 'image', src: '/stickers/wunai.png', alt: '无奈', emotion: 'speechless' },
  // { id: 'img3', type: 'image', src: '/stickers/doge.gif', alt: 'doge', emotion: 'savage' },
];

/** 随机挑 n 个贴纸（优先图片，不足用文字补） */
export function pickRoastStickers(count: number = 4): RoastSticker[] {
  const pool = [...ROAST_STICKERS_IMAGE, ...ROAST_STICKERS_TEXT];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}
