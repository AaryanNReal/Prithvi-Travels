import Image from "next/image";
import Link from "next/link";
import { ClockIcon, CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface BlogCardProps {
  id: string;
  title: string;
  slug:string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
  imageUrl: string;
  imageAlt?: string;
  category: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  author?: {
    name: string;
    image: string;
    role?: string;
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
  category,
  isFeatured = false,
  author,
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
      href={`/blog/${category.slug}/${slug}`} 
      className="block group mb-6 hover:no-underline"
      aria-label={`Read more about ${title}`}
    >
      <div className={`
        rounded-xl overflow-hidden shadow-lg 
        bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400
        ${isFeatured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
      `}>
        {/* Image with badges */}
        <div className="relative ">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={500}
            height={500}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={isFeatured}
          />
          
          {/* Featured badge */}
         
          {/* Category badge */}
          <span className="absolute top-2 right-3 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
            {category.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-col h-full">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
              {description}
            </p>
            
            {/* Metadata */}
            
              
              
              {/* Author and dates */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-black/10 pt-3">
                <div className="flex items-center   ">
                  {author && (
                    <div className="flex items-center">
                      <div className="relative rounded-4xl overflow-hidden mr-2">
                        <Image
                          src={author.image}
                          alt={author.name}
                          width={80}
                          height={10}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold text-black border-r-2  p-2">{author.name}</span>
                      {author.role && <span className="hidden sm:inline">• {author.role}</span>}
                    </div>
                  )}
                </div>
                
                
                  
                  <div className="text-black mr-6 ">
                  <div>
                    <h1>Date</h1>
                  </div>
                  <div>
                     <span> 
                      {formatDate(createdAt)}</span>
                  </div>
                   
                   
                  </div>
                </div>
              </div>
              
             
              
              
            </div>
          </div>
        
      
    </Link>
  );
};

export default BlogCard;