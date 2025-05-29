'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import CruiseCard from '@/components/Cruises/cruise_card';
import Head from 'next/head';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Cruise {
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
  price: number | string;
  startDate: string;
  status: string;
  cruiseType: string;
}

export default function FeaturedCruises() {
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedCruises = async () => {
      try {
        const cruisesRef = collection(db, 'cruises');
        const q = query(
          cruisesRef,
          where('isFeatured', '==', true),
          where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const cruisesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cruise[];

        setCruises(cruisesData);
      } catch (err) {
        console.error('Error fetching cruises:', err);
        if (isMounted) {
          setError('Failed to load cruises. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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
    <>
      <Head>
        <title>Featured Cruise Packages | Your Travel Company</title>
        <meta name="description" content="Explore our featured cruise vacation packages" />
      </Head>

      <main className="container mx-auto px-4  border-b py-8 mt-5">
        <Link href="/cruises">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Editor's Choice: Cruise Getaways
            </h1>
          </div>
        </Link>

        {cruises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No featured cruises available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="relative">
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
              className="py-4 px-2"
            >
              {cruises.map((cruise) => (
                <SwiperSlide key={cruise.id} className="pb-10">
                  <div className="h-full flex justify-center">
                    <CruiseCard {...cruise} />
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