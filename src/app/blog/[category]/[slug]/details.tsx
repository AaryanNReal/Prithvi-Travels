// app/blog/[category]/[title]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

import Head from 'next/head';

const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate();
    return format(date, 'MMMM d, yyyy');
  } catch (e) {
    return '';
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const encodedCategory = params.category as string;
  const encodedTitle = params.slug as string;
  const [blog, setBlog] = useState<any>(null);
  const [categoryDetails, setCategoryDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categorySlug = decodeURIComponent(encodedCategory || '');
  const titleSlug = decodeURIComponent(encodedTitle || '');

  useEffect(() => {
  if (!categorySlug || !titleSlug) {
    setError('Missing category or title parameter');
    setLoading(false);
    return;
  }

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      
      const blogsRef = collection(db, 'blogs');
      const q = query(
        blogsRef,
        where('slug', '==', titleSlug),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Blog post not found');
      } else {
        const blogDoc = querySnapshot.docs[0];
        const data = blogDoc.data();
        
        if (data.categoryID) {
          const categoryDocRef = doc(db, 'categories', data.categoryID);
          const categoryDocSnap = await getDoc(categoryDocRef);
          
          if (categoryDocSnap.exists()) {
            setCategoryDetails({
              id: categoryDocSnap.id,
              ...categoryDocSnap.data()
            });
          }
        }

        setBlog({ 
          id: blogDoc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  fetchBlogPost();
}, [categorySlug, titleSlug]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-28 text-center">
      <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
      <Link 
        href="/blog"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Blog
      </Link>
    </div>
  );

  if (!blog) return (
    <div className="max-w-4xl mx-auto px-4 py-28 text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">No blog post found</h2>
      <Link 
        href="/blog"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Browse All Posts
      </Link>
    </div>
  );

  const readTime = calculateReadingTime(blog.content || '');

  return (
    <>
      <Head>
        <title>{blog.title} - My Blog</title>
        <meta name="description" content={blog.description || 'Read this blog post'} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description || 'Read this blog post'} />
        <meta property="og:image" content={blog.imageURL || '/default-image.jpg'} />
        <meta property="og:url" content={`https://myblog.com/blog/${categorySlug}/${titleSlug}`} />
        {blog.seoDetails?.keywords && (
          <meta property='og:keywords' content={blog.seoDetails.keywords.join(', ')} />
        )}
        <link rel="canonical" href={`https://myblog.com/blog/${categorySlug}/${titleSlug}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 mt-14 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Category */}
            {categoryDetails && (
              <Link 
                href={`/blog/${categoryDetails.slug}`}
                className="inline-block mb-6 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {categoryDetails.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {blog.title}
            </h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {blog.description}
            </h2>

            {/* Meta Information */}
            <div className="flex items-center gap-4 mb-8 text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{readTime}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              {blog.updatedAt && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Updated {formatDate(blog.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Featured Image */}
            {blog.imageURL && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mb-10">
                <Image
                  src={blog.imageURL}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Tags */}
            {blog.tags && Object.keys(blog.tags).length > 0 && (
              <div className="mb-12">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(blog.tags).map(([key, tag]: [string, any]) => (
                    <Link 
                      key={key}
                      href={`/tags/${tag.slug}`}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <Link 
                href="/blog"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to all arti  cles
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          
      
        </div>
      </div>
    </>
  );
}