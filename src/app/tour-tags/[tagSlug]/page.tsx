// app/tours/tags/[tagSlug]/page.tsx
"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import TourCard from "@/components/Domestic/TourCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    categoryID: string;
    name: string;
    slug: string;
  };
  tags: {
    [key: string]: {
      name: string;
      slug: string;
      description?: string;
    };
  };
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
}

export default function TagToursPage() {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");

  useEffect(() => {
    const fetchToursByTag = async () => {
      try {
        setLoading(true);
        
        // First get all tours
        const toursSnapshot = await getDocs(collection(db, "tours"));
        const allTours = toursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Tour[];

        // Filter tours that contain the tagSlug in their tags object
        const filteredTours = allTours.filter(tour => {
          if (!tour.tags) return false;
          return Object.values(tour.tags).some(tag => tag.slug === tagSlug);
        });

        // Get the tag name from the first matching tour
        if (filteredTours.length > 0) {
          const firstTourWithTag = filteredTours[0];
          const matchingTag = Object.values(firstTourWithTag.tags).find(tag => tag.slug === tagSlug);
          if (matchingTag) {
            setTagName(matchingTag.name);
          }
        }

        setTours(filteredTours);
        setError(null);
      } catch (err) {
        console.error("Error fetching tours by tag:", err);
        setError("Failed to load tours with this tag. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchToursByTag();
  }, [tagSlug]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="">
          <Link 
            href="/tours" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to all tours
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {tagName || "Tagged"} Tours
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {tagName 
              ? `Tours tagged with "${tagName}"`
              : "Filtered tour packages"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading tagged tours...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tours Grid */}
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
                  No tours found with this tag.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}