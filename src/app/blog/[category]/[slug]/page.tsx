import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import BlogPostPage from './details';

export async function generateMetadata(
  props: {
    params: Promise<{ category: string; slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const { category, slug } = params;
  const baseUrl = 'https://prithvi-travels-36eo.vercel.app/';

  try {
    const blogsRef = collection(db, 'blogs');
    const q = query(
      blogsRef,
      where('categoryDetails.slug', '==', category),
      where('slug', '==', slug),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const blog = querySnapshot.docs[0].data();
      const seo = blog.seoDetails || {};
      
      if (!seo.title || !seo.description) {
        throw new Error('Required SEO fields are missing');
      }

      const url = `${baseUrl}/blog/${category}/${slug}`;
      const imageUrl = seo.imageURL || `${baseUrl}/default-image.jpg`;

      return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords?.join(', ') || '',
        openGraph: {
          title: seo.title,
          description: seo.description,
          url: url,
          type: 'article',
          images: [{
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: seo.title,
          }],
        },
        twitter: {
          card: 'summary_large_image',
          title: seo.title,
          description: seo.description,
          images: [imageUrl],
        },
        alternates: {
          canonical: url,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page Not Found | Prithvi Travels',
      description: 'The requested blog post could not be found',
    };
  }

  return {
    title: 'Page Not Found | Prithvi Travels',
    description: 'The requested blog post could not be found',
  };
}

export default function Page() {
  return <BlogPostPage />;
}