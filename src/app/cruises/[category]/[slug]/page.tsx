'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TagIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import MobileNumberInput from '@/components/PhoneInput';

interface Cruise {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    categoryID: string;
    name: string;
    slug: string;
    description?: string;
  };
  cruiseType: string;
  isFeatured: boolean;
  location: string;
  numberofDays: number;
  numberofNights: number;
  price: string;
  slug: string;
  startDate: string;
  status: string;
  videoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  userID?: string;
  uid?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function CruiseDetailPage() {


 

  const params = useParams();
  const router = useRouter();
  
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const slug = decodeURIComponent(params.slug as string);

  // Auth state handler with users collection lookup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Query users collection for matching document
          const usersQuery = query(
            collection(db, 'users'),
            where('uid', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(usersQuery);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data() as UserData;
            setUserData(data);
            
            // Pre-fill form with user data from users collection
            setFormData({
              name: data.name || currentUser.displayName || '',
              email: data.email || currentUser.email || '',
              phone: data.phone || '',
              message: ''
            });
          } else {
            // No user document found - use auth user data
            setFormData({
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: '',
              message: ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to auth user data if query fails
          setFormData({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: '',
            message: ''
          });
        }
      } else {
        // User not logged in - keep form empty
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setUserData(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch cruise data
  useEffect(() => {
    const fetchCruise = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const cruisesRef = collection(db, 'cruises');
        const q = query(cruisesRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data() as Cruise;
          setCruise({ ...data, id: docSnap.id });
        } else {
          setError('Cruise not found.');
        }
      } catch (err) {
        console.error('Error fetching cruise:', err);
        setError('Failed to load cruise details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCruise();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? 'Date not set'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    } catch {
      return 'Date not set';
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

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookingId = `PTID${Date.now()}`;
      
      // Prepare userDetails - use data from users collection if available, otherwise form data
      const userDetails = {
        name: userData?.name || formData.name,
        email: userData?.email || formData.email,
        phone: userData?.phone || formData.phone,
        uid: user?.uid || null,
        userID: userData?.userID || user?.uid || `GUEST${Date.now()}`
      };

      // Prepare cruiseDetails
      const cruiseDetails = {
        id: cruise?.id,
        title: cruise?.title,
        category: cruise?.categoryDetails?.name,
        ...cruise
      };

      // Create the booking document
      await setDoc(doc(db, 'bookings', bookingId), {
        bookingId,
        status: 'captured',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userDetails,
        cruiseDetails,
        
        source: user ? (userData ? 'Details' : 'Details') : 'Details',
      });

      setFormSubmitted(true);
      setFormData(prev => ({ ...prev, message: '' }));
      
      setTimeout(() => setFormSubmitted(false), 3000);

    } catch (error) {
      console.error('Booking submission failed:', error);
    }
  };


  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading cruise details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
        <p className="text-xl">⚠️ {error}</p>
        <button
          onClick={() => router.push('/cruises')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Cruises
        </button>
      </div>
    );
  }

  if (!cruise) return null;

  return (
    <>
      <Head>
        <title>{cruise.title} | Cruise Package</title>
        <meta name="description" content={cruise.description} />
        <meta property="og:title" content={cruise.title} />
        <meta property="og:description" content={cruise.description} />
        <meta property="og:image" content={cruise.imageURL} />
        <meta property="og:url" content={`https://yourwebsite.com/cruises/${cruise.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={cruise.title} />
        <meta name="twitter:description" content={cruise.description} />
        <meta name="twitter:image" content={cruise.imageURL} />
        <meta property='og:keywords' content='cruise, travel, vacation, package, booking' />
      </Head>
      <div className="flex flex-col md:flex-row mt-24 max-w-7xl mx-auto p-4 gap-8">
        {/* Main Cruise Details */}
        <div className="md:w-2/3">
          <div className="mt-4">
            <Link href="/cruises" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all Cruises
            </Link>
          </div>
          <div className="mt-5">
            <h1 className="text-3xl font-bold text-gray-800">{cruise.title}</h1>
            {cruise.categoryDetails && (
              <Link href={`/cruises/${cruise.categoryDetails.slug}`}>
                <h2 className="text-blue-500 text-sm font-medium p-1 rounded-sm hover:text-blue-600 transition-colors duration-200">
                  {cruise.categoryDetails.name}
                </h2>
              </Link>
            )}
            <p className="text-gray-600 mt-2 max-w-3xl leading-relaxed">{cruise.description}</p>
            <div className="mt-6 relative h-96 w-full">
              <Image
                src={cruise.imageURL}
                alt={cruise.title}
                fill
                className="object-cover rounded-lg shadow-md"
                style={{ border: 0 }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-8 text-gray-800">Details</h1>
          <div className="m-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center">
              <CalendarIcon className="h-10 w-10 text-blue-500" />
              <div className="ml-2">
                <p className="text-lg">{cruise.numberofDays} Days / {cruise.numberofNights} Nights</p>
                <p className="text-sm text-gray-500">
                  {cruise.startDate ? `Start: ${formatDate(cruise.startDate)}` : 'Flexible dates'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-10 w-10 text-blue-500" />
              <p className="ml-2 text-lg">{cruise.location}</p>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-10 w-10 text-blue-500" />
              <div className="ml-2">
                <p className="text-lg font-semibold">{formatPrice(Number(cruise.price))}</p>
              </div>
            </div>
          </div>
          
          {cruise.videoURL && (
            <>
              <h2 className="mt-8 font-bold text-2xl text-gray-800">Video Of The Cruise</h2>
              <div className="flex justify-start items-center m-10">
                <video
                  width="560"
                  height="315"
                  src={cruise.videoURL}
                  title="YouTube video player"
                  className="rounded-lg shadow-md"
                  controls
                ></video>
              </div>
            </>
          )}
        </div>

        {/* Booking Form Sidebar */}
        <div className="md:w-1/3 space-y-6 mt-16">
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request More Information</h2>
            {formSubmitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                Thank you for your inquiry! We'll contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {loadingUser ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : user ? (
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
                    
                    {/* Only show phone input if not in userData */}
                    {!userData?.phone && (
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
        </div>
      </div>
    </>
  );
}