'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import CruiseCard from '@/components/Cruises/cruise_card';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Cruise {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number | string;
  startDate: string;
  status: string;
  location: string;
  cruiseType: string;
}

const FeaturedCruisesPage = () => {
  const [featuredCruises, setFeaturedCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedCruises = async () => {
      try {
        const cruisesCollection = collection(db, 'cruises');
        const q = query(
          cruisesCollection,
          where('isFeatured', '==', true),
          where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const cruises = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cruise[];

        setFeaturedCruises(cruises);
      } catch (err) {
        console.error('Error fetching featured cruises:', err);
        if (isMounted) setError('Failed to load featured cruises');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedCruises();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading featured cruises...</p>
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/cruises">
          <div className="text-center mb-12 cursor-pointer">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Featured Cruise Packages
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Discover our specially selected cruise experiences
            </p>
          </div>
        </Link>

        {featuredCruises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No featured cruises available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="relative px-4 sm:px-6 lg:px-8">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="py-8"
            >
              {featuredCruises.map((cruise) => (
                <SwiperSlide key={cruise.id} className="pb-12">
                  <CruiseCard {...cruise} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedCruisesPage;