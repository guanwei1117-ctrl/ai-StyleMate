import type { Metadata } from 'next';
import WardrobeSubNav from '@/components/wardrobe/sub-nav';

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
      <WardrobeSubNav />
      {children}
    </>
  );
}
