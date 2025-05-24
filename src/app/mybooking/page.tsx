// app/bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '@/app/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Booking {
  bookingId: string;
  bookingType: 'Tour' | 'Cruise' | 'Custom Itinerary';
  createdAt: { toDate: () => Date };
  status: string;
  message?: string;
  userDetails: {
    uid: string;
    name: string;
    email: string;
    phone: string;
    userID?: string;
  };
  tourDetails?: {
    title: string;
    location: string;
    startDate: { toDate: () => Date } | null;
    price: number;
    description: string;
    flightIncluded: boolean;
    id: string;
    imageURL: string;
    isFeatured: boolean;
    numberofDays: number;
    numberofNights: number;
    slug: string;
    status: string;
    tourType: string;
    updatedAt: { toDate: () => Date };
    categoryDetails?: {
      categoryID: string;
      description: string;
      name: string;
      slug: string;
    };
    itenaries?: Record<string, {
      description: string;
      imageURL: string[];
      title: string;
      location: string;
    }>;
    tags?: Record<string, {
      description: string;
      name: string;
      slug: string;
    }>;
  };
  cruiseDetails?: {
    title: string;
    location: string;
    startDate: { toDate: () => Date };
    price: string;
    description: string;
    id: string;
    imageURL: string;
    isFeatured: boolean;
    numberofDays: number;
    numberofNights: number;
    slug: string;
    status: string;
    cruiseType: string;
    updatedAt: { toDate: () => Date };
    videoURL?: string;
    source?: string;
    categoryDetails?: {
      categoryID: string;
      description: string;
      name: string;
      slug: string;
    };
  };
  itineraryDetails?: {
    id: string;
    days: number;
    nights: number;
    location: string;
    totalCost: number;
    items: Array<{
      componentID: string;
      title: string;
      description: string;
      location: string;
      locationType: string;
      price: number;
      images: string[];
      createdAt: { toDate: () => Date };
      updatedAt: { toDate: () => Date };
    }>;
    createdAt: { toDate: () => Date };
    updatedAt: { toDate: () => Date };
  };
}

export default function BookingsPage() {
  const [user, userLoading] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tours' | 'cruises' | 'custom'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user?.uid) return;

      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('userDetails.uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const bookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
          bookingsData.push(doc.data() as Booking);
        });

        setBookings(bookingsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
        console.error('Error fetching bookings:', err);
      }
    };

    fetchUserBookings();
  }, [user?.uid]);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'tours') return booking.bookingType === 'Tour';
    if (activeTab === 'cruises') return booking.bookingType === 'Cruise';
    if (activeTab === 'custom') return booking.bookingType === 'Custom Itinerary';
    return true;
  });

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | undefined | null) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDetailModal = () => {
    if (!selectedBooking) return null;

    const isTour = selectedBooking.bookingType === 'Tour';
    const isCruise = selectedBooking.bookingType === 'Cruise';
    const isCustom = selectedBooking.bookingType === 'Custom Itinerary';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">
                {isTour 
                  ? selectedBooking.tourDetails?.title 
                  : isCruise 
                    ? selectedBooking.cruiseDetails?.title 
                    : 'Custom Itinerary'} - Booking Details
              </h2>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Booking Information</h3>
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p>{selectedBooking.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p>{selectedBooking.bookingType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="capitalize">{selectedBooking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booked On</p>
                  <p>{formatDateTime(selectedBooking.createdAt?.toDate())}</p>
                </div>
                {selectedBooking.message && (
                  <div>
                    <p className="text-sm text-gray-500">Message</p>
                    <p>{selectedBooking.message}</p>
                  </div>
                )}
              </div>

              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">User Information</h3>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>{selectedBooking.userDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{selectedBooking.userDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{selectedBooking.userDetails.phone}</p>
                </div>
                {selectedBooking.userDetails.userID && (
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p>{selectedBooking.userDetails.userID}</p>
                  </div>
                )}
              </div>

              {/* Tour/Cruise/Custom Details */}
              {isTour && selectedBooking.tourDetails && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Tour Details</h3>
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p>{selectedBooking.tourDetails.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedBooking.tourDetails.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{formatDate(selectedBooking.tourDetails.startDate?.toDate())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p>₹{selectedBooking.tourDetails.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>{selectedBooking.tourDetails.numberofDays} days / {selectedBooking.tourDetails.numberofNights} nights</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Flight Included</p>
                    <p>{selectedBooking.tourDetails.flightIncluded ? 'Yes' : 'No'}</p>
                  </div>
                  {selectedBooking.tourDetails.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p>{selectedBooking.tourDetails.description}</p>
                    </div>
                  )}
                </div>
              )}

              {isCruise && selectedBooking.cruiseDetails && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Cruise Details</h3>
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p>{selectedBooking.cruiseDetails.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedBooking.cruiseDetails.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{formatDate(selectedBooking.cruiseDetails.startDate?.toDate())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p>₹{Number(selectedBooking.cruiseDetails.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>{selectedBooking.cruiseDetails.numberofDays} days / {selectedBooking.cruiseDetails.numberofNights} nights</p>
                  </div>
                  {selectedBooking.cruiseDetails.videoURL && (
                    <div>
                      <p className="text-sm text-gray-500">Video</p>
                      <a href={selectedBooking.cruiseDetails.videoURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Watch Video
                      </a>
                    </div>
                  )}
                </div>
              )}

              {isCustom && selectedBooking.itineraryDetails && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Custom Itinerary Details</h3>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedBooking.itineraryDetails.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>{selectedBooking.itineraryDetails.days} days / {selectedBooking.itineraryDetails.nights} nights</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p>₹{selectedBooking.itineraryDetails.totalCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Itinerary Items</p>
                    <div className="space-y-4">
                      {selectedBooking.itineraryDetails.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="mt-2 flex justify-between">
                            <span className="text-sm">Location: {item.location}</span>
                            <span className="text-sm font-medium">₹{item.price.toLocaleString()}</span>
                          </div>
                          {item.images.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto">
                              {item.images.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`Item ${index + 1}`} className="h-16 w-auto rounded" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Details</h3>
                {isTour && selectedBooking.tourDetails?.imageURL && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tour Image</p>
                    <img 
                      src={selectedBooking.tourDetails.imageURL} 
                      alt={selectedBooking.tourDetails.title} 
                      className="w-full h-auto rounded-md max-h-40 object-cover"
                    />
                  </div>
                )}
                {isCruise && selectedBooking.cruiseDetails?.imageURL && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Cruise Image</p>
                    <img 
                      src={selectedBooking.cruiseDetails.imageURL} 
                      alt={selectedBooking.cruiseDetails.title} 
                      className="w-full h-auto rounded-md max-h-40 object-cover"
                    />
                  </div>
                )}
                {isTour && selectedBooking.tourDetails?.itenaries && (
                  <div>
                    <p className="text-sm text-gray-500">Itinerary</p>
                    <div className="mt-2 space-y-3">
                      {Object.entries(selectedBooking.tourDetails.itenaries).map(([day, itinerary]) => (
                        <div key={day} className="border-l-4 border-blue-200 pl-3 py-1">
                          <p className="font-medium">{itinerary.title}</p>
                          <p className="text-sm text-gray-600">{itinerary.description}</p>
                          {itinerary.imageURL?.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto">
                              {itinerary.imageURL.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`Day ${day}`} className="h-16 w-auto rounded" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (userLoading) return <div className="text-center mt-20 py-8">Loading user...</div>;
  if (!user) return <div className="text-center mt-20 py-8">Please sign in to view bookings</div>;
  if (loading) return <div className="text-center mt-20 py-8">Loading bookings...</div>;
  if (error) return <div className="text-center mt-20 py-8 text-red-500">{error}</div>;

  return (
    <main className="container mx-auto mt-20 px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          All ({bookings.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'tours' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tours')}
        >
          Tours ({bookings.filter(b => b.bookingType === 'Tour').length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'cruises' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cruises')}
        >
          Cruises ({bookings.filter(b => b.bookingType === 'Cruise').length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'custom' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom ({bookings.filter(b => b.bookingType === 'Custom Itinerary').length})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {activeTab === 'all' ? '' : activeTab} bookings found
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Booking ID</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.bookingId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{booking.bookingId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.bookingType === 'Tour' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.bookingType === 'Cruise'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}>
                      {booking.bookingType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {booking.bookingType === 'Tour' 
                      ? booking.tourDetails?.title 
                      : booking.bookingType === 'Cruise'
                        ? booking.cruiseDetails?.title
                        : 'Custom Itinerary'}
                  </td>
                  <td className="py-3 px-4">
                    {booking.bookingType === 'Tour' 
                      ? booking.tourDetails?.location 
                      : booking.bookingType === 'Cruise'
                        ? booking.cruiseDetails?.location
                        : booking.itineraryDetails?.location}
                  </td>
                  <td className="py-3 px-4">
                    {booking.bookingType === 'Tour'
                      ? `₹${booking.tourDetails?.price.toLocaleString()}`
                      : booking.bookingType === 'Cruise'
                        ? `₹${Number(booking.cruiseDetails?.price).toLocaleString()}`
                        : `₹${booking.itineraryDetails?.totalCost.toLocaleString()}`}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    {booking.status}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renderDetailModal()}
    </main>
  );
}