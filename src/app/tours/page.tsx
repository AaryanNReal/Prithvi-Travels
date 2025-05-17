
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TourCard from '@/components/Domestic/TourCard';

interface Tour {
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
  price: number;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
}

async function getTours() {
  try {
    const toursCollection = collection(db, 'tours');
    const toursSnapshot = await getDocs(toursCollection);
    
    return toursSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        imageURL: data.imageURL || '',
        categoryDetails: data.categoryDetails || { 
          name: 'Uncategorized', 
          slug: 'uncategorized' 
        },
        isFeatured: data.isFeatured || false,
        numberofDays: data.numberofDays || 0,
        numberofNights: data.numberofNights || 0,
        price: data.price || 0,
        startDate: data.startDate || '',
        status: data.status || '',
        location: data.location || '',
        tourType: data.tourType || ''
      };
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
}

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <div className="min-h-screen bg-gray-50 mt-16 dark:bg-gray-900">
      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Our Tour Packages
        </h1>

        {tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No tours available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} {...tour} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}