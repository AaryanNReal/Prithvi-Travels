// app/tours/international/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
  numberofDays: number;
  numberofNights: number;
  price: number;
  location: string;
}

export default function InternationalToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(
          collection(db, 'tours'),
          where('tourType', '==', 'international'),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        const toursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Tour[];
        setTours(toursData);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">International Tours</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Loading tours...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden h-full animate-pulse">
              <div className="bg-gray-200 h-64 w-full"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between mt-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">International Tours</h1>
        <p className="text-xl text-red-500 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-20 py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">International Tours</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our curated collection of international travel packages
        </p>
      </div>

      {tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map(tour => (
            <div key={tour.id} className="group">
              <Link href={`/tours/${tour.categoryDetails.slug}/${tour.slug}`} className="block h-full">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white h-full flex flex-col hover:shadow-xl transition-shadow">
                  <div className="relative h-64 w-full">
                    <Image
                      src={tour.imageURL}
                      alt={tour.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow">
                      {tour.categoryDetails.name}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {tour.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                      <div className="flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-1.5" />
                        <span>{tour.location}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-1.5" />
                        <span>{tour.numberofDays}D/{tour.numberofNights}N</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{tour.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-gray-700">
            No international tours available at the moment
          </h2>
          <Link 
            href="/tours" 
            className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Tours
          </Link>
        </div>
      )}
    </div>
  );
}