// app/tours/domestic/north/page.tsx
import { Metadata } from 'next';
import NorthToursClient from './NorthToursClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'North India Tours | Explore Northern India Travel Packages',
    description: 'Discover amazing North India tour packages. Book your perfect getaway with our curated collection of travel experiences.',
    keywords: ['north india tours', 'north india travel', 'vacation packages', 'tour packages north india'],
    openGraph: {
      title: 'North India Tours | Explore Northern India',
      description: 'Discover amazing North India tour packages',
      url: 'https://yourwebsite.com/tours/domestic/north',
      images: [{
        url: 'https://yourwebsite.com/images/north-tours-og.jpg',
        width: 1200,
        height: 630,
        alt: 'North India Tours',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'North India Tours | Explore Northern India',
      description: 'Discover amazing North India tour packages',
      images: ['https://yourwebsite.com/images/north-tours-twitter.jpg'],
    },
  };
}

export default function NorthToursPage() {
  return <NorthToursClient />;
}