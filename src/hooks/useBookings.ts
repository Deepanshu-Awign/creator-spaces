
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          duration_hours,
          total_price,
          status,
          studios (
            id,
            title,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      const formattedBookings = data?.map(booking => ({
        id: booking.id,
        studio: booking.studios?.title || 'Unknown Studio',
        date: booking.booking_date,
        time: booking.start_time,
        duration: `${booking.duration_hours} hour${booking.duration_hours > 1 ? 's' : ''}`,
        status: booking.status,
        price: `₹${booking.total_price?.toLocaleString()}`,
        image: booking.studios?.images?.[0] || "/placeholder.svg",
        canReview: booking.status === 'completed'
      })) || [];

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bookings."
      });
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    studioId: string;
    date: string;
    startTime: string;
    duration: number;
    guestCount: number;
    totalPrice: number;
    specialRequests?: string;
  }) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to make a booking."
      });
      return null;
    }

    try {
      // Check for existing booking conflict
      const { data: existing, error: conflictError } = await supabase
        .from('bookings')
        .select('id')
        .eq('studio_id', bookingData.studioId)
        .eq('booking_date', bookingData.date)
        .eq('start_time', bookingData.startTime)
        .single();
      
      if (existing) {
        throw new Error("This time slot is already booked. Please choose another.");
      }
      
      if (conflictError && conflictError.code !== 'PGRST116') {
        throw new Error("Error checking availability. Please try again.");
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          studio_id: bookingData.studioId,
          booking_date: bookingData.date,
          start_time: bookingData.startTime,
          duration_hours: bookingData.duration,
          guest_count: bookingData.guestCount,
          total_price: bookingData.totalPrice,
          special_requests: bookingData.specialRequests,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking created successfully!",
        description: "Your booking request has been submitted."
      });

      await fetchBookings();
      return data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    loading,
    createBooking,
    refetch: fetchBookings
  };
};
