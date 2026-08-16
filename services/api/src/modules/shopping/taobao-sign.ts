import * as crypto from 'crypto';

/**
 * 淘宝开放平台 MD5 签名（taobao.tbk.* 系列接口通用）
 *
 * 规则：
 *  1. 所有请求参数（不含 sign）按 key 字典序升序排列；
 *  2. 拼接 key + value（无分隔符）；
 *  3. 首尾拼接 appSecret；
 *  4. MD5 后转大写十六进制。
 */
export function signTaobaoParams(
  params: Record<string, string>,
  appSecret: string,
): string {
  const keys = Object.keys(params).sort();
  const raw = keys.map((key) => `${key}${params[key]}`).join('');
  const signed = appSecret + raw + appSecret;
  return crypto.createHash('md5').update(signed, 'utf8').digest('hex').toUpperCase();
}

/**
 * 淘宝开放平台统一时间戳格式：yyyy-MM-dd HH:mm:ss（东八区）
 */
export function taobaoTimestamp(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const offset = 8 * 60 * 60 * 1000; // 东八区
  const local = new Date(now.getTime() + offset);
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ` +
    `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}`
  );
}
