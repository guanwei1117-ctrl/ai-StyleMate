import type { OnboardingAnswers, StyleMatchResult } from './onboarding-types';
import { DAILY_SCENE_LABELS } from './onboarding-types';
import type { StyleCard } from '../data/styles';
import { DIMENSION_LABELS, STYLES } from '../data/styles';
import { extractStyleIntent } from './style-profile-storage';
import { buildApiErrorMessage } from './api-error';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface AiStyleProfileAnalysis {
  aiEnabled: true;
  providerModel: string;
  summary: string;
  visualAnalysis: {
    face: string;
    body: string;
    confidence: number;
  };
  intentAnalysis: {
    likedKeywords: string[];
    dislikedKeywords: string[];
    desiredImpression: string[];
    scenes: string[];
    constraints: string[];
    cleanedStatement: string;
  };
  recommendedStyles: Array<{
    styleId: string;
    score: number;
    reasons: string[];
    notices: string[];
  }>;
  avoidanceAdvice: string[];
  nextActions: string[];
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

function findStyle(styleId: string): StyleCard | undefined {
  return STYLES.find((style) => style.id === styleId);
}

export function buildStyleProfilePayload(
  answers: OnboardingAnswers,
  bodyShape: string,
  localResults: StyleMatchResult[],
  faceImageBase64?: string,
  fullBodyImageBase64?: string,
) {
  const candidates = localResults.slice(0, 12).map((result) => {
    const style = findStyle(result.styleId);
    return {
      styleId: result.styleId,
      styleName: result.styleName,
      category: result.category,
      dimension: style?.dimension,
      dimensionLabel: style ? DIMENSION_LABELS[style.dimension] : undefined,
      localScore: result.score,
      pillars: result.pillars,
      breakdown: result.matchBreakdown,
      description: style?.description,
      philosophy: style?.philosophy,
      difficulty: style?.difficulty,
      silhouette: style?.silhouette ?? [],
      keyItems: style?.keyItems ?? [],
      colorPalette: style?.colorPalette ?? [],
      matchReasons: result.matchReasons,
    };
  });

  return {
    profile: {
      gender: answers.gender,
      ageGroup: answers.ageGroup,
      height: answers.height,
      weight: answers.weight,
      bust: answers.bust,
      waist: answers.waist,
      hip: answers.hip,
      bodyShape,
      occupation: answers.occupation,
      dailyScenes: answers.dailyScenes,
      customScene: answers.customScene.trim(),
      sceneLabels: answers.dailyScenes.map((scene) => DAILY_SCENE_LABELS[scene]),
      city: answers.city,
      climate: answers.climate,
      budget: answers.budget,
      dressingGoals: answers.dressingGoals,
      priorities: answers.priorities,
      styleOpenness: answers.styleOpenness,
      preferredStyleIds: answers.preferredStyleIds,
      userStatement: answers.userStatement,
      hasFacePhoto: !!answers.photo,
      hasFullBodyPhoto: !!answers.fullBodyPhoto,
      extractedIntent: extractStyleIntent(answers.userStatement),
    },
    candidates,
    faceImageBase64,
    fullBodyImageBase64,
  };
}

export async function analyzeStyleProfileWithAi(
  answers: OnboardingAnswers,
  bodyShape: string,
  localResults: StyleMatchResult[],
): Promise<AiStyleProfileAnalysis> {
  const [faceImageBase64, fullBodyImageBase64] = await Promise.all([
    answers.photo ? fileToDataUrl(answers.photo) : Promise.resolve(undefined),
    answers.fullBodyPhoto ? fileToDataUrl(answers.fullBodyPhoto) : Promise.resolve(undefined),
  ]);

  const res = await fetch(`${API_BASE}/scoring/style-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildStyleProfilePayload(answers, bodyShape, localResults, faceImageBase64, fullBodyImageBase64)),
  });

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, 'AI 风格分析请求失败'));
  }

  const json: ApiResponse<AiStyleProfileAnalysis> = await res.json();
  if (json.code !== 200) {
    throw new Error(json.message || 'AI 风格分析失败');
  }

  return json.data;
}

export function mergeAiStyleResults(
  localResults: StyleMatchResult[],
  aiAnalysis: AiStyleProfileAnalysis,
): StyleMatchResult[] {
  const used = new Set<string>();
  const byId = new Map(localResults.map((result) => [result.styleId, result]));

  const aiRanked = aiAnalysis.recommendedStyles
    .map((item) => {
      const local = byId.get(item.styleId);
      if (!local) return null;
      used.add(item.styleId);
      const reasons = [
        ...item.reasons,
        ...item.notices.map((notice) => `注意：${notice}`),
      ].filter(Boolean);
      return {
        ...local,
        score: item.score,
        matchReasons: reasons.length > 0 ? reasons : local.matchReasons,
      };
    })
    .filter((item): item is StyleMatchResult => Boolean(item));

  return [
    ...aiRanked,
    ...localResults.filter((result) => !used.has(result.styleId)),
  ].slice(0, localResults.length);
}
