'use client'
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TourCard from '@/components/Domestic/TourCard';
import Head from 'next/head';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules'; // Removed Pagination, added Autoplay
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay'; // Add autoplay CSS

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  location: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  startDate: string;
  status: string;
  tourType: string;
}

export default function FeaturedDomesticTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedDomesticTours = async () => {
      try {
        const toursRef = collection(db, 'tours');
        const q = query(
          toursRef,
          where('isFeatured', '==', true),
          where('tourType', '==', 'domestic'),
          where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const toursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Tour[];

        setTours(toursData);
      } catch (err) {
        console.error('Error fetching tours:', err);
        if (isMounted) {
          setError('Failed to load tours. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedDomesticTours();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading featured tours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Featured Domestic Tours | Your Travel Company</title>
        <meta name="description" content="Explore our featured domestic tour packages" />
      </Head>

      <main className="container mt-7 mx-auto px-4">
        <Link href="/tours">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
             Top Trending Trips in India & Beyond
            </h1>
          </div>
        </Link>

        {tours.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No featured domestic tours available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]} // Removed Pagination, added Autoplay
              spaceBetween={30}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 5000 , // Rotate every 3 seconds
                disableOnInteraction: false, // Continue autoplay after user interaction
              }}
              loop={true} // Enable infinite loop
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="py-4 px-2"
            >
              {tours.map((tour) => (
                <SwiperSlide key={tour.id}>
                  <div className="h-full flex justify-center">
                    <TourCard {...tour} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </main>
    </>
  );
}