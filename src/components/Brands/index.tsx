"use client";
import React, { useState, useEffect, useCallback } from "react";

const countries = [
  { name: "India", image: "/images/flags/india.png" },
  { name: "USA", image: "/images/flags/usa.png" },
  { name: "Canada", image: "/images/flags/canada.png" },
  { name: "Australia", image: "/images/flags/australia.png" },
  { name: "Germany", image: "/images/flags/germany.png" },
  { name: "France", image: "/images/flags/france.png" },
  { name: "Japan", image: "/images/flags/japan.png" },
  { name: "Brazil", image: "/images/flags/brazil.png" },
  { name: "South Africa", image: "/images/flags/south-africa.png" },
];

const Brands = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const autoPlayInterval = 2000;

  // Memoized responsive items per page calculation
  const updateItemsPerPage = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) return setItemsPerPage(1);
    if (width < 1024) return setItemsPerPage(2);
    setItemsPerPage(4);
  }, []);

  useEffect(() => {
    updateItemsPerPage();
    const resizeHandler = () => requestAnimationFrame(updateItemsPerPage);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [updateItemsPerPage]);

  // Memoized next slide function
  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => 
      prev + itemsPerPage >= countries.length ? 0 : prev + itemsPerPage
    );
  }, [itemsPerPage]);

  // Auto play with cleanup
  useEffect(() => {
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Calculate transform percentage
  const transformPercentage = (currentIndex / itemsPerPage) * 100;
  const itemWidth = `${100 / itemsPerPage}%`;

  return (
    <section className="py-20 border-b border-t">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Our Global Presence
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our services across these countries
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-all duration-500 ease-in-out"
              style={{ transform: `translateX(-${transformPercentage}%)` }}
            >
              {countries.map((country, index) => (
                <div
                  key={`${country.name}-${index}`}
                  className="flex-shrink-0 px-4"
                  style={{ flexBasis: itemWidth }}
                >
                  <div className="group relative h-64 flex flex-col items-center justify-center">
                    <div className="relative w-full h-40 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <img
                        src={country.image}
                        alt={`${country.name} flag`}
                        className="w-auto h-full object-contain drop-shadow-lg"
                        style={{ maxWidth: "160px", maxHeight: "120px" }}
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-2">
                        {country.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Brands);