'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: {
    slug: string;
  };
}

const BlogTitlesPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch blogs from Firestore
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, orderBy('title', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const blogsData: Blog[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          blogsData.push({
            id: doc.id,
            title: data.title,
            slug: data.slug,
            category: {
              slug: data.categoryDetails?.slug || 'uncategorized'
            }
          });
        });

        setBlogs(blogsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs: ', err);
        setError('Failed to load blog titles');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Get unique first letters for filtering
  const getFirstLetters = () => {
    const letters = new Set<string>();
    blogs.forEach(blog => {
      const firstLetter = blog.title.charAt(0).toUpperCase();
      letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  // Filter blogs by selected letter and search query
  const filteredBlogs = blogs.filter(blog => {
    const matchesLetter = !activeLetter || 
      blog.title.charAt(0).toUpperCase() === activeLetter;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Titles</h1>
        <p className="text-gray-600 mb-6">Browse all blog articles alphabetically</p>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search blog titles</label>
              <input
                type="text"
                id="search"
                placeholder="Search titles..."
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

        {/* Blog Titles List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {filteredBlogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No titles found{activeLetter ? ` starting with "${activeLetter}"` : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredBlogs.map(blog => (
                <li key={blog.id} className="hover:bg-gray-50 transition-colors">
                  <Link 
                    href={`/blog/${blog.category.slug}/${blog.slug}`}
                    className="block px-6 py-4"
                  >
                    <h3 className="text-lg font-medium text-gray-800 hover:text-blue-600">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Category: {blog.category.slug}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredBlogs.length} of {blogs.length} articles
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

export default BlogTitlesPage;