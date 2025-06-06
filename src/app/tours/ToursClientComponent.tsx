'use client';

import { collection, getDocs , query , where} from 'firebase/firestore';
import { db, auth ,} from '@/app/lib/firebase';
import TourCard from '@/components/Domestic/TourCard';
import { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiX, FiMapPin, FiGlobe, FiDollarSign, FiCalendar, FiSliders } from 'react-icons/fi';
import { 
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import MobileNumberInput from '@/components/PhoneInput';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Link from 'next/link';


interface ItineraryDay {
  title: string;
  description: string;
  imageURL: string[];
}
interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageURL: string;
  categoryDetails: {
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  priceShow: boolean;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
  itenaries?: Record<string, ItineraryDay>;
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

export default function ToursClientComponent() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    tourType: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
  });
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
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

  // Fetch tours data
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const toursCollection = collection(db, 'tours');
        const toursSnapshot = await getDocs(toursCollection);
        
        const toursData = toursSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            slug: data.slug || '',
            description: data.description || '',
            imageURL: data.imageURL || '',
            categoryDetails: data.categoryDetails || { 
              name: 'Uncategorized', 
              slug: 'uncategorized' 
            },
            isFeatured: data.isFeatured || false,
            numberofDays: data.numberofDays || 0,
            numberofNights: data.numberofNights || 0,
            price: data.price || 0,
            priceShow: data.priceShow !== undefined ? data.priceShow : true,
            startDate: data.startDate || '',
            status: data.status || '',
            location: data.location || '',
            tourType: data.tourType || '',
            itenaries: data.itenaries || {}
          };
        });

        setTours(toursData);
        setFilteredTours(toursData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setLoading(false);
      }
    };

    fetchTours();
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

  // Filter tours
  useEffect(() => {
    let results = tours;

    if (searchTerm) {
      results = results.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.location) {
      results = results.filter(tour => tour.location === filters.location);
    }
    if (filters.tourType) {
      results = results.filter(tour => tour.tourType === filters.tourType);
    }
    if (filters.minPrice) {
      results = results.filter(tour => tour.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(tour => tour.price <= Number(filters.maxPrice));
    }
    if (filters.duration) {
      results = results.filter(tour => tour.numberofDays === Number(filters.duration));
    }

    setFilteredTours(results);
  }, [searchTerm, filters, tours]);

  // Modal handlers
  const handleEnquireClick = (tour: Tour) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTour(null);
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

      const tourDetails = selectedTour ? {
        id: selectedTour.id,
        title: selectedTour.title,
        price: selectedTour.price,
        numberofDays: selectedTour.numberofDays,
        numberofNights: selectedTour.numberofNights,
        location: selectedTour.location,
        imageURL: selectedTour.imageURL,
        slug: selectedTour.slug,
        tourType: selectedTour.tourType,
        itenaries: selectedTour.itenaries || {}
      } : null;

      if (!tourDetails) {
        throw new Error('No tour selected');
      }

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      tourType: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
    });
    setSearchTerm('');
  };

  const locations = [...new Set(tours.map(tour => tour.location))];
  const tourTypes = [...new Set(tours.map(tour => tour.tourType))];
  const durations = [...new Set(tours.map(tour => tour.numberofDays))];

  return (
    <div className="min-h-screen mt-16 dark:bg-gray-900 relative">
      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div className="order-1 md:order-none">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Our Tour Packages
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-2">
              Check Our International and Domestic tours
            </p>
          </div>
          
          <div className="relative w-full md:w-auto order-2 md:order-none">
            <input
              type="text"
              placeholder="Search tours..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Loading tours...
            </p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No tours match your search criteria.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <TourCard 
                key={tour.id} 
                {...tour} 
                numberofNights={tour.numberofNights}
                onEnquireClick={() => handleEnquireClick(tour)}
              />
            ))}
          </div>
        )}

        {/* Booking Modal */}
{isModalOpen && selectedTour && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Enquire About {selectedTour.title}
          </h3>
          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {formSubmitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm dark:bg-green-900 dark:border-green-700 dark:text-green-100">
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-1.5" />
              <span>Thank you! We'll contact you shortly.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded text-sm dark:bg-blue-900/30">
                  <div className="bg-blue-100 p-1.5 rounded-full dark:bg-blue-800">
                    <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-gray-800 truncate dark:text-white">
                      {userData?.name || user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate dark:text-gray-300">
                      {userData?.email || user.email}
                    </p>
                    <p className="text-xs text-gray-600 truncate dark:text-gray-300">
                      {userData?.phone || user.email}
                    </p>
                  </div>
                </div>
                
                {!userData?.phone && (
                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
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
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="text-sm pl-7 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="text-sm pl-7 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
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
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="numberofAdults" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Adults
                </label>
                <input
                  type="number"
                  id="numberofAdults"
                  name="numberofAdults"
                  min="1"
                  value={formData.numberofAdults}
                  onChange={handleNumberChange}
                  className="text-sm block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 border px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="numberofChildren" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Children
                </label>
                <input
                  type="number"
                  id="numberofChildren"
                  name="numberofChildren"
                  min="0"
                  value={formData.numberofChildren}
                  onChange={handleNumberChange}
                  className="text-sm block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 border px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="numberofInfants" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Infants
                </label>
                <input
                  type="number"
                  id="numberofInfants"
                  name="numberofInfants"
                  min="0"
                  value={formData.numberofInfants}
                  onChange={handleNumberChange}
                  className="text-sm block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 border px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Total: {formData.numberofTravellers}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="preferredDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Preferred Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  className="text-sm pl-7 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="customRequirement" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Special Requirements
              </label>
              <textarea
                id="customRequirement"
                name="customRequirement"
                rows={2}
                value={formData.customRequirement}
                onChange={handleInputChange}
                className="text-sm block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 px-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Any special requests"
              />
            </div>
            
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-1.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800`}
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
              <p className="text-xs text-gray-500 text-center dark:text-gray-400">
                Have an account?{' '}
                <Link href="/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
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
    </div>
  );
}