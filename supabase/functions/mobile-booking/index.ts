
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface BookingRequest {
  studioId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  durationHours: number;
  guestCount: number;
  specialRequests?: string;
  paymentId?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      // Create booking
      const bookingData: BookingRequest = await req.json();
      
      // Verify studio exists and get pricing
      const { data: studio, error: studioError } = await supabase
        .from('studios')
        .select('id, price_per_hour, is_active')
        .eq('id', bookingData.studioId)
        .single();

      if (studioError || !studio || !studio.is_active) {
        return new Response(
          JSON.stringify({ error: 'Studio not found or inactive' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Check availability
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('studio_id', bookingData.studioId)
        .eq('booking_date', bookingData.bookingDate)
        .eq('start_time', bookingData.startTime)
        .in('status', ['pending', 'confirmed']);

      if (existingBookings && existingBookings.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Time slot not available' }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Calculate total price
      const totalPrice = studio.price_per_hour * bookingData.durationHours;

      // Create booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: bookingData.userId,
          studio_id: bookingData.studioId,
          booking_date: bookingData.bookingDate,
          start_time: bookingData.startTime,
          duration_hours: bookingData.durationHours,
          guest_count: bookingData.guestCount,
          total_price: totalPrice,
          special_requests: bookingData.specialRequests,
          payment_id: bookingData.paymentId,
          status: 'pending',
          payment_status: 'pending'
        })
        .select(`
          *,
          studios!inner(
            id,
            title,
            location,
            images,
            profiles!studios_host_id_fkey(
              full_name,
              phone
            )
          )
        `)
        .single();

      if (bookingError) throw bookingError;

      return new Response(
        JSON.stringify({ booking: newBooking }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } else if (req.method === 'GET') {
      // Get user bookings
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const status = url.searchParams.get('status');

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      let query = supabase
        .from('bookings')
        .select(`
          *,
          studios!inner(
            id,
            title,
            location,
            images,
            profiles!studios_host_id_fkey(
              full_name,
              phone
            )
          )
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: bookings, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ bookings }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in mobile-booking function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
