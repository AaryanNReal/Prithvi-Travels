"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import CruiseCard from "@/components/Cruises/cruise_card";
import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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
  // Use the same parameter name as your folder [category]
  const { category: categorySlug } = useParams<{ category: string }>();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDetails | null>(null);

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



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="">
          <Link href="/cruises" className="inline-flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to all cruises
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryData?.name || "Loading..."} Cruises
          </h1>
          {categoryData?.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {categoryData.description}
            </p>
          )}
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
            {cruises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cruises.map((cruise) => (
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
                  No cruises available in this category.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}