'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface SliderImage {
  imageUrl: string;
  screenName: string;
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
              screenName: img.screenName.toLowerCase() // Convert to lowercase
            }));
          } else if (data.images && typeof data.images === 'object') {
            imagesArray = Object.values(data.images).map((img: any) => ({
              imageUrl: img.imageUrl,
              screenName: img.screenName.toLowerCase() // Convert to lowercase
            }));
          }

          console.log('Processed images:', imagesArray);
          setImages(imagesArray);
        } else {
          console.log('Document does not exist');
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

  // Filter images by search query (case insensitive)
  const filteredImages = images.filter(image => {
    return image.screenName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-red-500 text-xl">{error}</div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 mt-32 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Home Carousel Images</h1>
        
        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Search by screen name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} // Convert input to lowercase
          />
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {images.length === 0 ? 'No images found' : `No matches for "${searchQuery}"`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg">
                <div className="relative h-48">
                  <Link href={`/${image.screenName.toLowerCase()}`} className="block h-full w-full">
                    <Image
                      src={image.imageUrl}
                      alt={`${image.screenName} carousel image`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </Link>
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{image.screenName}</h3>
                  <a 
                    href={image.imageUrl} 
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Image
                  </a>
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