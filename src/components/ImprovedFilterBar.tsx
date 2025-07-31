import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, Star, MapPin, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const AVAILABLE_AMENITIES = [
  'WiFi', 'Air Conditioning', 'Parking', 'Security Camera', 'Sound System',
  '24x7 Access', 'Lighting Equipment', 'Backdrop', 'Makeup Room', 'Waiting Area',
  'Refreshments', 'Equipment Storage', 'Wheelchair Accessible', 'Bathroom Facilities',
  'Kitchen/Pantry', 'Reception Area', 'Conference Table', 'Projector', 'Whiteboard', 'Natural Light'
];

interface FilterState {
  searchTerm: string;
  selectedCity: string;
  selectedCategory: string;
  priceRange: number[];
  selectedAmenities: string[];
  minRating: number;
}

interface ImprovedFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const ImprovedFilterBar = ({ filters, onFiltersChange }: ImprovedFilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  // Fetch available cities
  const { data: cities = [] } = useQuery({
    queryKey: ['available-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('studios')
        .select('city')
        .eq('is_active', true)
        .not('city', 'is', null);

      if (error) throw error;

      return [...new Set(
        data?.map(studio => studio.city?.trim()).filter(Boolean)
      )].sort();
    },
  });

  // Use static categories for now since cs_studios table might not be accessible
  const categories = ['photography', 'videography', 'recording', 'event', 'conference', 'workshop'];

  const updateFilter = (key: keyof FilterState, value: any) => {
    // Handle special "all" values by converting them to empty strings
    const processedValue = value === 'all-cities' || value === 'all-categories' ? '' : value;
    onFiltersChange({
      ...filters,
      [key]: processedValue,
    });
  };

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    const updated = checked
      ? [...filters.selectedAmenities, amenity]
      : filters.selectedAmenities.filter(a => a !== amenity);
    updateFilter('selectedAmenities', updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      selectedCity: '',
      selectedCategory: '',
      priceRange: [0, 10000],
      selectedAmenities: [],
      minRating: 0,
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.selectedCity || filters.selectedCategory ||
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 || 
    filters.selectedAmenities.length > 0 || filters.minRating > 0;

  const activeFilterCount = [
    filters.searchTerm,
    filters.selectedCity,
    filters.selectedCategory,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000,
    filters.selectedAmenities.length > 0,
    filters.minRating > 0
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-3 md:p-6 mb-8">
      {/* Main Search Row */}
      <div className="flex flex-col gap-3 md:gap-4 mb-4">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search studios, locations, or amenities..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10 h-11 md:h-12 text-base border-neutral-300 focus:border-neutral-500"
            />
          </div>

          {/* Quick Filters Row - Mobile/Desktop Responsive */}
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
            {/* City Filter */}
            <Select value={filters.selectedCity} onValueChange={(value) => updateFilter('selectedCity', value)}>
              <SelectTrigger className="min-w-[120px] md:w-40 h-11 md:h-12 border-neutral-300 focus:border-neutral-500 flex-shrink-0">
                <div className="flex items-center gap-2 text-left">
                  <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <SelectValue placeholder="City" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-neutral-200 shadow-lg z-[9999]">
                <SelectItem value="all-cities">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city} className="hover:bg-neutral-50">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filters.selectedCategory} onValueChange={(value) => updateFilter('selectedCategory', value)}>
              <SelectTrigger className="min-w-[130px] md:w-40 h-11 md:h-12 border-neutral-300 focus:border-neutral-500 flex-shrink-0">
                <div className="flex items-center gap-2 text-left">
                  <Tag className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-neutral-200 shadow-lg z-[9999]">
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="hover:bg-neutral-50 capitalize">
                    {category.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 md:h-12 px-3 md:px-4 border-neutral-300 hover:border-neutral-400 flex-shrink-0 whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-1 md:mr-2" />
              {isMobile ? 'More' : 'Filters'}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 md:ml-2 bg-neutral-800 text-white text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="border-t border-neutral-200 pt-6 space-y-6">
          {/* Price Range Filter */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Price Range (₹/hour): ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value)}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>

          {/* Rating Filter */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Minimum Rating
            </Label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('minRating', rating)}
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
                <Label className="text-sm font-medium text-neutral-700 cursor-pointer">
                  Amenities {filters.selectedAmenities.length > 0 && `(${filters.selectedAmenities.length} selected)`}
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
                      checked={filters.selectedAmenities.includes(amenity)}
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
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
              <div className="flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.searchTerm}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter('searchTerm', '')}
                    />
                  </Badge>
                )}
                {filters.selectedCity && (
                  <Badge variant="secondary" className="gap-1">
                    City: {filters.selectedCity}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter('selectedCity', '')}
                    />
                  </Badge>
                )}
                {filters.selectedCategory && (
                  <Badge variant="secondary" className="gap-1 capitalize">
                    {filters.selectedCategory.replace('_', ' ')}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter('selectedCategory', '')}
                    />
                  </Badge>
                )}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
                  <Badge variant="secondary" className="gap-1">
                    Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter('priceRange', [0, 10000])}
                    />
                  </Badge>
                )}
                {filters.selectedAmenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="gap-1">
                    {amenity}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleAmenityToggle(amenity, false)}
                    />
                  </Badge>
                ))}
                {filters.minRating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.minRating}+ stars
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter('minRating', 0)}
                    />
                  </Badge>
                )}
              </div>
              <Button variant="ghost" onClick={clearFilters} className="gap-2 text-neutral-600 hover:text-neutral-900">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImprovedFilterBar;