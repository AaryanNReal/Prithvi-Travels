'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import CruiseCard from '@/components/Cruises/cruise_card';
import Head from 'next/head';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import SectionTitle from '../Common/SectionTitle';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  UsersIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import MobileNumberInput from '@/components/PhoneInput';

interface Cruise {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  location: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number | string;
  startDate: string;
  status: string;
  cruiseType: string;
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

export default function FeaturedCruises() {
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cruises data
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedCruises = async () => {
      try {
        const cruisesRef = collection(db, 'cruises');
        const q = query(
          cruisesRef,
          where('isFeatured', '==', true),
          where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const cruisesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cruise[];

        setCruises(cruisesData);
      } catch (err) {
        console.error('Error fetching cruises:', err);
        if (isMounted) {
          setError('Failed to load cruises. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedCruises();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user data
  useEffect(() => {
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

  const handleEnquireClick = (cruise: Cruise) => {
    setSelectedCruise(cruise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCruise(null);
    setFormSubmitted(false);
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
      const bookingId = `PCID${Date.now()}`;
      
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

      const cruiseDetails = selectedCruise ? {
        id: selectedCruise.id,
        title: selectedCruise.title,
        price: selectedCruise.price,
        categoryDetails: selectedCruise.categoryDetails,
        numberofDays: selectedCruise.numberofDays,
        numberofNights: selectedCruise.numberofNights,
        location: selectedCruise.location,
        imageURL: selectedCruise.imageURL,
        slug: selectedCruise.slug,
        cruiseType: selectedCruise.cruiseType
      } : null;

      if (!cruiseDetails) {
        throw new Error('No cruise selected');
      }

      await setDoc(doc(db, 'bookings', bookingId), {
        bookingId,
        bookingType: "Cruise",
        status: 'captured',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userDetails,
        cruiseDetails
      });

      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Booking submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading featured cruises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Featured Cruise Packages | Your Travel Company</title>
        <meta name="description" content="Explore our featured cruise vacation packages" />
      </Head>

      <main className="container mx-auto px-4 border-b py-5">
        <Link href="/cruises">
          <div className="text-center mb-12">
            <SectionTitle  
              title='Editors Choice Cruise Getaway'
              paragraph="Don't just take our word for it - hear from our globetrotters about their unforgettable journeys crafted by our expert team."
              center
            />
          </div>
        </Link>

        {cruises.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No featured cruises available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={true}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="py-4"
            >
              {cruises.map((cruise) => (
                <SwiperSlide key={cruise.id}>
                  <div className="h-full flex justify-center">
                    <CruiseCard 
                      {...cruise} 
                      onEnquireClick={() => handleEnquireClick(cruise)}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Booking Modal */}
        {isModalOpen && selectedCruise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Enquire About {selectedCruise.title}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {formSubmitted ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 mr-2" />
                      <span>Thank you! We'll contact you shortly.</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {user ? (
                      <>
                        <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {userData?.name || user.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {userData?.email || user.email}
                            </p>
                            {userData?.phone && (
                              <p className="text-xs text-gray-600 truncate">
                                {userData.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {!userData?.phone && (
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                              Phone <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
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
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="pl-8 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                              placeholder="Your name"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="pl-8 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
                              placeholder="Your email"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
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
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="numberofAdults" className="block text-sm font-medium text-gray-700 mb-1">
                          Adults
                        </label>
                        <input
                          type="number"
                          id="numberofAdults"
                          name="numberofAdults"
                          min="1"
                          value={formData.numberofAdults}
                          onChange={handleNumberChange}
                          className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="numberofChildren" className="block text-sm font-medium text-gray-700 mb-1">
                          Children
                        </label>
                        <input
                          type="number"
                          id="numberofChildren"
                          name="numberofChildren"
                          min="0"
                          value={formData.numberofChildren}
                          onChange={handleNumberChange}
                          className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3"
                        />
                      </div>
                    
                      <div>
                        <label htmlFor="numberofInfants" className="block text-sm font-medium text-gray-700 mb-1">
                          Infants
                        </label>
                        <input
                          type="number"
                          id="numberofInfants"
                          name="numberofInfants"
                          min="0"
                          value={formData.numberofInfants}
                          onChange={handleNumberChange}
                          className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3"
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm font-medium text-gray-700">
                      Total Travellers: {formData.numberofTravellers}
                    </div>
                    
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Cruise Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="preferredDate"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                          className="pl-8 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border"
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
                        className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        placeholder="Cabin preferences, dietary needs, etc."
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {isSubmitting ? (
                          'Processing...'
                        ) : (
                          <>
                            {user ? 'Request Callback' : 'Submit Enquiry'}
                          </>
                        )}
                      </button>
                    </div>
                    
                    {!user && (
                      <p className="text-xs text-gray-500 text-center">
                        Have an account?{' '}
                        <Link href="/signin" className="text-blue-600 hover:text-blue-800">
                          Sign in
                        </Link>{' '}
                        for faster booking
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}