// app/components/RelatedPostsSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  description?: string;
  category: {
    slug: string;
    name: string;
  };
  image?: {
    imageURL: string;
    altText?: string;
  };
  createdAt: any;
}

interface RelatedPostsSidebarProps {
  currentPostId: string;
  categorySlug: string;
}

const RelatedPostsSidebar = ({ currentPostId, categorySlug }: RelatedPostsSidebarProps) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categorySlug) return;

    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('category.slug', '==', categorySlug),
          where('id', '!=', currentPostId), // Exclude current post
          orderBy('createdAt', 'desc'),
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const posts: BlogPost[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          posts.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            category: data.category,
            image: data.image,
            createdAt: data.createdAt
          });
        });

        setRelatedPosts(posts);
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setError('Failed to load related posts');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostId, categorySlug]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return '';
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
      {error}
    </div>
  );

  if (relatedPosts.length === 0) return (
    <div className="text-gray-500 dark:text-gray-400 text-sm">
      No related posts found.
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">More in {relatedPosts[0]?.category.name}</h3>
      
      <div className="space-y-6">
        {relatedPosts.map((post) => (
          <Link 
            key={post.id}
            href={`/blog/${post.category.slug}/${encodeURIComponent(post.title)}`}
            className="block group"
          >
            <div className="relative h-40 rounded-lg overflow-hidden">
              {post.image?.imageURL ? (
                <Image
                  src={post.image.imageURL}
                  alt={post.image.altText || post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700"></div>
              )}
            </div>
            <h4 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h4>
            {post.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {post.description}
              </p>
            )}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatDate(post.createdAt)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPostsSidebar;