import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface TourCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
}

const TourCard: React.FC<TourCardProps> = ({
  id,
  title,
  slug,
  description,
  imageURL,
  categoryDetails,
  isFeatured = false,
  numberofDays,
  numberofNights,
  price,
  startDate,
  status,
  location,
  tourType,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date not set";
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Date not set";
    }
  };

  

  return (
    <Link 
      href={`/tours/${categoryDetails.slug}/${slug}`} 
      className="block group hover:no-underline w-full"
      aria-label={`View ${title} tour package`}
    >
      <div className={`
        rounded-xl overflow-hidden shadow-lg 
        bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400
        h-full flex flex-col
        w-full max-w-md mx-auto
      `}>
        {/* Image with badges */}
        <div className="relative h-64 w-full"> {/* Increased height to h-64 */}
          { imageURL && (
          <Image
            src={imageURL}
            alt={title}
            width={600}  // Increased width
            height={500} // Increased height
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={isFeatured}
            
          />
          )}
          {/* Featured badge */}
          
          {/* Category badge */}
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow">
            {categoryDetails.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col"> {/* Increased padding to p-5 */}
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-base line-clamp-2 mb-4 flex-1"> {/* Increased text size */}
            {description}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-black/10 pt-3">
            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 mr-1.5" /> {/* Increased icon size */}
              <span className="font-medium">{location}</span>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-1.5" /> {/* Increased icon size */}
              <span>{numberofDays}D/{numberofNights}N</span>
            </div>
            
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400"> {/* Increased text size */}
              ₹{price.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;