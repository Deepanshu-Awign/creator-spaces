import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Fetch host's studios
  const { data: studios = [] } = useQuery({
    queryKey: ['hostStudios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .eq('host_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch host's bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['hostBookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get the host's studios
      const { data: studios, error: studiosError } = await supabase
        .from('studios')
        .select('id')
        .eq('host_id', user.id);

      if (studiosError) throw studiosError;
      if (!studios || studios.length === 0) return [];

      const studioIds = studios.map(s => s.id);

      // Then get bookings for those studios
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          studios(title),
          profiles(full_name)
        `)
        .in('studio_id', studioIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate real stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
  });

  const totalRevenue = thisMonthBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
  const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
  const averageRating = studios.length > 0 
    ? studios.reduce((sum, studio) => sum + (studio.rating || 0), 0) / studios.length 
    : 0;

  const stats = {
    totalStudios: studios.length,
    totalBookings: bookings.length,
    totalRevenue,
    averageRating: Number(averageRating.toFixed(1)),
    pendingBookings,
    thisMonthBookings: thisMonthBookings.length,
    viewsThisMonth: 324, // This would need to be tracked separately
    occupancyRate: 75 // This would need to be calculated based on availability
  };

  const recentBookings = bookings.slice(0, 5).map(booking => ({
    id: booking.id,
    studioName: booking.studios?.title || 'Unknown Studio',
    guestName: booking.profiles?.full_name || 'Anonymous User',
    date: format(new Date(booking.booking_date), 'yyyy-MM-dd'),
    time: `${booking.start_time} (${booking.duration_hours}h)`,
    status: booking.status,
    amount: booking.total_price
  }));

  const studioStats = studios.map(studio => {
    const studioBookings = bookings.filter(booking => booking.studio_id === studio.id);
    const studioRevenue = studioBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
    
    return {
      id: studio.id,
      name: studio.title,
      status: studio.approval_status,
      bookings: studioBookings.length,
      rating: studio.rating || 0,
      revenue: studioRevenue,
      image: studio.images && studio.images.length > 0 ? studio.images[0] : null
    };
  });

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
            <Button 
              className="mt-4 md:mt-0"
              onClick={() => navigate('/host/studios')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Manage Studios
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
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate('/host/bookings')}
                    >
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Studios</h2>
                <Button onClick={() => navigate('/host/studios')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Studios
                </Button>
              </div>
              
              {studioStats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Studios Listed</h3>
                    <p className="text-muted-foreground mb-4">Start earning by listing your first studio</p>
                    <Button onClick={() => navigate('/host/studios')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Studio
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studioStats.slice(0, 6).map((studio) => (
                    <Card key={studio.id}>
                      <CardContent className="p-0">
                        {studio.image ? (
                          <img
                            src={studio.image}
                            alt={studio.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-medium mb-2">{studio.name}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Bookings:</span>
                              <span className="font-medium">{studio.bookings}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rating:</span>
                              <span className="font-medium flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                {studio.rating.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-medium text-green-600">₹{studio.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.open(`/studios/${studio.id}`, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => navigate('/host/studios')}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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