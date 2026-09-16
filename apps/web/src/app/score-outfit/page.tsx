import { redirect } from 'next/navigation';

/**
 * 「今日穿搭诊断」旧路由 —— 已合并到「拍立搭」诊断模式
 * 保留路由做服务端 307 重定向，避免破坏外链
 */
export default function ScoreOutfitPage() {
  redirect('/styles/camera?mode=diagnose');
}