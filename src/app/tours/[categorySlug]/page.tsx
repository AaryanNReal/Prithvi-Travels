"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import TourCard from "@/components/Domestic/TourCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface CategoryDetails {
  categoryID: string;
  name: string;
  slug: string;
  description?: string;
}

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: CategoryDetails;
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
  flightIncluded: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CategoryToursPage() {
  // Use the EXACT SAME parameter name as your folder
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDetails | null>(null);

  useEffect(() => {
    const fetchCategoryTours = async () => {
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

        // Get tours for this category
        const toursQuery = query(
          collection(db, "tours"),
          where("categoryDetails.slug", "==", categorySlug)
        );
        
        const toursSnapshot = await getDocs(toursQuery);
        const toursData = toursSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate().toISOString(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString()
        })) as Tour[];
        
        setTours(toursData);
        setError(null);
      } catch (err) {
        console.error("Error fetching category tours:", err);
        setError("Failed to load tours. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryTours();
  }, [categorySlug]); // Using categorySlug here to match the parameter

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="">
          <Link href="/tours" className="inline-flex items-center mt-2  text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to all tours
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryData?.name || "Loading..."} Tours
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
              Loading tours...
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
            {tours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour) => (
                  <TourCard 
                    key={tour.id}
                    id={tour.id}
                    title={tour.title}
                    slug={tour.slug}
                    description={tour.description}
                    imageURL={tour.imageURL}
                    categoryDetails={{
                      name: tour.categoryDetails.name,
                      slug: tour.categoryDetails.slug
                    }}
                    isFeatured={tour.isFeatured}
                    numberofDays={tour.numberofDays}
                    numberofNights={tour.numberofNights}
                    price={tour.price}
                    startDate={tour.startDate}
                    status={tour.status}
                    location={tour.location}
                    tourType={tour.tourType}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  No tours available in this category.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}