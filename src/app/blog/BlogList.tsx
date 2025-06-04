'use client';

import BlogCard from "@/components/BlogCard";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';

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

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogsData = querySnapshot.docs.map(doc => {
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
        
        // Simulate loading delay (remove in production)
        setTimeout(() => {
          setBlogs(blogsData);
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err instanceof Error ? err.message : "Failed to load blogs");
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <p className="text-lg text-center text-gray-700 dark:text-gray-300">Loading blogs...</p>
      </div>
    );
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
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}