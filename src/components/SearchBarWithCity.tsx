import { useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarWithCityProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

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

  useEffect(() => {
    fetchAvailableCities();
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
      onSearch();
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
                className="w-full justify-between h-12 px-3 sm:px-4 border-r-0 sm:border-r border-gray-200 rounded-lg sm:rounded-l-lg sm:rounded-r-none"
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
        <div className="flex-1 flex items-center px-3 sm:px-4 md:px-6 h-12 border border-gray-200 sm:border-l-0 rounded-lg sm:rounded-none sm:rounded-r-none">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 sm:mr-3 flex-shrink-0" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border-0 focus-visible:ring-0 text-sm sm:text-base md:text-lg bg-transparent p-0"
          />
        </div>

        {/* Search Button */}
        <div className="flex justify-center sm:justify-end">
          <Button 
            onClick={onSearch}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-full text-sm sm:text-base md:text-lg font-semibold transition-all hover:scale-105 w-full sm:w-auto h-12"
          >
            Search Studios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBarWithCity;