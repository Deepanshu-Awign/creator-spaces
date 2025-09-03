
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";
import DatabaseSeeder from "@/components/DatabaseSeeder";
import LocationSelector from "@/components/LocationSelector";
import SearchBarWithCity from "@/components/SearchBarWithCity";
import ImprovedCategoriesSection from "@/components/ImprovedCategoriesSection";
import LocationsSection from "@/components/sections/LocationsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredStudios, setFeaturedStudios] = useState<any[]>([]);
  const [popularByCity, setPopularByCity] = useState<{[key: string]: any[]}>({});
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(true);

  useEffect(() => {
    // Check if user has already selected a city
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      setSelectedCity(savedCity);
      setShowLocationSelector(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCity && !showLocationSelector) {
      fetchFeaturedStudios();
    }
  }, [selectedCity, showLocationSelector]);

  const fetchFeaturedStudios = async () => {
    try {
      setLoading(true);
      
      // Fetch all studios to group by city
      const { data, error } = await supabase
        .from("studios")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      const formattedStudios = data?.map(studio => ({
        id: studio.id,
        title: studio.title,
        location: studio.location,
        city: studio.city,
        state: studio.state,
        category: (studio as any).category,
        price_per_hour: studio.price_per_hour,
        rating: studio.rating || 0,
        total_reviews: studio.total_reviews || 0,
        images: studio.images || [],
        amenities: studio.amenities?.slice(0, 3) || [],
        description: studio.description
      })) || [];

      // Group studios by city, taking top 6 per city
      const groupedByCity: {[key: string]: any[]} = {};
      formattedStudios.forEach(studio => {
        if (studio.city) {
          if (!groupedByCity[studio.city]) {
            groupedByCity[studio.city] = [];
          }
          if (groupedByCity[studio.city].length < 6) {
            groupedByCity[studio.city].push(studio);
          }
        }
      });

      setPopularByCity(groupedByCity);
      
      // Set featured studios for selected city or default
      if (selectedCity && groupedByCity[selectedCity]) {
        setFeaturedStudios(groupedByCity[selectedCity]);
      } else {
        // Show first 6 overall highest rated
        setFeaturedStudios(formattedStudios.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching studios:", error);
      setFeaturedStudios([]);
      setPopularByCity({});
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowLocationSelector(false);
    localStorage.setItem('selectedCity', city);
    // Update URL with city
    window.history.pushState({}, '', `/${city.toLowerCase().replace(/\s+/g, '-')}`);
    
    // Update featured studios for selected city
    if (popularByCity[city]) {
      setFeaturedStudios(popularByCity[city]);
    }
  };

  const handleSearch = (filters?: { category?: string; amenities?: string[] }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('city', selectedCity || '');
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    }
    
    // Add filter parameters
    if (filters?.category) {
      searchParams.set('category', filters.category);
    }
    if (filters?.amenities && filters.amenities.length > 0) {
      searchParams.set('amenities', filters.amenities.join(','));
    }
    
    window.location.href = `/studios?${searchParams.toString()}`;
  };

  if (showLocationSelector) {
    return <LocationSelector onCitySelect={handleCitySelect} />;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation selectedCity={selectedCity} onCityChange={handleCitySelect} />
      
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-6 md:pt-8 lg:pt-8 pb-4 sm:pb-6 md:pb-8 lg:pb-8 px-4 sm:px-6 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-800 mb-2 sm:mb-3 md:mb-4 animate-fade-in leading-tight">
            Book Your Perfect
            <span className="text-orange-500 block">Creative Space</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in px-2 sm:px-4">
            Discover and book professional studios for podcasting, photography, video production, and more in {selectedCity}.
          </p>

          {/* Database Seeder - Show only if no studios */}
          {!loading && featuredStudios.length === 0 && (
            <DatabaseSeeder />
          )}

          {/* Integrated Search Bar with City Selection */}
          <SearchBarWithCity
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity || ""}
            onCityChange={handleCitySelect}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Featured Studios - Popular in Selected City */}
      <section className="py-4 sm:py-6 md:py-6 lg:py-8 px-4 sm:px-6 md:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900">
              Popular in {selectedCity}
            </h2>
            <Link to={`/studios?city=${selectedCity}`}>
              <Button variant="outline" className="hover:bg-neutral-100 border-neutral-300 w-full sm:w-auto text-xs sm:text-sm">
                Show all
              </Button>
            </Link>
          </div>
          
           {loading ? (
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-neutral-200 animate-pulse rounded-xl h-48 min-w-[200px] flex-shrink-0"></div>
              ))}
            </div>
          ) : featuredStudios.length > 0 ? (
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
              {featuredStudios.slice(0, 10).map((studio) => (
                <div key={studio.id} className="min-w-[200px] max-w-[200px] lg:min-w-[250px] lg:max-w-[250px] flex-shrink-0">
                  <StudioCard studio={studio} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-slate-600 text-base sm:text-lg mb-3 sm:mb-4">No studios available in {selectedCity} at the moment.</p>
              <p className="text-slate-500 text-sm sm:text-base">Please try a different city or check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular in Other Cities */}
      {Object.keys(popularByCity).filter(city => city !== selectedCity).length > 0 && (
        <section className="py-4 sm:py-6 md:py-6 lg:py-8 px-4 sm:px-6 md:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            {Object.entries(popularByCity)
              .filter(([city]) => city !== selectedCity)
              .slice(0, 3)
              .map(([city, studios]) => (
                <div key={city} className="mb-8 sm:mb-12 last:mb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900">
                      Popular in {city}
                    </h2>
                    <Link to={`/studios?city=${city}`}>
                      <Button variant="outline" className="hover:bg-neutral-100 border-neutral-300 w-full sm:w-auto text-xs sm:text-sm">
                        Show all in {city}
                      </Button>
                    </Link>
                  </div>
                  <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                    {studios.slice(0, 10).map((studio) => (
                      <div key={studio.id} className="min-w-[200px] max-w-[200px] lg:min-w-[250px] lg:max-w-[250px] flex-shrink-0">
                        <StudioCard studio={studio} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <ImprovedCategoriesSection selectedCity={selectedCity} />

      {/* Locations Section */}
      <LocationsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-dark text-white relative overflow-hidden">
        {/* Background pattern for better contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/95 drop-shadow-sm">
            Join thousands of creators who trust Creator Spaces for their perfect studio space.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to={`/studios?city=${selectedCity}`}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                🎙 Explore Studios
              </Button>
            </Link>
            <Link to="/host/signup">
              <Button size="lg" variant="outline" className="border-white/80 text-black bg-white hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-105">
                🏠 List Your Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
