// components/CategoryList.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CategoryList() {
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Get all blog posts
        const blogsRef = collection(db, 'blogs');
        const querySnapshot = await getDocs(blogsRef);
        
        // Extract unique categories
        const categoryMap = new Map<string, string>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category) {
            const { slug, name } = data.category;
            if (slug && name && !categoryMap.has(slug)) {
              categoryMap.set(slug, name);
            }
          }
        });
        
        // Convert to array
        const uniqueCategories = Array.from(categoryMap, ([slug, name]) => ({ slug, name }));
        setCategories(uniqueCategories);
        
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm py-4">{error}</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Categories
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/blog/${category.slug}`}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              pathname.includes(`/blog/${category.slug}`)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}