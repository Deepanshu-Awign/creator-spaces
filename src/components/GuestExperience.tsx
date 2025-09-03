import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  MessageSquare, 
  Phone, 
  Mail, 
  Camera,
  Download,
  Share2,
  Heart,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  ArrowRight,
  User,
  CreditCard,
  Receipt,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

interface GuestExperienceProps {
  user?: any;
  bookings?: any[];
  favorites?: any[];
}

const GuestExperience = ({ user, bookings = [], favorites = [] }: GuestExperienceProps) => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [messageText, setMessageText] = useState("");

  const mockBookings = [
    {
      id: "1",
      studio: {
        name: "Professional Photography Studio",
        image: "/placeholder.svg",
        host: { name: "John Smith", avatar: null },
        location: "Mumbai, Maharashtra"
      },
      date: "2024-01-15",
      time: "14:00-16:00",
      status: "confirmed",
      amount: 2400,
      rating: 5,
      review: "Amazing studio with professional equipment!",
      specialRequests: "Need additional lighting setup"
    },
    {
      id: "2",
      studio: {
        name: "Music Recording Studio",
        image: "/placeholder.svg",
        host: { name: "Sarah Wilson", avatar: null },
        location: "Delhi, NCR"
      },
      date: "2024-01-20",
      time: "10:00-12:00",
      status: "upcoming",
      amount: 1800,
      rating: null,
      review: null,
      specialRequests: "Acoustic guitar available?"
    },
    {
      id: "3",
      studio: {
        name: "Video Production Studio",
        image: "/placeholder.svg",
        host: { name: "Mike Chen", avatar: null },
        location: "Bangalore, Karnataka"
      },
      date: "2024-01-10",
      time: "16:00-18:00",
      status: "completed",
      amount: 3200,
      rating: 4,
      review: "Great space for video shoots",
      specialRequests: "Green screen setup"
    }
  ];

  const mockFavorites = [
    {
      id: "1",
      studio: {
        name: "Professional Photography Studio",
        image: "/placeholder.svg",
        price: 1200,
        rating: 4.9,
        location: "Mumbai, Maharashtra"
      }
    },
    {
      id: "2",
      studio: {
        name: "Music Recording Studio",
        image: "/placeholder.svg",
        price: 900,
        rating: 4.7,
        location: "Delhi, NCR"
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "upcoming": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-gray-100 text-gray-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "upcoming": return <Clock className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, send message to host
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Experience</h1>
          <p className="text-neutral-600">Manage your bookings and favorites</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">{mockBookings.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Favorites</p>
              <p className="text-2xl font-bold text-neutral-900">{mockFavorites.length}</p>
            </div>
            <Heart className="w-8 h-8 text-red-600" />
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Spent</p>
              <p className="text-2xl font-bold text-neutral-900">₹{mockBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Average Rating</p>
              <p className="text-2xl font-bold text-neutral-900">4.5</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </AirbnbCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">All Bookings</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Sort</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <AirbnbCard key={booking.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-neutral-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{booking.studio.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.studio.location}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      {booking.specialRequests && (
                        <p className="text-sm text-neutral-600 mt-2">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </div>
                    </Badge>
                    <p className="text-lg font-bold mt-2">₹{booking.amount}</p>
                    {booking.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{booking.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message Host
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Receipt className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>

                {booking.review && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">Your Review</span>
                    </div>
                    <p className="text-sm text-neutral-700">{booking.review}</p>
                  </div>
                )}
              </AirbnbCard>
            ))}
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Favorite Studios</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFavorites.map((favorite) => (
              <AirbnbCard key={favorite.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-neutral-600" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </Button>
                </div>
                
                <h4 className="font-semibold text-neutral-900 mb-2">{favorite.studio.name}</h4>
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{favorite.studio.location}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{favorite.studio.rating}</span>
                  </div>
                  <span className="font-bold">₹{favorite.studio.price}/hour</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Book Now
                  </Button>
                </div>
              </AirbnbCard>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Host List */}
            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Hosts</h3>
              <div className="space-y-3">
                {mockBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBooking?.id === booking.id ? 'bg-airbnb-primary/10' : 'hover:bg-neutral-50'
                    }`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={booking.studio.host.avatar} />
                      <AvatarFallback>{booking.studio.host.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{booking.studio.host.name}</p>
                      <p className="text-sm text-neutral-600">{booking.studio.name}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </AirbnbCard>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              <AirbnbCard className="p-6 h-96 flex flex-col">
                {selectedBooking ? (
                  <>
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedBooking.studio.host.avatar} />
                        <AvatarFallback>{selectedBooking.studio.host.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{selectedBooking.studio.host.name}</h4>
                        <p className="text-sm text-neutral-600">{selectedBooking.studio.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      <div className="flex justify-end">
                        <div className="bg-airbnb-primary text-white p-3 rounded-lg max-w-xs">
                          <p className="text-sm">Hi! I have a question about the studio setup.</p>
                          <p className="text-xs opacity-75 mt-1">2:30 PM</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-neutral-100 p-3 rounded-lg max-w-xs">
                          <p className="text-sm">Hello! Sure, what would you like to know?</p>
                          <p className="text-xs text-neutral-500 mt-1">2:32 PM</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        rows={2}
                      />
                      <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                        Send
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                      <p>Select a host to start messaging</p>
                    </div>
                  </div>
                )}
              </AirbnbCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuestExperience; 