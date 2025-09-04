import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Shield, 
  Heart, 
  Users, 
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  ExternalLink
} from 'lucide-react'

const SupportMap = ({ isOpen, onClose }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [supportServices, setSupportServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [locationPermission, setLocationPermission] = useState('prompt')

  // Load Leaflet dynamically
  useEffect(() => {
    if (!isOpen) return

    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        initializeMap()
      } catch (err) {
        setError('Failed to load map. Please try again.')
      }
    }

    loadLeaflet()
  }, [isOpen])

  const initializeMap = () => {
    if (!mapRef.current || map) return

    setLoading(true)
    setError(null)

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          createMap(latitude, longitude)
          loadSupportServices(latitude, longitude)
          setLocationPermission('granted')
        },
        (error) => {
          console.error('Location error:', error)
          setLocationPermission('denied')
          // Fallback to a default location (New York City)
          const defaultLat = 40.7128
          const defaultLng = -74.0060
          setUserLocation({ lat: defaultLat, lng: defaultLng })
          createMap(defaultLat, defaultLng)
          loadSupportServices(defaultLat, defaultLng)
          setError('Location access denied. Showing default area. Enable location for better results.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
    }
  }

  const createMap = (lat, lng) => {
    if (!mapRef.current || !window.L) return

    try {
      const mapInstance = window.L.map(mapRef.current).setView([lat, lng], 13)

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance)

      // Add user location marker
      const userIcon = window.L.divIcon({
        html: `<div style="background: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        className: 'user-location-marker'
      })

      window.L.marker([lat, lng], { icon: userIcon })
        .addTo(mapInstance)
        .bindPopup('📍 You are here')

      setMap(mapInstance)
      setLoading(false)
    } catch (err) {
      setError('Failed to create map. Please try again.')
      setLoading(false)
    }
  }

  const loadSupportServices = async (lat, lng) => {
    try {
      setLoading(true)
      
      // Multiple queries for different types of support services
      const queries = [
        {
          type: 'hospitals',
          icon: '🏥',
          color: '#EF4444',
          query: `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](${lat - 0.02},${lng - 0.02},${lat + 0.02},${lng + 0.02});
              node["amenity"="clinic"](${lat - 0.02},${lng - 0.02},${lat + 0.02},${lng + 0.02});
            );
            out;
          `
        },
        {
          type: 'pharmacies',
          icon: '💊',
          color: '#10B981',
          query: `
            [out:json][timeout:25];
            node["amenity"="pharmacy"](${lat - 0.02},${lng - 0.02},${lat + 0.02},${lng + 0.02});
            out;
          `
        },
        {
          type: 'support_groups',
          icon: '👥',
          color: '#8B5CF6',
          query: `
            [out:json][timeout:25];
            (
              node["amenity"="social_facility"](${lat - 0.02},${lng - 0.02},${lat + 0.02},${lng + 0.02});
              node["healthcare"="counselling"](${lat - 0.02},${lng - 0.02},${lat + 0.02},${lng + 0.02});
            );
            out;
          `
        }
      ]

      const allServices = []

      for (const queryData of queries) {
        try {
          const response = await fetch(
            'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(queryData.query)
          )
          const data = await response.json()
          
          if (data.elements) {
            data.elements.forEach(place => {
              if (place.lat && place.lon && place.tags) {
                allServices.push({
                  id: place.id,
                  name: place.tags.name || place.tags['addr:housename'] || `${queryData.type.replace('_', ' ')} facility`,
                  type: queryData.type,
                  icon: queryData.icon,
                  color: queryData.color,
                  lat: place.lat,
                  lng: place.lon,
                  address: getAddress(place.tags),
                  phone: place.tags.phone || place.tags['contact:phone'],
                  website: place.tags.website || place.tags['contact:website'],
                  opening_hours: place.tags.opening_hours,
                  description: getDescription(place.tags, queryData.type)
                })
              }
            })
          }
        } catch (err) {
          console.error(`Failed to load ${queryData.type}:`, err)
        }
      }

      setSupportServices(allServices)
      addMarkersToMap(allServices)
      setLoading(false)
    } catch (err) {
      setError('Failed to load support services. Please try again.')
      setLoading(false)
    }
  }

  const getAddress = (tags) => {
    const parts = []
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
    if (tags['addr:street']) parts.push(tags['addr:street'])
    if (tags['addr:city']) parts.push(tags['addr:city'])
    return parts.join(' ') || 'Address not available'
  }

  const getDescription = (tags, type) => {
    switch (type) {
      case 'hospitals':
        return 'Emergency medical care and health services'
      case 'pharmacies':
        return 'Prescription medications and health supplies'
      case 'support_groups':
        return 'Counseling and support services'
      default:
        return 'Support service facility'
    }
  }

  const addMarkersToMap = (services) => {
    if (!map || !window.L) return

    services.forEach(service => {
      const markerIcon = window.L.divIcon({
        html: `
          <div style="
            background: ${service.color}; 
            width: 30px; 
            height: 30px; 
            border-radius: 50%; 
            border: 2px solid white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: 16px;
          ">
            ${service.icon}
          </div>
        `,
        iconSize: [30, 30],
        className: 'support-service-marker'
      })

      const marker = window.L.marker([service.lat, service.lng], { icon: markerIcon })
        .addTo(map)
        .on('click', () => setSelectedService(service))

      const popupContent = `
        <div style="min-width: 200px;">
          <strong>${service.name}</strong><br/>
          <small style="color: #666;">${service.description}</small><br/>
          ${service.address ? `📍 ${service.address}<br/>` : ''}
          ${service.phone ? `📞 ${service.phone}<br/>` : ''}
          <button onclick="window.openServiceDetails('${service.id}')" style="
            background: ${service.color}; 
            color: white; 
            border: none; 
            padding: 5px 10px; 
            border-radius: 5px; 
            margin-top: 5px;
            cursor: pointer;
          ">
            View Details
          </button>
        </div>
      `
      marker.bindPopup(popupContent)
    })

    // Global function for popup buttons
    window.openServiceDetails = (serviceId) => {
      const service = services.find(s => s.id.toString() === serviceId)
      if (service) setSelectedService(service)
    }
  }

  const sendSOSAlert = () => {
    if (!userLocation) {
      alert('Location not available. Please enable location services.')
      return
    }

    const message = `🚨 EMERGENCY ALERT 🚨\n\nI need immediate help with my recovery.\n\nMy location: https://www.openstreetmap.org/?mlat=${userLocation.lat}&mlon=${userLocation.lng}&zoom=16\n\nPlease check on me or send help.\n\n- Sent from MindBalance Recovery App`
    
    // Create SMS link
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    
    // Create email link
    const emailUrl = `mailto:?subject=EMERGENCY%20ALERT%20-%20Recovery%20Support%20Needed&body=${encodeURIComponent(message)}`

    // Show options dialog
    const choice = confirm(
      `🚨 SOS Alert Ready!\n\nChoose OK to send SMS, or Cancel to send Email.\n\nYour location will be shared: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
    )

    if (choice) {
      window.open(smsUrl, '_blank')
    } else {
      window.open(emailUrl, '_blank')
    }

    // Log to console for development
    console.log('SOS Alert:', { userLocation, message })
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getDirections = (service) => {
    if (!userLocation) return
    
    const url = `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${service.lat},${service.lng}&route=foot`
    window.open(url, '_blank')
  }

  const ServiceTypeFilter = ({ services }) => {
    const types = [...new Set(services.map(s => s.type))]
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map(type => {
          const service = services.find(s => s.type === type)
          const count = services.filter(s => s.type === type).length
          return (
            <div
              key={type}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
            >
              <span>{service?.icon}</span>
              <span className="text-white text-sm capitalize">
                {type.replace('_', ' ')} ({count})
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-800/50 p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-blue-400" />
                <span>Nearby Support Services</span>
              </h2>
              <p className="text-white/60 mt-1">Find immediate help and support in your area</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Emergency SOS Button */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={sendSOSAlert}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 animate-pulse"
            >
              <Shield className="w-5 h-5" />
              <span>🚨 Emergency SOS</span>
            </button>

            {locationPermission === 'denied' && (
              <div className="text-orange-400 text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Enable location for better results</span>
              </div>
            )}
          </div>

          {/* Service type filters */}
          {supportServices.length > 0 && (
            <ServiceTypeFilter services={supportServices} />
          )}
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Map Container */}
          <div className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-white">Loading map and services...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 z-10">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div 
              ref={mapRef} 
              className="w-full h-full bg-gray-800"
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Service Details Sidebar */}
          {selectedService && (
            <div className="w-80 bg-gray-800/50 border-l border-white/10 p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: selectedService.color }}
                  >
                    {selectedService.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{selectedService.name}</h3>
                    <p className="text-white/60 text-sm capitalize">{selectedService.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-white/80">{selectedService.description}</p>

                {selectedService.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Address</p>
                      <p className="text-white/70">{selectedService.address}</p>
                    </div>
                  </div>
                )}

                {selectedService.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Phone</p>
                      <a 
                        href={`tel:${selectedService.phone}`}
                        className="text-green-400 hover:text-green-300"
                      >
                        {selectedService.phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedService.opening_hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Hours</p>
                      <p className="text-white/70">{selectedService.opening_hours}</p>
                    </div>
                  </div>
                )}

                {userLocation && (
                  <div className="flex items-start space-x-3">
                    <Navigation className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Distance</p>
                      <p className="text-white/70">
                        {calculateDistance(
                          userLocation.lat, 
                          userLocation.lng, 
                          selectedService.lat, 
                          selectedService.lng
                        ).toFixed(1)} km away
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2 pt-4">
                  <button
                    onClick={() => getDirections(selectedService)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions</span>
                  </button>

                  {selectedService.phone && (
                    <a
                      href={`tel:${selectedService.phone}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Now</span>
                    </a>
                  )}

                  {selectedService.website && (
                    <a
                      href={selectedService.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SupportMap
