import { STYLES } from '../data/styles';
import {
  AGE_GROUP_LABELS,
  BUDGET_OPTIONS,
  CLIMATE_LABELS,
  DAILY_SCENE_LABELS,
  DRESSING_GOAL_LABELS,
  OCCUPATION_LABELS,
  PRIORITY_LABELS,
  type BodyShape,
  type OnboardingAnswers,
  type StyleMatchResult,
} from './onboarding-types';
import type { AiStyleProfileAnalysis } from './style-profile-api';
import { clearStyleProfileFromStorage, STYLE_PROFILE_STORAGE_KEY } from './style-profile-storage-core';

export interface ExtractedStyleIntent {
  likedKeywords: string[];
  dislikedKeywords: string[];
  desiredImpression: string[];
  scenes: string[];
  constraints: string[];
  rawStatement: string;
}

export interface StoredStyleProfile {
  createdAt: string;
  aiEnabled: boolean;
  aiAnalysis?: AiStyleProfileAnalysis;
  bodyShape: BodyShape;
  answersSummary: {
    gender: string | null;
    height: number | null;
    weight: number | null;
    ageGroup: string | null;
    occupation: string | null;
    budget: string | null;
    preferredStyles: string[];
    dressingGoals: string[];
    priorities: string[];
    dailyScenes: string[];
    customScene: string;
    city: string;
    climate: string | null;
    hasFacePhoto: boolean;
    hasFullBodyPhoto: boolean;
    bloggerId: string | null;
  };
  extractedIntent: ExtractedStyleIntent;
  results: StyleMatchResult[];
}

const positiveKeywords = [
  '清冷', '干净', '高级', '松弛', '少年感', '甜酷', '辣妹', '学院', '韩系',
  '法式', '日系', '新中式', '街头', '复古', '通勤', '老钱', '极简', '显高',
  '显瘦', '有质感', '自然', '文艺', '精致', '舒服', '不费力',
];

const negativeKeywords = [
  '讨厌', '不喜欢', '不要', '不想', '拒绝', '显矮', '显胖', '土', '廉价',
  '太甜', '太成熟', '太幼稚', '太花', '网红', '紧身', '夸张', '复杂',
];

const sceneKeywords = ['上学', '通勤', '上班', '办公室', '约会', '出街', '旅行', '面试', '拍照', '见客户', '客户会议', '聚会', '运动', '健身', '居家', '正式场合', '婚礼', '演出', '音乐节', '带娃', '亲子', '直播', '上镜', '探店'];
const impressionKeywords = ['干净', '清冷', '成熟', '亲和', '专业', '有钱', '有审美', '显高', '显瘦', '有气场', '温柔'];
const constraintKeywords = ['预算', '平价', '不露', '遮肉', '腿短', '肩宽', '胯宽', '小个子', '偏瘦', '微胖', '学生'];

function pickKeywords(text: string, candidates: string[]) {
  return candidates.filter((keyword) => text.includes(keyword));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function extractStyleIntent(statement: string): ExtractedStyleIntent {
  const text = statement.trim();
  const dislikedFromSentences = text
    .split(/[。！？!?\n]/)
    .filter((part) => negativeKeywords.some((keyword) => part.includes(keyword)))
    .flatMap((part) => pickKeywords(part, positiveKeywords));

  return {
    likedKeywords: unique(pickKeywords(text, positiveKeywords)),
    dislikedKeywords: unique([...pickKeywords(text, negativeKeywords), ...dislikedFromSentences]),
    desiredImpression: unique(pickKeywords(text, impressionKeywords)),
    scenes: unique(pickKeywords(text, sceneKeywords)),
    constraints: unique(pickKeywords(text, constraintKeywords)),
    rawStatement: statement,
  };
}

export function buildGeneratedStatement(answers: OnboardingAnswers) {
  const parts: string[] = [];
  const genderText = answers.gender === 'female' ? '女性' : answers.gender === 'male' ? '男性' : answers.gender === 'other' ? '不限定性别表达' : '';
  const ageText = answers.ageGroup ? AGE_GROUP_LABELS[answers.ageGroup] : '';
  const bodyText = [answers.height ? `${answers.height}cm` : '', answers.weight ? `${answers.weight}kg` : ''].filter(Boolean).join(' / ');
  const occupationText = answers.occupation ? OCCUPATION_LABELS[answers.occupation] : '';
  const climateText = answers.climate ? CLIMATE_LABELS[answers.climate] : '';
  const styleNames = answers.preferredStyleIds
    .map((id) => STYLES.find((style) => style.id === id)?.name)
    .filter(Boolean) as string[];
  const budgetText = answers.budget ? BUDGET_OPTIONS.find((item) => item.value === answers.budget)?.label : '';
  const goalText = answers.dressingGoals.map((goal) => DRESSING_GOAL_LABELS[goal]);
  const priorityText = answers.priorities.map((priority) => PRIORITY_LABELS[priority]);

  if (genderText || ageText || bodyText) {
    parts.push(`我的基础信息是：${[genderText, ageText, bodyText].filter(Boolean).join('，')}。`);
  }
  if (occupationText || answers.city || climateText) {
    parts.push(`我的日常场景主要是：${[occupationText, answers.city, climateText].filter(Boolean).join('，')}。`);
  }
  if (styleNames.length > 0) {
    parts.push(`我目前比较喜欢这些风格：${styleNames.slice(0, 8).join('、')}。`);
  }
  if (budgetText || goalText.length > 0 || priorityText.length > 0) {
    parts.push(`我的穿衣目标和限制是：${[budgetText ? `预算偏${budgetText}` : '', goalText.length ? `想要${goalText.join('、')}` : '', priorityText.length ? `优先考虑${priorityText.join(' > ')}` : ''].filter(Boolean).join('，')}。`);
  }
  parts.push('我还想补充：最近喜欢什么、讨厌什么、想呈现什么感觉，可以在这里继续写。');

  return parts.join('\n');
}

export function createStoredStyleProfile(
  answers: OnboardingAnswers,
  bodyShape: BodyShape,
  results: StyleMatchResult[],
  aiAnalysis?: AiStyleProfileAnalysis,
): StoredStyleProfile {
  return {
    createdAt: new Date().toISOString(),
    aiEnabled: !!aiAnalysis,
    aiAnalysis,
    bodyShape,
    answersSummary: {
      gender: answers.gender,
      height: answers.height,
      weight: answers.weight,
      ageGroup: answers.ageGroup ? AGE_GROUP_LABELS[answers.ageGroup] : null,
      occupation: answers.occupation ? OCCUPATION_LABELS[answers.occupation] : null,
      budget: answers.budget ? BUDGET_OPTIONS.find((item) => item.value === answers.budget)?.label ?? null : null,
      preferredStyles: answers.preferredStyleIds
        .map((id) => STYLES.find((style) => style.id === id)?.name)
        .filter(Boolean) as string[],
      dressingGoals: answers.dressingGoals.map((goal) => DRESSING_GOAL_LABELS[goal]),
      priorities: answers.priorities.map((priority) => PRIORITY_LABELS[priority]),
      dailyScenes: answers.dailyScenes.map((scene) => DAILY_SCENE_LABELS[scene]),
      customScene: answers.customScene,
      city: answers.city,
      climate: answers.climate ? CLIMATE_LABELS[answers.climate] : null,
      hasFacePhoto: !!answers.photoPreview,
      hasFullBodyPhoto: !!answers.fullBodyPhotoPreview,
      bloggerId: answers.bloggerId,
    },
    extractedIntent: extractStyleIntent(answers.userStatement),
    results,
  };
}

export function saveStyleProfile(profile: StoredStyleProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STYLE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadStyleProfile(): StoredStyleProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STYLE_PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) as StoredStyleProfile : null;
  } catch {
    return null;
  }
}

export function clearStyleProfile() {
  if (typeof window === 'undefined') return;
  clearStyleProfileFromStorage(window.localStorage);
}


