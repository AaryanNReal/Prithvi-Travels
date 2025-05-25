// app/blog/visa-expert/page.tsx
import type { Metadata } from 'next';
import VisaExpertPage from './VisaExpertPage';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Visa Expert Articles | Professional Visa Guidance & Tips',
    description: 'Get expert advice on visa requirements, application processes, and latest updates for hassle-free international travel.',
    keywords: [
      'visa expert',
      'visa application guide',
      'travel visa requirements',
      'visa tips',
      'immigration advice'
    ],
    openGraph: {
      title: 'Visa Expert Articles | Professional Visa Guidance',
      description: 'Expert visa advice for smooth international travel',
      url: 'https://yourwebsite.com/blog/visa-expert',
      images: [{
        url: 'https://yourwebsite.com/images/visa-expert-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Visa Expert Articles',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Visa Expert Articles',
      description: 'Professional visa guidance for travelers',
      images: ['https://yourwebsite.com/images/visa-expert-twitter.jpg'],
    },
    alternates: {
      canonical: 'https://yourwebsite.com/blog/visa-expert',
    },
  };
}

export default function Page() {
  return <VisaExpertPage />;
}