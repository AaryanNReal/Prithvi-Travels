import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

interface CruiseCardProps {
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
  price: number | string;
  startDate: string;
  status: string;
  location: string;
  cruiseType: string;
  onEnquireClick?: () => void; // Add this prop
}

const CruiseCard: React.FC<CruiseCardProps> = ({
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
  cruiseType,
  onEnquireClick,
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

  const isPexelsImage = imageURL.includes('pexels.com');
  const numericPrice = typeof price === 'string' ? parseInt(price) : price;

  return (
    <div className="block group hover:no-underline w-full">
      <Link 
        href={`/cruises/${categoryDetails.slug}/${slug}`} 
        className="block group hover:no-underline w-full"
        aria-label={`View ${title} cruise package`}
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
          <div className="relative h-64 w-full">
            <Image
              alt={title}
              src={imageURL}
              width={600}
              height={500}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Category and Cruise Type badges */}
            <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
              <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow">
                {categoryDetails.name}
              </span>
              <span className="bg-purple-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow capitalize">
                {cruiseType} cruise
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {title}
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-base line-clamp-1 mb-4 flex-1">
              {description}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-black/10 pt-3">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 mr-1.5" />
                <span className="font-medium">{location}</span>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-1.5" />
                <span>{numberofDays}D/{numberofNights}N</span>
              </div>
              
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{numericPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Enquire Button - Added below the card but inside the same container */}
      {onEnquireClick && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEnquireClick();
          }}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <EnvelopeIcon className="w-5 h-5" />
          Enquire Now
        </button>
      )}
    </div>
  );
};

export default CruiseCard;