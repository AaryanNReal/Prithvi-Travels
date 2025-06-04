// app/cruises/page.tsx
import { Metadata } from 'next';
import CruisesClientPage from './CruisesClientPage';

export const metadata: Metadata = {
  title: 'Luxury Cruise Packages | Explore the World by Sea',
  description: 'Discover our exclusive collection of cruise vacations to stunning destinations worldwide. Book your dream cruise today!',
  keywords: ['cruise packages', 'luxury cruises', 'vacation at sea', 'cruise deals'],
  openGraph: {
    title: 'Luxury Cruise Packages | Explore the World by Sea',
    description: 'Discover our exclusive collection of cruise vacations',
    url: 'https://yourwebsite.com/cruises',
    images: [{
      url: 'https://yourwebsite.com/images/cruises-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Luxury Cruise Ship',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Cruise Packages',
    description: 'Discover our exclusive collection of cruise vacations',
    images: ['https://yourwebsite.com/images/cruises-twitter.jpg'],
  },
};

export default function CruisesPage() {
  return <CruisesClientPage />;
}