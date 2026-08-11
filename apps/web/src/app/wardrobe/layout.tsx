import type { Metadata } from 'next';
import DockNav from '@/components/wardrobe/dock-nav';

export const metadata: Metadata = {
  title: '衣橱 — StyleMate',
};

export default function WardrobeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <DockNav />
    </>
  );
}
