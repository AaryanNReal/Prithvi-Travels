'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  slug: string; // Added slug field
  count?: number;
}

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tags from Firestore
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsRef = collection(db, 'tags');
        const q = query(tagsRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const tagsData: Tag[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tagsData.push({
            id: doc.id,
            name: data.name, // Changed from data.slug to data.name
            slug: data.slug, // Now properly getting slug from Firestore
            count: data.count || 0
          });
        });

        setTags(tagsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tags: ', err);
        setError('Failed to load tags');
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Get unique first letters for filtering
  const getFirstLetters = () => {
    const letters = new Set<string>();
    tags.forEach(tag => {
      const firstLetter = tag.name.charAt(0).toUpperCase();
      letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  // Filter tags by selected letter and search query
  const filteredTags = tags.filter(tag => {
    const matchesLetter = !activeLetter || 
      tag.name.charAt(0).toUpperCase() === activeLetter;
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLetter && matchesSearch;
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tags</h1>
        <p className="text-gray-600 mb-6">Browse all available tags</p>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search tags</label>
              <input
                type="text"
                id="search"
                placeholder="Search tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveLetter(null)}
                  className={`px-3 py-1 text-sm rounded-md ${!activeLetter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All
                </button>
                {getFirstLetters().map(letter => (
                  <button
                    key={letter}
                    onClick={() => setActiveLetter(letter)}
                    className={`px-3 py-1 text-sm rounded-md ${activeLetter === letter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {filteredTags.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tags found{activeLetter ? ` starting with "${activeLetter}"` : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <Link 
                    key={tag.id} 
                    href={`/tags/${tag.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-medium">#{tag.name}</span>
                    {tag.count !== undefined && (
                      <span className="ml-1.5 text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">
                        {tag.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredTags.length} of {tags.length} tags
            {activeLetter && ` starting with "${activeLetter}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <div className="bg-gray-100 px-2 py-1 rounded-md">
            Sorted alphabetically
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;