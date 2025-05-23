'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

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
    description?: string;
    imageURL?: string;
    isFeatured?: boolean;
    createdAt?: any;
    content?: string;
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
    title?: string;
    updatedAt?: any;
  }>;
  isFeatured?: boolean;
}

export default function TagPage() {
  const params = useParams();
  const encodedTag = params.tag as string;
  const tagSlug = decodeURIComponent(encodedTag);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    if (!tagSlug) return;

    const fetchAndFilterPosts = async () => {
      try {
        setLoading(true);
        setError('');

        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const filteredPosts: BlogPost[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const tags = data.tags || {};

          const tagMatchEntry = Object.values(tags).find(
            (tag: any) => tag?.slug === tagSlug
          );

          if (tagMatchEntry) {
            const post: BlogPost = {
              id: doc.id,
              title: data.title,
              slug: data.slug,
              description: data.description,
              createdAt: data.createdAt,
             
              imageURL: data.imageURL || '/default-blog-image.jpg', // Add fallback image
              categoryDetails: {
                categoryID: data.categoryDetails?.categoryID || '',
                name: data.categoryDetails?.name || '',
                slug: data.categoryDetails?.slug || '',
                
              },
              createdBy: data.createdBy,
              tags: data.tags,
              isFeatured: data.isFeatured
            };

            filteredPosts.push(post);

           
          }
        });

        if (filteredPosts.length === 0) {
          setError('No posts found with this tag');
        }

        setPosts(filteredPosts);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterPosts();
  }, [tagSlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mt-28 sm:px-6 lg:px-8 ">
      <div className="mb-6">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to all posts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
          Posts tagged with "{tagName || tagSlug}"
        </h1>
        {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <BlogCard 
                id={post.id}
                slug={post.slug}
                title={post.title}
                description={post.description}
                createdAt={post.createdAt?.toDate().toISOString() || new Date().toISOString()}
                imageUrl={post.imageURL}
                
                categoryDetails={post.categoryDetails}
                author={post.createdBy ? {
                  name: post.createdBy.name,
                  image: post.createdBy.image,
                  role: post.createdBy.description
                } : undefined}
                tags={post.tags ? Object.values(post.tags).map(tag => ({
                  id: tag.slug,
                  name: tag.name,
                  slug: tag.slug,
                  description: tag.description,
                  title: tag.title,
                  updatedAt: tag.updatedAt?.toDate?.()?.toISOString()
                })) : []}
                
              />
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No posts found with this tag</p>
          </div>
        )
      )}
    </div>
  );
}