'use client'
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TourCard from '@/components/Domestic/TourCard';
import Head from 'next/head';

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
        const toursData: Tour[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          toursData.push({
            id: doc.id,
            title: data.title,
            slug: data.slug,
            description: data.description,
            imageURL: data.imageURL,
            location: data.location,
            categoryDetails: data.categoryDetails,
            isFeatured: data.isFeatured,
            numberofDays: data.numberofDays,
            numberofNights: data.numberofNights,
            price: data.price,
            startDate: data.startDate,
            status: data.status,
            tourType: data.tourType
          });
        });

        setTours(toursData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load tours. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeaturedDomesticTours();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading featured tours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Featured Domestic Tours
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our specially curated selection of domestic tour packages
          </p>
        </div>

        {tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No featured domestic tours available at the moment. Please check back later.
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
                640: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
              }}
              className="py-4 px-2"
            >
              {tours.map((tour) => (
                <SwiperSlide key={tour.id} className="pb-10">
                  <div className="h-full flex justify-center">
                    <TourCard
                      id={tour.id}
                      title={tour.title}
                      slug={tour.slug}
                      description={tour.description}
                      imageURL={tour.imageURL}
                      categoryDetails={tour.categoryDetails}
                      isFeatured={tour.isFeatured}
                      numberofDays={tour.numberofDays}
                      numberofNights={tour.numberofNights}
                      price={tour.price}
                      startDate={tour.startDate}
                      status={tour.status}
                      location={tour.location}
                      tourType={tour.tourType}
                    />
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