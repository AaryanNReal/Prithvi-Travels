// app/tours/page.tsx (Server Component)
import { Metadata } from 'next';
import ToursClientComponent from './ToursClientComponent';

export const metadata: Metadata = {
  title: 'Explore Our Tour Packages | Prithvi Travels ',
  description: 'Discover our amazing collection of tour packages. From adventure trips to relaxing getaways, we have something for everyone.',
  keywords: [
    'tour packages',
    'vacation deals',
    'travel agency',
    'holiday tours',
    'adventure trips'
  ].join(', '),
  openGraph: {
    title: 'Our Tour Packages | Travel Agency',
    description: 'Browse our collection of handpicked tour packages for your next adventure.',
    url: '',
    siteName: 'Travel Agency',
    images: [
      {
        url: '/default-tour-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Agency Tours',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Tour Packages | Travel Agency',
    description: 'Browse our collection of handpicked tour packages for your next adventure.',
    images: '/default-tour-image.jpg',
  },
  alternates: {
    canonical: 'https://yourwebsite.com/tours',
  },
};

export default function ToursPage() {
  return (
    <div>
      <ToursClientComponent />
    </div>
  );
}