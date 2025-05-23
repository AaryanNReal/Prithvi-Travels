'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
  type: 'blog' | 'tour';
}

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'blog' | 'tour'>('all');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Fetch blog tags
        const blogsSnapshot = await getDocs(collection(db, 'blogs'));
        const blogTags: {name: string, slug: string}[] = [];
        blogsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.tags && typeof data.tags === 'object') {
            Object.values(data.tags).forEach((tag: any) => {
              if (tag.name && tag.slug) {
                blogTags.push({
                  name: tag.name,
                  slug: tag.slug,
                  type: 'blog'
                });
              }
            });
          }
        });

        // Fetch tour tags
        const toursSnapshot = await getDocs(collection(db, 'tours'));
        const tourTags: {name: string, slug: string}[] = [];
        toursSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.tags && typeof data.tags === 'object') {
            Object.values(data.tags).forEach((tag: any) => {
              if (tag.name && tag.slug) {
                tourTags.push({
                  name: tag.name,
                  slug: tag.slug,
                  type: 'tour'
                });
              }
            });
          }
        });

        // Combine and count tags
        const allTags = [...blogTags, ...tourTags];
        const tagMap = new Map<string, Tag>();

        allTags.forEach(tag => {
          const key = `${tag.slug}-${tag.type}`;
          if (tagMap.has(key)) {
            const existing = tagMap.get(key)!;
            tagMap.set(key, {
              ...existing,
              count: existing.count + 1
            });
          } else {
            tagMap.set(key, {
              id: key,
              name: tag.name,
              slug: tag.slug,
              count: 1,
              type: tag.type
            });
          }
        });

        // Convert to array and sort
        const tagsArray = Array.from(tagMap.values());
        tagsArray.sort((a, b) => a.name.localeCompare(b.name));

        setTags(tagsArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags. Please try again later.');
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Get unique first letters for filtering
  const getFirstLetters = () => {
    const letters = new Set<string>();
    tags
      .filter(tag => activeType === 'all' || tag.type === activeType)
      .forEach(tag => {
        const firstLetter = tag.name.charAt(0).toUpperCase();
        letters.add(firstLetter);
      });
    return Array.from(letters).sort();
  };

  // Filter tags based on active filters
  const filteredTags = tags.filter(tag => {
    const matchesType = activeType === 'all' || tag.type === activeType;
    const matchesLetter = !activeLetter || 
      tag.name.charAt(0).toUpperCase() === activeLetter;
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesLetter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tags</h1>
        <p className="text-gray-600 mb-6">Browse all available tags across our content</p>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveType('all')}
                className={`px-4 py-2 rounded-md ${activeType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveType('blog')}
                className={`px-4 py-2 rounded-md ${activeType === 'blog' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Blog Tags
              </button>
              <button
                onClick={() => setActiveType('tour')}
                className={`px-4 py-2 rounded-md ${activeType === 'tour' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Tour Tags
              </button>
            </div>
          </div>

          {/* Alphabet filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveLetter(null)}
              className={`px-3 py-1 rounded-md ${!activeLetter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              All
            </button>
            {getFirstLetters().map(letter => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter)}
                className={`px-3 py-1 rounded-md ${activeLetter === letter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Tags display */}
        {filteredTags.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTags.map(tag => (
                <Link
                  key={tag.id}
                  href={tag.type === 'blog' 
                    ? `/tags/${tag.slug}`
                    : `/tour-tags/${tag.slug}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-medium text-gray-800">#{tag.name}</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {tag.type === 'blog' ? 'Blog' : 'Tour'} tag
                    </span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {tag.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No tags found
              {activeType !== 'all' && ` in ${activeType}s`}
              {activeLetter && ` starting with "${activeLetter}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="mb-2 sm:mb-0">
            Showing {filteredTags.length} of {tags.length} total tags
          </div>
          <div className="flex gap-4">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
              <span>Blog: {tags.filter(t => t.type === 'blog').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              <span>Tour: {tags.filter(t => t.type === 'tour').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;