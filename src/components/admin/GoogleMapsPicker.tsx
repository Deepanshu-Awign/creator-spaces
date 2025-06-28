import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2, Search } from 'lucide-react';
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

  const handleSearchInput = (value: string) => {
    setSearchValue(value);
    setShowDropdown(false);
    setSearchResults([]);

    if (value.length < 3) return;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const performSearch = async (query: string) => {
    if (!window.google || !window.google.maps) {
      toast.error('Google Maps not loaded');
      return;
    }

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

  const selectPlace = async (placeId: string, description: string) => {
    if (!window.google || !window.google.maps) {
      toast.error('Google Maps not loaded');
      return;
    }

    console.log('Selecting place:', { placeId, description });

    try {
      // Create a dummy div for PlacesService (required by Google Maps API)
      const serviceDiv = document.createElement('div');
      const service = new window.google.maps.places.PlacesService(serviceDiv);
      
      service.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'geometry', 'name', 'place_id']
        },
        (place: any, status: any) => {
          console.log('Place details response:', { place, status });
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            console.log('Place details successful:', place);
            
            if (place.geometry && place.geometry.location) {
              const newLat = place.geometry.location.lat();
              const newLng = place.geometry.location.lng();
              const newAddress = place.formatted_address || place.name || description;

              console.log('Location extracted:', { newLat, newLng, newAddress });
              setAddress(newAddress);
              setSearchValue(newAddress);
              updateLocation(newLat, newLng, newAddress, mapInstanceRef.current);
              setShowDropdown(false);
              setSearchResults([]);
              toast.success('Location selected successfully!');
            } else {
              console.error('No geometry found in place:', place);
              toast.error('Could not get location coordinates. Please try clicking on the map instead.');
            }
          } else {
            console.error('PlacesService error:', status);
            // Fallback to geocoding
            fallbackGeocode(description);
          }
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback to geocoding
      fallbackGeocode(description);
    }
  };

  const fallbackGeocode = (address: string) => {
    console.log('Using fallback geocoding for:', address);
    
    if (!window.google || !window.google.maps) {
      toast.error('Google Maps not loaded');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results: any, status: any) => {
      console.log('Geocoding response:', { results, status });
      
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newLat = location.lat();
        const newLng = location.lng();
        const newAddress = results[0].formatted_address;

        console.log('Fallback geocoding successful:', { newLat, newLng, newAddress });
        setAddress(newAddress);
        setSearchValue(newAddress);
        updateLocation(newLat, newLng, newAddress, mapInstanceRef.current);
        setShowDropdown(false);
        setSearchResults([]);
        toast.success('Location found via geocoding!');
      } else {
        console.error('Geocoding failed:', status);
        toast.error('Could not find location. Please try clicking on the map instead.');
      }
    });
  };

  const handleManualSearch = () => {
    if (!searchValue.trim()) {
      toast.error('Please enter an address to search');
      return;
    }

    if (!window.google || !window.google.maps) {
      toast.error('Google Maps not loaded');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchValue }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newLat = location.lat();
        const newLng = location.lng();
        const newAddress = results[0].formatted_address;

        console.log('Manual search result:', { newLat, newLng, newAddress });
        setAddress(newAddress);
        setSearchValue(newAddress);
        updateLocation(newLat, newLng, newAddress, mapInstanceRef.current);
        setShowDropdown(false);
        setSearchResults([]);
        toast.success('Location found!');
      } else {
        toast.error('Could not find the address. Please try a different search term or click on the map.');
      }
    });
  };

  const addMarker = (lat: number, lng: number, map: any) => {
    console.log('addMarker called with:', { lat, lng, mapExists: !!map });
    
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
    console.log('Marker created and added to map');

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
    console.log('updateLocation called with:', { newLat, newLng, newAddress, mapExists: !!map });
    
    setLat(newLat.toString());
    setLng(newLng.toString());
    if (newAddress) {
      setAddress(newAddress);
    }

    // Update map center and zoom
    if (map) {
      map.setCenter({ lat: newLat, lng: newLng });
      map.setZoom(15);

      // Add/update marker
      addMarker(newLat, newLng, map);
    } else {
      console.error('Map instance not available for updateLocation');
    }
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const newAddress = results[0].formatted_address;
        setAddress(newAddress);
        setSearchValue(newAddress);
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
    setSearchValue('');
    setShowDropdown(false);
    setSearchResults([]);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      ref={searchInputRef}
                      id="address-search"
                      value={searchValue}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="Search for an address..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualSearch();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleManualSearch}
                      disabled={!searchValue.trim()}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Custom Dropdown */}
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
                            onClick={() => selectPlace(result.place_id, result.description)}
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
                        <div className="p-3 text-center text-gray-500">
                          No results found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Type to search, press Enter, or click directly on the map to select a location
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
