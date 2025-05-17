// RelatedPosts.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

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
}

interface RelatedPostsProps {
  currentPostTitle: string;
  currentCategorySlug: string;
}

const RelatedPosts = ({ currentPostTitle, currentCategorySlug }: RelatedPostsProps) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const postsRef = collection(db, 'blogPosts');
        const q = query(postsRef, where('category.slug', '==', currentCategorySlug));
        const querySnapshot = await getDocs(q);

        const filteredPosts: BlogPost[] = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              category: data.category,
              image: data.image,
            };
          })
          .filter(post => post.title !== currentPostTitle);

        setRelatedPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      }
    };

    fetchRelatedPosts();
  }, [currentPostTitle, currentCategorySlug]);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Recommended Posts</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {relatedPosts.map(post => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <div className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
              {post.image?.imageURL && (
                <Image
                  src={post.image.imageURL}
                  alt={post.image.altText || post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="text-sm text-gray-600">{post.description?.slice(0, 100)}...</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
