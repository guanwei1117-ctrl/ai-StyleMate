import WardrobeItemDetailClient from './item-detail-client';

export function generateStaticParams() {
  return [{ id: 'preview' }];
}

export default function WardrobeItemDetailPage() {
  return <WardrobeItemDetailClient />;
}
