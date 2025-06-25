import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Camera, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";
import DatabaseSeeder from "@/components/DatabaseSeeder";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredStudios, setFeaturedStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedStudios = async () => {
      try {
        const { data, error } = await supabase
          .from("studios")
          .select("*")
          .eq("is_active", true)
          .order("rating", { ascending: false })
          .limit(6);

        if (error) throw error;

        const formattedStudios = data?.map(studio => ({
          id: studio.id,
          title: studio.title,
          location: studio.location,
          price: `₹${studio.price_per_hour?.toLocaleString()}/hour`,
          priceValue: studio.price_per_hour,
          rating: studio.rating || 0,
          reviewCount: studio.total_reviews || 0,
          image: studio.images?.[0] || "/placeholder.svg",
          tags: studio.rating >= 4.8 ? ["Hot Selling", "Verified"] : studio.rating >= 4.5 ? ["Trending", "Popular"] : ["Featured"],
          amenities: studio.amenities?.slice(0, 3) || []
        })) || [];

        setFeaturedStudios(formattedStudios);
      } catch (error) {
        console.error("Error fetching studios:", error);
        setFeaturedStudios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStudios();
  }, []);

  const categories = [
    { icon: Mic, name: "Podcast Studios", count: "120+ Studios" },
    { icon: Camera, name: "Photography", count: "200+ Studios" },
    { icon: Video, name: "Video Production", count: "85+ Studios" },
    { icon: Users, name: "Meeting Rooms", count: "150+ Studios" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 animate-fade-in">
            Book Your Perfect
            <span className="text-orange-500 block">Creative Space</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto animate-fade-in">
            Discover and book professional studios for podcasting, photography, video production, and more. Your creative vision starts here.
          </p>

          {/* Database Seeder - Show only if no studios */}
          {!loading && featuredStudios.length === 0 && (
            <DatabaseSeeder />
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-full shadow-2xl p-2 max-w-4xl mx-auto mb-12 animate-scale-in">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-6 py-3">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <Input
                  placeholder="What type of studio are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-lg"
                />
              </div>
              <div className="flex items-center px-6 py-3 border-l">
                <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                <Input
                  placeholder="Location"
                  className="border-0 focus-visible:ring-0 text-lg"
                />
              </div>
              <div className="flex items-center px-6 py-3 border-l">
                <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                <Input
                  placeholder="When?"
                  className="border-0 focus-visible:ring-0 text-lg"
                />
              </div>
              <div className="flex justify-center">
                <Link to="/studios">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all hover:scale-105">
                    Search Studios
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link to="/studios" key={index}>
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                  <CardContent className="p-8 text-center">
                    <category.icon className="w-12 h-12 text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{category.name}</h3>
                    <p className="text-slate-600">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Studios */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Hot Selling Studios</h2>
            <Link to="/studios">
              <Button variant="outline" className="hover:bg-orange-50 hover:border-orange-300">
                View All Studios
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
              <p className="text-slate-600 text-lg mb-4">No studios available at the moment.</p>
              <p className="text-slate-500">Please check back later or use the seeder above to add sample data.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Something Amazing?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of creators who trust BookMyStudio for their perfect studio space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/studios">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold">
                Browse Studios
              </Button>
            </Link>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
              List Your Studio
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
