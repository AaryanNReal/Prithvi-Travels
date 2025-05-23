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
            // Normalize the location name (trim, lowercase, etc.)
            const normalized = rawLocation.trim().toLowerCase()
            
            // If this normalized name exists already, increment count
            if (locationMap[normalized]) {
              locationMap[normalized].count++
              // Keep the most properly capitalized version as display name
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

        // Sort alphabetically by display name
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
      // Find the display name for the selected normalized name
      const selectedGroup = locationGroups.find(group => group.normalizedName === selectedLocation)
      if (selectedGroup) {
        router.push(`/create-custom-itinerary/${encodeURIComponent(selectedGroup.displayName)}`)
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 relative max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">
          &times;
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Create Custom Itinerary</h2>
          
          <div className="mb-4">
            <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select a Location
            </label>
            <select
              id="location-select"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">-- Select Location --</option>
              {locationGroups.map((group, index) => (
                <option key={index} value={group.normalizedName}>
                  {group.displayName} ({group.count} {group.count === 1 ? 'experience' : 'experiences'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateItinerary}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!selectedLocation || loading}
          >
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}