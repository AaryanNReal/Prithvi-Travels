'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import BlogCard from '../BlogCard';

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
}

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);

  // Memoized responsive slides per view calculation
  const updateSlidesPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) setSlidesPerView(1);
    else if (width < 1024) setSlidesPerView(2);
    else setSlidesPerView(3);
  }, []);

  useEffect(() => {
    updateSlidesPerView();
    const resizeHandler = () => requestAnimationFrame(updateSlidesPerView);
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [updateSlidesPerView]);

  // Fetch posts with cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const blogsRef = collection(db, 'blogs');
        const q = query(
          blogsRef,
          where('isFeatured', '==', true),
          orderBy('createdAt', 'desc'),
        );

        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;
        
        if (querySnapshot.empty) {
          setError('No featured posts found');
        } else {
          const postsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as BlogPost[];
          setFeaturedPosts(postsData);
        }
      } catch (err) {
        console.error('Error fetching featured posts:', err);
        if (isMounted) setError('Failed to load featured posts');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedPosts();
    return () => { isMounted = false; };
  }, []);

  // Reset current slide when slides per view changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [slidesPerView]);

  // Memoized navigation functions
  const nextSlide = useCallback(() => {
    if (featuredPosts.length <= slidesPerView) return;
    const totalSlides = Math.ceil(featuredPosts.length / slidesPerView);
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, [featuredPosts.length, slidesPerView]);

  const prevSlide = useCallback(() => {
    if (featuredPosts.length <= slidesPerView) return;
    const totalSlides = Math.ceil(featuredPosts.length / slidesPerView);
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [featuredPosts.length, slidesPerView]);

  // Auto slide with cleanup
  useEffect(() => {
    if (featuredPosts.length <= slidesPerView) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, featuredPosts.length, slidesPerView]);

  // Memoized slides calculation
  const { slides, totalSlides } = useMemo(() => {
    const total = Math.ceil(featuredPosts.length / slidesPerView);
    const slidesArray = [];
    
    for (let i = 0; i < total; i++) {
      slidesArray.push(featuredPosts.slice(i * slidesPerView, (i + 1) * slidesPerView));
    }
    
    return { slides: slidesArray, totalSlides: total };
  }, [featuredPosts, slidesPerView]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-400">{error}</p>
    </div>
  );

  return (
    <section className="mb-12 mx-auto max-w-screen-xl mt-10 px-4 md:px-6 lg:px-8 border-b">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Featured Posts</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover our handpicked selection of featured tours. These exceptional experiences are 
          carefully chosen to inspire your next adventure.
        </p>
      </div>
      
      <div className="relative">
        <div className="overflow-hidden relative max-w-5xl mx-auto">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slideContent, slideIndex) => (
              <div 
                key={`slide-${slideIndex}`} 
                className="min-w-full flex-shrink-0 px-1 md:px-2"
              >
                <div className={`grid grid-cols-1 ${
                  slidesPerView === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
                } gap-4 md:gap-5 lg:gap-6`}>
                  {slideContent.map((post) => (
                    <div key={post.id} className="w-full max-w-xs mx-auto md:max-w-sm lg:max-w-sm overflow-hidden rounded-lg shadow-sm">
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
                        author={post.author || { name: 'Prithvi Travels Team', slug: '' }}
                        
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {totalSlides > 1 && (
            <>
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-0 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10 md:-translate-x-3 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10 md:translate-x-3 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Extracted SVG icons for better readability
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);