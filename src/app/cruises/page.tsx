'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase'; // Adjust this import based on your Firebase setup
import CruiseCard from '@/components/Cruises/cruise_card'; // Adjust the import path

// Define the interface locally since we're not importing it
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

const CruisesPage = () => {
  const [cruises, setCruises] = useState<CruiseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCruises = async () => {
      try {
        const cruisesCollection = collection(db, 'cruises');
        // You can add query constraints if needed, for example:
        // const q = query(cruisesCollection, where('status', '==', 'active'));
        const querySnapshot = await getDocs(cruisesCollection);
        
        const cruisesData: CruiseCardData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          cruisesData.push({
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
          });
        });
        
        setCruises(cruisesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cruises:', err);
        setError('Failed to load cruises. Please try again later.');
        setLoading(false);
      }
    };

    fetchCruises();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
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
};

export default CruisesPage;