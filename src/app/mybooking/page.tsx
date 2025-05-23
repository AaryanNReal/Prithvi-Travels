// app/bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '@/app/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Booking {
  bookingId: string;
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
    startDate: { toDate: () => Date };
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
    category?: string;
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
    category?: string;
    categoryDetails?: {
      categoryID: string;
      description: string;
      name: string;
      slug: string;
    };
  };
}

export default function BookingsPage() {
  const [user, userLoading] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tours' | 'cruises'>('all');
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
    if (activeTab === 'tours') return booking.tourDetails;
    if (activeTab === 'cruises') return booking.cruiseDetails;
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

    const details = selectedBooking.tourDetails || selectedBooking.cruiseDetails;
    const isTour = !!selectedBooking.tourDetails;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">
                {details?.title} - Booking Details
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

              {/* Tour/Cruise Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{isTour ? 'Tour' : 'Cruise'} Details</h3>
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p>{details?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p>{details?.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p>{formatDate(details?.startDate?.toDate())}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p>{isTour ? `₹${details?.price?.toLocaleString()}` : `₹${Number(details?.price).toLocaleString()}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p>{details?.numberofDays} days / {details?.numberofNights} nights</p>
                </div>
                {details?.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{details.description}</p>
                  </div>
                )}
                {isTour && selectedBooking.tourDetails?.flightIncluded !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Flight Included</p>
                    <p>{selectedBooking.tourDetails.flightIncluded ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Details</h3>
                {details?.imageURL && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Image</p>
                    <img 
                      src={details.imageURL} 
                      alt={details.title} 
                      className="w-full h-auto rounded-md max-h-40 object-cover"
                    />
                  </div>
                )}
                {!isTour && selectedBooking.cruiseDetails?.videoURL && (
                  <div>
                    <p className="text-sm text-gray-500">Video URL</p>
                    <a href={selectedBooking.cruiseDetails.videoURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View Video
                    </a>
                  </div>
                )}
                {details?.category && (
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{details.category}</p>
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
          Tours ({bookings.filter(b => b.tourDetails).length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'cruises' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cruises')}
        >
          Cruises ({bookings.filter(b => b.cruiseDetails).length})
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
                <th className='py-3 px-4 text-left'>Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.bookingId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{booking.bookingId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.tourDetails 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.tourDetails ? 'Tour' : 'Cruise'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {booking.tourDetails?.title || booking.cruiseDetails?.title}
                  </td>
                  <td className="py-3 px-4">
                    {booking.tourDetails?.location || booking.cruiseDetails?.location}
                  </td>
                  <td className="py-3 px-4">
                    {booking.tourDetails
                      ? `₹${booking.tourDetails.price.toLocaleString()}`
                      : `₹${Number(booking.cruiseDetails?.price).toLocaleString()}`}
                  </td>
                   <td className="py-3 px-4">
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