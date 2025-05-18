// app/cruises/[slug]/page.tsx
import { Metadata } from 'next';
import CruiseDetailComponent from './details';

export const metadata: Metadata = {
  title: {
    template: 'Prithvi Travels',
    default: 'Prithvi Travels',
  },
  description: 'Prithvi Travels , Best Travel Company',
  keywords: ['Cruises', 'Tours', 'Travels'],
  authors: [{ name: 'Prithvi Travels ', url: 'https://prithvi-travels-36eo.vercel.app' }],
  themeColor: '#FCFCFC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prithvi-travels-36eo.vercel.app/',
    siteName: 'Prithvi Travels',
    images: [
      {
        url: '/images/logo/logo.png',
        width: 1200,
        height: 630,
        alt: 'Your Site Name',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prithvi Travles',
    description: 'Best Travel Agency',
    images: ['/images/logo/logo.png'],
  },
};
// This tells TypeScript we're not using params in the page component
export default function Page() {
  return <CruiseDetailComponent />;
 
}


