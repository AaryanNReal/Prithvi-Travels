// app/cruises/page.tsx
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import CruiseCard from '@/components/Cruises/cruise_card';
import type { Metadata } from 'next';
import Link from 'next/link';
interface CruiseCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number | string;
  startDate: string;
  status: string;
  location: string;
  cruiseType: string;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
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
}

async function getCruisesData(): Promise<CruiseCardData[]> {
  try {
    const cruisesCollection = collection(db, 'cruises');
    const querySnapshot = await getDocs(cruisesCollection);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        imageURL: data.imageURL,
        categoryDetails: data.categoryDetails,
        isFeatured: data.isFeatured || false,
        numberofDays: data.numberofDays,
        numberofNights: data.numberofNights,
        price: data.price,
        startDate: data.startDate,
        status: data.status,
        location: data.location,
        cruiseType: data.cruiseType,
      };
    });
  } catch (err) {
    console.error('Error fetching cruises:', err);
    throw new Error('Failed to load cruises');
  }
}

export default async function CruisesPage() {
  let cruises: CruiseCardData[] = [];
  let error = '';

  try {
    cruises = await getCruisesData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load cruises';
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
        <Link 
          href="/cruises"
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Cruise Packages
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover amazing destinations with our curated cruise experiences
          </p>
        </div>

        {cruises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No cruises available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cruises.map((cruise) => (
              <CruiseCard
                key={cruise.id}
                id={cruise.id}
                title={cruise.title}
                slug={cruise.slug}
                description={cruise.description}
                imageURL={cruise.imageURL}
                categoryDetails={cruise.categoryDetails}
                isFeatured={cruise.isFeatured}
                numberofDays={cruise.numberofDays}
                numberofNights={cruise.numberofNights}
                price={cruise.price}
                startDate={cruise.startDate}
                status={cruise.status}
                location={cruise.location}
                cruiseType={cruise.cruiseType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}