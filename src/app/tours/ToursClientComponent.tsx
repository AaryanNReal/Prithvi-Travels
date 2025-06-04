// app/tours/ToursClientComponent.tsx (Client Component)
'use client';

import { collection, getDocs  } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TourCard from '@/components/Domestic/TourCard';
import { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiX, FiMapPin, FiGlobe, FiDollarSign, FiCalendar, FiSliders } from 'react-icons/fi';

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
  isFeatured: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
}

export default function ToursClientComponent() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    tourType: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const toursCollection = collection(db, 'tours');
        const toursSnapshot = await getDocs(toursCollection);
        
        const toursData = toursSnapshot.docs.map(doc => {
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

        setTours(toursData);
        setFilteredTours(toursData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    let results = tours;

    if (searchTerm) {
      results = results.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.location) {
      results = results.filter(tour => tour.location === filters.location);
    }
    if (filters.tourType) {
      results = results.filter(tour => tour.tourType === filters.tourType);
    }
    if (filters.minPrice) {
      results = results.filter(tour => tour.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(tour => tour.price <= Number(filters.maxPrice));
    }
    if (filters.duration) {
      results = results.filter(tour => tour.numberofDays === Number(filters.duration));
    }

    setFilteredTours(results);
  }, [searchTerm, filters, tours]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      tourType: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
    });
    setSearchTerm('');
  };

  const locations = [...new Set(tours.map(tour => tour.location))];
  const tourTypes = [...new Set(tours.map(tour => tour.tourType))];
  const durations = [...new Set(tours.map(tour => tour.numberofDays))];

  return (
    <div className="min-h-screen mt-16 dark:bg-gray-900 relative">
      <main className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Our Tour Packages
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
              Check Our International and Domestic tours
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tours..."
                className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
    </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Loading tours...
            </p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No tours match your search criteria.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} {...tour} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}