'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Slide {
  imageUrl: string;
  redirectionURL: string;
  altText: string;
  position: number;
}

// Utility functions (moved outside component to avoid recreation)
const cleanRedirectionURL = (url: string): string => {
  if (!url) return '/';
  const cleaned = url.trim().replace(/^["']+|["']+$/g, '');
  return !cleaned.startsWith('http') && !cleaned.startsWith('/') 
    ? `/${cleaned}` 
    : cleaned.replace(/([^:]\/)\/+/g, '$1');
};

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Extracted SVG Icons (moved outside to avoid recreation)
const ErrorIcon = () => (
  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
  </svg>
);

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Responsive detection (optimized with passive listener)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const debouncedResize = debounce(handleResize, 100);
    
    handleResize();
    window.addEventListener('resize', debouncedResize, { passive: true });
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // Intersection Observer (optimized with rootMargin)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { rootMargin: '200px' } // Trigger earlier
    );
    const heroElement = document.querySelector('#hero-carousel');
    heroElement && observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  // Data fetching (optimized with error boundary)
  const fetchSliderImages = useCallback(async () => {
    try {
      const docSnap = await getDoc(doc(db, 'sliderImages', 'homeCarousel'));
      if (!docSnap.exists()) throw new Error('No carousel data found');

      const slideData = (docSnap.data().images || [])
        .map((slide: any, index: number) => ({
          imageUrl: slide.imageUrl || '',
          redirectionURL: cleanRedirectionURL(slide.redirectionURL),
          altText: slide.altText || `Slide ${index + 1}`,
          position: typeof slide.position === 'number' ? slide.position : index
        }))
        .filter((slide: Slide) => {
          if (!slide.imageUrl) {
            console.warn('Missing imageUrl for slide');
            return false;
          }
          return true;
        })
        .sort((a: Slide, b: Slide) => a.position - b.position);

      setSlides(slideData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load carousel');
    }
  }, []);

  useEffect(() => {
    isVisible && fetchSliderImages();
  }, [isVisible, fetchSliderImages]);

  // Auto-rotation (optimized with cleanup)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  // Navigation (optimized with useCallback)
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Memoized components
  const errorComponent = useMemo(() => (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-8 mt-16 md:mt-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <ErrorIcon />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Error loading carousel</h3>
            <p className="text-sm md:text-base text-gray-600 max-w-md">{error}</p>
            <button 
              onClick={fetchSliderImages}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [error, fetchSliderImages]);

  const loadingPlaceholder = useMemo(() => (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-8 mt-16 md:mt-20">
      <div id="hero-carousel" className="mx-auto max-w-[1400px]">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.5/1] flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="flex space-x-2 justify-center">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm">Loading carousel...</p>
          </div>
        </div>
      </div>
    </div>
  ), []);

  if (error) return errorComponent;
  if (!isVisible || slides.length === 0) return loadingPlaceholder;

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-6 md:py-8 mt-16 md:mt-20">
      <div 
        id="hero-carousel"
        className="mx-auto max-w-[1400px] group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative rounded-2xl shadow-2xl bg-gray-900 overflow-hidden aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.5/1] lg:aspect-[21/8]">
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={`${slide.imageUrl}-${index}`}
                className={`w-full h-full transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <Link
                  href={slide.redirectionURL}
                  className="block w-full h-full relative group/slide overflow-hidden rounded-2xl"
                  target={slide.redirectionURL.startsWith('http') ? '_blank' : '_self'}
                  rel={slide.redirectionURL.startsWith('http') ? 'noopener noreferrer' : undefined}
                  prefetch={false} // Disable prefetching for non-critical links
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.altText}
                    fill
                    priority={index === 0} // Only prioritize first image
                    loading={index === 0 ? 'eager' : 'lazy'}
                    quality={85} // Reduce quality for smaller files
                    className="object-cover w-full h-full cursor-pointer transition-transform duration-700 group-hover:scale-105 rounded-2xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = '/fallback-image.jpg';
                      target.onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 transition-opacity duration-300 group-hover/slide:opacity-75 rounded-2xl"></div>
                </Link>
              </div>
            ))}
          </div>

          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 backdrop-blur-md p-2 sm:p-3 md:p-4 text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronIcon direction="left" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 backdrop-blur-md p-2 sm:p-3 md:p-4 text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronIcon direction="right" />
              </button>

              <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2 sm:space-x-3 md:space-x-4 bg-black/20 backdrop-blur-sm rounded-full px-3 sm:px-4 md:px-6 py-2 md:py-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      index === currentSlide 
                        ? 'bg-white h-2 w-6 sm:h-3 sm:w-8 md:h-3 md:w-10 shadow-md' 
                        : 'bg-white/50 hover:bg-white/70 h-2 w-2 sm:h-3 sm:w-3 md:h-3 md:w-3 hover:scale-110'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;