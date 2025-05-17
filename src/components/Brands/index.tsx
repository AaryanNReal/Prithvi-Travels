"use client";
import React, { useState, useEffect } from "react";

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

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + itemsPerPage >= countries.length ? 0 : prev + itemsPerPage
    );
  };

  // Auto play
  useEffect(() => {
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [currentIndex, itemsPerPage]);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
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
              style={{
                transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)`,
              }}
            >
              {countries.map((country, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-4"
                  style={{ flexBasis: `${100 / itemsPerPage}%` }}
                >
                  <div className="group relative h-64 flex flex-col items-center justify-center">
                    {/* Flag container with fixed size */}
                    <div className="relative w-full h-40 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <img
                        src={country.image}
                        alt={`${country.name} flag`}
                        className="w-auto h-full object-contain drop-shadow-lg"
                        style={{ maxWidth: "160px", maxHeight: "120px" }}
                      />
                    </div>
                    
                    {/* Country name that appears only on hover */}
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

export default Brands;