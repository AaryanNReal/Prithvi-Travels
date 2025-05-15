'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const categoriesData: Category[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          categoriesData.push({
            id: doc.id,
            name: data.name, // Changed from data.slug to data.name for display
            slug: data.slug // Added slug for URL
          });
        });

        setCategories(categoriesData);
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

  // Filter categories by selected letter
  const filteredCategories = activeLetter 
    ? categories.filter(category => 
        category.name.charAt(0).toUpperCase() === activeLetter
      )
    : categories;

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
    <div className="container mx-auto mt-32 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Categories</h1>
        
        {/* Alphabetical Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveLetter(null)}
              className={`px-3 py-1 rounded-md ${!activeLetter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All
            </button>
            {getFirstLetters().map(letter => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter)}
                className={`px-3 py-1 rounded-md ${activeLetter === letter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No categories found{activeLetter ? ` starting with "${activeLetter}"` : ''}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredCategories.map(category => (
                <li key={category.id} className="p-4 hover:bg-gray-50">
                  <Link 
                    href={`/blog/${category.slug}`}
                    className="flex items-center text-lg font-medium text-gray-800 hover:text-blue-600"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Count and active filter indicator */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredCategories.length} of {categories.length} categories
          {activeLetter && ` (filtered by "${activeLetter}")`}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;