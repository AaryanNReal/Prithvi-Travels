// app/cruises/CruisesClientComponent.tsx
"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import CruiseCard from "@/components/Cruises/cruise_card";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface CruiseCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number | string;
  startDate: string;
  status: string;
  location: string;
  cruiseType: string;
}

const CruisesClientComponent = () => {
  const [cruises, setCruises] = useState<CruiseCardData[]>([]);
  const [filteredCruises, setFilteredCruises] = useState<CruiseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getCruisesData = async () => {
      try {
        setLoading(true);
        const cruisesCollection = collection(db, 'cruises');
        const querySnapshot = await getDocs(cruisesCollection);
        
        const cruisesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            slug: data.slug,
            description: data.description,
            imageURL: data.imageURL,
            categoryDetails: data.categoryDetails,
            isFeatured: data.isFeatured || false,
            numberofDays: data.numberofDays,
            numberofNights: data.numberofNights,
            price: data.price,
            startDate: data.startDate,
            status: data.status,
            location: data.location,
            cruiseType: data.cruiseType,
          };
        });

        setCruises(cruisesData);
        setFilteredCruises(cruisesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cruises:', err);
        setError('Failed to load cruises. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getCruisesData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCruises(cruises);
    } else {
      const filtered = cruises.filter((cruise) =>
        cruise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cruise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cruise.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cruise.cruiseType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCruises(filtered);
    }
  }, [searchTerm, cruises]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
        <Link 
          href="/cruises"
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 py-12 mt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Cruise Packages
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover amazing destinations with our curated cruise experiences
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cruises..."
                className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading cruise packages...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {filteredCruises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCruises.map((cruise) => (
                  <CruiseCard
                    key={cruise.id}
                    id={cruise.id}
                    title={cruise.title}
                    slug={cruise.slug}
                    description={cruise.description}
                    imageURL={cruise.imageURL}
                    categoryDetails={cruise.categoryDetails}
                    isFeatured={cruise.isFeatured}
                    numberofDays={cruise.numberofDays}
                    numberofNights={cruise.numberofNights}
                    price={cruise.price}
                    startDate={cruise.startDate}
                    status={cruise.status}
                    location={cruise.location}
                    cruiseType={cruise.cruiseType}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No cruises match your search." : "No cruises available at the moment. Please check back later."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CruisesClientComponent;