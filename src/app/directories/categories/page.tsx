'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Category {
  id: string; // Combination of slug and type
  name: string;
  slug: string;
  type: 'blog' | 'tour' | 'cruise';
  count: number;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories from all collections (blogs, tours, cruises) using categoryDetails
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch from all three collections
        const [blogsSnapshot, toursSnapshot, cruisesSnapshot] = await Promise.all([
          getDocs(collection(db, 'blogs')),
          getDocs(collection(db, 'tours')),
          getDocs(collection(db, 'cruises'))
        ]);

        const categoriesData: Category[] = [];

        // Process blogs
        blogsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.categoryDetails) {
            const slug = data.categoryDetails.slug;
            const name = data.categoryDetails.name || 'Unnamed Category';
            categoriesData.push({
              id: `${slug}-blog`,
              name,
              slug,
              type: 'blog',
              count: 1
            });
          }
        });

        // Process tours
        toursSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.categoryDetails) {
            const slug = data.categoryDetails.slug;
            const name = data.categoryDetails.name || 'Unnamed Category';
            categoriesData.push({
              id: `${slug}-tour`,
              name,
              slug,
              type: 'tour',
              count: 1
            });
          }
        });

        // Process cruises
        cruisesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.categoryDetails) {
            const slug = data.categoryDetails.slug;
            const name = data.categoryDetails.name || 'Unnamed Category';
            categoriesData.push({
              id: `${slug}-cruise`,
              name,
              slug,
              type: 'cruise',
              count: 1
            });
          }
        });

        // Aggregate counts for identical categories (same slug and type)
        const aggregatedCategories: Record<string, Category> = {};
        
        categoriesData.forEach(category => {
          const key = `${category.slug}-${category.type}`;
          if (aggregatedCategories[key]) {
            aggregatedCategories[key].count += 1;
          } else {
            aggregatedCategories[key] = { ...category };
          }
        });

        // Convert to array and sort
        const sortedCategories = Object.values(aggregatedCategories)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(sortedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories: ', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Get unique first letters for filtering
  const getFirstLetters = () => {
    const letters = new Set<string>();
    categories.forEach(category => {
      const firstLetter = category.name.charAt(0).toUpperCase();
      letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  // Filter categories by selected letter and search query
  const filteredCategories = categories.filter(category => {
    const matchesLetter = !activeLetter || 
      category.name.charAt(0).toUpperCase() === activeLetter;
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLetter && matchesSearch;
  });

  // Determine the URL for a category based on its type
  const getCategoryLink = (category: Category) => {
    switch (category.type) {
      case 'tour':
        return `/tours/${category.slug}`;
      case 'cruise':
        return `/cruises/${category.slug}`;
      case 'blog':
      default:
        return `/blog/${category.slug}`;
    }
  };

  // Get badge color based on category type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'tour':
        return 'bg-green-100 text-green-800';
      case 'cruise':
        return 'bg-blue-100 text-blue-800';
      case 'blog':
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Categories</h1>
        <p className="text-gray-600 mb-6">Browse all content categories</p>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search categories</label>
              <input
                type="text"
                id="search"
                placeholder="Search categories..."
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

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {filteredCategories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No categories found{activeLetter ? ` starting with "${activeLetter}"` : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCategories.map(category => (
                  <Link 
                    key={category.id} 
                    href={getCategoryLink(category)}
                    className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.count} {category.count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(category.type)}`}>
                        {category.type}
                      </span>
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
            Showing {filteredCategories.length} of {categories.length} categories
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

export default CategoriesPage;