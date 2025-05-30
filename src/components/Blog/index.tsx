'use client';
import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import BlogCard from '../BlogCard';
import Head from 'next/head';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Author {
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  createdAt: any;
  imageURL: string;
  isFeatured: boolean;
  categoryDetails: {
    categoryID: string;
    name: string;
    slug: string;
  };
  seoDetails?: {
    description: string;
    imageURL: string;
    keywords: string[];
    title: string;
  };
  tags?: Record<string, {
    name: string;
    slug: string;
    description: string;
  }>;
  updatedAt?: any;
  author?: Author;
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedPosts = async () => {
      try {
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('isFeatured', '==', true),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];

        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching posts:', err);
        if (isMounted) {
          setError('Failed to load posts. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading featured posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Featured Blog Posts | Your Travel Company</title>
        <meta name="description" content="Explore our featured blog posts and articles" />
      </Head>

      <main className="container mx-auto border-t px-4 py-8 mt-5">
        <Link href="/blog">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
              Featured Travel Stories
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our handpicked selection of featured travel stories and articles.
            </p>
          </div>
        </Link>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No featured posts available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={true}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="py-4"
            >
              {posts.map((post) => (
                <SwiperSlide key={post.id} className="h-auto">
                  <div className="h-[500px] flex justify-center">
                    <div className="w-full h-full">
                      <BlogCard
                        id={post.id}
                        slug={post.slug}
                        title={post.title}
                        description={post.description}
                        createdAt={post.createdAt?.toDate?.() ? post.createdAt.toDate().toISOString() : new Date().toISOString()}
                        imageUrl={post.imageURL}
                        imageAlt={post.title}
                        categoryDetails={{
                          name: post.categoryDetails.name,
                          slug: post.categoryDetails.slug
                        }}
                        author={post.author || { name: 'Prithvi Travels Team', slug: 'prithvi-travels' }}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </main>
    </>
  );
}