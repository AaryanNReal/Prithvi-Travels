'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface SliderImage {
  imageUrl: string;
  redirectionURL: string;
  title?: string; // Optional title for display
}

const SliderImagesPage = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch slider images from Firestore
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'sliderImages', 'homeCarousel');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          let imagesArray: SliderImage[] = [];
          
          if (Array.isArray(data.images)) {
            imagesArray = data.images.map((img: any) => ({
              imageUrl: img.imageUrl,
              redirectionURL: img.redirectionURL || '#',
              title: img.title || getTitleFromURL(img.redirectionURL)
            }));
          } else if (data.images && typeof data.images === 'object') {
            imagesArray = Object.values(data.images).map((img: any) => ({
              imageUrl: img.imageUrl,
              redirectionURL: img.redirectionURL || '#',
              title: img.title || getTitleFromURL(img.redirectionURL)
            }));
          }

          setImages(imagesArray);
        } else {
          setImages([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load images');
        setLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // Helper function to extract title from URL
  const getTitleFromURL = (url: string) => {
    if (!url) return 'Untitled';
    try {
      const pathParts = new URL(url).pathname.split('/');
      return pathParts[pathParts.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch {
      return 'Untitled';
    }
  };

  // Filter images by search query (case insensitive)
  const filteredImages = images.filter(image => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (image.title?.toLowerCase().includes(searchTerm)) ||
      (image.redirectionURL.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-32 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Home Carousel Images</h1>
          <p className="text-gray-600">Manage all slider images and their redirection links</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title or URL..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredImages.length} of {images.length} images
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            {images.length === 0 ? 'No images found' : `No matches for "${searchQuery}"`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Link 
                    href={image.redirectionURL} 
                    target="_blank"
                    className="block h-full w-full"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.title || 'Carousel image'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </Link>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-1 truncate">
                    {image.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center justify-between">
                    <a
                      href={image.redirectionURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-[180px]"
                      title={image.redirectionURL}
                    >
                      {image.redirectionURL.split('/').slice(-2).join('/')}
                    </a>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderImagesPage;