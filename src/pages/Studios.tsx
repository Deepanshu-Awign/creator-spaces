
import { useState } from "react";
import { Search, Filter, MapPin, Star, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";

const Studios = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([1000, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  const mockStudios = [
    {
      id: 1,
      title: "Downtown Podcast Studio",
      location: "Mumbai, Maharashtra",
      price: "₹2,500/hour",
      rating: 4.8,
      reviewCount: 124,
      image: "/placeholder.svg",
      tags: ["Hot Selling", "Verified"],
      amenities: ["Soundproof", "Professional Mics", "Editing Suite"]
    },
    {
      id: 2,
      title: "Creative Photography Loft",
      location: "Bangalore, Karnataka",
      price: "₹3,200/hour",
      rating: 4.9,
      reviewCount: 89,
      image: "/placeholder.svg",
      tags: ["Trending", "Popular"],
      amenities: ["Natural Light", "Props Available", "Backdrop"]
    },
    {
      id: 3,
      title: "Video Production House",
      location: "Delhi, NCR",
      price: "₹4,500/hour",
      rating: 4.7,
      reviewCount: 156,
      image: "/placeholder.svg",
      tags: ["Premium", "Featured"],
      amenities: ["Green Screen", "4K Cameras", "Lighting Kit"]
    },
    {
      id: 4,
      title: "Modern Meeting Studio",
      location: "Pune, Maharashtra",
      price: "₹1,800/hour",
      rating: 4.6,
      reviewCount: 67,
      image: "/placeholder.svg",
      tags: ["Budget Friendly"],
      amenities: ["AC", "Projector", "Whiteboard"]
    },
    {
      id: 5,
      title: "Music Recording Studio",
      location: "Chennai, Tamil Nadu",
      price: "₹5,200/hour",
      rating: 4.9,
      reviewCount: 203,
      image: "/placeholder.svg",
      tags: ["Premium", "Top Rated"],
      amenities: ["Acoustic Treatment", "Mixing Console", "Instruments"]
    },
    {
      id: 6,
      title: "Content Creator Space",
      location: "Hyderabad, Telangana",
      price: "₹2,800/hour",
      rating: 4.7,
      reviewCount: 91,
      image: "/placeholder.svg",
      tags: ["Popular", "New"],
      amenities: ["Ring Lights", "Tripods", "Backdrops"]
    }
  ];

  const amenities = [
    "Soundproof",
    "Professional Lighting",
    "Green Screen",
    "Professional Cameras",
    "Editing Suite",
    "Props Available",
    "Natural Light",
    "AC",
    "Parking Available",
    "WiFi"
  ];

  const studioTypes = [
    "Podcast Studio",
    "Photography Studio",
    "Video Production",
    "Meeting Room",
    "Music Studio",
    "Content Creation"
  ];

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
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Studio Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {studioTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
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
                <h3 className="font-semibold text-lg mb-4">Filters</h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range (per hour)</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    min={500}
                    step={500}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox id={`rating-${rating}`} />
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
                        <Checkbox id={amenity} />
                        <label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Apply Filters
                </Button>
              </div>
            )}

            {/* Studios Grid/List */}
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-slate-600">
                  Showing {mockStudios.length} studios
                </p>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {mockStudios.map((studio) => (
                  <StudioCard key={studio.id} studio={studio} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studios;
