import BlogCard from "@/components/BlogCard";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Metadata } from 'next';

interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
  imageURL: string;
  isFeatured?: boolean;
  categoryDetails: {
    categoryID: string;
    name: string;
    slug: string;
    description: string;
    createdAt: { seconds: number; nanoseconds: number };
  };
  createdBy?: {
    name: string;
    image?: string;
    description?: string;
  };
  seoDetails?: {
    description: string;
    imageURL: string;
    keywords: string[];
    title: string;
  };
  tags?: Record<string, {
    description: string;
    name: string;
    slug: string;
    title: string;
    updatedAt: { seconds: number; nanoseconds: number };
  }>;
}

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

async function getBlogs(): Promise<Blog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "blogs"));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        title: data.title || "Untitled Blog",
        slug: data.slug,
        description: data.description || "",
        content: data.content || "",
        createdAt: data.createdAt || { seconds: Date.now() / 1000 },
        updatedAt: data.updatedAt,
        imageURL: data.imageURL || "/default-blog-image.jpg",
        isFeatured: data.isFeatured || false,
        categoryDetails: {
          categoryID: data.categoryDetails?.categoryID || "",
          name: data.categoryDetails?.name || "Uncategorized",
          slug: data.categoryDetails?.slug || "uncategorized",
          description: data.categoryDetails?.description || "",
          createdAt: data.categoryDetails?.createdAt || { seconds: Date.now() / 1000 }
        },
        createdBy: data.createdBy,
        seoDetails: data.seoDetails ? {
          description: data.seoDetails.description || "",
          imageURL: data.seoDetails.imageURL || "",
          keywords: data.seoDetails.keywords || [],
          title: data.seoDetails.title || ""
        } : undefined,
        tags: data.tags
      };
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    throw new Error("Failed to load blogs");
  }
}

export default async function BlogList() {
  let blogs: Blog[] = [];
  let error = '';

  try {
    blogs = await getBlogs();
    // Simulate loading delay (remove in production)
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load blogs";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <div className="text-4xl text-red-500 mb-4">⚠️</div>
        <p className="text-lg text-center text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="container px-5 py-10 mx-auto max-w-6xl">
      <div className="mb-16 mt-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Blogs</h1>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700 w-full mt-8"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center mt-8">
            <p className="text-lg text-center text-gray-700 dark:text-gray-300">
              No blogs found. Check back later!
            </p>
          </div>
        ) : ( 
          blogs.map((blog) => (
            <div key={blog.id} className="">
              <BlogCard
                id={blog.id}
                title={blog.title}
                slug={blog.slug}
                description={blog.description}
                content={blog.content}
                createdAt={new Date(blog.createdAt.seconds * 1000).toISOString()}
                updatedAt={blog.updatedAt ? new Date(blog.updatedAt.seconds * 1000).toISOString() : undefined}
                imageUrl={blog.imageURL}
                isFeatured={blog.isFeatured}
                categoryDetails={{
                  name: blog.categoryDetails.name,
                  slug: blog.categoryDetails.slug,
                }}
                author={blog.createdBy ? {
                  name: blog.createdBy.name,
                  image: blog.createdBy.image,
                  role: blog.createdBy.description
                } : undefined}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}