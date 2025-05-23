// app/blog/[category]/[title]/page.tsx
import { Metadata } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
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
      where('slug','==',slug),
    
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const blog = querySnapshot.docs[0].data();
      const tags = blog.tags ? Object.values(blog.tags as Record<string, { name: string }>).map(tag => tag.name) : [];
      
      const defaultKeywords = [
        'blog',
        'article',
        blog.category?.name || '',
        blog.createdBy?.name || '',
      ];

      const allKeywords = [...tags, ...defaultKeywords].filter(Boolean);
      const description = blog.summary || blog.description?.substring(0, 160) || 'Read this blog post';
      const url = `${baseUrl}/blog/${category}/${slug}`;
      const imageUrl = blog.imageURL || `${baseUrl}/default-image.jpg`;

      return {
        title: `${blog.title} | My Blog`,
        description,
        keywords: allKeywords.join(', '),
        openGraph: {
          title: blog.title,
          description,
          url,
          type: 'article',
          publishedTime: blog.createdAt?.toDate?.()?.toISOString(),
          authors: [blog.createdBy?.name || ''],
          images: [{
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.image?.altText || blog.title,
          }],
        },
        twitter: {
          card: 'summary_large_image',
          title: blog.title,
          description,
          images: [imageUrl],
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
    title: 'Blog Post | My Blog',
    description: 'Read this interesting blog post',
    keywords: 'blog, article, post',
  };
}

export default function Page() {
  return <BlogPostPage />;
}