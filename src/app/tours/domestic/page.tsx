// app/tours/international/page.tsx
import { Metadata } from 'next';
import InternationalToursClient from './InternationalToursClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'International Tours | Explore the World with Our Travel Packages',
    description: 'Discover amazing international tour packages across the globe. Book your perfect getaway with our curated collection of travel experiences.',
    keywords: ['international tours', 'world travel', 'vacation packages', 'international tour packages'],
    openGraph: {
      title: 'International Tours | Explore the World',
      description: 'Discover amazing international tour packages across the globe',
      url: 'https://yourwebsite.com/tours/international',
      images: [{
        url: 'https://yourwebsite.com/images/international-tours-og.jpg',
        width: 1200,
        height: 630,
        alt: 'International Tours Worldwide',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'International Tours | Explore the World',
      description: 'Discover amazing international tour packages across the globe',
      images: ['https://yourwebsite.com/images/international-tours-twitter.jpg'],
    },
  };
}

export default function InternationalToursPage() {
  return <InternationalToursClient />;
}