/**
 * 基础 API 请求封装 —— wx.request + 认证注入
 */

const API_BASE = 'http://localhost:4000/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  header?: Record<string, string>;
  showLoading?: boolean;
}

function getToken(): string | null {
  try {
    return wx.getStorageSync('token') || null;
  } catch {
    return null;
  }
}

function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, header = {}, showLoading = false } = options;

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${url}`,
      method,
      data,
      header: headers,
      success(res) {
        if (showLoading) wx.hideLoading();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          const errMsg = (res.data as any)?.message || `请求失败 (${res.statusCode})`;
          wx.showToast({ title: errMsg, icon: 'none' });
          reject(new Error(errMsg));
        }
      },
      fail(err) {
        if (showLoading) wx.hideLoading();
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        reject(new Error(err.errMsg || '网络异常'));
      },
    });
  });
}

/** 上传文件（multipart/form-data） */
function uploadFile<T = any>(url: string, filePath: string, name: string = 'file', formData?: Record<string, any>): Promise<T> {
  const token = getToken();
  const header: Record<string, string> = {};
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}${url}`,
      filePath,
      name,
      formData,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(res.data) as T);
          } catch {
            resolve(res.data as unknown as T);
          }
        } else {
          try {
            const errData = JSON.parse(res.data);
            wx.showToast({ title: errData.message || '上传失败', icon: 'none' });
            reject(new Error(errData.message || '上传失败'));
          } catch {
            reject(new Error('上传失败'));
          }
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败，请稍后重试', icon: 'none' });
        reject(new Error(err.errMsg || '上传失败'));
      },
    });
  });
}

export { API_BASE, request, uploadFile };