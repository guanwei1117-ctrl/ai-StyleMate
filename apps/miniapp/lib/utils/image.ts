/**
 * 图片处理工具
 */

/** 选择图片（拍照或从相册） */
export function chooseImage(count: number = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const paths = res.tempFiles.map((f) => f.tempFilePath);
        resolve(paths);
      },
      fail(err) {
        if (err.errMsg.includes('cancel')) {
          resolve([]);
        } else {
          reject(err);
        }
      },
    });
  });
}

/** 压缩图片 */
export function compressImage(tempFilePath: string, quality: number = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: tempFilePath,
      quality,
      success(res) {
        resolve(res.tempFilePath);
      },
      fail(err) {
        // 压缩失败返回原图
        resolve(tempFilePath);
      },
    });
  });
}

/** 上传图片到后端（返回 URL） */
export async function uploadImage(tempFilePath: string, type: 'avatar' | 'outfit' | 'wardrobe' = 'outfit'): Promise<string> {
  const app = getApp();
  const token = app.globalData.token;

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: 'http://localhost:4000/api/v1/images/upload',
      filePath: tempFilePath,
      name: 'image',
      formData: { type },
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = JSON.parse(res.data);
          resolve(data.url || data.imageUrl);
        } else {
          reject(new Error('上传失败'));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '上传失败'));
      },
    });
  });
}