import Navigation from '@/components/home/navigation';
import HeroSection from '@/components/home/hero-section';
import TrendingSection from '@/components/home/trending-section';
import StyleCategories from '@/components/home/style-categories';
import InspirationMasonry from '@/components/home/inspiration-masonry';
import BrandStory from '@/components/home/brand-story';
import Footer from '@/components/home/footer';

export default function HomePage() {
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
