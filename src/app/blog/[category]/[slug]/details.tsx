// app/blog/[category]/[title]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar';
import CategoryList from '@/components/CategoryList';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categorySlug = decodeURIComponent(encodedCategory || '');
  const titleSlug = decodeURIComponent(encodedTitle || '');

  useEffect(() => {
    if (!categorySlug || !titleSlug) return;

    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('category.slug', '==', categorySlug),
          where('slug', '==', titleSlug),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Blog post not found');
        } else {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setBlog({ 
            id: doc.id,
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
      <meta name="description" content={blog.summary || 'Read this blog post'} />
      <meta property="og:title" content={blog.title} />
      <meta property="og:description" content={blog.summary || 'Read this blog post'} />
      <meta property="og:image" content={blog.image?.imageURL || '/default-image.jpg'} />
      <meta property="og:url" content={`https://myblog.com/blog/${categorySlug}/${titleSlug}`} />
      <meta property='og:keywords' content={blog.tags ? Object.values(blog.tags).map((tag: any) => tag.name).join(', ') : ''} />
      <link rel="canonical" href={`https://myblog.com/blog/${categorySlug}/${titleSlug}`} />

   </Head>

    <div className="max-w-7xl mx-auto px-4 mt-14 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Category */}
          {blog.category && (
            <Link 
              href={`/blog/${blog.category.slug}`}
              className="inline-block mb-6 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {blog.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.title}
          </h1>
          <h1>
            {blog.summary}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 mb-8 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{blog.createdBy?.name || 'Unknown Author'}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{readTime}</span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.image?.imageURL && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mb-10">
              <Image
                src={blog.image.imageURL}
                alt={blog.image.altText || blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Description */}
          {blog.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {blog.description}
            </p>
          )}

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none mb-12">
            {/* Your content renderer would go here */}
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          {/* Tags */}
          {blog.tags && Object.keys(blog.tags).length > 0 && (
            <div className="mb-12">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(blog.tags).map((tag: any) => (
                  <Link 
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {blog.createdBy && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-12">
              <div className="flex items-center">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                  {blog.createdBy.image && (
                    <Image
                      src={blog.createdBy.image}
                      alt={blog.createdBy.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{blog.createdBy.name}</h4>
                  {blog.createdBy.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{blog.createdBy.description}</p>
                  )}
                </div>
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
              Back to all articles
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 mt-10">
          <div className="sticky top-20">
            {blog && (
              <RelatedPostsSidebar 
                currentPostId={blog.id}
                categorySlug={categorySlug}
              />
              
              
            )}
            <div className='mt-10'>
             <CategoryList />
             </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}