'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Tour {
  id: string;
  title: string;
  tourType: 'domestic' | 'international';
  slug: string;
}

const ToursPage = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'domestic' | 'international'>('all');

  // Fetch tours from Firestore
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const toursRef = collection(db, 'tours');
        const querySnapshot = await getDocs(toursRef);
        
        const toursData: Tour[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          toursData.push({
            id: doc.id,
            title: data.title,
            tourType: data.tourType,
            slug: data.slug
          });
        });

        setTours(toursData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tours: ', err);
        setError('Failed to load tours');
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Filter tours by search query and type
  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || tour.tourType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-32 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Tours</h1>
        <p className="text-gray-600 mb-6">Browse all available tour packages</p>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tours..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-sm rounded-md ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('domestic')}
                  className={`px-3 py-1 text-sm rounded-md ${filterType === 'domestic' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Domestic
                </button>
                <button
                  onClick={() => setFilterType('international')}
                  className={`px-3 py-1 text-sm rounded-md ${filterType === 'international' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  International
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tours List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {filteredTours.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tours found{filterType !== 'all' ? ` of type "${filterType}"` : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTours.map(tour => (
                  <Link 
                    key={tour.id} 
                    href={`/tours`}
                    className="block border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{tour.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tour.tourType === 'domestic' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tour.tourType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      View details →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredTours.length} of {tours.length} tours
            {filterType !== 'all' ? ` (${filterType})` : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToursPage;