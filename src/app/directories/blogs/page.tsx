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
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

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
              slug: data.category?.slug || 'uncategorized' // Fallback for missing category
            }
          });
        });

        setBlogs(blogsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs: ', err);
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

  // Filter blogs by selected letter
  const filteredBlogs = activeLetter 
    ? blogs.filter(blog => 
        blog.title.charAt(0).toUpperCase() === activeLetter
      )
    : blogs;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-32 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Blog Titles</h1>
      
      {/* Alphabetical Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
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

      {/* Blog Titles List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredBlogs.length === 0 ? (
            <li className="p-4 text-center text-gray-500">
              No titles found{activeLetter ? ` starting with "${activeLetter}"` : ''}
            </li>
          ) : (
            filteredBlogs.map(blog => (
              <li key={blog.id} className="p-4 hover:bg-gray-50">
                <Link 
                  href={`/blog/${blog.category.slug}/${blog.slug}`}
                  className="font-medium text-gray-800 hover:text-blue-600"
                >
                  {blog.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Count */}
      <div className="mt-3 text-sm text-gray-500">
        Showing {filteredBlogs.length} of {blogs.length} titles
      </div>
    </div>
  );
};

export default BlogTitlesPage;