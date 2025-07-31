
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";
import DatabaseSeeder from "@/components/DatabaseSeeder";
import LocationSelector from "@/components/LocationSelector";
import CategoriesSection from "@/components/sections/CategoriesSection";
import LocationsSection from "@/components/sections/LocationsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredStudios, setFeaturedStudios] = useState<any[]>([]);
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
      let query = supabase
        .from("studios")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(6);

      // Filter by city if selected
      if (selectedCity) {
        query = query.eq("city", selectedCity);
      }

      const { data, error } = await query;

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

      setFeaturedStudios(formattedStudios);
    } catch (error) {
      console.error("Error fetching studios:", error);
      setFeaturedStudios([]);
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

          {/* Responsive Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 max-w-4xl mx-auto mb-12 animate-scale-in">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 flex items-center px-4 md:px-6 py-3 md:py-4">
                <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <Input
                  placeholder="Search for studios, equipment, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-0 focus-visible:ring-0 text-base md:text-lg bg-transparent p-0"
                />
              </div>
              <div className="flex justify-center md:justify-end">
                <Button 
                  onClick={handleSearch}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-full text-base md:text-lg font-semibold transition-all hover:scale-105 w-full md:w-auto"
                >
                  Search Studios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Studios */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Popular in {selectedCity}</h2>
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
