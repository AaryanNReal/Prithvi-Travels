// components/CustomItineraryOverlay.tsx
'use client'

import { useRouter } from 'next/navigation'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { useEffect, useState } from 'react'

interface OverlayProps {
  isOpen: boolean
  onClose: () => void
}

interface LocationGroup {
  displayName: string
  normalizedName: string
  count: number
}

export default function CustomItineraryOverlay({ isOpen, onClose }: OverlayProps) {
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'customComponents'))
        const locationMap: Record<string, { displayName: string, count: number }> = {}
        
        querySnapshot.forEach(doc => {
          const rawLocation = doc.data().location
          if (rawLocation) {
            const normalized = rawLocation.trim().toLowerCase()
            
            if (locationMap[normalized]) {
              locationMap[normalized].count++
              if (rawLocation[0] === rawLocation[0].toUpperCase()) {
                locationMap[normalized].displayName = rawLocation
              }
            } else {
              locationMap[normalized] = {
                displayName: rawLocation,
                count: 1
              }
            }
          }
        })

        const groups = Object.entries(locationMap).map(([normalizedName, { displayName, count }]) => ({
          displayName,
          normalizedName,
          count
        }))

        groups.sort((a, b) => a.displayName.localeCompare(b.displayName))
        setLocationGroups(groups)
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) fetchLocations()
  }, [isOpen])

  const handleCreateItinerary = () => {
    if (selectedLocation) {
      const selectedGroup = locationGroups.find(group => group.normalizedName === selectedLocation)
      if (selectedGroup) {
        router.push(`/create-custom-itinerary/${encodeURIComponent(selectedGroup.displayName)}`)
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-all duration-500 ease-out"
      onClick={onClose}
    >
      <div 
        className="relative bg-white/95 backdrop-blur-2xl border border-white/20 rounded-3xl max-w-lg w-full shadow-2xl shadow-slate-900/25 transform transition-all duration-700 ease-out scale-100 hover:scale-[1.01] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/50 flex items-center justify-center transition-all duration-200 hover:rotate-90 z-10 group"
        >
          <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="relative p-8">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl opacity-20 blur-lg"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Create Your Itinerary
            </h1>
            <p className="text-slate-600 text-base leading-relaxed max-w-sm mx-auto">
              Select your destination and we'll help you discover amazing experiences
            </p>
          </div>

          {/* Location Selector */}
          <div className="mb-8">
            <label htmlFor="location-select" className="block text-sm font-semibold text-slate-800 mb-4 tracking-wide">
              DESTINATION
            </label>
            <div className="relative group">
              <select
                id="location-select"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full p-4 bg-slate-50/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-xl text-slate-800 text-base font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/90 transition-all duration-300 appearance-none cursor-pointer hover:border-slate-300 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-md"
                disabled={loading}
              >
                <option value="" className="text-slate-500">
                  {loading ? 'Loading destinations...' : 'Choose your destination'}
                </option>
                {locationGroups.map((group, index) => (
                  <option key={index} value={group.normalizedName} className="text-slate-800 py-2">
                    {group.displayName} 
                  </option>
                ))}
              </select>
              
              {/* Custom Dropdown Icon */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-slate-200/60 flex items-center justify-center group-hover:bg-slate-300/60 transition-colors duration-200">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Helper Text */}
            {selectedLocation && (
              <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200/50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  ✓ {locationGroups.find(g => g.normalizedName === selectedLocation)?.displayName} selected
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleCreateItinerary}
            disabled={!selectedLocation || loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500/20 relative overflow-hidden group"
          >
            {/* Button Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Loading destinations...
                </div>
              ) : selectedLocation ? (
                <div className="flex items-center justify-center">
                  <span>Continue to Itinerary</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              ) : (
                'Select a destination to continue'
              )}
            </div>
          </button>

          {/* Stats or Additional Info */}
          {locationGroups.length > 0 && !loading && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {locationGroups.length} destinations • {locationGroups.reduce((sum, group) => sum + group.count, 0)} total experiences
              </p>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-400/10 via-purple-500/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-purple-400/8 via-blue-500/8 to-transparent rounded-full blur-3xl"></div>
        
        {/* Border Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
      </div>
    </div>
  )
}