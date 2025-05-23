'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Slide {
  imageUrl: string;
  redirectionURL: string;
  altText: string;
}

const cleanRedirectionURL = (url: string): string => {
  let cleaned = url.replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return '/';
  if (!cleaned.startsWith('http') && !cleaned.startsWith('/')) {
    cleaned = `/${cleaned}`;
  }
  return cleaned.replace(/([^:]\/)\/+/g, '$1');
};

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const heroElement = document.querySelector('#hero-carousel');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  const fetchSliderImages = useCallback(async () => {
    try {
      const docRef = doc(db, 'sliderImages', 'homeCarousel');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const slideData = (data.images || []).map((slide: any, index: number) => ({
          imageUrl: slide.imageUrl || '',
          redirectionURL: cleanRedirectionURL(slide.redirectionURL || '/'),
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
    }
  }, []);

  // Only fetch data when component becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchSliderImages();
    }
  }, [isVisible, fetchSliderImages]);

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 mt-16 md:mt-22">
        <div className="relative mx-auto max-w-7xl h-[50vh] md:h-[calc(100vh-96px)] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
    );
  }

  if (!isVisible || slides.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 mt-16 md:mt-22">
        <div 
          id="hero-carousel"
          className="relative mx-auto max-w-7xl h-[50vh] md:h-[calc(100vh-96px)] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Enhanced loading placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="flex space-x-2 justify-center">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-gray-500 text-sm">Loading carousel...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 mt-20  md:mt-20">
      <div 
        id="hero-carousel"
        className="relative mx-auto max-w-7xl h-[50vh] md:h-[calc(100vh-120px)] overflow-hidden group rounded-2xl shadow-2xl bg-gray-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-full w-full">
          {slides.map((slide, index) => (
            <div
              key={`${slide.imageUrl}-${index}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
              }`}
            >
              <Link
                href={slide.redirectionURL}
                passHref
                className="block h-full w-full"
                target={slide.redirectionURL.startsWith('http') ? '_blank' : '_self'}
                rel={slide.redirectionURL.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.altText}
                  fill
                  className="object-cover w-full h-full cursor-pointer transition-transform duration-700 group-hover:scale-105"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  unoptimized
                  onError={(e) => {
                    console.error(`Error loading image: ${slide.imageUrl}`);
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/fallback-image.jpg';
                    target.onerror = null;
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                />
                {/* Enhanced overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 transition-opacity duration-300 hover:opacity-75"></div>
              </Link>
            </div>
          ))}

          {slides.length > 1 && (
            <>
              {/* Enhanced Navigation Arrows */}
              <button
                onClick={prevSlide}
                className={`absolute left-4 md:left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md p-3 md:p-4 text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg opacity-0 group-hover:opacity-100 ${
                  isMobile ? 'scale-75 opacity-80' : ''
                }`}
                aria-label="Previous slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className={`absolute right-4 md:right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md p-3 md:p-4 text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg opacity-0 group-hover:opacity-100 ${
                  isMobile ? 'scale-75 opacity-80' : ''
                }`}
                aria-label="Next slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Enhanced Indicators with better spacing and styling */}
              <div className="absolute bottom-6 md:bottom-8 left-1/2 z-10 flex -translate-x-1/2 space-x-3 md:space-x-4 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 md:px-6 md:py-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      index === currentSlide 
                        ? 'bg-white h-3 w-8 md:h-3 md:w-10 shadow-md' 
                        : 'bg-white/50 hover:bg-white/70 h-3 w-3 md:h-3 md:w-3 hover:scale-110'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide}
                  />
                ))}
              </div>
            </>
          )}

          {/* Optional: Add slide counter */}
          
        </div>
      </div>
    </div>
  );
};

export default Hero;