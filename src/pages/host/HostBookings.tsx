import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, DollarSign, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';

const HostBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Fetch host's bookings using correct table names
  const { data: bookings = [], isLoading } = useQuery({
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
          studios(title, location, price_per_hour),
          profiles(full_name, email, phone)
        `)
        .in('studio_id', studioIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostBookings'] });
      toast({ title: "Booking status updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating booking", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading bookings...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Bookings Management
              </h1>
              <p className="text-muted-foreground">
                Manage booking requests for your studios
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                onClick={() => setFilter(tab.key as any)}
                size="sm"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No bookings found
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'You haven\'t received any bookings yet' 
                    : `No ${filter} bookings found`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">
                              {booking.studios?.title || 'Unknown Studio'}
                            </h3>
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {booking.studios?.location || 'Location not specified'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{booking.profiles?.full_name || 'Anonymous User'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{format(new Date(booking.booking_date), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.start_time} ({booking.duration_hours}h)</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">₹{booking.total_price?.toLocaleString()}</span>
                            </div>
                            {booking.guest_count && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{booking.guest_count} guests</span>
                              </div>
                            )}
                            {booking.special_requests && (
                              <div className="text-xs">
                                <p className="font-medium text-muted-foreground">Special Requests:</p>
                                <p className="mt-1">{booking.special_requests}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingMutation.mutate({ 
                                bookingId: booking.id, 
                                status: 'confirmed' 
                              })}
                              disabled={updateBookingMutation.isPending}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingMutation.mutate({ 
                                bookingId: booking.id, 
                                status: 'cancelled' 
                              })}
                              disabled={updateBookingMutation.isPending}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingMutation.mutate({ 
                              bookingId: booking.id, 
                              status: 'completed' 
                            })}
                            disabled={updateBookingMutation.isPending}
                          >
                            Mark Complete
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/booking/${booking.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostBookings;