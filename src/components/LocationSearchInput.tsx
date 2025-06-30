
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSearchInputProps {
  onLocationSelect: (location: string, studios: any[]) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onLocationSelect,
  placeholder = "Search for your city or area..."
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (apiKey && !window.google?.maps?.places) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMaps = () => {
        setApiLoaded(true);
      };
      
      document.head.appendChild(script);
    } else if (window.google?.maps?.places) {
      setApiLoaded(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (!apiLoaded || !window.google?.maps?.places) return;

    setIsSearching(true);
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'IN' },
          types: ['(cities)']
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

  const findNearestStudios = async (city: string, lat?: number, lng?: number) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('studios')
        .select('*')
        .eq('is_active', true);

      // If we have coordinates, we could add distance calculation here
      // For now, let's filter by city and limit to 10
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      const { data: studios, error } = await query.limit(10);

      if (error) {
        console.error('Error fetching studios:', error);
        return [];
      }

      return studios || [];
    } catch (error) {
      console.error('Error finding nearest studios:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const selectPlace = async (placeId: string, description: string) => {
    if (!window.google?.maps?.places) return;

    setIsLoading(true);
    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'geometry', 'name', 'address_components']
        },
        async (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const city = place.address_components?.find((comp: any) => 
              comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
            )?.long_name || '';

            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();

            const nearestStudios = await findNearestStudios(city, lat, lng);
            
            setSearchValue(description);
            setShowDropdown(false);
            setSearchResults([]);
            
            onLocationSelect(city, nearestStudios);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error selecting place:', error);
      setIsLoading(false);
    }
  };

  const handleDirectSearch = async () => {
    if (!searchValue.trim()) return;

    const studios = await findNearestStudios(searchValue);
    onLocationSelect(searchValue, studios);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchValue}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleDirectSearch}
          disabled={!searchValue.trim() || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </Button>
      </div>
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              <span>Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => (
              <button
                key={result.place_id}
                className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:bg-gray-100 focus:outline-none"
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
            <div className="p-3 text-center text-gray-500">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
