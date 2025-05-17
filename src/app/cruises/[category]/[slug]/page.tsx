// app/cruises/[category]/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CruiseDetailClient from './cruisedetails';
import Link from 'next/link';
interface Cruise {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  location: string;
  price: string;
  slug: string;
  numberofDays: number;
  numberofNights: number;
  startDate: string;
  videoURL?: string;
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string }
}): Promise<Metadata> {
  // Use params directly without destructuring
  const baseUrl = 'https://prithvi-travels-36eo.vercel.app';
  const url = `${baseUrl}/cruises/${params.category}/${params.slug}`;

  // Get cruise data (optional - only if you want cruise-specific metadata)
  let cruise = null;
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    cruise = await getCruiseData(decodedSlug);
  } catch (error) {
    console.error('Error fetching cruise for metadata:', error);
  }

  return {
    title: `${cruise?.title || 'Cruise'} | Prithvi Travels`,
    description: cruise?.description || 'Discover amazing cruise experiences',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${cruise?.title || 'Cruise'} | Prithvi Travels`,
      description: cruise?.description || 'Discover amazing cruise experiences',
      url,
      images: [
        {
          url: cruise?.imageURL || `${baseUrl}/images/default-cruise.jpg`,
          width: 1200,
          height: 630,
          alt: cruise?.title || 'Cruise image',
        },
      ],
      siteName: 'Prithvi Travels',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cruise?.title || 'Cruise'} | Prithvi Travels`,
      description: cruise?.description || 'Discover amazing cruise experiences',
      images: [cruise?.imageURL || `${baseUrl}/images/default-cruise.jpg`],
    },
  };
}

async function getCruiseData(slug: string): Promise<Cruise | null> {
  try {
    const cruisesRef = collection(db, 'cruises');
    const q = query(cruisesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        imageURL: data.imageURL,
        categoryDetails: data.categoryDetails,
        location: data.location,
        price: data.price,
        slug: data.slug,
        numberofDays: data.numberofDays,
        numberofNights: data.numberofNights,
        startDate: data.startDate?.toDate().toISOString() || '',
        videoURL: data.videoURL,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching cruise:', error);
    return null;
  }
}

export default async function CruiseDetailPage({
  params,
}: {
  params: { category: string; slug: string }
}) {
  // Decode the parameters
  const decodedSlug = decodeURIComponent(params.slug);
  const decodedCategory = decodeURIComponent(params.category);
  const cruise = await getCruiseData(decodedSlug);

  if (!cruise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Cruise not found</p>
          <Link href="/cruises" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Back to Cruises
          </Link>
        </div>
      </div>
    );
  }

  return <CruiseDetailClient cruise={cruise} />;
}