"use client";

import { collection, getDocs, query, where, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, auth } from "@/app/lib/firebase";
import TourCard from "@/components/Domestic/TourCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged, User } from "firebase/auth";
import MobileNumberInput from "@/components/PhoneInput";
import {
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface CategoryDetails {
  categoryID: string;
  name: string;
  slug: string;
  description?: string;
}

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
  categoryDetails: CategoryDetails;
  isFeatured?: boolean;
  numberofDays: number;
  numberofNights: number;
  price: number;
  priceShow:boolean;
  startDate: string;
  status: string;
  location: string;
  tourType: string;
  flightIncluded: boolean;
  createdAt: string;
  updatedAt: string;
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

export default function CategoryToursPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    const fetchCategoryTours = async () => {
      try {
        setLoading(true);
        
        const categoriesQuery = query(
          collection(db, "categories"),
          where("slug", "==", categorySlug)
        );
        
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        if (categoriesSnapshot.empty) {
          throw new Error("Category not found");
        }
        
        const categoryDoc = categoriesSnapshot.docs[0];
        setCategoryData({
          categoryID: categoryDoc.id,
          ...categoryDoc.data()
        } as CategoryDetails);

        const toursQuery = query(
          collection(db, "tours"),
          where("categoryDetails.slug", "==", categorySlug)
        );
        
        const toursSnapshot = await getDocs(toursQuery);
        const toursData = toursSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate().toISOString(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString()
        })) as Tour[];
        
        setTours(toursData);
        setFilteredTours(toursData);
        setError(null);
      } catch (err) {
        console.error("Error fetching category tours:", err);
        setError("Failed to load tours. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryTours();
  }, [categorySlug]);

  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("uid", "==", currentUser.uid)
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
          console.error("Error fetching user data:", error);
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
    if (searchQuery.trim() === "") {
      setFilteredTours(tours);
    } else {
      const filtered = tours.filter(tour => 
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.tourType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTours(filtered);
    }
  }, [searchQuery, tours]);

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
        categoryDetails: selectedTour.categoryDetails,
        itenaries: selectedTour.itenaries || {} 
      } : null;

      if (!tourDetails) {
        throw new Error("No tour selected");
      }

      await setDoc(doc(db, "bookings", bookingId), {
        bookingId,
        bookingType: "Tour",
        status: "captured",
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
      console.error("Booking submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/tours" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to all tours
            </Link>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {categoryData?.name || "Loading..."} Tours
              </h1>
              {categoryData?.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {categoryData.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="relative w-64 mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {searchQuery && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} matching "{searchQuery}"
          </p>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading tours...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTours.map((tour) => (
                  <TourCard 
                    key={tour.id}
                    id={tour.id}
                    title={tour.title}
                    slug={tour.slug}
                    description={tour.description}
                    imageURL={tour.imageURL}
                    categoryDetails={{
                      name: tour.categoryDetails.name,
                      slug: tour.categoryDetails.slug
                    }}
                    isFeatured={tour.isFeatured}
                    numberofDays={tour.numberofDays}
                    numberofNights={tour.numberofNights}
                    price={tour.price}
                    startDate={tour.startDate}
                    status={tour.status}
                    location={tour.location}
                    tourType={tour.tourType}
                    priceShow={tour.priceShow}
                    onEnquireClick={() => handleEnquireClick(tour)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? "No tours match your search criteria."
                    : "No tours available in this category."}
                </p>
              </div>
            )}
          </>
        )}

        {/* Booking Modal */}
        {isModalOpen && selectedTour && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Enquire About {selectedTour.title}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {formSubmitted ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900 dark:border-green-700 dark:text-green-100">
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 mr-2" />
                      <span>Thank you! We'll contact you shortly.</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {user ? (
                      <>
                        <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded dark:bg-blue-900/30">
                          <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-800">
                            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-gray-800 text-sm truncate dark:text-white">
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
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
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
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
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
                              className="pl-8 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Your name"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
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
                              className="pl-8 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Your email"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="numberofAdults" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                          Adults
                        </label>
                        <input
                          type="number"
                          id="numberofAdults"
                          name="numberofAdults"
                          min="1"
                          value={formData.numberofAdults}
                          onChange={handleNumberChange}
                          className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="numberofChildren" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                          Children
                        </label>
                        <input
                          type="number"
                          id="numberofChildren"
                          name="numberofChildren"
                          min="0"
                          value={formData.numberofChildren}
                          onChange={handleNumberChange}
                          className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="numberofInfants" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                          Infants
                        </label>
                        <input
                          type="number"
                          id="numberofInfants"
                          name="numberofInfants"
                          min="0"
                          value={formData.numberofInfants}
                          onChange={handleNumberChange}
                          className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="flex items-end">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Travellers: {formData.numberofTravellers}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                        Preferred Travel Date
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
                          className="pl-8 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="customRequirement" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                        Special Requirements
                      </label>
                      <textarea
                        id="customRequirement"
                        name="customRequirement"
                        rows={3}
                        value={formData.customRequirement}
                        onChange={handleInputChange}
                        className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Any special requests or requirements"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
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
      </div>
    </div>
  );
}