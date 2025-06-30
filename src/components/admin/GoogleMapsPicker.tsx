
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: string;
  lng: string;
}

interface GoogleMapsPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: Partial<LocationData>;
}

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  onLocationSelect,
  initialLocation = {}
}) => {
  const [locationData, setLocationData] = useState<LocationData>({
    address: initialLocation.address || '',
    city: initialLocation.city || '',
    state: initialLocation.state || '',
    country: initialLocation.country || 'India',
    pincode: initialLocation.pincode || '',
    lat: initialLocation.lat || '',
    lng: initialLocation.lng || ''
  });
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setApiKey(key || '');
    
    if (key) {
      console.log('Google Maps API key found');
    } else {
      console.error('Google Maps API key not found in environment variables');
    }
  }, []);

  const extractLocationData = (place: any): LocationData => {
    const components = place.address_components || [];
    let city = '';
    let state = '';
    let country = 'India';
    let pincode = '';

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });

    return {
      address: place.formatted_address || place.name || '',
      city,
      state,
      country,
      pincode,
      lat: place.geometry?.location?.lat()?.toString() || '',
      lng: place.geometry?.location?.lng()?.toString() || ''
    };
  };

  const loadGoogleMaps = () => {
    if (mapLoaded) return;

    if (!apiKey) {
      toast.error('Google Maps API key is not configured');
      return;
    }

    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
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
    if (!mapRef.current || !window.google?.maps) return;

    try {
      const center = locationData.lat && locationData.lng 
        ? { lat: parseFloat(locationData.lat), lng: parseFloat(locationData.lng) } 
        : { lat: 20.5937, lng: 78.9629 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: locationData.lat && locationData.lng ? 15 : 6,
        mapTypeControl: false,
        streetViewControl: false,
      });

      mapInstanceRef.current = map;

      if (locationData.lat && locationData.lng) {
        addMarker(parseFloat(locationData.lat), parseFloat(locationData.lng), map);
      }

      map.addListener('click', (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          reverseGeocode(lat, lng);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }
  };

  const addMarker = (lat: number, lng: number, map: any) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
      title: 'Studio Location'
    });

    markerRef.current = marker;

    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        const markerLat = position.lat();
        const markerLng = position.lng();
        reverseGeocode(markerLat, markerLng);
      }
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google?.maps) return;
    
    const geocoder = new window.google.maps.Geocoder();
    try {
      const response = await new Promise<any>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      const newLocationData = extractLocationData(response);
      setLocationData(newLocationData);
      setSearchValue(newLocationData.address);
      
      // Update map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat, lng });
        mapInstanceRef.current.setZoom(15);
        addMarker(lat, lng, mapInstanceRef.current);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error('Failed to get address details');
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchValue(value);
    setShowDropdown(false);
    setSearchResults([]);

    if (value.length < 3) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const performSearch = async (query: string) => {
    if (!window.google?.maps) return;

    setIsSearching(true);
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'IN' },
          types: ['establishment', 'geocode']
        },
        (predictions: PlaceResult[], status: any) => {
          setIsSearching(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions);
            setShowDropdown(true);
          } else {
            setSearchResults([]);
            setShowDropdown(false);
          }
        }
      );
    } catch (error) {
      setIsSearching(false);
      console.error('Search error:', error);
    }
  };

  const selectPlace = async (placeId: string) => {
    if (!window.google?.maps) return;

    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'geometry', 'name', 'address_components']
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const newLocationData = extractLocationData(place);
            setLocationData(newLocationData);
            setSearchValue(newLocationData.address);
            
            if (mapInstanceRef.current && place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              mapInstanceRef.current.setCenter({ lat, lng });
              mapInstanceRef.current.setZoom(15);
              addMarker(lat, lng, mapInstanceRef.current);
            }
            
            setShowDropdown(false);
            setSearchResults([]);
            toast.success('Location selected successfully!');
          }
        }
      );
    } catch (error) {
      console.error('Error selecting place:', error);
      toast.error('Failed to select location');
    }
  };

  const handleConfirm = () => {
    if (!locationData.lat || !locationData.lng) {
      toast.error('Please select a location on the map');
      return;
    }

    if (!locationData.city || !locationData.state) {
      toast.error('Please ensure city and state information is available');
      return;
    }

    onLocationSelect(locationData);
    setIsMapOpen(false);
    toast.success('Location confirmed successfully');
  };

  const handleCancel = () => {
    setIsMapOpen(false);
    setLocationData({
      address: initialLocation.address || '',
      city: initialLocation.city || '',
      state: initialLocation.state || '',
      country: initialLocation.country || 'India',
      pincode: initialLocation.pincode || '',
      lat: initialLocation.lat || '',
      lng: initialLocation.lng || ''
    });
    setSearchValue('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleOpenMap = () => {
    if (!apiKey) {
      toast.error('Google Maps API key is not configured');
      return;
    }
    setIsMapOpen(true);
    if (!mapLoaded) {
      loadGoogleMaps();
    } else {
      setTimeout(initializeMap, 100);
    }
  };

  useEffect(() => {
    if (isMapOpen && mapLoaded && mapRef.current) {
      setTimeout(initializeMap, 100);
    }
  }, [isMapOpen, mapLoaded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {locationData.address ? 'Change Location' : 'Pick Location'}
      </Button>

      {locationData.address && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{locationData.address}</p>
          {locationData.city && (
            <p className="text-xs text-gray-500 mt-1">
              {locationData.city}, {locationData.state} {locationData.pincode}
            </p>
          )}
        </div>
      )}

      {isMapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Studio Location</h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <Label>Search Address</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      ref={searchInputRef}
                      value={searchValue}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="Search for an address..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!searchValue.trim()}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-3 text-center text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          <span className="ml-2">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <button
                            key={result.place_id}
                            className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            onClick={() => selectPlace(result.place_id)}
                          >
                            <div className="font-medium text-sm">
                              {result.structured_formatting?.main_text || result.description}
                            </div>
                            {result.structured_formatting?.secondary_text && (
                              <div className="text-xs text-gray-500">
                                {result.structured_formatting.secondary_text}
                              </div>
                            )}
                          </button>
                        ))
                      ) : searchValue.length >= 3 ? (
                        <div className="p-3 text-center text-gray-500">No results found</div>
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Search or click directly on the map to select a location
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
                  <Label>City</Label>
                  <p className="text-gray-600">{locationData.city || 'Not set'}</p>
                </div>
                <div>
                  <Label>State</Label>
                  <p className="text-gray-600">{locationData.state || 'Not set'}</p>
                </div>
                <div>
                  <Label>Pincode</Label>
                  <p className="text-gray-600">{locationData.pincode || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!locationData.lat || !locationData.lng || !locationData.city}
              >
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
