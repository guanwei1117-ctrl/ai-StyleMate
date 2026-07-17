import type { EvaluateOutfitResponse } from './scoring-types';

function calculateAverageScore(result: EvaluateOutfitResponse): number {
  if (result.dimensions.length === 0) return 0;
  return Math.round(result.dimensions.reduce((sum, item) => sum + item.score, 0) / result.dimensions.length);
}

export function buildScoringSummaryText(result: EvaluateOutfitResponse): string {
  const averageScore = calculateAverageScore(result);
  const topDimensions = result.dimensions
    .slice(0, 3)
    .map((item) => `${item.label} ${item.score}`)
    .join('、');
  const improvements = result.improvements
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');

  return [
    'StyleMate 今日 Look 诊断',
    `诊断视角：${result.bloggerName}`,
    `平均分：${averageScore}`,
    topDimensions ? `关键维度：${topDimensions}` : '',
    `整体评价：${result.overallComment}`,
    improvements ? `立即改进：\n${improvements}` : '',
  ].filter(Boolean).join('\n');
}
