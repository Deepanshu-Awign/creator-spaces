
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

interface ProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (req.method === 'GET') {
      // Get profile with stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get booking stats
      const { data: bookingStats } = await supabase
        .from('bookings')
        .select('status')
        .eq('user_id', userId);

      const stats = {
        totalBookings: bookingStats?.length || 0,
        completedBookings: bookingStats?.filter(b => b.status === 'completed').length || 0,
        pendingBookings: bookingStats?.filter(b => b.status === 'pending').length || 0,
        cancelledBookings: bookingStats?.filter(b => b.status === 'cancelled').length || 0
      };

      // Get favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({
          profile,
          stats,
          favoritesCount: favoritesCount || 0
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } else if (req.method === 'PUT') {
      // Update profile
      const updateData: ProfileUpdateRequest = await req.json();

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          full_name: updateData.fullName,
          phone: updateData.phone,
          location: updateData.location,
          avatar_url: updateData.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ profile: updatedProfile }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in mobile-profile function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
