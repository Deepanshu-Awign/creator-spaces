
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StudioCard from '@/components/StudioCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Studios = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Get city from URL params or localStorage
  useEffect(() => {
    const cityFromUrl = searchParams.get('city');
    const cityFromStorage = localStorage.getItem('selectedCity');
    const city = cityFromUrl || cityFromStorage || '';
    
    if (city) {
      setSelectedCity(city);
    }
  }, [searchParams]);

  // Fetch studios with enhanced filtering
  const { data: studios = [], isLoading } = useQuery({
    queryKey: ['studios', searchTerm, selectedCity, selectedState, priceRange],
    queryFn: async () => {
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

      // Apply city filter - prioritize selectedCity
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      // Apply state filter
      if (selectedState) {
        query = query.eq('state', selectedState);
      }

      // Apply price range filter
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (max) {
          query = query.gte('price_per_hour', min).lte('price_per_hour', max);
        } else {
          query = query.gte('price_per_hour', min);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching studios:', error);
        return [];
      }
      return data || [];
    }
  });

  // Fetch unique cities and states for filters
  const { data: locationData } = useQuery({
    queryKey: ['studio-locations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('studios')
        .select('city, state')
        .eq('is_active', true)
        .not('city', 'is', null)
        .not('state', 'is', null);

      // Clean up city names
      const cleanedData = data?.map(item => ({
        ...item,
        city: item.city?.replace(/\s+division$/i, '').trim()
      }));

      const cities = [...new Set(cleanedData?.map(item => item.city).filter(Boolean))].sort();
      const states = [...new Set(cleanedData?.map(item => item.state).filter(Boolean))].sort();

      return { cities, states };
    }
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setPriceRange('');
    // Keep selectedCity as it comes from URL/localStorage
  };

  const hasActiveFilters = searchTerm || selectedState || priceRange;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Studio {selectedCity && `in ${selectedCity}`}
          </h1>
          <p className="text-xl text-gray-600">
            Discover and book amazing studios for your next project
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Main Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                  {[searchTerm, selectedState, priceRange].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City Filter - Show current city */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                    {selectedCity || 'All Cities'}
                  </div>
                </div>

                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All States</SelectItem>
                      {locationData?.states?.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹/hour)
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Prices</SelectItem>
                      <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                      <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                      <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                      <SelectItem value="2000-5000">₹2,000 - ₹5,000</SelectItem>
                      <SelectItem value="5000">₹5,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters */}
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
                    {selectedState && (
                      <Badge variant="secondary" className="gap-1">
                        State: {selectedState}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setSelectedState('')}
                        />
                      </Badge>
                    )}
                    {priceRange && (
                      <Badge variant="secondary" className="gap-1">
                        Price: ₹{priceRange.replace('-', ' - ₹')}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setPriceRange('')}
                        />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isLoading ? 'Loading...' : `${studios.length} Studios Found`}
            </h2>
            {(hasActiveFilters || selectedCity) && (
              <p className="text-gray-600">
                {selectedCity && `Showing results for ${selectedCity}`}
              </p>
            )}
          </div>
        </div>

        {/* Studios Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : studios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studios.map((studio) => (
              <StudioCard key={studio.id} studio={studio} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
