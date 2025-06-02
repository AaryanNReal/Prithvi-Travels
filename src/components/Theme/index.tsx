'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/autoplay';
import SectionTitle from '../Common/SectionTitle';

export default function CleanCircularSlider() {
  const directions = [
    { 
      name: 'North', 
      path: '/north',
      image: '/images/north.png' // Replace with actual paths
    },
    { 
      name: 'East', 
      path: '/east',
      image: '/images/east.png'
    },
    { 
      name: 'Center', 
      path: '/center',
      image: '/images/centre.jpg'
    },
    { 
      name: 'West', 
      path: '/west',
      image: '/images/west.png'
    },
    { 
      name: 'South', 
      path: '/south',
      image: '/images/south.png'
    },
  ];

  return (
    <div className="relative py-12  max-w-7xl mx-auto px-4">
      <SectionTitle 
        title='Explore India' 
        paragraph='Explore India, visit different Cultures and Experience Bliss' 
        center
      />
      <Swiper
        modules={[Autoplay]}
        spaceBetween={30}
        slidesPerView={4}
        centeredSlides={false}
        autoplay={{ 
          delay: 5000,
          disableOnInteraction: false
        }}
        loop={true}
      >
        {directions.map((direction) => (
          <SwiperSlide key={direction.name}>
            <Link href={direction.path} className="block group">
              <div className="relative w-56  h-56 mx-auto overflow-hidden rounded-full border-2 border-gray-100 transform transition-transform duration-300 hover:scale-105">
                <Image
                  src={direction.image}
                  alt={direction.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {direction.name}
                </h3>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}