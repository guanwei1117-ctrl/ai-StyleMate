/**
 * 首次建档完成后，把用户画像同步到后端（长期记忆）。
 * 用本地 userId 作为主键，确保与衣橱里的单品、风格偏好、体型 / 生活方式档案全部关联。
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

import type { OnboardingAnswers, StyleMatchResult } from './onboarding-types';

export async function syncProfileToServer(
  answers: OnboardingAnswers,
  results: StyleMatchResult[],
) {
  const userId = getLocalUserId();

  // 1. 创建用户（用本地 id 作为主键，与衣橱单品关联）
  await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, nickname: 'StyleMate 用户' }),
  });

  // 2. 风格偏好
  await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/style-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bodyShape: null,
      skinTone: null,
      skinSeasonType: null,
      shoulderWidth: undefined,
      chest: answers.bust,
      waist: answers.waist,
      hip: answers.hip,
    }),
  });

  // 4. 生活方式画像
  await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/lifestyle-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ageGroup: answers.ageGroup,
      occupation: answers.occupation,
      city: answers.city,
落地: answers.climate ?? answers.city,
      city: answers.city,
      climate: answers.climate,
      budgetLevel: answers.budget ?? 'mid',
      dressingGoals: answers.dressingGoals,
      priorities: answers.priorities,
      styleOpenness: answers.styleOpenness,
    }),
  });
}

function getLocalUserId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('stylemate_user_id') || '';
}
