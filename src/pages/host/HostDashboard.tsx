import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Star,
  Eye,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react';
import Navigation from '@/components/Navigation';

const HostDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock data - in real app, this would come from API
  const stats = {
    totalStudios: 3,
    totalBookings: 28,
    totalRevenue: 45600,
    averageRating: 4.8,
    pendingBookings: 5,
    thisMonthBookings: 12,
    viewsThisMonth: 324,
    occupancyRate: 75
  };

  const recentBookings = [
    {
      id: 1,
      studioName: 'Professional Podcast Studio',
      guestName: 'Rahul Sharma',
      date: '2024-01-15',
      time: '14:00 - 17:00',
      status: 'confirmed',
      amount: 2400
    },
    {
      id: 2,
      studioName: 'Photography Studio Pro',
      guestName: 'Priya Patel',
      date: '2024-01-16',
      time: '10:00 - 14:00',
      status: 'pending',
      amount: 3200
    },
    {
      id: 3,
      studioName: 'Video Production Suite',
      guestName: 'Vikram Singh',
      date: '2024-01-18',
      time: '09:00 - 18:00',
      status: 'confirmed',
      amount: 7200
    }
  ];

  const studios = [
    {
      id: 1,
      name: 'Professional Podcast Studio',
      status: 'active',
      bookings: 12,
      rating: 4.9,
      revenue: 18600,
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=300&h=200'
    },
    {
      id: 2,
      name: 'Photography Studio Pro',
      status: 'active',
      bookings: 9,
      rating: 4.7,
      revenue: 15200,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&h=200'
    },
    {
      id: 3,
      name: 'Video Production Suite',
      status: 'active',
      bookings: 7,
      rating: 4.8,
      revenue: 11800,
      image: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?auto=format&fit=crop&w=300&h=200'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'Host'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your studios and track your performance
              </p>
            </div>
            <Button className="mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Add New Studio
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Studios</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalStudios}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month's Revenue</p>
                    <p className="text-2xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold text-foreground">{stats.averageRating}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-foreground">{stats.occupancyRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="studios">Studios</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{booking.studioName}</h4>
                            <p className="text-sm text-muted-foreground">{booking.guestName}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.date} • {booking.time}
                            </p>
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
                    <Button variant="outline" className="w-full mt-4">
                      View All Bookings
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Bookings</span>
                      <span className="font-medium">{stats.thisMonthBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profile Views</span>
                      <span className="font-medium">{stats.viewsThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Requests</span>
                      <Badge variant="secondary">{stats.pendingBookings}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{booking.studioName}</h4>
                          <p className="text-sm text-muted-foreground">{booking.guestName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.date} • {booking.time}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <p className="font-medium">₹{booking.amount}</p>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">View</Button>
                            {booking.status === 'pending' && (
                              <Button size="sm">Approve</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="studios" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                  <Card key={studio.id}>
                    <CardContent className="p-0">
                      <img
                        src={studio.image}
                        alt={studio.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-4">
                        <h3 className="font-medium mb-2">{studio.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Bookings this month:</span>
                            <span className="font-medium">{studio.bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rating:</span>
                            <span className="font-medium flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              {studio.rating}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium text-green-600">₹{studio.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="flex-1">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Revenue chart would go here
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Booking chart would go here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;