// app/tours/[categorySlug]/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import TourDetail from './details';
interface Tag {
  name: string;
  slug: string;
}
export async function generateMetadata(
  props: {
    params: Promise<{ categorySlug: string; slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const { categorySlug, slug } = params;
  const baseUrl = 'https://prithvi-travels-36eo.vercel.app';

  try {
    const toursRef = collection(db, 'tours');
    const q = query(
      toursRef,
      where('slug', '==', slug),
      where('categoryDetails.slug', '==', categorySlug),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const tour = querySnapshot.docs[0].data();
    const tags = tour.tags ? Object.values(tour.tags as Record<string, Tag>).map(tag => tag.name) : [];
      const defaultKeywords = [
        'tour packages',
        'travel agency',
        'vacation packages',
        categorySlug.replace('-', ' '),
        tour.location || '',
        `${tour.numberofDays} days tour`,
        `${tour.numberofNights} nights tour`
      ];
      
      const allKeywords = [...tags, ...defaultKeywords].filter(Boolean);
      const description = tour.description.substring(0, 160);
      const url = `${baseUrl}/tours/${categorySlug}/${slug}`;

      return {
        title: `${tour.title} | Prithvi Travels`,
        description,
        keywords: allKeywords.join(', '),
        openGraph: {
          title: tour.title,
          description,
          url,
          type: 'website',
          images: [{
            url: tour.imageURL || `${baseUrl}/images/logo/logo.png`,
            width: 800,
            height: 600,
            alt: tour.title,
          }],
        },
        twitter: {
          card: 'summary_large_image',
          title: tour.title,
          description,
          images: [tour.imageURL || `${baseUrl}/images/logo/logo.png`],
        },
        alternates: {
          canonical: url,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Tour Details | Prithvi Travels',
    description: 'Explore this amazing tour opportunity',
    keywords: 'tour, travel, vacation, package',
  };
}

export default function Page() {
  return <TourDetail />;
}