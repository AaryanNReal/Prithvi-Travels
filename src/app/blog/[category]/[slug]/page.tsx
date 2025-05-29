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
      const categoryDetails = blog.categoryDetails || {};
      
      // Fallback values
      const title = seo.title || blog.title || categoryDetails.title || 'Visa Expert | Prithvi Travels';
      const description = seo.description || blog.description || categoryDetails.description || 'Expert visa guidance for hassle-free international travel';
      const keywords = seo.keywords?.join(', ') || '';
      const imageUrl = seo.imageURL || blog.imageURL || `${baseUrl}/default-image.jpg`;

      const url = `${baseUrl}/blog/${category}/${slug}`;

      return {
        title: title,
        description: description,
        keywords: keywords,
        openGraph: {
          title: title,
          description: description,
          url: url,
          type: 'article',
          images: [{
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }],
        },
        twitter: {
          card: 'summary_large_image',
          title: title,
          description: description,
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