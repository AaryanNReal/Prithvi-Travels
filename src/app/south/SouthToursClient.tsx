// app/tours/domestic/south/SouthToursClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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

export default function SouthToursClient() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'tours'),
          where('tourType', '==', 'domestic'),
          where('status', '==', 'active'),
          where('themeType', '==', 'south')
        );
        const querySnapshot = await getDocs(q);
        const toursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Tour[];
        
        setTours(toursData);
        setFilteredTours(toursData);
        setError(null);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load tours. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTours(tours);
    } else {
      const filtered = tours.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.categoryDetails.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTours(filtered);
    }
  }, [searchTerm, tours]);

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Southern India Tours</h1>
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
    <div className="container mx-auto py-12 mt-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Southern India</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Explore our curated collection of Southern India travel packages
          </p>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tours..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading tours...</p>
        </div>
      ) : (
        <>
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map(tour => (
                <div key={tour.id} className="group">
                  <Link href={`/tours/${tour.categoryDetails.slug}/${tour.slug}`} className="block h-full">
                    <div className="rounded-xl overflow-hidden shadow-lg bg-white h-full flex flex-col hover:shadow-xl transition-shadow">
                      <div className="relative h-64 w-full">
                        <Image
                          src={tour.imageURL || "/images/default-tour.jpg"}
                          alt={tour.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
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
                {searchTerm ? 'No tours match your search' : 'No Southern India tours available at the moment'}
              </h2>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <Link 
                  href="/tours" 
                  className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse All Tours
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}