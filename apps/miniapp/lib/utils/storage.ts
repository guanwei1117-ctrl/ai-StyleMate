/**
 * wx storage 封装
 */

export function get<T = any>(key: string): T | null {
  try {
    const raw = wx.getStorageSync(key);
    return raw || null;
  } catch {
    return null;
  }
}

export function set(key: string, value: any): void {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error(`[storage] set failed: ${key}`, e);
  }
}

export function remove(key: string): void {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error(`[storage] remove failed: ${key}`, e);
  }
}

export function clear(): void {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('[storage] clear failed', e);
  }
}

export function getJSON<T = any>(key: string): T | null {
  try {
    const raw = wx.getStorageSync(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

export function setJSON(key: string, value: any): void {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[storage] setJSON failed: ${key}`, e);
  }
}