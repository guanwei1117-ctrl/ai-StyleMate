'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Navigation from '@/components/home/navigation';
import HeroSection from '@/components/home/hero-section';
import TrendingSection from '@/components/home/trending-section';
import StyleCategories from '@/components/home/style-categories';
import InspirationMasonry from '@/components/home/inspiration-masonry';
import BrandStory from '@/components/home/brand-story';
import Footer from '@/components/home/footer';

export default function HomePage() {
  const router = useRouter();

  // 老用户（已登录）→ 直接进 /wardrobe（不再看营销页，避免被拉去 /memory）
  // 新用户（未登录）→ 展示营销页
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/wardrobe');
    }
  }, [router]);

  return (
    <>
      <Navigation />
      <HeroSection />
      <TrendingSection />
      <StyleCategories />
      <InspirationMasonry />
      <BrandStory />
      <Footer />
    </>
  );
}
