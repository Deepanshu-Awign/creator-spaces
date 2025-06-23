
import { useState } from "react";
import { ArrowLeft, Heart, Share, Star, MapPin, Calendar, Clock, Users, Wifi, Car, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import BookingForm from "@/components/BookingForm";

const StudioDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const studio = {
    id: 1,
    title: "Downtown Podcast Studio",
    location: "Bandra West, Mumbai, Maharashtra",
    price: 2500,
    rating: 4.8,
    reviewCount: 124,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    tags: ["Hot Selling", "Verified", "Professional"],
    description: "Professional podcast studio located in the heart of Mumbai. Perfect for recording high-quality audio content with state-of-the-art equipment and soundproofing. The studio features professional microphones, mixing equipment, and a comfortable recording environment.",
    amenities: [
      { icon: Wifi, name: "High-speed WiFi" },
      { icon: Coffee, name: "Complimentary refreshments" },
      { icon: Car, name: "Free parking" },
      { icon: Users, name: "Accommodates up to 4 people" }
    ],
    features: [
      "Professional Microphones (Shure SM7B)",
      "Acoustic Treatment & Soundproofing",
      "Digital Mixing Console",
      "Real-time Audio Monitoring",
      "Backup Recording Systems",
      "Comfortable Seating for 4",
      "Adjustable Lighting",
      "Air Conditioning"
    ],
    host: {
      name: "Rajesh Kumar",
      avatar: "/placeholder.svg",
      rating: 4.9,
      experience: "Host since 2019",
      verified: true
    },
    rules: [
      "No smoking inside the studio",
      "Maximum 4 people allowed",
      "Clean up after your session",
      "No outside food or drinks",
      "Respect the equipment"
    ],
    reviews: [
      {
        id: 1,
        user: "Priya Sharma",
        avatar: "/placeholder.svg",
        rating: 5,
        date: "2 weeks ago",
        comment: "Excellent studio with amazing sound quality. Rajesh was very helpful and the equipment is top-notch!"
      },
      {
        id: 2,
        user: "Amit Patel",
        avatar: "/placeholder.svg",
        rating: 4,
        date: "1 month ago",
        comment: "Great location and professional setup. Perfect for our podcast recording needs."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <div className="lg:col-span-3">
              <img
                src={studio.images[selectedImage]}
                alt={studio.title}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
              {studio.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${studio.title} ${index + 1}`}
                  className={`w-full h-20 lg:h-24 object-cover rounded-lg cursor-pointer transition-all ${
                    selectedImage === index ? "ring-2 ring-orange-500" : "hover:opacity-80"
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {studio.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {studio.title}
                    </h1>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {studio.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium ml-1">{studio.rating}</span>
                  </div>
                  <span className="text-slate-600">
                    {studio.reviewCount} reviews
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">About this studio</h2>
                <p className="text-slate-700 leading-relaxed">
                  {studio.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studio.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {studio.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <amenity.icon className="w-5 h-5 text-slate-600 mr-3" />
                      <span className="text-slate-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={studio.host.avatar} />
                        <AvatarFallback>RK</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Hosted by {studio.host.name}
                        </h3>
                        <div className="flex items-center text-sm text-slate-600">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          {studio.host.rating} rating • {studio.host.experience}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">Contact Host</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                  <Button variant="outline">See all reviews</Button>
                </div>
                <div className="space-y-6">
                  {studio.reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-200 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>
                            {review.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{review.user}</h4>
                            <span className="text-sm text-slate-500">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm studio={studio} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDetail;
