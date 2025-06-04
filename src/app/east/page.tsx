// app/tours/domestic/east/page.tsx
import { Metadata } from 'next';
import EasternToursClient from './EasternToursClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Eastern India Tours | Explore Eastern India with Our Travel Packages',
    description: 'Discover amazing Eastern India tour packages. Book your perfect getaway with our curated collection of travel experiences.',
    keywords: ['eastern india tours', 'east india travel', 'vacation packages', 'tour packages east india'],
    openGraph: {
      title: 'Eastern India Tours | Explore Eastern India',
      description: 'Discover amazing Eastern India tour packages',
      url: 'https://yourwebsite.com/tours/domestic/east',
      images: [{
        url: 'https://yourwebsite.com/images/eastern-tours-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Eastern India Tours',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Eastern India Tours | Explore Eastern India',
      description: 'Discover amazing Eastern India tour packages',
      images: ['https://yourwebsite.com/images/eastern-tours-twitter.jpg'],
    },
  };
}

export default function EasternToursPage() {
  return <EasternToursClient />;
}