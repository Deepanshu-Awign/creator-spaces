
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Camera, Mic, Video, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import StudioCard from "@/components/StudioCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredStudios = [
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
    }
  ];

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
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all hover:scale-105">
                Search Studios
              </Button>
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
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <category.icon className="w-12 h-12 text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{category.name}</h3>
                  <p className="text-slate-600">{category.count}</p>
                </CardContent>
              </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredStudios.map((studio) => (
              <StudioCard key={studio.id} studio={studio} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Something Amazing?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of creators who trust BookMyStage for their perfect studio space.
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
