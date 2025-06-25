import { useState, useMemo, useEffect } from "react";
import { Search, Filter, MapPin, Star, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";
import { supabase } from "@/integrations/supabase/client";

const Studios = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([100000, 1000000]); // Fixed price range
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStudioType, setSelectedStudioType] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const amenities = [
    "Professional Microphones",
    "Professional Lighting",
    "Green Screen", 
    "4K Cameras",
    "Editing Suite",
    "Props Collection",
    "High-Speed WiFi",
    "Audio Interface",
    "Soundproof Booth",
    "Recording Software"
  ];

  const studioTypes = [
    { value: "podcast", label: "Podcast Studio" },
    { value: "photography", label: "Photography Studio" },
    { value: "video", label: "Video Production" },
    { value: "meeting", label: "Meeting Room" },
    { value: "music", label: "Music Studio" },
    { value: "content", label: "Content Creation" }
  ];

  const locations = [
    { value: "mumbai", label: "Mumbai" },
    { value: "bangalore", label: "Bangalore" },
    { value: "delhi", label: "Delhi" },
    { value: "pune", label: "Pune" },
    { value: "chennai", label: "Chennai" },
    { value: "hyderabad", label: "Hyderabad" }
  ];

  useEffect(() => {
    const fetchStudios = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching studios from database...");
        const { data, error } = await supabase
          .from("studios")
          .select("*")
          .eq("is_active", true);
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Fetched studios data:", data);
        
        if (!data || data.length === 0) {
          console.log("No studios found in database");
          setStudios([]);
          return;
        }

        const formattedStudios = data.map((studio) => ({
          ...studio,
          id: studio.id,
          title: studio.title,
          location: studio.location,
          price: `₹${studio.price_per_hour?.toLocaleString()}/hour`,
          priceValue: studio.price_per_hour || 0,
          rating: studio.rating || 0,
          reviewCount: studio.total_reviews || 0,
          image: studio.images?.[0] || "/placeholder.svg",
          tags: studio.rating >= 4.8 ? ["Hot Selling", "Verified"] : studio.rating >= 4.5 ? ["Trending", "Popular"] : ["Featured"],
          amenities: studio.amenities || [],
          type: "" // You can map type based on title or add type field to database
        }));
        
        console.log("Formatted studios:", formattedStudios);
        setStudios(formattedStudios);
      } catch (err: any) {
        console.error("Error fetching studios:", err);
        setError(err.message || "Failed to load studios.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudios();
  }, []);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities(prev => [...prev, amenity]);
    } else {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    }
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    if (checked) {
      setMinRating(prev => [...prev, rating]);
    } else {
      setMinRating(prev => prev.filter(r => r !== rating));
    }
  };

  const filteredStudios = useMemo(() => {
    let filtered = studios.filter(studio => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!studio.title.toLowerCase().includes(query) &&
            !studio.location.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Location filter
      if (selectedLocation) {
        if (!studio.location.toLowerCase().includes(selectedLocation)) {
          return false;
        }
      }
      // Price range filter
      if (studio.priceValue < priceRange[0] || studio.priceValue > priceRange[1]) {
        return false;
      }
      // Amenities filter
      if (selectedAmenities.length > 0) {
        if (!selectedAmenities.some(amenity => studio.amenities.includes(amenity))) {
          return false;
        }
      }
      // Rating filter
      if (minRating.length > 0) {
        const maxRequiredRating = Math.max(...minRating);
        if (studio.rating < maxRequiredRating) {
          return false;
        }
      }
      return true;
    });
    // Sort filtered results
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.priceValue - b.priceValue;
          case "price-high":
            return b.priceValue - a.priceValue;
          case "rating":
            return b.rating - a.rating;
          case "popular":
            return b.reviewCount - a.reviewCount;
          default:
            return 0;
        }
      });
    }
    return filtered;
  }, [studios, searchQuery, selectedLocation, priceRange, selectedAmenities, minRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedStudioType("");
    setPriceRange([100000, 1000000]);
    setSelectedAmenities([]);
    setMinRating([]);
    setSortBy("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Discover Studios</h1>
            <p className="text-slate-600">Find the perfect space for your creative needs</p>
          </div>
          
          {/* Search and View Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 flex items-center relative">
                <Search className="absolute left-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search studios by name, location, or type..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range (per hour)</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000000}
                    min={50000}
                    step={50000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                {/* Rating */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`rating-${rating}`}
                          checked={minRating.includes(rating)}
                          onCheckedChange={(checked) => handleRatingChange(rating, !!checked)}
                        />
                        <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          {rating}+ stars
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Amenities */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Amenities</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                        />
                        <label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Studios Grid/List */}
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-slate-600">
                  {loading ? "Loading studios..." : error ? error : `Showing ${filteredStudios.length} studios`}
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading studios...</div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
              ) : (
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {filteredStudios.map((studio) => (
                    <StudioCard key={studio.id} studio={studio} />
                  ))}
                </div>
              )}
              
              {!loading && !error && filteredStudios.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No studios found matching your criteria</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studios;
