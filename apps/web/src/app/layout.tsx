import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StyleMate - AI 个人风格顾问',
  description: '为 16-25 岁用户建立个人风格档案，提供专业、年轻、可执行的穿搭建议。',
  keywords: ['穿搭', '风格', 'AI 形象顾问', '风格测评', '穿搭诊断'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  );
}
