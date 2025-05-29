// app/blog/visa-expert/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import { ChevronLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: any;
  imageURL: string;
  categoryDetails: {
    categoryID: string;
    name: string;
    slug: string;
  };
  createdBy?: {
    name: string;
    image?: string;
    description?: string;
  };
  tags?: Record<string, {
    name: string;
    slug: string;
    description?: string;
  }>;
  isFeatured?: boolean;
}

export default function VisaExpertPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    const fetchVisaExpertPosts = async () => {
      try {
        setLoading(true);
        setError('');
        setIndexError(false);
        
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('categoryDetails.slug', '==', 'visa-expert'), // Updated to categoryDetails.slug
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No visa expert posts found');
        } else {
          const postsData: BlogPost[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            postsData.push({
              id: doc.id,
              title: data.title,
              slug: data.slug,
              description: data.description,
              createdAt: data.createdAt,
              imageURL: data.imageURL, // Updated to direct imageURL
              categoryDetails: {
                categoryID: data.categoryDetails.categoryID,
                name: data.categoryDetails.name,
                slug: data.categoryDetails.slug
              },
              createdBy: data.createdBy,
              tags: data.tags,
              isFeatured: data.isFeatured
            });
          });
          setPosts(postsData);
        }
      } catch (err: any) {
        console.error('Error fetching visa expert posts:', err);
        if (err.code === 'failed-precondition') {
          setIndexError(true);
          setError('Database query requires index configuration');
        } else {
          setError('Failed to load posts. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVisaExpertPosts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (indexError) return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 inline-flex flex-col items-center max-w-2xl mx-auto">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-yellow-800 mb-2">Index Configuration Required</h2>
        <p className="text-yellow-700 mb-4">
          This query requires a Firestore index to be created. Please ask your administrator to set this up.
        </p>
        <a
          href="https://console.firebase.google.com/v1/r/project/pruthvi-travels-6d10a/firestore/indexes?create_composite=ClNwcm9qZWN0cy9wcnV0aHZpLXRyYXZlbHMtNmQxMGEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2Jsb2dzL2luZGV4ZXMvXxABGhEKDWNhdGVnb3J5LnNsdWcQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          Create Index Now
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to all categories
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
          Visa Expert Articles
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Professional advice and latest updates on visa requirements and processes
        </p>
        {error && !indexError && (
          <div className="mt-4 text-red-500">{error}</div>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              id={post.id}
              slug={post.slug}
              title={post.title}
              description={post.description}
              createdAt={post.createdAt?.toDate().toISOString() || new Date().toISOString()}
              imageUrl={post.imageURL}
              imageAlt={post.title} // Using title as alt text since altText is not in schema
              categoryDetails={post.categoryDetails}
              
              tags={post.tags ? Object.values(post.tags).map(tag => ({
                id: tag.slug,
                name: tag.name,
                slug: tag.slug,
                description: tag.description
              })) : []}
            />
          ))}
        </div>
      ) : (
        !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No visa expert articles found</p>
          </div>
        )
      )}
    </div>
  );
}