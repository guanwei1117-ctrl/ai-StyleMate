export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
export const IMAGE_UPLOAD_SIZE_LABEL = '8MB';
export const ACCEPTED_IMAGE_MIME_TYPES = 'image/jpeg,image/png,image/webp';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type ImageFileLike = Pick<File, 'type' | 'size'>;

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateImageFile(file: ImageFileLike): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: '请上传 JPG / PNG / WebP 图片文件。' };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false, message: `图片不能超过 ${IMAGE_UPLOAD_SIZE_LABEL}，请压缩后重新上传。` };
  }

  return { ok: true };
}


