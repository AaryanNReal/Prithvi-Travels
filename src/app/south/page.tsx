// app/tours/domestic/south/page.tsx
import { Metadata } from 'next';
import SouthToursClient from './SouthToursClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'South India Tours | Explore Southern India Travel Packages',
    description: 'Discover amazing South India tour packages. Book your perfect getaway with our curated collection of travel experiences.',
    keywords: ['south india tours', 'south india travel', 'vacation packages', 'tour packages south india'],
    openGraph: {
      title: 'South India Tours | Explore Southern India',
      description: 'Discover amazing South India tour packages',
      url: 'https://yourwebsite.com/tours/domestic/south',
      images: [{
        url: 'https://yourwebsite.com/images/south-tours-og.jpg',
        width: 1200,
        height: 630,
        alt: 'South India Tours',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'South India Tours | Explore Southern India',
      description: 'Discover amazing South India tour packages',
      images: ['https://yourwebsite.com/images/south-tours-twitter.jpg'],
    },
  };
}

export default function SouthToursPage() {
  return <SouthToursClient />;
}