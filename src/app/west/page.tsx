// app/tours/domestic/west/page.tsx
import { Metadata } from 'next';
import WestToursClient from './WestToursClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'West India Tours | Explore Western India Travel Packages',
    description: 'Discover amazing West India tour packages. Book your perfect getaway with our curated collection of travel experiences.',
    keywords: ['west india tours', 'west india travel', 'vacation packages', 'tour packages west india'],
    openGraph: {
      title: 'West India Tours | Explore Western India',
      description: 'Discover amazing West India tour packages',
      url: 'https://yourwebsite.com/tours/domestic/west',
      images: [{
        url: 'https://yourwebsite.com/images/west-tours-og.jpg',
        width: 1200,
        height: 630,
        alt: 'West India Tours',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'West India Tours | Explore Western India',
      description: 'Discover amazing West India tour packages',
      images: ['https://yourwebsite.com/images/west-tours-twitter.jpg'],
    },
  };
}

export default function WestToursPage() {
  return <WestToursClient />;
}