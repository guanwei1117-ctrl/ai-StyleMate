/**
 * 今日推荐 API
 */
import { request } from './request';

export async function getTodayOutfit(params?: { occasion?: string; styleGoal?: string }): Promise<any> {
  const query = params ? `?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}` : '';
  return request(`/recommendation/today${query}`);
}

export async function getRecommendationHistory(page: number = 1, pageSize: number = 20): Promise<any> {
  return request(`/recommendation/history?page=${page}&pageSize=${pageSize}`);
}