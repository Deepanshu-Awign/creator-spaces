
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBookingSlots = (studioId: string, selectedDate: string) => {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studioId && selectedDate) {
      fetchBookedSlots();
    }
  }, [studioId, selectedDate]);

  const fetchBookedSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, duration_hours')
        .eq('studio_id', studioId)
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;

      // Convert booked slots to time strings
      const slots: string[] = [];
      data?.forEach(booking => {
        const startTime = booking.start_time;
        const duration = booking.duration_hours;
        
        // Add all hours that are booked
        for (let i = 0; i < duration; i++) {
          const [hours, minutes] = startTime.split(':');
          const bookedHour = parseInt(hours) + i;
          if (bookedHour < 24) {
            slots.push(`${bookedHour.toString().padStart(2, '0')}:${minutes}`);
          }
        }
      });

      setBookedSlots(slots);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  return { bookedSlots, loading, refetch: fetchBookedSlots };
};
