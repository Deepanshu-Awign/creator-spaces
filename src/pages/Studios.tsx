
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StudioCard from '@/components/StudioCard';
import MobileStudioCard from '@/components/MobileStudioCard';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Star, MapPin } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useMobileLocation } from '@/hooks/useMobileLocation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import OfflineBookingQueue from '@/components/OfflineBookingQueue';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Parking',
  'Security Camera',
  'Sound System',
  '24x7 Access',
  'Lighting Equipment',
  'Backdrop',
  'Makeup Room',
  'Waiting Area',
  'Refreshments',
  'Equipment Storage',
  'Wheelchair Accessible',
  'Bathroom Facilities',
  'Kitchen/Pantry',
  'Reception Area',
  'Conference Table',
  'Projector',
  'Whiteboard',
  'Natural Light'
];

const Studios = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const { getCurrentLocation, location } = useMobileLocation();
  const { offlineData, isOnline, cacheData } = useOfflineStorage();

  // Get city from URL params or localStorage
  useEffect(() => {
    const cityFromUrl = searchParams.get('city');
    const cityFromStorage = localStorage.getItem('selectedCity');
    const city = cityFromUrl || cityFromStorage || '';
    
    if (city) {
      setSelectedCity(city);
    }
  }, [searchParams]);

  // Enhanced fetch studios with offline support
  const { data: studios = [], isLoading } = useQuery({
    queryKey: ['studios', searchTerm, selectedCity, priceRange, selectedAmenities, minRating],
    queryFn: async () => {
      // If offline, return cached data
      if (!isOnline && offlineData.studios.length > 0) {
        console.log('Using cached studios data (offline)');
        return filterOfflineStudios(offlineData.studios);
      }

      let query = supabase
        .from('studios')
        .select(`
          *,
          profiles!studios_host_id_fkey(full_name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,amenities.cs.{${searchTerm}}`);
      }

      // Apply city filter
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      // Apply price range filter
      query = query.gte('price_per_hour', priceRange[0]).lte('price_per_hour', priceRange[1]);

      // Apply rating filter
      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching studios:', error);
        // If online fetch fails, fallback to cached data
        return filterOfflineStudios(offlineData.studios);
      }

      // Filter by amenities on the client side since PostgreSQL array filtering is complex
      let filteredData = data || [];
      if (selectedAmenities.length > 0) {
        filteredData = filteredData.filter(studio => {
          if (!studio.amenities) return false;
          return selectedAmenities.every(amenity => studio.amenities.includes(amenity));
        });
      }

      // Cache the fetched data when online
      if (isOnline && filteredData.length > 0) {
        await cacheData('studios', filteredData);
      }

      return filteredData;
    },
    // Enable cached data when offline
    enabled: isOnline || offlineData.studios.length > 0,
    staleTime: isOnline ? 5 * 60 * 1000 : Infinity, // Longer stale time when offline
  });

  const filterOfflineStudios = (cachedStudios: any[]) => {
    let filtered = cachedStudios;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(studio => 
        studio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studio.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studio.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studio.amenities?.some((amenity: string) => 
          amenity.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply city filter
    if (selectedCity) {
      filtered = filtered.filter(studio => studio.city === selectedCity);
    }

    // Apply price range filter
    filtered = filtered.filter(studio => 
      studio.price_per_hour >= priceRange[0] && 
      studio.price_per_hour <= priceRange[1]
    );

    // Apply rating filter
    if (minRating > 0) {
      filtered = filtered.filter(studio => (studio.rating || 0) >= minRating);
    }

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(studio => {
        if (!studio.amenities) return false;
        return selectedAmenities.every(amenity => studio.amenities.includes(amenity));
      });
    }

    return filtered;
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
    // Update URL with city
    window.history.pushState({}, '', `/studios?city=${encodeURIComponent(city)}`);
  };

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities(prev => [...prev, amenity]);
    } else {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 10000]);
    setSelectedAmenities([]);
    setMinRating(0);
  };

  const hasActiveFilters = searchTerm || priceRange[0] > 0 || priceRange[1] < 10000 || selectedAmenities.length > 0 || minRating > 0;

  const handleLocationSearch = async () => {
    await getCurrentLocation();
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Navigation with city selector */}
      <Navigation selectedCity={selectedCity} onCityChange={handleCityChange} />
      
      {/* Offline Booking Queue */}
      <div className="pt-16">
        <OfflineBookingQueue />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Studio {selectedCity && `in ${selectedCity}`}
          </h1>
          <p className="text-lg text-gray-600">
            Discover and book amazing studios for your next project
          </p>
        </div>

        {/* Mobile Location Button */}
        {isMobile && (
          <div className="mb-4">
            <Button
              onClick={handleLocationSearch}
              variant="outline"
              className="w-full mb-4 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find studios near me
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          {/* Main Search with City Integration */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search studios, locations, or amenities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[searchTerm, priceRange[0] > 0 || priceRange[1] < 10000, selectedAmenities.length > 0, minRating > 0].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="border-t pt-6 space-y-6">
              {/* Price Range Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Price Range (₹/hour): ₹{priceRange[0]} - ₹{priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Minimum Rating
                </Label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={minRating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMinRating(rating)}
                      className="gap-1"
                    >
                      {rating === 0 ? 'Any' : (
                        <>
                          {rating}
                          <Star className="w-3 h-3 fill-current" />
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amenities Filter */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <Label className="text-sm font-medium text-gray-700 cursor-pointer">
                      Amenities {selectedAmenities.length > 0 && `(${selectedAmenities.length} selected)`}
                    </Label>
                    <Filter className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {AVAILABLE_AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => handleAmenityToggle(amenity, checked as boolean)}
                        />
                        <Label
                          htmlFor={`amenity-${amenity}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {searchTerm}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setSearchTerm('')}
                        />
                      </Badge>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                      <Badge variant="secondary" className="gap-1">
                        Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setPriceRange([0, 10000])}
                        />
                      </Badge>
                    )}
                    {selectedAmenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="gap-1">
                        {amenity}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleAmenityToggle(amenity, false)}
                        />
                      </Badge>
                    ))}
                    {minRating > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        {minRating}+ stars
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setMinRating(0)}
                        />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results with offline indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              {isLoading ? 'Loading...' : `${studios.length} Studios Found`}
              {!isOnline && (
                <span className="ml-2 text-sm text-orange-600 font-normal">
                  (Cached Results)
                </span>
              )}
            </h2>
            {selectedCity && (
              <p className="text-gray-600 text-sm md:text-base">
                Showing results for {selectedCity}
              </p>
            )}
          </div>
        </div>

        {/* Studios Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse border border-neutral-200">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : studios.length > 0 ? (
          <div className={isMobile ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6"}>
            {studios.map((studio) => (
              isMobile ? (
                <MobileStudioCard key={studio.id} studio={studio} />
              ) : (
                <StudioCard key={studio.id} studio={studio} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Studios Found
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedCity 
                ? `No studios available in ${selectedCity} matching your criteria`
                : 'Try adjusting your search criteria or filters'
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studios;
