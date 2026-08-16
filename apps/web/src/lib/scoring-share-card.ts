import type { EvaluateOutfitResponse } from './scoring-types';

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

/**
 * 按最大宽度折行（供 canvas 绘制使用，纯函数可单测）
 */
export function wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = '';
  for (const ch of chars) {
    const testLine = current + ch;
    if (current && ctx.measureText(testLine).width > maxWidth) {
      lines.push(current);
      current = ch;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function averageScore(result: EvaluateOutfitResponse): number {
  if (result.dimensions.length === 0) return 0;
  return Math.round(
    result.dimensions.reduce((sum, item) => sum + item.score, 0) / result.dimensions.length,
  );
}

/**
 * 生成诊断报告分享卡片 PNG
 *
 * 纯 canvas 绘制，无第三方依赖。
 */
export function renderShareCardImage(
  result: EvaluateOutfitResponse,
  thumbnail?: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = SHARE_CARD_WIDTH;
    canvas.height = SHARE_CARD_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('canvas 不可用'));
      return;
    }

    const W = SHARE_CARD_WIDTH;
    const avg = averageScore(result);

    const draw = () => {
      // 背景
      ctx.fillStyle = '#f4f1ea';
      ctx.fillRect(0, 0, W, SHARE_CARD_HEIGHT);

      // 顶部深色横幅
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, 200);
      ctx.fillStyle = '#f4f1ea';
      ctx.font = '600 64px Georgia, "Times New Roman", serif';
      ctx.fillText('STYLEMATE', 64, 100);
      ctx.font = '400 30px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('今日 LOOK 诊断报告', 64, 156);

      // 缩略图（右侧圆形）
      if (thumbnail) {
        const img = new Image();
        img.onload = () => {
          const size = 150;
          const cx = W - 64 - size / 2;
          const cy = 100;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          const scale = Math.max(size / img.width, size / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
          ctx.restore();
          drawBody();
        };
        img.onerror = () => drawBody();
        img.src = thumbnail;
      } else {
        drawBody();
      }
    };

    const drawBody = () => {
      let y = 260;

      // 平均分
      ctx.fillStyle = '#0a0a0a';
      ctx.font = '700 120px Georgia, serif';
      ctx.fillText(String(avg), 64, y + 100);
      ctx.font = '400 30px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#6b6b63';
      ctx.fillText('/ 100 · 平均分', 64 + ctx.measureText(String(avg)).width + 24, y + 100);

      // 分隔线
      y += 160;
      ctx.strokeStyle = 'rgba(10,10,10,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(64, y);
      ctx.lineTo(W - 64, y);
      ctx.stroke();

      // 8 维评分条
      y += 56;
      ctx.fillStyle = '#0a0a0a';
      ctx.font = '600 26px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('八维评分', 64, y);
      y += 44;

      const barMaxWidth = W - 64 - 150 - 60;
      for (const dim of result.dimensions) {
        ctx.fillStyle = '#55554d';
        ctx.font = '400 24px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText(dim.label, 64, y);
        // 底槽
        ctx.fillStyle = 'rgba(10,10,10,0.08)';
        roundRect(ctx, 64 + 150, y - 18, barMaxWidth, 22, 11);
        ctx.fill();
        // 填充
        ctx.fillStyle = '#6b7f5e';
        const w = Math.max(8, (dim.score / 100) * barMaxWidth);
        roundRect(ctx, 64 + 150, y - 18, w, 22, 11);
        ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.font = '700 24px Georgia, serif';
        ctx.fillText(String(dim.score), 64 + 150 + barMaxWidth + 20, y);
        y += 46;
      }

      // 整体评价
      y += 30;
      ctx.strokeStyle = 'rgba(10,10,10,0.12)';
      ctx.beginPath();
      ctx.moveTo(64, y - 18);
      ctx.lineTo(W - 64, y - 18);
      ctx.stroke();

      ctx.fillStyle = '#0a0a0a';
      ctx.font = '600 26px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('整体评价', 64, y + 20);
      y += 58;
      ctx.fillStyle = '#3a3a34';
      ctx.font = '400 26px "PingFang SC", "Microsoft YaHei", sans-serif';
      const commentLines = wrapText(`“${result.overallComment}”`, W - 128, ctx);
      for (const line of commentLines.slice(0, 3)) {
        ctx.fillText(line, 64, y);
        y += 40;
      }

      // 改进建议
      y += 16;
      ctx.fillStyle = '#0a0a0a';
      ctx.font = '600 26px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('立即改进', 64, y);
      y += 44;
      ctx.fillStyle = '#3a3a34';
      ctx.font = '400 24px "PingFang SC", "Microsoft YaHei", sans-serif';
      for (const tip of result.improvements.slice(0, 2)) {
        const tipLines = wrapText(`0${result.improvements.indexOf(tip) + 1}  ${tip}`, W - 128, ctx);
        for (const line of tipLines.slice(0, 2)) {
          ctx.fillText(line, 64, y);
          y += 38;
        }
        y += 6;
      }

      // 底部
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, SHARE_CARD_HEIGHT - 96, W, 96);
      ctx.fillStyle = '#f4f1ea';
      ctx.font = '600 26px Georgia, serif';
      ctx.fillText('STYLEMATE', 64, SHARE_CARD_HEIGHT - 40);
      ctx.font = '400 22px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('找到属于你的穿搭', W - 64, SHARE_CARD_HEIGHT - 40);
      ctx.textAlign = 'left';

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('图片生成失败'));
      }, 'image/png');
    };

    draw();
  });
}
