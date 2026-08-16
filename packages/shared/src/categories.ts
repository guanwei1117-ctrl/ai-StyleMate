/**
 * 衣物分类体系 — 统一的一级类目 + 二级子类常量表
 *
 * 该表是：
 *  1. 添加衣物时级联选择的数据源
 *  2. AI 识别时 subCategory 的候选集
 *  3. 筛选的二级维度
 *
 * 前端与后端共享，避免两处维护不一致。
 */

export const CLOTHING_CATEGORIES = [
  'top',
  'outerwear',
  'bottom',
  'dress',
  'shoes',
  'bag',
  'hat',
  'accessory',
] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

/** 二级子类候选集：一级类目 → 子类列表 */
export const SUBCATEGORY_MAP: Record<ClothingCategory, string[]> = {
  top: ['T恤', 'Polo衫', '衬衫', '卫衣', '毛衣/针织衫', '背心/吊带', '马甲'],
  outerwear: ['夹克', '风衣', '大衣', '羽绒服/棉服', '西装外套', '开衫', '棒球服/运动外套'],
  bottom: ['长裤', '短裤', '半身裙'],
  dress: ['连衣裙', '连体裤', '背带裤/背带裙'],
  shoes: ['运动鞋', '帆布鞋', '皮鞋', '高跟鞋', '凉鞋/拖鞋', '靴子'],
  bag: ['背包', '手提包', '单肩包/斜挎包', '手拿包/钱包'],
  hat: ['棒球帽', '贝雷帽', '渔夫帽', '草帽/礼帽', '针织帽/毛线帽'],
  accessory: ['围巾/披肩', '手套', '腰带', '领带/领结', '首饰', '太阳镜/眼镜', '手表'],
};

/** 一级类目中文标签 */
export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: '上装',
  outerwear: '外套',
  bottom: '下装',
  dress: '连体装',
  shoes: '鞋类',
  bag: '包袋',
  hat: '帽子',
  accessory: '配饰',
};
