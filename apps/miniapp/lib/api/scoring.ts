/**
 * 穿搭评分 API
 */
import { request, uploadFile } from './request';
import type { EvaluateOutfitResponse } from '../types/scoring';

export async function evaluateOutfit(imagePath: string): Promise<EvaluateOutfitResponse> {
  return uploadFile<EvaluateOutfitResponse>('/scoring/evaluate', imagePath, 'image');
}

export async function getScoringHistory(page: number = 1, pageSize: number = 20): Promise<any> {
  return request(`/scoring/history?page=${page}&pageSize=${pageSize}`);
}

export async function getScoringDetail(recordId: string): Promise<any> {
  return request(`/scoring/${recordId}`);
}