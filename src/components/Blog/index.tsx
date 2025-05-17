'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import BlogCard from '../BlogCard';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: any;
  image: {
    imageURL: string;
    altText?: string;
  };
  category: {
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

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);

  // Set slides per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1); // Mobile: 1 card per slide
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2); // Tablet: 2 cards per slide
      } else {
        setSlidesPerView(3); // Desktop: 3 cards per slide
      }
    };

    // Initial call
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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
        
        if (querySnapshot.empty) {
          setError('No featured posts found');
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
              image: {
                imageURL: data.image?.imageURL,
                altText: data.image?.altText
              },
              category: data.category,
              createdBy: data.createdBy,
              tags: data.tags,
              isFeatured: true
            });
          });
          setFeaturedPosts(postsData);
        }
      } catch (err) {
        console.error('Error fetching featured posts:', err);
        setError('Failed to load featured posts');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  // Reset current slide when slides per view changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [slidesPerView]);

  // Function to move to next slide
  const nextSlide = useCallback(() => {
    if (featuredPosts.length <= slidesPerView) return;
    
    const totalSlides = Math.ceil(featuredPosts.length / slidesPerView);
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  }, [featuredPosts.length, slidesPerView]);

  // Function to move to previous slide
  const prevSlide = useCallback(() => {
    if (featuredPosts.length <= slidesPerView) return;
    
    const totalSlides = Math.ceil(featuredPosts.length / slidesPerView);
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  }, [featuredPosts.length, slidesPerView]);

  // Auto slide every 5 seconds
  useEffect(() => {
    const autoSlideTimer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(autoSlideTimer);
  }, [nextSlide]);

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

  // Prepare slides based on slidesPerView
  const slides = [];
  const totalSlides = Math.ceil(featuredPosts.length / slidesPerView);

  for (let i = 0; i < totalSlides; i++) {
    const startIndex = i * slidesPerView;
    const slidePosts = featuredPosts.slice(startIndex, startIndex + slidesPerView);
    slides.push(slidePosts);
  }

  return (
    <section className="mb-12 mx-auto max-w-screen-xl mt-2 px-4 md:px-6 lg:px-8 border-b">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Posts</h2>
      
      <div className="relative">
        {/* Slider Container */}
        <div className="overflow-hidden relative max-w-5xl mx-auto">
          {/* Slider container with smooth transition */}
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slideContent, slideIndex) => (
              <div 
                key={slideIndex} 
                className="min-w-full flex-shrink-0 px-1 md:px-2"
              >
                {/* Responsive grid - always one column on mobile, variable on larger screens */}
                <div className={`grid grid-cols-1 ${
                  slidesPerView === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
                } gap-4 md:gap-5 lg:gap-6`}>
                  {slideContent.map((post) => (
                    <div 
                      key={post.id}
                      className="w-full max-w-xs mx-auto md:max-w-sm lg:max-w-sm overflow-hidden rounded-lg shadow-sm"
                    >
                      <BlogCard
                        id={post.id}
                        slug={post.slug}
                        title={post.title}
                        description={post.description}
                        createdAt={post.createdAt?.toDate?.() ? post.createdAt.toDate().toISOString() : new Date().toISOString()}
                        imageUrl={post.image.imageURL}
                        imageAlt={post.image.altText}
                        category={post.category}
                        author={post.createdBy ? {
                          name: post.createdBy.name,
                          image: post.createdBy.image,
                          role: post.createdBy.description
                        } : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full ${
                    currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation arrows - only show if there are multiple slides */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-0 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10 md:-translate-x-3"
                aria-label="Previous slide"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10 md:translate-x-3"
                aria-label="Next slide"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}