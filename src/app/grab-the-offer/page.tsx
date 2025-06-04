// app/tours/special-offers/page.tsx
import { Metadata } from 'next';
import SpecialOffersClient from './SpecialOffersClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Special Tour Offers | Limited-Time Deals on Travel Packages',
    description: 'Discover exclusive limited-time offers on our best travel packages. Grab these special deals before they expire!',
    keywords: ['tour offers', 'travel deals', 'vacation discounts', 'limited-time offers'],
    openGraph: {
      title: 'Special Tour Offers | Limited-Time Deals',
      description: 'Discover exclusive limited-time offers on our best travel packages',
      url: 'https://yourwebsite.com/tours/special-offers',
      images: [{
        url: 'https://yourwebsite.com/images/special-offers-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Special Tour Offers',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Special Tour Offers | Limited-Time Deals',
      description: 'Discover exclusive limited-time offers on our best travel packages',
      images: ['https://yourwebsite.com/images/special-offers-twitter.jpg'],
    },
  };
}

export default function SpecialOffersPage() {
  return <SpecialOffersClient />;
}