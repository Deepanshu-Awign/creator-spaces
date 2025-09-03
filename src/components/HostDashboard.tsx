import { useState } from "react";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  TrendingUp, 
  Settings, 
  Camera, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HostDashboardProps {
  host?: any;
  studios?: any[];
  bookings?: any[];
  analytics?: any;
}

const HostDashboard = ({ host, studios = [], bookings = [], analytics }: HostDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const mockAnalytics = {
    totalRevenue: 45000,
    monthlyRevenue: 8500,
    totalBookings: 127,
    averageRating: 4.8,
    occupancyRate: 78,
    responseRate: 98,
    responseTime: "1.2 hours"
  };

  const mockBookings = [
    {
      id: "1",
      guest: { name: "Sarah Johnson", avatar: null },
      studio: "Professional Photography Studio",
      date: "2024-01-15",
      time: "14:00-16:00",
      status: "confirmed",
      amount: 2400,
      rating: 5
    },
    {
      id: "2",
      guest: { name: "Mike Chen", avatar: null },
      studio: "Music Recording Studio",
      date: "2024-01-16",
      time: "10:00-12:00",
      status: "pending",
      amount: 1800,
      rating: null
    },
    {
      id: "3",
      guest: { name: "Emma Davis", avatar: null },
      studio: "Video Production Studio",
      date: "2024-01-17",
      time: "16:00-18:00",
      status: "completed",
      amount: 3200,
      rating: 4
    }
  ];

  const mockStudios = [
    {
      id: "1",
      name: "Professional Photography Studio",
      image: "/placeholder.svg",
      status: "active",
      bookings: 45,
      rating: 4.9,
      revenue: 18000
    },
    {
      id: "2",
      name: "Music Recording Studio",
      image: "/placeholder.svg",
      status: "active",
      bookings: 32,
      rating: 4.7,
      revenue: 12000
    },
    {
      id: "3",
      name: "Video Production Studio",
      image: "/placeholder.svg",
      status: "draft",
      bookings: 0,
      rating: 0,
      revenue: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStudioStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "draft": return "bg-gray-100 text-gray-700";
      case "inactive": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Host Dashboard</h1>
          <p className="text-neutral-600">Manage your studios and bookings</p>
        </div>
        <AirbnbButton className="gap-2">
          <Plus className="w-4 h-4" />
          Add Studio
        </AirbnbButton>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">₹{mockAnalytics.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">{mockAnalytics.totalBookings}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-blue-600 mt-2">+8% from last month</p>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Average Rating</p>
              <p className="text-2xl font-bold text-neutral-900">{mockAnalytics.averageRating}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-sm text-yellow-600 mt-2">Excellent reviews</p>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{mockAnalytics.occupancyRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-purple-600 mt-2">+5% from last month</p>
        </AirbnbCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="studios">My Studios</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <AirbnbCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Recent Bookings</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {mockBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={booking.guest.avatar} />
                        <AvatarFallback>{booking.guest.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-neutral-900">{booking.guest.name}</p>
                        <p className="text-sm text-neutral-600">{booking.studio}</p>
                        <p className="text-xs text-neutral-500">{booking.date} • {booking.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">₹{booking.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AirbnbCard>

            {/* Quick Stats */}
            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-600">Response Time</span>
                  </div>
                  <span className="font-medium">{mockAnalytics.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-600">Response Rate</span>
                  </div>
                  <span className="font-medium">{mockAnalytics.responseRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-600">Verified Host</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-600">Superhost Status</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">Superhost</Badge>
                </div>
              </div>
            </AirbnbCard>
          </div>
        </TabsContent>

        {/* Studios Tab */}
        <TabsContent value="studios" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">My Studios</h3>
            <AirbnbButton className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Studio
            </AirbnbButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStudios.map((studio) => (
              <AirbnbCard key={studio.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-neutral-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{studio.name}</h4>
                      <Badge className={getStudioStatusColor(studio.status)}>
                        {studio.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Bookings</span>
                    <span className="font-medium">{studio.bookings}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{studio.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Revenue</span>
                    <span className="font-medium">₹{studio.revenue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </AirbnbCard>
            ))}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">All Bookings</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <AirbnbCard key={booking.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={booking.guest.avatar} />
                      <AvatarFallback>{booking.guest.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{booking.guest.name}</h4>
                      <p className="text-sm text-neutral-600">{booking.studio}</p>
                      <p className="text-xs text-neutral-500">{booking.date} • {booking.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
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
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </AirbnbCard>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">This Month</span>
                  <span className="font-medium">₹{mockAnalytics.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Last Month</span>
                  <span className="font-medium">₹7,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Growth</span>
                  <span className="font-medium text-green-600">+18%</span>
                </div>
              </div>
            </AirbnbCard>

            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Average Booking Value</span>
                  <span className="font-medium">₹2,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Repeat Bookings</span>
                  <span className="font-medium">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Cancellation Rate</span>
                  <span className="font-medium text-red-600">4%</span>
                </div>
              </div>
            </AirbnbCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostDashboard; 