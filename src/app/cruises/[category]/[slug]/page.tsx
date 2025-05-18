// app/cruises/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CruiseDetail from './details';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  
  try {
    const cruisesRef = collection(db, 'cruises');
    const q = query(cruisesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const cruise = docSnap.data();
      
      return {
        title: `${cruise.title} | Cruise Details`,
        description: cruise.description.substring(0, 160),
        openGraph: {
          title: cruise.title,
          description: cruise.description.substring(0, 160),
          images: [{
            url: cruise.imageURL,
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
    title: 'Cruise Details',
    description: 'Explore this amazing cruise opportunity',
  };
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Page({ params }: PageProps) {
  return <CruiseDetail />;
}