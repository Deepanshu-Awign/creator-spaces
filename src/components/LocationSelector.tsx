import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const POPULAR_CITIES = [
  { name: "Mumbai", state: "Maharashtra", icon: "🏙️" },
  { name: "Delhi", state: "NCR", icon: "🏛️" },
  { name: "Bangalore", state: "Karnataka", icon: "🌆" },
  { name: "Hyderabad", state: "Telangana", icon: "🏢" },
  { name: "Chennai", state: "Tamil Nadu", icon: "🏘️" },
  { name: "Pune", state: "Maharashtra", icon: "🏪" },
  { name: "Kolkata", state: "West Bengal", icon: "🏛️" },
  { name: "Ahmedabad", state: "Gujarat", icon: "🏬" },
  { name: "Kochi", state: "Kerala", icon: "🌴" },
  { name: "Jaipur", state: "Rajasthan", icon: "🕌" }
];

interface LocationSelectorProps {
  onCitySelect: (city: string) => void;
}

const LocationSelector = ({ onCitySelect }: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customCity, setCustomCity] = useState("");

  const filteredCities = POPULAR_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we'll set to Mumbai
          // In a real app, you'd reverse geocode the coordinates
          onCitySelect("Mumbai");
        },
        (error) => {
          console.error("Location detection failed:", error);
          // Fallback to Mumbai
          onCitySelect("Mumbai");
        }
      );
    } else {
      // Fallback if geolocation is not supported
      onCitySelect("Mumbai");
    }
  };

  const handleCustomCitySubmit = () => {
    if (customCity.trim()) {
      onCitySelect(customCity.trim());
    }
  };

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

        {/* Popular Cities */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Popular Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredCities.map((city) => (
              <Card
                key={city.name}
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
        </div>

        {/* Other City */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Don't see your city? Enter it here:
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your city name..."
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomCitySubmit()}
              className="flex-1"
            />
            <Button
              onClick={handleCustomCitySubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!customCity.trim()}
            >
              Go
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
