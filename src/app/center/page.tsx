// app/tours/domestic/central/page.tsx
import { Metadata } from 'next';
import CentralToursClient from './CentralToursClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Central India Tours | Explore Central India Travel Packages',
    description: 'Discover amazing Central India tour packages. Book your perfect getaway with our curated collection of travel experiences.',
    keywords: ['central india tours', 'central india travel', 'vacation packages', 'tour packages central india'],
    openGraph: {
      title: 'Central India Tours | Explore Central India',
      description: 'Discover amazing Central India tour packages',
      url: 'https://yourwebsite.com/tours/domestic/central',
      images: [{
        url: 'https://yourwebsite.com/images/central-tours-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Central India Tours',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Central India Tours | Explore Central India',
      description: 'Discover amazing Central India tour packages',
      images: ['https://yourwebsite.com/images/central-tours-twitter.jpg'],
    },
  };
}

export default function CentralToursPage() {
  return <CentralToursClient />;
}