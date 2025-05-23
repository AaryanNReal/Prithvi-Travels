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

  if (!isVisible || slides.length === 0) {
    return (
      <div 
        id="hero-carousel"
        className="relative w-full mt-16 md:mt-22 h-[50vh] md:h-[calc(100vh-96px)] bg-gray-100"
      >
        {/* Placeholder content while lazy loading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="hero-carousel"
      className="relative w-full mt-20 md:mt-22 h-[50vh] md:h-[calc(100vh-96px)] overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={`${slide.imageUrl}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
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
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 hover:opacity-0"></div>
            </Link>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className={`absolute left-2 md:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 md:p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 focus:outline-none opacity-0 group-hover:opacity-100 ${
                isMobile ? 'scale-75 opacity-100' : ''
              }`}
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className={`absolute right-2 md:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 md:p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 focus:outline-none opacity-0 group-hover:opacity-100 ${
                isMobile ? 'scale-75 opacity-100' : ''
              }`}
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 z-10 flex -translate-x-1/2 space-x-2 md:space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 w-2 md:h-3 md:w-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50 hover:bg-white/70'
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