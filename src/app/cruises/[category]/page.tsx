"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import CruiseCard from "@/components/Cruises/cruise_card";
import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface CategoryDetails {
  categoryID: string;
  name: string;
  slug: string;
  description?: string;
}

interface Cruise {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: CategoryDetails;
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number | string;
  startDate: string;
  status: string;
  location: string;
  cruiseType: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoryCruisesPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [filteredCruises, setFilteredCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategoryCruises = async () => {
      try {
        setLoading(true);
        
        // Get the category data first
        const categoriesQuery = query(
          collection(db, "categories"),
          where("slug", "==", categorySlug)
        );
        
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        if (categoriesSnapshot.empty) {
          throw new Error("Category not found");
        }
        
        const categoryDoc = categoriesSnapshot.docs[0];
        setCategoryData({
          categoryID: categoryDoc.id,
          ...categoryDoc.data()
        } as CategoryDetails);

        // Get cruises for this category
        const cruisesQuery = query(
          collection(db, "cruises"),
          where("categoryDetails.slug", "==", categorySlug)
        );
        
        const cruisesSnapshot = await getDocs(cruisesQuery);
        const cruisesData = cruisesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate().toISOString(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString()
        })) as Cruise[];
        
        setCruises(cruisesData);
        setFilteredCruises(cruisesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching category cruises:", err);
        setError("Failed to load cruises. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryCruises();
    }
  }, [categorySlug]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="">
          <Link href="/cruises" className="inline-flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to all cruises
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {categoryData?.name || "Loading..."} Cruises
            </h1>
            {categoryData?.description && (
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {categoryData.description}
              </p>
            )}
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
              Loading cruises...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
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
                    categoryDetails={{
                      name: cruise.categoryDetails.name,
                      slug: cruise.categoryDetails.slug
                    }}
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
                  {searchTerm ? "No cruises match your search." : "No cruises available in this category."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}