
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StudioCard from '@/components/StudioCard';
import MobileStudioCard from '@/components/MobileStudioCard';
import Navigation from '@/components/Navigation';
import ImprovedFilterBar from '@/components/ImprovedFilterBar';
import { Search, MapPin } from 'lucide-react';
import type { Studio } from "@/types/studio";
import { Button } from '@/components/ui/button';
import { useMobileLocation } from '@/hooks/useMobileLocation';
import OfflineBookingQueue from '@/components/OfflineBookingQueue';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { getCurrentLocation, location } = useMobileLocation();
  const { offlineData, isOnline, cacheData } = useOfflineStorage();
  const isMobile = useIsMobile();
  
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCity: '',
    selectedCategory: '',
    priceRange: [0, 10000],
    selectedAmenities: [],
    minRating: 0,
  });

  // Get initial filters from URL params
  useEffect(() => {
    const cityFromUrl = searchParams.get('city');
    const categoryFromUrl = searchParams.get('category');
    const cityFromStorage = localStorage.getItem('selectedCity');
    
    setFilters(prev => ({
      ...prev,
      selectedCity: cityFromUrl || cityFromStorage || '',
      selectedCategory: categoryFromUrl || '',
    }));
  }, [searchParams]);

  // Enhanced fetch studios with offline support
  const { data: studios = [], isLoading } = useQuery({
    queryKey: ['studios', filters.searchTerm, filters.selectedCity, filters.selectedCategory, filters.priceRange, filters.selectedAmenities, filters.minRating],
    queryFn: async () => {
      // If offline, return cached data
      if (!isOnline && offlineData.studios.length > 0) {
        console.log('Using cached studios data (offline)');
        return filterOfflineStudios(offlineData.studios);
      }

      // Use type assertion to bypass TypeScript inference issues
      let query: any = supabase
        .from('studios')
        .select(`
          *,
          profiles!studios_host_id_fkey(full_name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply comprehensive search filters
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        query = query.or(`
          title.ilike.%${filters.searchTerm}%,
          description.ilike.%${filters.searchTerm}%,
          location.ilike.%${filters.searchTerm}%,
          city.ilike.%${filters.searchTerm}%,
          state.ilike.%${filters.searchTerm}%,
          category.ilike.%${filters.searchTerm}%,
          tags.cs.{${filters.searchTerm}},
          amenities.cs.{${filters.searchTerm}},
          profiles!studios_host_id_fkey.full_name.ilike.%${filters.searchTerm}%
        `);
      }
      
      if (filters.selectedCity) {
        query = query.eq('city', filters.selectedCity);
      }
      
      if (filters.selectedCategory) {
        query = query.eq('category', filters.selectedCategory);
      }
      
      query = query
        .gte('price_per_hour', filters.priceRange[0])
        .lte('price_per_hour', filters.priceRange[1]);
        
      if (filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching studios:', error);
        // If online fetch fails, fallback to cached data
        return filterOfflineStudios(offlineData.studios);
      }

      // Filter by amenities on the client side since PostgreSQL array filtering is complex
      let filteredData = (data || []) as Studio[];
      if (filters.selectedAmenities.length > 0) {
        filteredData = filteredData.filter(studio => {
          if (!studio.amenities) return false;
          return filters.selectedAmenities.every(amenity => studio.amenities.includes(amenity));
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

    // Apply comprehensive search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(studio => 
        studio.title?.toLowerCase().includes(searchTerm) ||
        studio.description?.toLowerCase().includes(searchTerm) ||
        studio.location?.toLowerCase().includes(searchTerm) ||
        studio.city?.toLowerCase().includes(searchTerm) ||
        studio.state?.toLowerCase().includes(searchTerm) ||
        studio.category?.toLowerCase().includes(searchTerm) ||
        studio.tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchTerm)
        ) ||
        studio.amenities?.some((amenity: string) => 
          amenity.toLowerCase().includes(searchTerm)
        ) ||
        studio.profiles?.full_name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply city filter
    if (filters.selectedCity) {
      filtered = filtered.filter(studio => studio.city === filters.selectedCity);
    }

    // Apply category filter
    if (filters.selectedCategory) {
      filtered = filtered.filter(studio => studio.category === filters.selectedCategory);
    }

    // Apply price range filter
    filtered = filtered.filter(studio => 
      studio.price_per_hour >= filters.priceRange[0] && 
      studio.price_per_hour <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(studio => (studio.rating || 0) >= filters.minRating);
    }

    // Apply amenities filter
    if (filters.selectedAmenities.length > 0) {
      filtered = filtered.filter(studio => {
        if (!studio.amenities) return false;
        return filters.selectedAmenities.every(amenity => studio.amenities.includes(amenity));
      });
    }

    return filtered;
  };

  const handleCityChange = (city: string) => {
    setFilters(prev => ({ ...prev, selectedCity: city }));
    localStorage.setItem('selectedCity', city);
    // Update URL with city and category
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (filters.selectedCategory) params.set('category', filters.selectedCategory);
    window.history.pushState({}, '', `/studios?${params.toString()}`);
  };

  const handleLocationSearch = async () => {
    await getCurrentLocation();
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Navigation with city selector */}
      <Navigation selectedCity={filters.selectedCity} onCityChange={handleCityChange} />
      
      {/* Offline Booking Queue */}
      <OfflineBookingQueue />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Studio {filters.selectedCity && `in ${filters.selectedCity}`}
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

        {/* Improved Filter Bar */}
        <ImprovedFilterBar
          filters={filters}
          onFiltersChange={setFilters}
        />

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
            {filters.selectedCity && (
              <p className="text-gray-600 text-sm md:text-base">
                Showing results for {filters.selectedCity}
              </p>
            )}
          </div>
        </div>

        {/* Studios Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
          <div className={isMobile ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"}>
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
              {filters.selectedCity 
                ? `No studios available in ${filters.selectedCity} matching your criteria`
                : 'Try adjusting your search criteria or filters'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Studios;
