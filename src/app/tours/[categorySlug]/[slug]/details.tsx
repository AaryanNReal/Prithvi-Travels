'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { db, auth } from '@/app/lib/firebase';
import { collection, getDocs, query, where, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon, CurrencyRupeeIcon, TagIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import MobileNumberInput from '@/components/PhoneInput';
import { getAuth } from 'firebase/auth';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Head from 'next/head';

interface ItineraryDay {
  title: string;
  description: string;
  imageURL: string[];
}

interface CategoryDetails {
  categoryID: string;
  name: string;
  slug: string;
}

interface Tag {
  name: string;
  slug: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  location: string;
  price: number;
  numberofDays: number;
  numberofNights: number;
  startDate: string;
  itenaries: Record<string, ItineraryDay>;
  status?: string;
  categoryDetails: CategoryDetails;
  flightIncluded?: boolean;
  tags?: Record<string, Tag>;
}

interface RelatedTour {
  id: string;
  title: string;
  slug: string;
  imageURL: string;
  price: number;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  uid?: string;
  userID?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  userID?: string;
}

export default function TourDetailPage() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedTours, setRelatedTours] = useState<RelatedTour[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const dayRefs = useRef<{[key: string]: HTMLDivElement | null}>({});


  const slug = decodeURIComponent(params.slug as string);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const usersQuery = query(
            collection(db, 'users'),
            where('uid', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(usersQuery);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as UserData;
            setUserData(userData);
            
            setFormData({
              name: userData.name || currentUser.displayName || '',
              email: currentUser.email || '',
              phone: userData.phone || '',
              userID: userData.userID || "",
            });
          } else {
            setFormData({
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setFormData({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: ''
          });
        }
      } else {
        setFormData({
          name: '',
          email: '',
          phone: ''
        });
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        
        const toursQuery = query(
          collection(db, 'tours'),
          where('slug', '==', slug)
        );
        const tourSnapshot = await getDocs(toursQuery);

        if (tourSnapshot.empty) {
          setError('Tour not found');
          return;
        }

        const tourDoc = tourSnapshot.docs[0];
        const tourData = tourDoc.data() as Tour;

        if (tourData.status && tourData.status !== 'active') {
          setError('Tour is not available');
          return;
        }

        setTour({
          ...tourData,
          id: tourDoc.id
        });

        if (tourData.categoryDetails?.categoryID) {
          const relatedQuery = query(
            collection(db, 'tours'),
            where('categoryDetails.categoryID', '==', tourData.categoryDetails.categoryID),
            where('status', '==', 'active'),
            where('slug', '!=', slug)
          );
          const relatedSnapshot = await getDocs(relatedQuery);
          const related = relatedSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            slug: doc.data().slug,
            imageURL: doc.data().imageURL,
            price: doc.data().price
          }));
          setRelatedTours(related);
        }

        const allTours = await getDocs(collection(db, 'tours'));
        const uniqueCategories = new Map<string, CategoryDetails>();
        allTours.forEach(tourDoc => {
          const tour = tourDoc.data() as Tour;
          if (tour.categoryDetails) {
            uniqueCategories.set(tour.categoryDetails.categoryID, tour.categoryDetails);
          }
        });
        
      } catch (err) {
        console.error('Error loading tour:', err);
        setError('Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchTourData();
  }, [slug]);

  useEffect(() => {
    if (selectedDay && dayRefs.current[selectedDay]) {
      dayRefs.current[selectedDay]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedDay]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date not specified';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookingId = `PTID${Date.now()}`;
      
      const userId = user?.uid || `GUEST${Date.now()}`;
      const userID = userData?.userID || userId;
      const userDetails = {
        name: userData?.name || formData.name,
        email: userData?.email || formData.email,
        phone: userData?.phone || formData.phone,
        uid: user?.uid || null,
        userID: userID
      };

      const tourDetails = {
        id: tour?.id,
        title: tour?.title,
        category: tour?.categoryDetails?.name,
        ...tour
      };

      await setDoc(doc(db, 'bookings', bookingId), {
        bookingId,
        status: 'captured',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userDetails,
        tourDetails
      });

      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
    } catch (error) {
      console.error('Booking submission failed:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading tour details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
      <p className="text-xl">⚠️ {error}</p>
      <Link href="/tours" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Back to Tours
      </Link>
    </div>
  );

  if (!tour) return null;

  const dayKeys = Object.keys(tour.itenaries || {}).sort((a, b) => {
    const dayA = parseInt(a.replace('Day', ''));
    const dayB = parseInt(b.replace('Day', ''));
    return dayA - dayB;
  });

  const tagKeys = tour.tags ? Object.keys(tour.tags) : [];

  const handleDaySelect = (dayKey: string) => {
    setSelectedDay(dayKey);
  };

  return (
    <>
      <Head>
        <title>{tour.title} - Tour Details</title>
        <meta name="description" content={tour.description} />
        <meta property="og:title" content={tour.title} />
        <meta property="og:description" content={tour.description} />
        <meta property="og:image" content={tour.imageURL} />
        <meta property="og:url" content={`https://yourwebsite.com/tours/${slug}`} />
        <meta property='og:keywords' content={tour.tags ? tagKeys.map(key => tour.tags![key].name).join(', ') : ''} />
        <link rel="canonical" href={`https://yourwebsite.com/tours/${slug}`} />
      </Head>
      <div className="flex flex-col mt-24 md:flex-row gap-8 p-4 max-w-7xl mx-auto">
        <div className="md:w-2/3">
          <div className="mt-4">
            <Link href="/tours" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all tours
            </Link>
          </div>
          
          <div className='mt-5'>
            <h1 className='text-3xl font-bold text-gray-800'>{tour.title}</h1>
            {tour.categoryDetails && (
              <Link href={`/tours/${tour.categoryDetails.slug}`}>
                <h1 className='text-blue-500 text-sm font-medium p-1 rounded-sm hover:text-blue-600 transition-colors duration-200'>{tour.categoryDetails.name}</h1>
              </Link>
            )}
            <p className='text-gray-600 mt-2 max-w-3xl leading-relaxed'>
              {tour.description.length > 500 
                ? `${tour.description.substring(0, 500)}...` 
                : tour.description}
            </p>
            <div className="mt-6 relative h-96 w-full">
              <Image
                src={tour.imageURL}
                className="object-cover rounded-lg shadow-md"
                alt={tour.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
          
          <h1 className='text-2xl font-bold mt-8 text-gray-800'>Details</h1>
          <div className='m-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='flex items-center'>
                <CalendarIcon className='h-10 w-10 text-blue-500' />
                <div className='ml-2'>
                  <p className='text-lg'>{tour.numberofDays} Days / {tour.numberofNights} Nights</p>
                  <p className='text-sm text-gray-500'></p>
                </div>
              </div>
              <div className='flex items-center'>
                <MapPinIcon className='h-10 w-10 text-blue-500' />
                <p className='ml-2 text-lg'>{tour.location}</p>
              </div>
              <div className='flex items-center'>
                <CurrencyRupeeIcon className='h-10 w-10 text-blue-500' />
                <div className='ml-2'>
                  <p className='text-lg font-semibold'>{formatPrice(tour.price)}</p>
                  {tour.flightIncluded && (
                    <p className='text-sm text-green-600'>Flight included</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <h1 className='text-2xl font-bold mt-8 text-gray-800'>Tour Itinerary</h1>
          
          {/* Day Filter Navigation */}
          {dayKeys.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {dayKeys.map((dayKey) => {
                  const dayNumber = dayKey.replace('Day', '');
                  return (
                    <button
                      key={dayKey}
                      onClick={() => handleDaySelect(dayKey)}
                      className={`px-4 py-2 rounded-md ${selectedDay === dayKey ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      Day {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className='m-4'>
            <div className="space-y-6">
              {tour.itenaries && Object.keys(tour.itenaries).length > 0 ? (
                dayKeys.map((dayKey) => {
                  const day = tour.itenaries[dayKey];
                  const dayNumber = dayKey.replace('Day', '');
                  
                  return (
                    <div 
                      key={dayKey} 
                     ref={(el) => {
  dayRefs.current[dayKey] = el;
}}

                      className="bg-gray-50 rounded-lg p-6 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Day {dayNumber}: {day.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {day.description}
                      </p>
                      
                      {day.imageURL && day.imageURL.length > 0 && (
                        <div className="mt-4 relative px-4">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={1000}
                            autoplay={true}
                            autoplaySpeed={2000}
                            slidesToShow={2}
                            slidesToScroll={1}
                            adaptiveHeight={true}
                            arrows={true}
                            className="rounded-md overflow-hidden"
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1
                                }
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1
                                }
                              }
                            ]}
                          >
                            {day.imageURL.map((img, idx) => (
                              <div key={idx} className="relative h-[400px] w-full px-2">
                                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
                                  <Image
                                    src={img}
                                    alt={`Day ${dayNumber} Image ${idx + 1}`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    priority={idx === 0}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                </div>
                              </div>
                            ))}
                          </Slider>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 italic">No itinerary details available for this tour.</p>
              )}
            </div>
          </div>
          
          {tagKeys.length > 0 && (
            <div className="m-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <TagIcon className="h-6 w-6 text-blue-500 mr-2" />
                Tour Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {tagKeys.map((tagKey) => {
                  const tag = tour.tags![tagKey];
                  return (
                    <Link 
                      key={tagKey} 
                      href={`/tour-tags/${tag.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="md:w-1/3 space-y-6 mt-16">
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request More Information</h2>
            
            {formSubmitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                Thank you for your inquiry! We'll contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-lg">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{userData?.name || user.displayName || 'User'}</p>
                        <p className="text-sm text-gray-600">{userData?.email || user.email}</p>
                        {userData?.phone && <p className="text-sm text-gray-600">{userData.phone}</p>}
                      </div>
                    </div>
                    
                    {!userData?.phone && (
                      <div className=''>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <MobileNumberInput 
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                          placeholder="Your name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <MobileNumberInput 
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                  >
                    {user ? 'Request a Call Back' : 'Submit Inquiry'}
                  </button>
                </div>
                
                {!user && (
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-blue-600 hover:text-blue-800">
                      Log in
                    </Link>
                  </p>
                )}
              </form>
            )}
          </div>
        
          {relatedTours.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Related Tours</h3>
              <div className="space-y-4">
                {relatedTours.map((tour) => (
                  <Link 
                    key={tour.id} 
                    href={`/tours/${tour.slug}`}
                    className="flex items-start space-x-4 group"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={tour.imageURL}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                        {tour.title}
                      </h4>
                      <p className="text-sm text-blue-600 font-medium">{formatPrice(tour.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}