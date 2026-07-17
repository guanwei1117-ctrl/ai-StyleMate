import { BadRequestException } from '@nestjs/common';

export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
export const IMAGE_UPLOAD_SIZE_LABEL = '8MB';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/;

export function validateImageDataUrl(value: string, fieldName: string): void {
  const match = value.match(DATA_URL_PATTERN);
  if (!match) {
    throw new BadRequestException(`${fieldName} 图片格式无效，请上传 JPG / PNG / WebP 图片。`);
  }

  const [, mimeType, base64Payload] = match;
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new BadRequestException(`${fieldName} 仅支持 JPG / PNG / WebP 图片。`);
  }

  const normalizedPayload = base64Payload.replace(/\s/g, '');
  const decodedBytes = Buffer.byteLength(normalizedPayload, 'base64');
  if (decodedBytes > MAX_IMAGE_UPLOAD_BYTES) {
    throw new BadRequestException(`${fieldName} 图片不能超过 ${IMAGE_UPLOAD_SIZE_LABEL}，请压缩后重新上传。`);
  }
}
