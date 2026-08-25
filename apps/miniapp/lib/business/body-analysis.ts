/**
 * 体型分析 —— 根据身高体重三围推导体型（从 Web 端复制）
 */
import type { BodyShape } from '../types/onboarding';

export function deriveBodyShape(
  height: number,
  weight: number,
  bust?: number | null,
  waist?: number | null,
  hip?: number | null,
): BodyShape {
  const bmi = calculateBMI(height, weight);
  if (!waist || !hip) {
    if (bmi >= 28) return 'apple';
    if (bmi >= 24) return 'rectangle';
    return 'rectangle';
  }
  const whr = waist / hip;
  const bhp = bust ? bust / hip : null;
  if (bhp && bhp >= 1.05) return 'inverted_triangle';
  if (whr <= 0.75) return 'pear';
  if (whr >= 0.85) return 'apple';
  if (whr >= 0.7 && whr <= 0.8 && bhp && bhp >= 0.9 && bhp <= 1.1) return 'hourglass';
  return 'rectangle';
}

export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}