// app/custom-itinerary/[location]/page.tsx
import type { Metadata } from 'next';
import CreateCustomItineraryPage from './CreateCustomItineraryPage';

export async function generateMetadata(): Promise<Metadata> {
  const location = "Your Destination"; // Static location name

  return {
    title: `Custom ${location} Itinerary Builder | Plan Your Perfect Trip`,
    description: `Create your dream vacation itinerary for ${location}. Mix and match experiences to build your perfect trip.`,
    keywords: [
      `${location} itinerary`,
      'custom travel planner',
      'trip builder',
      'vacation planner',
      'travel package creator',
    ],
    openGraph: {
      title: `Plan Your ${location} Trip | Custom Itinerary Builder`,
      description: `Build your perfect ${location} vacation with our custom itinerary planner`,
      url: `https://yourwebsite.com/custom-itinerary`,
      images: [{
        url: `https://yourwebsite.com/images/itinerary-og.jpg`,
        width: 1200,
        height: 630,
        alt: `${location} Travel Itinerary`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Custom ${location} Itinerary Builder`,
      description: `Create your perfect trip to ${location}`,
      images: [`https://yourwebsite.com/images/itinerary-twitter.jpg`],
    },
    alternates: {
      canonical: `https://yourwebsite.com/custom-itinerary`,
    },
  };
}

export default async function Page() {
  return (
    <>
      {/* Server component wrapper */}
      <CreateCustomItineraryPage />
    </>
  );
}