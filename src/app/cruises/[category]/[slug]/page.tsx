// app/cruises/[category]/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CruiseDetail from './details';

export async function generateMetadata(
  props: {
    params: Promise<{ category: string; slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  // Create a synchronous function to decode parameters
  const decodeParams = () => ({
    category: decodeURIComponent(params.category),
    slug: decodeURIComponent(params.slug),
  });

  // Get decoded parameters synchronously
  const { category, slug } = decodeParams();

  try {
    const cruisesRef = collection(db, 'cruises');
    const q = query(
      cruisesRef,
      where('slug', '==', slug),
      where('categoryDetails.slug', '==', category)
    );
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