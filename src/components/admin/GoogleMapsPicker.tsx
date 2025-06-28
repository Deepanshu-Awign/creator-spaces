import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleMapsPickerProps {
  onLocationSelect: (location: {
    address: string;
    lat: string;
    lng: string;
  }) => void;
  initialAddress?: string;
  initialLat?: string;
  initialLng?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  onLocationSelect,
  initialAddress = '',
  initialLat = '',
  initialLng = ''
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Get API key from environment
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setApiKey(key || '');
    
    // Test API key if available
    if (key) {
      console.log('Google Maps API key found:', key.substring(0, 10) + '...');
    } else {
      console.error('Google Maps API key not found in environment variables');
    }
  }, []);

  const loadGoogleMaps = () => {
    if (mapLoaded) {
      return;
    }

    if (!apiKey) {
      toast.error('Google Maps API key is not configured');
      return;
    }

    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Set up callback
    window.initGoogleMaps = () => {
      setIsLoading(false);
      setMapLoaded(true);
      initializeMap();
    };
    
    script.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to load Google Maps. Please check your API key.');
    };
    
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.log('Map initialization failed - missing requirements');
      return;
    }

    try {
      // Default center (India)
      const center = lat && lng 
        ? { lat: parseFloat(lat), lng: parseFloat(lng) } 
        : { lat: 20.5937, lng: 78.9629 };

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: lat && lng ? 15 : 6,
        mapTypeControl: false,
        streetViewControl: false,
      });

      mapInstanceRef.current = map;

      // Add existing marker if coordinates exist
      if (lat && lng) {
        addMarker(parseFloat(lat), parseFloat(lng), map);
      }

      // Initialize autocomplete
      if (autocompleteRef.current) {
        console.log('Initializing autocomplete...');
        try {
          const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'IN' }
          });

          autocomplete.addListener('place_changed', () => {
            console.log('Place changed event triggered');
            const place = autocomplete.getPlace();
            console.log('Selected place:', place);
            
            if (place.geometry && place.geometry.location) {
              const newLat = place.geometry.location.lat();
              const newLng = place.geometry.location.lng();
              const newAddress = place.formatted_address || place.name || '';

              console.log('Updating location:', { newLat, newLng, newAddress });
              updateLocation(newLat, newLng, newAddress, map);
            } else {
              console.log('No geometry found for selected place');
              toast.error('Could not get location for selected place. Please try clicking on the map instead.');
            }
          });
        } catch (error) {
          console.error('Error initializing autocomplete:', error);
          toast.error('Address search not available. Please use map click to select location.');
        }
      } else {
        console.log('Autocomplete ref not available');
      }

      // Handle map click
      map.addListener('click', (event: any) => {
        if (event.latLng) {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          
          updateLocation(newLat, newLng, '', map);
          reverseGeocode(newLat, newLng);
        }
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }
  };

  const addMarker = (lat: number, lng: number, map: any) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
      title: 'Studio Location'
    });

    markerRef.current = marker;

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        const markerLat = position.lat();
        const markerLng = position.lng();
        setLat(markerLat.toString());
        setLng(markerLng.toString());
        reverseGeocode(markerLat, markerLng);
      }
    });
  };

  const updateLocation = (newLat: number, newLng: number, newAddress: string, map: any) => {
    setLat(newLat.toString());
    setLng(newLng.toString());
    if (newAddress) {
      setAddress(newAddress);
    }

    // Update map center and zoom
    map.setCenter({ lat: newLat, lng: newLng });
    map.setZoom(15);

    // Add/update marker
    addMarker(newLat, newLng, map);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const newAddress = results[0].formatted_address;
        setAddress(newAddress);
        
        // Also update the autocomplete input
        if (autocompleteRef.current) {
          autocompleteRef.current.value = newAddress;
        }
      }
    });
  };

  const handleConfirm = () => {
    if (!lat || !lng) {
      toast.error('Please select a location on the map');
      return;
    }

    onLocationSelect({
      address: address || 'Selected Location',
      lat,
      lng
    });
    setIsMapOpen(false);
    toast.success('Location selected successfully');
  };

  const handleCancel = () => {
    setIsMapOpen(false);
    // Reset to initial values
    setAddress(initialAddress);
    setLat(initialLat);
    setLng(initialLng);
  };

  const handleOpenMap = () => {
    console.log('Opening map, API key:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) {
      toast.error('Google Maps API key is not configured');
      return;
    }
    setIsMapOpen(true);
    if (!mapLoaded) {
      console.log('Loading Google Maps...');
      loadGoogleMaps();
    } else if (mapInstanceRef.current) {
      console.log('Map already loaded, reinitializing...');
      // Map already loaded, just reinitialize
      setTimeout(initializeMap, 100);
    }
  };

  useEffect(() => {
    if (isMapOpen && mapLoaded && mapRef.current) {
      setTimeout(initializeMap, 100);
    }
  }, [isMapOpen, mapLoaded]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpenMap}
        className="gap-2"
        disabled={!apiKey}
      >
        <MapPin className="w-4 h-4" />
        Pick on Map
      </Button>

      {isMapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Studio Location</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address-search">Search Address</Label>
                <Input
                  ref={autocompleteRef}
                  id="address-search"
                  placeholder="Search for an address..."
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Type to search or click directly on the map to select a location
                </p>
              </div>

              <div className="flex-1 relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                      <p className="mt-2 text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <div ref={mapRef} className="w-full h-full rounded border" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label>Address</Label>
                  <p className="text-gray-600 truncate">{address || 'No address selected'}</p>
                </div>
                <div>
                  <Label>Latitude</Label>
                  <p className="text-gray-600">{lat || 'Not set'}</p>
                </div>
                <div>
                  <Label>Longitude</Label>
                  <p className="text-gray-600">{lng || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!lat || !lng}>
                Confirm Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleMapsPicker;
