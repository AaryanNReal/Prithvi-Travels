'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Slide {
  imageUrl: string;
  screenName: string;
  altText: string;
}

const cleanScreenName = (name: string): string => {
  // Remove all quotes and trim whitespace
  let cleaned = name.replace(/^["']+|["']+$/g, '').trim();
  
  // Handle empty case
  if (!cleaned) return '/';
  
  // Convert spaces to hyphens for paths
  if (!cleaned.startsWith('http')) {
    cleaned = cleaned.replace(/\s+/g, '-').toLowerCase();
  }
  
  // Ensure paths start with single slash
  if (!cleaned.startsWith('http') && !cleaned.startsWith('/')) {
    cleaned = `/${cleaned}`;
  }
  
  // Remove duplicate slashes
  return cleaned.replace(/([^:]\/)\/+/g, '$1');
};

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      
      // Initial check
      checkIfMobile();
      
      // Add event listener for resize
      window.addEventListener('resize', checkIfMobile);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  const fetchSliderImages = useCallback(async () => {
    try {
      const docRef = doc(db, 'sliderImages', 'homeCarousel');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const slideData = (data.images || []).map((slide: any, index: number) => ({
          imageUrl: slide.imageUrl || '',
          screenName: cleanScreenName(slide.screenName || '/'),
          altText: slide.altText || `Carousel slide ${index + 1}`
        })).filter((slide: Slide) => {
          if (!slide.imageUrl) {
            console.warn('Skipping slide with missing imageUrl');
            return false;
          }
          return true;
        });

        setSlides(slideData);
      } else {
        setError('No carousel data found');
      }
    } catch (err) {
      console.error('Error fetching slider images:', err);
      setError('Failed to load carousel. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliderImages();
  }, [fetchSliderImages]);

  // Auto-slide functionality with cleanup
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));

  if (loading) {
    return (
      <div className="relative w-full mt-16 md:mt-22 h-[50vh] md:h-[calc(100vh-96px)] flex items-center justify-center bg-gray-100">
        <div className="h-12 w-12 md:h-16 md:w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full mt-16 md:mt-22 h-[50vh] md:h-[calc(100vh-96px)] flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="mb-4 text-lg md:text-xl font-medium text-red-500">Error loading carousel</p>
        <p className="text-center text-sm md:text-base text-gray-600">{error}</p>
        <button 
          onClick={fetchSliderImages}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm md:text-base"
        >
          Retry
        </button>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full mt-16 md:mt-22 h-[50vh] md:h-[calc(100vh-96px)] flex items-center justify-center bg-gray-100">
        <p className="text-lg md:text-xl font-medium text-gray-500">No slides available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full mt-16 md:mt-22 h-[50vh] md:h-[calc(100vh-96px)] overflow-hidden">
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={`${slide.imageUrl}-${index}`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Link
              href={slide.screenName}
              passHref
              className="block h-full w-full"
              target={slide.screenName.startsWith('http') ? '_blank' : '_self'}
              rel={slide.screenName.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.altText}
                fill
                className="object-cover w-full h-full cursor-pointer"
                priority={index === 0}
                unoptimized
                onError={(e) => {
                  console.error(`Error loading image: ${slide.imageUrl}`);
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/fallback-image.jpg';
                  target.onerror = null; // Prevent infinite loop
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              />
            </Link>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-2 md:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-1 md:p-2 text-white backdrop-blur-sm transition-all hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isMobile ? 'scale-75' : ''
              }`}
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className={`absolute right-2 md:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-1 md:p-2 text-white backdrop-blur-sm transition-all hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isMobile ? 'scale-75' : ''
              }`}
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-2 md:bottom-6 left-1/2 z-10 flex -translate-x-1/2 space-x-1 md:space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all ${
                    index === currentSlide ? 'md:w-6 w-4 bg-primary' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;