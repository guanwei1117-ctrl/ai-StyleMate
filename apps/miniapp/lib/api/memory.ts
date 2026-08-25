/**
 * 记忆 API
 */
import { request } from './request';

export async function getMemoryList(page: number = 1, pageSize: number = 20): Promise<any> {
  return request(`/memory?page=${page}&pageSize=${pageSize}`);
}

export async function getMemoryDetail(memoryId: string): Promise<any> {
  return request(`/memory/${memoryId}`);
}

export async function deleteMemory(memoryId: string): Promise<any> {
  return request(`/memory/${memoryId}`, { method: 'DELETE' });
}