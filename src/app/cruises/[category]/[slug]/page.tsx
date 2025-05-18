// app/cruises/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CruiseDetail from './details';

export async function generateMetadata(): Promise<Metadata> {
  // Extract the slug from the URL path
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const slug = pathParts.length > 0 ? decodeURIComponent(pathParts[pathParts.length - 1]) : '';
  
  if (!slug) {
    return {
      title: 'Cruise Details | Prithvi Travels',
      description: 'Explore this amazing cruise opportunity',
    };
  }

  try {
    const cruisesRef = collection(db, 'cruises');
    const q = query(cruisesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const cruise = querySnapshot.docs[0].data();
      
      return {
        title: `${cruise.title} | Prithvi Travels`,
        description: cruise.description.substring(0, 160),
        openGraph: {
          title: cruise.title,
          description: cruise.description.substring(0, 160),
          images: [{
            url: cruise.imageURL || '/images/logo/logo.png',
            width: 800,
            height: 600,
            alt: cruise.title,
          }],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Cruise Details | Prithvi Travels',
    description: 'Explore this amazing cruise opportunity',
  };
}

export default function Page() {
  return <CruiseDetail />;
}