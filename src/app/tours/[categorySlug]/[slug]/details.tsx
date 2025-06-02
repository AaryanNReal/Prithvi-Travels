'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, where, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  TagIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  UsersIcon,
 
} from '@heroicons/react/24/outline';
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
  description?: string;
  createdAt?: any;
}

interface Tag {
  name: string;
  slug: string;
  description?: string;
}

interface IncludedDetails {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  hotel: boolean;
  flights: boolean;
  transfers: boolean;
  sightseeing: boolean;
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
  startDate: string | null;
  itenaries: Record<string, ItineraryDay>;
  status?: string;
  categoryDetails: CategoryDetails;
  flightIncluded: boolean;
  tags?: Record<string, Tag>;
  dos?: string[];
  donts?: string[];
  included: IncludedDetails;
  includedMore?: string[];
  notIncluded?: string[];
  isFeatured?: boolean;
  isOffered?: boolean;
  isStartDate?: boolean;
  tourType: string;
  slug: string;
  createdAt?: any;
  updatedAt?: any;
}

interface RelatedTour {
  id: string;
  title: string;
  slug: string;
  imageURL: string;
  price: number;
  tourType: string;
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
  numberofTravellers: number;
  numberofAdults: number;
  numberofChildren: number;
  numberofInfants: number;
  preferredDate: string;
  customRequirement: string;
}

export default function TourDetailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
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
    numberofTravellers: 1,
    numberofAdults: 1,
    numberofChildren: 0,
    numberofInfants: 0,
    preferredDate: '',
    customRequirement: ''
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
            
            setFormData(prev => ({
              ...prev,
              name: userData.name || currentUser.displayName || '',
              email: currentUser.email || '',
              phone: userData.phone || '',
              userID: userData.userID || ""
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: ''
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setFormData(prev => ({
            ...prev,
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: ''
          }));
        }
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          numberofTravellers: 1,
          numberofAdults: 1,
          numberofChildren: 0,
          numberofInfants: 0,
          preferredDate: '',
          customRequirement: ''
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

        // Process the tour data to match the schema
        const processedTour: Tour = {
          ...tourData,
          id: tourDoc.id,
          flightIncluded: tourData.included?.flights || false,
          included: {
            breakfast: tourData.included?.breakfast || false,
            lunch: tourData.included?.lunch || false,
            dinner: tourData.included?.dinner || false,
            hotel: tourData.included?.hotel || false,
            flights: tourData.included?.flights || false,
            transfers: tourData.included?.transfers || false,
            sightseeing: tourData.included?.sightseeing || false,
          },
          dos: tourData.dos || [],
          donts: tourData.donts || [],
          notIncluded: tourData.notIncluded || [],
          includedMore: tourData.includedMore || [],
          tourType: tourData.tourType || 'international',
        };

        setTour(processedTour);

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
            price: doc.data().price,
            tourType: doc.data().tourType || 'international'
          }));
          setRelatedTours(related);
        }
        
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Flexible Dates';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Flexible Dates';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev, 
      [name]: numValue,
      numberofTravellers: 
        name === 'numberofAdults' ? numValue + prev.numberofChildren + prev.numberofInfants :
        name === 'numberofChildren' ? prev.numberofAdults + numValue + prev.numberofInfants :
        prev.numberofAdults + prev.numberofChildren + numValue
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const bookingId = `PTID${Date.now()}`;
      
      const userId = user?.uid || `GUEST${Date.now()}`;
      const userID = userData?.userID || userId;
      const userDetails = {
        name: userData?.name || formData.name,
        email: userData?.email || formData.email,
        phone: userData?.phone || formData.phone,
        uid: user?.uid || null,
        userID: userID,
        numberofTravellers: formData.numberofTravellers,
        numberofAdults: formData.numberofAdults,
        numberofChildren: formData.numberofChildren,
        numberofInfants: formData.numberofInfants,
        preferredDate: formData.preferredDate,
        customRequirement: formData.customRequirement
      };

      const tourDetails = {
        id: tour?.id,
        title: tour?.title,
        ...tour
      };

      await setDoc(doc(db, 'bookings', bookingId), {
        bookingId,
        bookingType: "Tour",
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
    } finally {
      setIsSubmitting(false);
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
        <title>{tour.title} - Tour Details | Prathvi Travels</title>
        <meta name="description" content={tour.description.substring(0, 160)} />
        <meta property="og:title" content={tour.title} />
        <meta property="og:description" content={tour.description.substring(0, 160)} />
        <meta property="og:image" content={tour.imageURL} />
        <meta property="og:url" content={`https://prathvitravels.com/tours/${slug}`} />
        <meta property="og:type" content="website" />
        <meta name="keywords" content={`${tour.title}, ${tour.location}, ${tour.tourType} tour, travel package`} />
        <link rel="canonical" href={`https://prathvitravels.com/tours/${slug}`} />
      </Head>

      <div className="flex flex-col mt-24 md:flex-row gap-8 p-4 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="md:w-2/3">
          {/* Back button and tour title */}
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
            <div className="flex items-center gap-4 mt-2">
              {tour.categoryDetails && (
                <Link href={`/tours/${tour.categoryDetails.slug}`} className="text-blue-500 text-sm font-medium p-1 rounded-sm hover:text-blue-600 transition-colors duration-200">
                  {tour.categoryDetails.name}
                </Link>
              )}
            </div>
            <p className='text-gray-600 mt-2 max-w-3xl leading-relaxed'>
              {tour.description.length > 500 
                ? `${tour.description.substring(0, 500)}...` 
                : tour.description}
            </p>
            <div className="mt-6 relative h-96 w-full rounded-xl overflow-hidden shadow-lg">
              <Image
                src={tour.imageURL}
                className="object-cover"
                alt={tour.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
          
          {/* Tour Highlights Section */}
          <div className="mt-8">
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>Tour Highlights</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration */}
              <div className='flex items-center bg-gray-50 p-3 rounded-lg'>
                <CalendarIcon className='h-6 w-6 text-blue-500 mr-2 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Duration</p>
                  <p className='text-gray-800 font-semibold'>{tour.numberofDays} Days / {tour.numberofNights} Nights</p>
                </div>
              </div>

              {/* Location */}
              <div className='flex items-center bg-gray-50 p-3 rounded-lg'>
                <MapPinIcon className='h-6 w-6 text-blue-500 mr-2 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Location</p>
                  <p className='text-gray-800 font-semibold'>{tour.location}</p>
                </div>
              </div>

              {/* Price */}
              <div className='flex items-center bg-gray-50 p-3 rounded-lg'>
                <CurrencyRupeeIcon className='h-6 w-6 text-blue-500 mr-2 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Price</p>
                  <p className='text-gray-800 font-semibold'>{formatPrice(tour.price)}</p>
                </div>
              </div>
            </div>

            {/* Start Date - appears below on smaller screens */}
            {tour.startDate && (
              <div className='mt-4 md:hidden flex items-center bg-gray-50 p-3 rounded-lg'>
                <CalendarIcon className='h-6 w-6 text-blue-500 mr-2 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Start Date</p>
                  <p className='text-gray-800 font-semibold'>{formatDate(tour.startDate)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Inclusions & Exclusions Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Inclusions & Exclusions</h2>
            
            {/* What's Included Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                What's Included
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Breakfast */}
                {tour.included.breakfast && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Breakfast</span>
                  </div>
                )}
                
                {/* Lunch */}
                {tour.included.lunch && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Lunch</span>
                  </div>
                )}
                
                {/* Dinner */}
                {tour.included.dinner && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>Dinner</span>
                  </div>
                )}
                
                {/* Hotel */}
                {tour.included.hotel && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Hotel Accommodation</span>
                  </div>
                )}
                
                {/* Flights */}
                {tour.included.flights && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Flights</span>
                  </div>
                )}
                
                {/* Transfers */}
                {tour.included.transfers && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Transfers</span>
                  </div>
                )}
                
                {/* Sightseeing */}
                {tour.included.sightseeing && (
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Sightseeing</span>
                  </div>
                )}
                
                {/* Additional Inclusions */}
                {tour.includedMore && tour.includedMore.length > 0 && (
                  <div className="col-span-full mt-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2"> ✅ Additional Inclusions:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {tour.includedMore.map((item, index) => (
                        <li key={index} className="text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* What's Not Included Section */}
            {tour.notIncluded && tour.notIncluded.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                  <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                  What's Not Included
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {tour.notIncluded.map((item, index) => (
                    <li key={index} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Itinerary Section */}
          <div className="mt-8">
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>Tour Itinerary</h1>
            
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
            
            <div className="space-y-6">
              {dayKeys.length > 0 ? (
                dayKeys.map((dayKey) => {
                  const day = tour.itenaries[dayKey];
                  const dayNumber = dayKey.replace('Day', '');
                  
                  return (
                    <div 
                      key={dayKey} 
                      ref={(el) => { dayRefs.current[dayKey] = el }}
                      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                    >
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Day {dayNumber}: {day.title}
                      </h3>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: day.description }} />
                      
                      {day.imageURL && day.imageURL.length > 0 && (
                        <div className="mt-6">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={1000}
                            autoplay={true}
                            autoplaySpeed={2000}
                            slidesToShow={Math.min(2, day.imageURL.length)}
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

          {/* Dos & Don'ts Section */}
          {(tour.dos?.length > 0 || tour.donts?.length > 0) && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Dos & Don'ts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tour.dos?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Dos</h3>
                    <ul className="space-y-2">
                      {tour.dos.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.donts?.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Don'ts</h3>
                    <ul className="space-y-2">
                      {tour.donts.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <XMarkIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tags Section */}
          {tagKeys.length > 0 && (
            <div className="mt-8">
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
        
        {/* Sidebar */}
        {/* Sidebar - Fixed with proper spacing */}
<div className="md:w-1/3">
  <div className="space-y-6 sticky top-24">
    {/* Booking Form */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book This Tour</h2>
      
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
          
          {/* Traveler Information Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-800">Traveler Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="numberofAdults" className="block text-sm font-medium text-gray-700 mb-1">
                 Adults (⫺ 12)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="numberofAdults"
                    name="numberofAdults"
                    min="1"
                    value={formData.numberofAdults}
                    onChange={handleNumberChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numberofChildren" className="block text-sm font-medium text-gray-700 mb-1">
                  Children (⫺ 2 & ⧀ 12)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="numberofChildren"
                    name="numberofChildren"
                    min="0"
                    value={formData.numberofChildren}
                    onChange={handleNumberChange}
                    className="pl-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numberofInfants" className="block text-sm font-medium text-gray-700 mb-1">
                   Infants (⧀ 2)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="numberofInfants"
                    name="numberofInfants"
                    min="0"
                    value={formData.numberofInfants}
                    onChange={handleNumberChange}
                    className="pl-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numberofTravellers" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Travelers
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UsersIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="numberofTravellers"
                    name="numberofTravellers"
                    value={formData.numberofTravellers}
                    readOnly
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Travel Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="customRequirement" className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              <textarea
                id="customRequirement"
                name="customRequirement"
                rows={3}
                value={formData.customRequirement}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 py-2 border"
                placeholder="Any special requests"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting 
                ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                )
                : (user ? 'Request a Call Back' : 'Submit Inquiry')
              }
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
  
    {/* Related Tours */}
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
                <div className="flex items-center mt-1">
                  <span className="text-sm text-blue-600 font-medium">{formatPrice(tour.price)}</span>
                  <span className="text-xs ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                    {tour.tourType === 'international' ? 'International' : 'Domestic'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
      </div>
    </>
  );
}