
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X } from 'lucide-react';
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
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Check if Google Maps API key is available
    const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (envApiKey && envApiKey !== 'undefined') {
      setApiKey(envApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  useEffect(() => {
    if (isMapOpen && apiKey) {
      loadGoogleMaps();
    }
  }, [isMapOpen, apiKey]);

  const loadGoogleMaps = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      toast.error('Failed to load Google Maps. Please check your API key.');
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    setIsLoading(false);

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : { lat: 20.5937, lng: 78.9629 }, // India center
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;

    // Add marker if coordinates exist
    if (lat && lng) {
      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        map: map,
        draggable: true,
      });
      markerRef.current = marker;

      // Handle marker drag
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        const newLat = position.lat();
        const newLng = position.lng();
        setLat(newLat.toString());
        setLng(newLng.toString());
        reverseGeocode(newLat, newLng);
      });
    }

    // Initialize autocomplete
    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'IN' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.geometry) {
          const newLat = place.geometry.location.lat();
          const newLng = place.geometry.location.lng();
          const newAddress = place.formatted_address || place.name;

          setLat(newLat.toString());
          setLng(newLng.toString());
          setAddress(newAddress);

          // Update map
          map.setCenter({ lat: newLat, lng: newLng });
          map.setZoom(15);

          // Update or create marker
          if (markerRef.current) {
            markerRef.current.setPosition({ lat: newLat, lng: newLng });
          } else {
            const marker = new window.google.maps.Marker({
              position: { lat: newLat, lng: newLng },
              map: map,
              draggable: true,
            });
            markerRef.current = marker;

            marker.addListener('dragend', () => {
              const position = marker.getPosition();
              const markerLat = position.lat();
              const markerLng = position.lng();
              setLat(markerLat.toString());
              setLng(markerLng.toString());
              reverseGeocode(markerLat, markerLng);
            });
          }
        }
      });
    }

    // Handle map click
    map.addListener('click', (event: any) => {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      
      setLat(newLat.toString());
      setLng(newLng.toString());

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: newLat, lng: newLng });
      } else {
        const marker = new window.google.maps.Marker({
          position: { lat: newLat, lng: newLng },
          map: map,
          draggable: true,
        });
        markerRef.current = marker;

        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          const markerLat = position.lat();
          const markerLng = position.lng();
          setLat(markerLat.toString());
          setLng(markerLng.toString());
          reverseGeocode(markerLat, markerLng);
        });
      }

      // Reverse geocode to get address
      reverseGeocode(newLat, newLng);
    });
  };

  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
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
    setAddress(initialAddress);
    setLat(initialLat);
    setLng(initialLng);
  };

  const handleOpenMap = () => {
    if (!apiKey) {
      toast.error('Please enter your Google Maps API key first');
      return;
    }
    setIsMapOpen(true);
    setIsLoading(true);
  };

  return (
    <>
      {showApiKeyInput && (
        <div className="space-y-2 mb-4 p-4 border rounded-lg bg-yellow-50">
          <Label htmlFor="google-maps-key">Google Maps API Key</Label>
          <Input
            id="google-maps-key"
            type="password"
            placeholder="Enter your Google Maps API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-600">
            Get your API key from: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" className="text-blue-600 underline">Google Cloud Console</a>
          </p>
        </div>
      )}

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
              </div>

              <div className="flex-1 relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
