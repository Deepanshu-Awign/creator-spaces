
import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Heart, Star, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";

const Profile = () => {
  const [user] = useState({
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    joinDate: "March 2023",
    avatar: "/placeholder.svg",
    verified: true
  });

  const bookings = [
    {
      id: 1,
      studio: "Downtown Podcast Studio",
      date: "2024-01-15",
      time: "14:00",
      duration: "2 hours",
      status: "confirmed",
      price: "₹5,000",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      studio: "Creative Photography Loft",
      date: "2024-01-08",
      time: "10:00",
      duration: "4 hours",
      status: "completed",
      price: "₹12,800",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      studio: "Music Recording Studio",
      date: "2023-12-20",
      time: "16:00",
      duration: "3 hours",
      status: "completed",
      price: "₹15,600",
      image: "/placeholder.svg"
    }
  ];

  const favorites = [
    {
      id: 1,
      title: "Downtown Podcast Studio",
      location: "Mumbai, Maharashtra",
      price: "₹2,500/hour",
      rating: 4.8,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Creative Photography Loft",
      location: "Bangalore, Karnataka",
      price: "₹3,200/hour",
      rating: 4.9,
      image: "/placeholder.svg"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                    {user.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-slate-600 mb-6">
                    <div className="flex items-center justify-center md:justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.location}
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since {user.joinDate}
                    </div>
                  </div>
                  
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <img
                          src={booking.image}
                          alt={booking.studio}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{booking.studio}</h3>
                          <div className="text-sm text-slate-600 space-y-1">
                            <p>{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                            <p>Duration: {booking.duration}</p>
                            <p className="font-medium text-slate-800">{booking.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          {booking.status === "confirmed" && (
                            <div className="mt-2 space-x-2">
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Favorite Studios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((studio) => (
                      <div key={studio.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                          src={studio.image}
                          alt={studio.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-800 mb-2">{studio.title}</h3>
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {studio.location}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm font-medium">{studio.rating}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{studio.price}</span>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                              Book Now
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
