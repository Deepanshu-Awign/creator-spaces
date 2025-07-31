
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";
import DatabaseSeeder from "@/components/DatabaseSeeder";
import LocationSelector from "@/components/LocationSelector";
import SearchBarWithCity from "@/components/SearchBarWithCity";
import CategoriesSection from "@/components/sections/CategoriesSection";
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

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    searchParams.set('city', selectedCity || '');
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
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
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-800 mb-6 animate-fade-in">
            Book Your Perfect
            <span className="text-orange-500 block">Creative Space</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto animate-fade-in">
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
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Popular in {selectedCity}
            </h2>
            <Link to={`/studios?city=${selectedCity}`}>
              <Button variant="outline" className="hover:bg-neutral-100 border-neutral-300 w-full md:w-auto">
                Show all
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-200 animate-pulse rounded-lg h-80"></div>
              ))}
            </div>
          ) : featuredStudios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredStudios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg mb-4">No studios available in {selectedCity} at the moment.</p>
              <p className="text-slate-500">Please try a different city or check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular in Other Cities */}
      {Object.keys(popularByCity).filter(city => city !== selectedCity).length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            {Object.entries(popularByCity)
              .filter(([city]) => city !== selectedCity)
              .slice(0, 3)
              .map(([city, studios]) => (
                <div key={city} className="mb-16 last:mb-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                      Popular in {city}
                    </h2>
                    <Link to={`/studios?city=${city}`}>
                      <Button variant="outline" className="hover:bg-neutral-100 border-neutral-300 w-full md:w-auto">
                        Show all in {city}
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {studios.slice(0, 3).map((studio) => (
                      <StudioCard key={studio.id} studio={studio} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <CategoriesSection />

      {/* Locations Section */}
      <LocationsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Something Amazing?</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Join thousands of creators who trust Creator Spaces for their perfect studio space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/studios?city=${selectedCity}`}>
              <Button size="lg" className="bg-white hover:bg-white/90 text-primary px-8 py-4 text-lg font-semibold rounded-full shadow-glow">
                🎙 Explore Studios
              </Button>
            </Link>
            <Link to="/host/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold rounded-full">
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
