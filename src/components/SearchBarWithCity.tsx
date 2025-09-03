import { useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown, Filter, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarWithCityProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSearch: (filters?: { category?: string; amenities?: string[] }) => void;
  placeholder?: string;
}

// Studio types and equipment options - Using actual database categories and amenities
const STUDIO_TYPES = [
  "Photography",
  "Music Recording", 
  "Video Production",
  "Podcast",
  "Coworking",
  "Event Spaces"
];

const EQUIPMENT_OPTIONS = [
  "WiFi",
  "Air Conditioning",
  "Parking",
  "Security Camera",
  "Sound System",
  "24x7 Access",
  "Lighting Equipment",
  "Backdrop",
  "Makeup Room",
  "Waiting Area",
  "Refreshments",
  "Equipment Storage",
  "Wheelchair Accessible",
  "Bathroom Facilities",
  "Kitchen/Pantry",
  "Reception Area",
  "Conference Table",
  "Projector",
  "Whiteboard",
  "Natural Light"
];

const SearchBarWithCity = ({
  searchQuery,
  setSearchQuery,
  selectedCity,
  onCityChange,
  onSearch,
  placeholder = "Search for studios, equipment, or services..."
}: SearchBarWithCityProps) => {
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    fetchAvailableCities();
  }, []);

  useEffect(() => {
    // Generate search suggestions based on selected filters
    const suggestions = [] as string[];
    if (selectedCategory) {
      suggestions.push(selectedCategory);
    }
    if (selectedAmenities.length > 0) {
      suggestions.push(...selectedAmenities);
    }
    setSearchSuggestions(suggestions);
  }, [selectedCategory, selectedAmenities]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-input-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAvailableCities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("studios")
        .select("city, state")
        .eq("is_active", true)
        .not("city", "is", null);

      if (error) throw error;

      // Group cities by state and count studios
      const cityMap = new Map();
      data?.forEach(studio => {
        if (studio.city) {
          const cleanCity = studio.city.replace(/\s+division$/i, '').trim();
          const key = `${cleanCity}-${studio.state}`;
          if (!cityMap.has(key)) {
            cityMap.set(key, {
              name: cleanCity,
              state: studio.state,
              icon: getCityIcon(cleanCity)
            });
          }
        }
      });

      setAvailableCities(Array.from(cityMap.values()));
    } catch (error) {
      console.error("Error fetching available cities:", error);
      setAvailableCities([]);
    } finally {
      setLoading(false);
    }
  };

  const getCityIcon = (cityName: string) => {
    const iconMap: { [key: string]: string } = {
      "Mumbai": "🏙️",
      "Delhi": "🏛️",
      "Bangalore": "🌆",
      "Hyderabad": "🏢",
      "Chennai": "🏘️",
      "Pune": "🏪",
      "Kolkata": "🏛️",
      "Ahmedabad": "🏬",
      "Kochi": "🌴",
      "Jaipur": "🕌"
    };
    return iconMap[cityName] || "🏙️";
  };

  const handleCitySelect = (city: string) => {
    onCityChange(city);
    setOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedAmenities(prev => 
      prev.includes(equipment) 
        ? prev.filter(item => item !== equipment)
        : [...prev, equipment]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedAmenities([]);
    setSearchQuery("");
  };

  const handleSearchClick = () => {
    // Pass the current filters to the parent component
    onSearch({
      category: selectedCategory,
      amenities: selectedAmenities
    });
  };

  const hasActiveFilters = selectedCategory || selectedAmenities.length > 0;

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      console.log("User location:", { latitude, longitude });

      // Find nearest city from available cities
      const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
        "Mumbai": { lat: 19.0760, lng: 72.8777 },
        "Delhi": { lat: 28.7041, lng: 77.1025 },
        "Bangalore": { lat: 12.9716, lng: 77.5946 },
        "Hyderabad": { lat: 17.3850, lng: 78.4867 },
        "Chennai": { lat: 13.0827, lng: 80.2707 },
        "Pune": { lat: 18.5204, lng: 73.8567 },
        "Kolkata": { lat: 22.5726, lng: 88.3639 },
        "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
        "Kochi": { lat: 9.9312, lng: 76.2673 },
        "Jaipur": { lat: 26.9124, lng: 75.7873 }
      };

      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      let nearestCity = "";
      let shortestDistance = Infinity;

      availableCities.forEach(city => {
        const cityCoords = cityCoordinates[city.name];
        if (cityCoords) {
          const distance = calculateDistance(latitude, longitude, cityCoords.lat, cityCoords.lng);
          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestCity = city.name;
          }
        }
      });

      if (nearestCity) {
        toast.success(`Detected nearest city: ${nearestCity} (${Math.round(shortestDistance)}km away)`);
        onCityChange(nearestCity);
      } else {
        toast.error("No nearby cities found");
      }
    } catch (error) {
      console.error("Location detection failed:", error);
      
      let errorMessage = "Failed to detect your location";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setDetectingLocation(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-4 max-w-4xl mx-auto mb-8 sm:mb-12 animate-scale-in">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* City Selector */}
        <div className="sm:w-48 flex-shrink-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 px-3 sm:px-4 border border-gray-200 rounded-l-lg rounded-r-none"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="truncate text-sm sm:text-base">
                    {selectedCity || "Select City"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">Loading cities...</div>
                ) : (
                  <div className="p-2">
                    {/* Detect Location Button */}
                    <button
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left border-b border-gray-200 mb-2"
                    >
                      <Navigation className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-sm sm:text-base text-blue-600">
                          {detectingLocation ? "Detecting..." : "Detect My Location"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">Find nearest city</div>
                      </div>
                    </button>
                    
                    {availableCities.map((city, index) => (
                      <button
                        key={`${city.name}-${index}`}
                        onClick={() => handleCitySelect(city.name)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="text-lg">{city.icon}</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{city.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{city.state}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Input */}
        <div className="flex-1 flex items-center px-3 sm:px-4 md:px-6 h-12 border border-gray-200 rounded-none relative search-input-container">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 sm:mr-3 flex-shrink-0" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            className="border-0 focus-visible:ring-0 text-sm sm:text-base md:text-lg bg-transparent p-0"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <div className="flex justify-center sm:justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`h-12 px-3 border border-gray-200 rounded-l-none rounded-r-lg ${hasActiveFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-orange-100 text-orange-600 text-xs">
                {selectedAmenities.length + (selectedCategory ? 1 : 0)}
              </Badge>
            )}
          </Button>
          
          <Button 
            onClick={handleSearchClick}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-full text-sm sm:text-base md:text-lg font-semibold transition-all hover:scale-105 w-full sm:w-auto h-12"
          >
            Search Studios
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Filter Options</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Studio Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Studio Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select studio category" />
                </SelectTrigger>
                <SelectContent>
                  {STUDIO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities & Equipment
              </label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <Badge
                    key={equipment}
                    variant={selectedAmenities.includes(equipment) ? "default" : "outline"}
                    className={`cursor-pointer hover:bg-orange-50 ${
                      selectedAmenities.includes(equipment) 
                        ? 'bg-orange-100 text-orange-700 border-orange-200' 
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                    onClick={() => handleEquipmentToggle(equipment)}
                  >
                    {equipment}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBarWithCity;