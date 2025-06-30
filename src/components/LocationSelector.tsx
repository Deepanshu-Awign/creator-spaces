
import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface LocationSelectorProps {
  onCitySelect: (city: string) => void;
}

const LocationSelector = ({ onCitySelect }: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          // Clean up city name to remove "division" suffix
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

  const filteredCities = availableCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we'll set to the first available city
          if (availableCities.length > 0) {
            onCitySelect(availableCities[0].name);
          }
        },
        (error) => {
          console.error("Location detection failed:", error);
          // Fallback to first available city
          if (availableCities.length > 0) {
            onCitySelect(availableCities[0].name);
          }
        }
      );
    } else {
      // Fallback if geolocation is not supported
      if (availableCities.length > 0) {
        onCitySelect(availableCities[0].name);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading available cities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">
            Book<span className="text-orange-500">MyStudio</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Choose your city to discover amazing studios near you
          </p>
        </div>

        {/* Search for city */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <Input
              placeholder="Search for your city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg border-0 focus-visible:ring-0"
            />
          </div>
          
          <Button
            onClick={handleDetectLocation}
            variant="outline"
            className="w-full mb-4 text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Detect my location
          </Button>
        </div>

        {/* Available Cities */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Available Cities</h2>
          {filteredCities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredCities.map((city, index) => (
                <Card
                  key={`${city.name}-${index}`}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => onCitySelect(city.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{city.icon}</div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-slate-500">{city.state}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">No cities found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
