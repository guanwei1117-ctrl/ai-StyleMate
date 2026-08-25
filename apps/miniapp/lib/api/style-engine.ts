/**
 * 风格引擎 API
 */
import { request } from './request';
import type { OnboardingAnswers } from '../types/onboarding';

export async function matchStyles(answers: Partial<OnboardingAnswers>): Promise<any> {
  return request('/style-engine/match', {
    method: 'POST',
    data: answers,
  });
}

export async function analyzePhoto(tempFilePath: string): Promise<any> {
  return request('/style-engine/analyze-photo', {
    method: 'POST',
    data: { imagePath: tempFilePath },
  });
}

export async function getStyleProfile(): Promise<any> {
  return request('/style-engine/profile');
}

export async function saveStyleProfile(data: any): Promise<any> {
  return request('/style-engine/profile', {
    method: 'POST',
    data,
  });
}