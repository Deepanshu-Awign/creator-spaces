
import { useState, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LocationSelectorProps {
  onCitySelect: (city: string) => void;
}

interface City {
  name: string;
  state: string;
  icon: string;
  lat?: number;
  lng?: number;
}

const LocationSelector = ({ onCitySelect }: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);

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
              icon: getCityIcon(cleanCity),
              lat: getCityCoordinates(cleanCity).lat,
              lng: getCityCoordinates(cleanCity).lng
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

  const getCityCoordinates = (cityName: string) => {
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
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
    return coordinates[cityName] || { lat: 20.5937, lng: 78.9629 }; // Default to India center
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

  const findNearestCity = (userLat: number, userLng: number): City | null => {
    if (availableCities.length === 0) return null;

    let nearestCity = availableCities[0];
    let shortestDistance = calculateDistance(userLat, userLng, nearestCity.lat || 0, nearestCity.lng || 0);

    availableCities.forEach(city => {
      if (city.lat && city.lng) {
        const distance = calculateDistance(userLat, userLng, city.lat, city.lng);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestCity = city;
        }
      }
    });

    return nearestCity;
  };

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

      const nearestCity = findNearestCity(latitude, longitude);
      
      if (nearestCity) {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          nearestCity.lat || 0, 
          nearestCity.lng || 0
        );
        
        toast.success(`Detected nearest city: ${nearestCity.name} (${Math.round(distance)}km away)`);
        onCitySelect(nearestCity.name);
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
      
      // Fallback to first available city
      if (availableCities.length > 0) {
        onCitySelect(availableCities[0].name);
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  const filteredCities = availableCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            disabled={detectingLocation}
            variant="outline"
            className="w-full mb-4 text-orange-600 border-orange-300 hover:bg-orange-50 disabled:opacity-50"
          >
            {detectingLocation ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Detecting location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Detect my location
              </>
            )}
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
