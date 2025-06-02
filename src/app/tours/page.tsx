import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TourCard from '@/components/Domestic/TourCard';
import { Metadata } from 'next';

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

export async function generateMetadata(): Promise<Metadata> {
  const tours = await getTours();
  const featuredTours = tours.filter(tour => tour.isFeatured);
  
  return {
    title: 'Explore Our Tour Packages | Travel Agency',
    description: 'Discover our amazing collection of tour packages. From adventure trips to relaxing getaways, we have something for everyone.',
    keywords: [
      'tour packages',
      'vacation deals',
      'travel agency',
      'holiday tours',
      'adventure trips',
      ...tours.map(tour => tour.location),
      ...tours.map(tour => tour.tourType)
    ].filter(Boolean).join(', '),
    openGraph: {
      title: 'Our Tour Packages | Travel Agency',
      description: 'Browse our collection of handpicked tour packages for your next adventure.',
      url: 'https://yourwebsite.com/tours',
      siteName: 'Travel Agency',
      images: featuredTours.length > 0 
        ? [
            {
              url: featuredTours[0].imageURL,
              width: 800,
              height: 600,
              alt: featuredTours[0].title,
            }
          ]
        : [
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
      images: featuredTours.length > 0 
        ? featuredTours[0].imageURL 
        : '/default-tour-image.jpg',
    },
    alternates: {
      canonical: 'https://yourwebsite.com/tours',
    },
  };
}

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <div className="min-h-screen mt-16 dark:bg-gray-900">
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