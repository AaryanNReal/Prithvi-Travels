'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Cruise {
  id: string;
  title: string;
  cruiseType: 'domestic' | 'international';
  slug: string;
}

const CruisesPage = () => {
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'domestic' | 'international'>('all');

  // Fetch cruises from Firestore
  useEffect(() => {
    const fetchCruises = async () => {
      try {
        setLoading(true);
        const cruisesRef = collection(db, 'cruises');
        const querySnapshot = await getDocs(cruisesRef);
        
        const cruisesData: Cruise[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          cruisesData.push({
            id: doc.id,
            title: data.title,
            cruiseType: data.cruiseType,
            slug: data.slug
          });
        });

        setCruises(cruisesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cruises: ', err);
        setError('Failed to load cruises');
        setLoading(false);
      }
    };

    fetchCruises();
  }, []);

  // Filter cruises by search query and type
  const filteredCruises = cruises.filter(cruise => {
    const matchesSearch = cruise.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeType === 'all' || cruise.cruiseType === activeType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-red-500 text-xl">{error}</div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 mt-32 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cruise Packages</h1>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search cruises..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveType('all')}
                  className={`px-3 py-1 text-sm rounded-md ${activeType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveType('domestic')}
                  className={`px-3 py-1 text-sm rounded-md ${activeType === 'domestic' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Domestic
                </button>
                <button
                  onClick={() => setActiveType('international')}
                  className={`px-3 py-1 text-sm rounded-md ${activeType === 'international' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  International
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cruises List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {filteredCruises.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No cruises found{activeType !== 'all' ? ` of type "${activeType}"` : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {filteredCruises.map(cruise => (
                  <Link 
                    key={cruise.id} 
                    href={"/cruises"}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-medium">{cruise.title}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      cruise.cruiseType === 'domestic' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cruise.cruiseType}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredCruises.length} of {cruises.length} cruises
          {activeType !== 'all' && ` (${activeType})`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>
    </div>
  );
};

export default CruisesPage;