import type { Metadata } from 'next';
import BlogList from './BlogList';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog Articles | Insights & Latest Updates',
    description: 'Explore our collection of insightful blog articles covering various topics and industry trends.',
    keywords: ['blog', 'articles', 'insights', 'updates', 'news'],
    openGraph: {
      title: 'Blog Articles | Insights & Latest Updates',
      description: 'Explore our collection of insightful blog articles',
      url: 'https://yourwebsite.com/blog',
      images: [{
        url: 'https://yourwebsite.com/images/blog-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog Articles',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog Articles',
      description: 'Explore our collection of insightful blog articles',
      images: ['https://yourwebsite.com/images/blog-twitter.jpg'],
    },
  };
}

export default function BlogPage() {
  return <BlogList />;
}