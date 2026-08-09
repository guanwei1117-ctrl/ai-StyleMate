/**
 * 客户端图片压缩工具
 *
 * 在 base64 编码上传前，使用 Canvas API 将图片缩放到合理尺寸，
 * 减少 AI API 传输数据量，降低成本和延迟。
 *
 * 策略：
 * - 只压缩宽度 > maxWidth 或文件 > sizeThreshold 的图片
 * - 优先输出 WebP（更小），不支持时回退 JPEG
 * - 保持 EXIF 方向（由浏览器处理）
 */

const DEFAULT_MAX_WIDTH = 1024;
const DEFAULT_QUALITY = 0.8;
const SIZE_THRESHOLD_BYTES = 500 * 1024; // 500KB

export interface CompressOptions {
  /** 最大宽度（像素），默认 1024 */
  maxWidth?: number;
  /** 输出质量 0-1，默认 0.8 */
  quality?: number;
  /** 文件大小阈值（字节），超过才压缩，默认 500KB */
  sizeThreshold?: number;
}

/**
 * 压缩图片文件。如果图片已经足够小，直接返回原 File。
 * 在非浏览器环境下返回原 File（不压缩）。
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const { maxWidth = DEFAULT_MAX_WIDTH, quality = DEFAULT_QUALITY, sizeThreshold = SIZE_THRESHOLD_BYTES } = options;

  // SSR / 非浏览器环境：直接返回原文件
  if (typeof window === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    return file;
  }

  // 小于阈值不压缩
  if (file.size <= sizeThreshold) {
    return file;
  }

  try {
    const compressed = await compressWithCanvas(file, maxWidth, quality);
    // 如果压缩后更大，返回原文件
    if (compressed.size >= file.size) {
      return file;
    }
    return compressed;
  } catch {
    // 压缩失败时返回原文件，不影响主流程
    return file;
  }
}

async function compressWithCanvas(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<File> {
  const image = await loadImage(file);
  const { width, height } = calculateDimensions(image.width, image.height, maxWidth);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法获取 Canvas 2D 上下文');
  }

  ctx.drawImage(image, 0, 0, width, height);

  // 优先 WebP，不支持则 JPEG
  const mimeType = canEncodeWebP(canvas) ? 'image/webp' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, mimeType, quality);

  const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `${file.name || 'image'}.${ext}`, { type: mimeType });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
): { width: number; height: number } {
  if (srcWidth <= maxWidth) {
    return { width: srcWidth, height: srcHeight };
  }
  const ratio = maxWidth / srcWidth;
  return {
    width: maxWidth,
    height: Math.round(srcHeight * ratio),
  };
}

function canEncodeWebP(canvas: HTMLCanvasElement): boolean {
  try {
    const dataUrl = canvas.toDataURL('image/webp', 0.01);
    return dataUrl.startsWith('data:image/webp');
  } catch {
    return false;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob 失败'));
        }
      },
      mimeType,
      quality,
    );
  });
}
