import Image from "next/image";
import Link from "next/link";
import { ClockIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
  imageUrl: string;
  imageAlt?: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  author?: {
    name: string;
    slug: string;
  };
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
  readingTime?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  slug,
  description,
  content = "",
  createdAt,
  updatedAt,
  imageUrl,
  imageAlt = "",
  categoryDetails,
  isFeatured = false,
  author = { name: 'Prithvi Travels Team', slug: 'prithvi-travels' },
  tags = [],
  readingTime,
}) => {
  // Calculate reading time if not provided
  const calculateReadingTime = () => {
    if (readingTime) return readingTime;
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link 
      href={`/blog/${categoryDetails.slug}/${slug}`} 
      className="block group hover:no-underline h-full"
      aria-label={`Read more about ${title}`}
    >
      <div className={`
        rounded-xl overflow-hidden shadow-lg 
        bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400
        h-full flex flex-col
      `}>
        {/* Image container with fixed aspect ratio */}
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={isFeatured}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Category badge */}
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
            {categoryDetails.name}
          </span>
        </div>

        {/* Content container with consistent padding and flex-grow */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title with consistent line clamping */}
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {title}
          </h2>
          
          {/* Description with consistent line clamping */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1 mb-3 flex-grow">
            {description}
          </p>
          
          {/* Metadata with consistent spacing */}
          <div className="mt-auto pt-3 border-t  border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                By {author.name}
              </div>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <CalendarIcon className="w-3 h-3 mr-1" />
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;