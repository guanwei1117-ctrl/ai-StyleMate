/**
 * 本地背景移除（抠图）工具
 *
 * 使用 @imgly/background-removal 在浏览器本地运行，
 * 不调任何远程 API，免费、隐私安全。
 */

let removeBgFn: ((blob: Blob) => Promise<Blob>) | null = null;

/** 懒加载抠图模块（首次调用时才下载模型，约 5MB） */
async function getRemoveBg() {
  if (!removeBgFn) {
    const mod = await import('@imgly/background-removal');
    removeBgFn = mod.removeBackground;
  }
  return removeBgFn;
}

export interface RemoveBackgroundOptions {
  /** 输出格式，默认 'image/png'（支持透明通道） */
  format?: 'image/png' | 'image/webp' | 'image/jpeg';
}

/**
 * 移除图片背景，返回透明背景的 Blob
 *
 * @param input - File / Blob / base64 string / URL
 * @param options - 可选配置
 * @returns 透明背景的 PNG Blob
 */
export async function removeBackground(
  input: File | Blob | string,
  options?: RemoveBackgroundOptions,
): Promise<Blob> {
  const removeBg = await getRemoveBg();

  // 如果是 base64 string，先转 Blob
  let blob: Blob;
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      const res = await fetch(input);
      blob = await res.blob();
    } else {
      const res = await fetch(input);
      blob = await res.blob();
    }
  } else {
    blob = input;
  }

  // 先压缩大图（>2MB 降采样），加速抠图
  if (blob.size > 2 * 1024 * 1024) {
    blob = await resizeBlob(blob, 1024);
  }

  const result = await removeBg(blob);
  return result;
}

/**
 * 将 Blob 转为 base64 data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Blob 转 base64 失败'));
    reader.readAsDataURL(blob);
  });
}

/** 缩放大图，保持比例 */
function resizeBlob(blob: Blob, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(blob);
        return;
      }
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob 失败'));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}
