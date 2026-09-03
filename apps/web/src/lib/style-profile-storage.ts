import { STYLES } from '../data/styles';
import {
  AGE_GROUP_LABELS,
  BUDGET_OPTIONS,
  CLIMATE_LABELS,
  DAILY_SCENE_LABELS,
  DRESSING_GOAL_LABELS,
  OCCUPATION_LABELS,
  PRIORITY_LABELS,
  ageToGroup,
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

/** 从用户自由文字中提取结构化偏好 */
export interface ExtractedStylePreference {
  likedKeywords: string[];
  dislikedKeywords: string[];
  desiredImpression: string[];
  scenes: string[];
  constraints: string[];
  /** 检测到的风格 ID 列表（匹配 STYLES 名称/分类/关键词） */
  styleIds: string[];
  /** 检测到的预算档位 */
  budget: string | null;
  /** 检测到的穿搭目标 */
  dressingGoals: string[];
  /** 检测到的优先级 */
  priorities: string[];
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

// 预算关键词 → BudgetLevel
const BUDGET_KEYWORDS: Record<string, string> = {
  '平价': 'budget', '实惠': 'budget', '便宜': 'budget', '省钱': 'budget', '学生党': 'budget',
  '中等': 'mid', '适中': 'mid', '中等价位': 'mid', '设计师': 'mid',
  '轻奢': 'premium', '奢侈': 'premium', '高端': 'premium', '贵': 'premium', '大牌': 'premium',
};

// 穿搭目标关键词 → DressingGoal
const GOAL_KEYWORDS: Record<string, string> = {
  '得体': 'look_polished', '精致': 'look_polished', '优雅': 'look_polished',
  '个性': 'express_personality', '态度': 'express_personality', '独特': 'express_personality',
  '舒适': 'comfort_first', '舒服': 'comfort_first', '自在': 'comfort_first',
  '显瘦': 'look_slim', '显高': 'look_slim', '修饰': 'look_slim',
  '职场': 'professional', '专业': 'professional', '正式': 'professional', '通勤': 'professional',
  '尝试': 'try_new_style', '突破': 'try_new_style', '新风格': 'try_new_style',
  '胶囊': 'build_wardrobe', '精简': 'build_wardrobe', '基础款': 'build_wardrobe',
};

// 优先级关键词 → PriorityDimension
const PRIORITY_KW: Record<string, string> = {
  '舒适': 'comfort', '舒服': 'comfort', '不束缚': 'comfort',
  '显瘦': 'slimming', '显高': 'slimming', '比例': 'slimming',
  '质感': 'texture', '面料': 'texture', '高级': 'texture', '剪裁': 'texture',
  '个性': 'personality', '辨识度': 'personality', '独特': 'personality',
};

export function extractStylePreference(statement: string): ExtractedStylePreference {
  const base = extractStyleIntent(statement);
  const text = statement.trim();

  // 匹配风格名称 → styleIds
  const styleIds: string[] = [];
  for (const style of STYLES) {
    if (text.includes(style.name)) {
      styleIds.push(style.id);
    }
  }

  // 检测预算
  let budget: string | null = null;
  for (const [kw, level] of Object.entries(BUDGET_KEYWORDS)) {
    if (text.includes(kw)) { budget = level; break; }
  }

  // 检测穿搭目标
  const dressingGoals = unique(
    Object.entries(GOAL_KEYWORDS)
      .filter(([kw]) => text.includes(kw))
      .map(([, goal]) => goal),
  );

  // 检测优先级（按出现顺序排序，最多4个）
  const priorities = unique(
    Object.entries(PRIORITY_KW)
      .filter(([kw]) => text.includes(kw))
      .map(([, p]) => p),
  );

  return { ...base, styleIds, budget, dressingGoals, priorities };
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
  const ageText = answers.age ? `${answers.age}岁` : '';
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
      age: answers.age,
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


