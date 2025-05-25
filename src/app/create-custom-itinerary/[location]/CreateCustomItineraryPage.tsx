'use client'

import { useParams } from 'next/navigation'
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/app/lib/firebase'
import { useEffect, useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { EyeIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, CurrencyDollarIcon, ArrowRightIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { onAuthStateChanged, User } from 'firebase/auth'
import Link from 'next/link'
import MobileNumberInput from '@/components/PhoneInput'

// Custom Arrow Components
const SliderArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`absolute ${direction === 'left' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all`}
    aria-label={`${direction === 'left' ? 'Previous' : 'Next'} image`}
  >
    {direction === 'left' ? (
      <ChevronLeftIcon className="h-4 w-4" />
    ) : (
      <ChevronRightIcon className="h-4 w-4" />
    )}
  </button>
)

interface ItineraryItem {
  componentID: string
  title: string
  description: string
  location: string
  price: number
  images: string[]
  duration?: number // in hours
}

interface UserData {
  uid?: string
  name?:string
  email?: string | null
  displayName?: string | null
  phone?: string
  userID?: string
}

interface FormData {
  name: string
  email: string
  phone: string
  userID?: string
}

export default function CreateCustomItineraryPage() {
  const params = useParams()
  const location = decodeURIComponent(params.location as string)
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingItem, setViewingItem] = useState<ItineraryItem | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // New state for submission loading

  // Slider settings with custom arrows
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SliderArrow direction="right" onClick={() => {}} />,
    prevArrow: <SliderArrow direction="left" onClick={() => {}} />,
    adaptiveHeight: true
  }

  // Calculate days and nights based on selected items
  const days = selectedItems.length
  const nights = Math.max(0, days - 1)
  const totalCost = selectedItems.reduce((sum, item) => sum + (item.price || 0), 0)

  // Fetch itinerary items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'customComponents'),
          where('location', '==', location)
        )
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map(doc => doc.data() as ItineraryItem)
        setItineraryItems(items)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [location])

  // Auth state listener (identical to TourDetailPage)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        try {
          const usersQuery = query(
            collection(db, 'users'),
            where('uid', '==', currentUser.uid)
          )
          const querySnapshot = await getDocs(usersQuery)

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userData = userDoc.data() as UserData
            setUserData(userData)
            
            setFormData({
              name: userData.name || currentUser.displayName || '',
              email: currentUser.email || '',
              phone: userData.phone || '',
              userID: userData.userID || "",
            })
          } else {
            setFormData({
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: ''
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setFormData({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: ''
          })
        }
      } else {
        setFormData({
          name: '',
          email: '',
          phone: ''
        })
        setUserData(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Handlers
  const addToItinerary = (item: ItineraryItem) => {
    if (!selectedItems.some(i => i.componentID === item.componentID)) {
      setSelectedItems([...selectedItems, item])
    }
  }

  const removeFromItinerary = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.componentID !== id))
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = [...selectedItems]
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setSelectedItems(items)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }))
  }

  // Updated booking submission with loading state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const bookingId = `PTID${Date.now()}`
      
      const userId = user?.uid || `GUEST${Date.now()}`
      const userID = userData?.userID || userId
      const userDetails = {
        name: userData?.displayName || formData.name,
        email: userData?.email || formData.email,
        phone: userData?.phone || formData.phone,
        uid: user?.uid || null,
        userID: userID
      }

      const itineraryDetails = {
        id: bookingId,
        items: selectedItems,
        totalCost,
        days,
        nights,
        location,
        createdAt: serverTimestamp()
      }

      await setDoc(doc(db, 'bookings', bookingId), {
        bookingId,
        bookingType:"Custom Itinerary",
        status: 'captured',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userDetails,
        itineraryDetails
      })

      setFormSubmitted(true)
      setTimeout(() => setFormSubmitted(false), 3000)
    } catch (error) {
      console.error('Booking submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto mt-20 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen mt-20">
      {/* Main Content - 70% width */}
      <div className="w-full lg:w-7/12 p-4">
        <h1 className="text-3xl font-bold mb-6">Planning your trip to {location}</h1>

        {/* Available Activities */}
        <section className="mb-6 h-[50vh] overflow-y-auto border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white pb-2">Available Experiences</h2>
          <div className="space-y-4">
            {itineraryItems.map(item => (
              <div key={item.componentID} className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 relative">
                    <Slider {...sliderSettings}>
                      {item.images?.map((img, i) => (
                        <div key={i} className="aspect-video bg-gray-100">
                          <img
                            src={img}
                            alt={`${item.title} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </Slider>
                  </div>

                  <div className="md:w-3/5 p-4 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-md font-semibold text-blue-600">
                          ₹{item.price?.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-600 my-2 line-clamp-2 text-sm">{item.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setViewingItem(item)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View details
                      </button>
                      
                      {selectedItems.some(i => i.componentID === item.componentID) ? (
                        <button
                          onClick={() => removeFromItinerary(item.componentID)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => addToItinerary(item)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          Add to trip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Itinerary */}
        {selectedItems.length > 0 && (
          <section className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Your Trip Plan ({days} days, {nights} nights)</h2>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="itinerary">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {selectedItems.map((item, index) => (
                      <Draggable key={item.componentID} draggableId={item.componentID} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg border flex items-center gap-4 hover:shadow-sm cursor-grab"
                          >
                            <div className="text-gray-400 font-medium">Day {index + 1}</div>
                            {item.images?.[0] && (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{item.title}</h3>
                              <p className="text-sm text-gray-600">₹{item.price?.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setViewingItem(item)}
                                className="p-1 text-gray-500 hover:text-blue-600"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => removeFromItinerary(item.componentID)}
                                className="p-1 text-gray-500 hover:text-red-600"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </section>
        )}
      </div>

      {/* Sidebar - 30% width */}
      <div className="w-full lg:w-5/12 p-4 bg-gray-50 border-l">
        <div className="sticky top-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
              Trip Summary
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Days</p>
                <p className="text-xl font-bold">{days}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Nights</p>
                <p className="text-xl font-bold">{nights}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg col-span-2">
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold">₹{totalCost.toLocaleString()}</p>
                
              </div>
              <p className='text-red-400 '> * This Price is just an estimate </p>

            </div>

            {/* Booking Form with disabled button functionality */}
            {selectedItems.length > 0 && (
              <div>
                {formSubmitted ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
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
                            <p className="font-medium text-gray-800">{userData?.displayName || user.displayName || 'User'}</p>
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
                                disabled={isSubmitting}
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
                              disabled={isSubmitting}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              disabled={isSubmitting}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${
                          isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isSubmitting 
                          ? 'Submitting...' 
                          : user 
                            ? 'Request a Call Back' 
                            : 'Submit Inquiry'
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
            )}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{viewingItem.title}</h2>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Image Slider */}
              <div className="mb-6 rounded-xl overflow-hidden">
                <Slider {...sliderSettings}>
                  {viewingItem.images?.map((img, i) => (
                    <div key={i} className="aspect-video bg-gray-100">
                      <img
                        src={img}
                        alt={`${viewingItem.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </Slider>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <h3 className="font-bold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{viewingItem.description}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Location</h3>
                    <p className="text-gray-700">{viewingItem.location}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Price</h3>
                    <p className="text-2xl font-bold text-blue-600">₹{viewingItem.price?.toLocaleString()}</p>
                  </div>
                  {viewingItem.duration && (
                    <div>
                      <h3 className="font-bold text-lg mb-1">Duration</h3>
                      <p className="text-gray-700">~{viewingItem.duration} hours</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  addToItinerary(viewingItem)
                  setViewingItem(null)
                }}
                className={`w-full py-3 rounded-lg font-medium ${
                  selectedItems.some(i => i.componentID === viewingItem.componentID)
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={selectedItems.some(i => i.componentID === viewingItem.componentID)}
              >
                {selectedItems.some(i => i.componentID === viewingItem.componentID)
                  ? 'Already added to trip'
                  : 'Add to trip itinerary'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}