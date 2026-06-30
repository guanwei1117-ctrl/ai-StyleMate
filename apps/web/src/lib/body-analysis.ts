/**
 * 体型分析 —— 根据身高体重三围推导体型
 */

import type { BodyShape } from './onboarding-types';

/**
 * 根据身高/体重/三围推导体型分类
 * 逻辑：基于 WHR（腰臀比）和肩胸-腰-臀关系
 */
export function deriveBodyShape(
  height: number,
  weight: number,
  bust?: number | null,
  waist?: number | null,
  hip?: number | null,
): BodyShape {
  const bmi = calculateBMI(height, weight);

  // 没有三围数据 → 仅用 BMI 粗略判断
  if (!waist || !hip) {
    if (bmi >= 28) return 'apple';
    if (bmi >= 24) return 'rectangle';
    return 'rectangle'; // 默认
  }

  const whr = waist / hip;
  const bhp = bust ? bust / hip : null;

  // 倒三角：肩/胸明显大于臀
  if (bhp && bhp >= 1.05) {
    return 'inverted_triangle';
  }

  // 梨形：臀明显大于腰 (WHR ≤ 0.75 且臀大)
  if (whr <= 0.75) {
    return 'pear';
  }

  // 苹果形：腰臀比 ≥ 0.85（腰围接近或大于臀围）
  if (whr >= 0.85) {
    return 'apple';
  }

  // 沙漏形：腰臀比在 0.7-0.8 且胸臀接近
  if (whr >= 0.7 && whr <= 0.8 && bhp && bhp >= 0.9 && bhp <= 1.1) {
    return 'hourglass';
  }

  // 剩余归为 H 形
  return 'rectangle';
}

/** BMI 计算 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
