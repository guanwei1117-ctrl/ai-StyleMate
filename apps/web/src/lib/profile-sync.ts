/**
 * 首次建档完成后，把用户画像同步到后端（长期记忆）。
 */

import type { OnboardingAnswers, StyleMatchResult, BodyShape } from './onboarding-types';
import { BODY_SHAPE_LABELS, DRESSING_GOAL_LABELS, DAILY_SCENE_LABELS } from './onboarding-types';
import { STYLES } from '@/data/styles';
import { getCurrentUserId, getAuthToken } from './auth';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function syncProfileToServer(
  answers: OnboardingAnswers,
  results: StyleMatchResult[],
  bodyShape: BodyShape,
) {
  const userId = getCurrentUserId();

  // 1. 创建用户
  await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id: userId, nickname: 'StyleMate 用户' }),
  });

  // 2. 风格偏好
  await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/style-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      preferredStyles: answers.preferredStyleIds,
      dislikedStyles: [],
      budgetLevel: answers.budget ?? 'mid',
      favoriteColors: [],
    }),
  });

  // 3. 体型档案
  await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/body-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      bodyShape,
      skinTone: null,
      skinSeasonType: null,
      chest: answers.bust,
      waist: answers.waist,
      hip: answers.hip,
    }),
  });

  // 4. 生活方式画像
  await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/lifestyle-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      ageGroup: answers.ageGroup,
      occupation: answers.occupation,
      city: answers.city,
      climate: answers.climate,
      budgetLevel: answers.budget ?? 'mid',
      dressingGoals: answers.dressingGoals,
      priorities: answers.priorities,
      styleOpenness: answers.styleOpenness,
    }),
  });

  // 5. 本地匹配结果同步到长期记忆（best-effort，失败不影响建档）
  await syncLocalResultsToMemory(answers, results, bodyShape);
}

/**
 * 将本地测评结果写入服务端长期记忆
 * best-effort：失败不抛异常，确保建档流程不受影响
 */
export async function syncLocalResultsToMemory(
  answers: OnboardingAnswers,
  results: StyleMatchResult[],
  bodyShape: BodyShape,
) {
  const userId = getCurrentUserId();
  try {
    const topStyles = results.slice(0, 8);
    await fetch(`${API_BASE}/memory/${encodeURIComponent(userId)}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        bodyType: BODY_SHAPE_LABELS[bodyShape],
        suitableStyles: topStyles.map((r) => r.styleId),
        likedStyles: topStyles.slice(0, 3).map((r) => r.styleName),
        dressGoals: answers.dressingGoals.map((g) => DRESSING_GOAL_LABELS[g]),
        commonOccasions: answers.dailyScenes.map((s) => DAILY_SCENE_LABELS[s]),
      }),
    });
  } catch {
    // 静默处理 — memory 同步失败不影响建档
  }
}
