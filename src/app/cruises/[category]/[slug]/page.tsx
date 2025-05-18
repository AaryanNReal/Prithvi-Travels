// app/cruises/[category]/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import CruiseDetail from './details';

// 1. Predefined fallback metadata
const FALLBACK_METADATA: Metadata = {
  title: 'Cruise Details | Prithvi Travels',
  description: 'Explore this amazing cruise opportunity',
  openGraph: {
    images: '/images/logo/logo.png',
  }
};

// 2. Cache slug-to-ID mapping (adjust based on your DB structure)
const getCruiseDocId = (slug: string, category: string) => 
  `cruise_${category}_${slug}`.toLowerCase();

export async function generateMetadata(
  props: {
    params: Promise<{ category: string; slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  // 3. Parallel decode and ID generation
  const [category, slug] = [
    decodeURIComponent(params.category),
    decodeURIComponent(params.slug),
  ];
  const docId = getCruiseDocId(slug, category);

  try {
    // 4. Direct document access (faster than query)
    const docRef = doc(db, 'cruises', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cruise = docSnap.data();
      
      // 5. Minimal metadata construction
      return {
        title: `${cruise.title} | Prithvi Travels`,
        description: cruise.description.substring(0, 160),
        openGraph: {
          title: cruise.title,
          description: cruise.description.substring(0, 160),
          images: cruise.imageURL 
        },
      };
    }
  } catch (error) {
    console.error('Metadata generation failed:', error);
  }

  // 6. Return fallback immediately on failure
  return FALLBACK_METADATA;
}

export default function Page() {
  return <CruiseDetail />;
}