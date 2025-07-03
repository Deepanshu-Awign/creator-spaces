
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

interface StudioSearchParams {
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'distance';
  page?: number;
  limit?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams: StudioSearchParams = {
      city: url.searchParams.get('city') || undefined,
      latitude: url.searchParams.get('latitude') ? parseFloat(url.searchParams.get('latitude')!) : undefined,
      longitude: url.searchParams.get('longitude') ? parseFloat(url.searchParams.get('longitude')!) : undefined,
      radius: url.searchParams.get('radius') ? parseFloat(url.searchParams.get('radius')!) : 10,
      minPrice: url.searchParams.get('minPrice') ? parseInt(url.searchParams.get('minPrice')!) : undefined,
      maxPrice: url.searchParams.get('maxPrice') ? parseInt(url.searchParams.get('maxPrice')!) : undefined,
      amenities: url.searchParams.get('amenities')?.split(',') || [],
      sortBy: (url.searchParams.get('sortBy') as 'price' | 'rating' | 'distance') || 'rating',
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20')
    };

    let query = supabase
      .from('studios')
      .select(`
        id,
        title,
        description,
        location,
        city,
        state,
        country,
        latitude,
        longitude,
        price_per_hour,
        rating,
        total_reviews,
        images,
        amenities,
        tags,
        is_active,
        created_at,
        profiles!studios_host_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .eq('approval_status', 'approved');

    // Apply filters
    if (searchParams.city) {
      query = query.ilike('city', `%${searchParams.city}%`);
    }

    if (searchParams.minPrice) {
      query = query.gte('price_per_hour', searchParams.minPrice);
    }

    if (searchParams.maxPrice) {
      query = query.lte('price_per_hour', searchParams.maxPrice);
    }

    if (searchParams.amenities.length > 0) {
      query = query.overlaps('amenities', searchParams.amenities);
    }

    // Apply sorting
    switch (searchParams.sortBy) {
      case 'price':
        query = query.order('price_per_hour', { ascending: true });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('rating', { ascending: false });
    }

    // Apply pagination
    const from = (searchParams.page! - 1) * searchParams.limit!;
    const to = from + searchParams.limit! - 1;
    query = query.range(from, to);

    const { data: studios, error, count } = await query;

    if (error) throw error;

    // Calculate distance if coordinates provided
    let studiosWithDistance = studios;
    if (searchParams.latitude && searchParams.longitude) {
      studiosWithDistance = studios?.map(studio => {
        if (studio.latitude && studio.longitude) {
          const distance = calculateDistance(
            searchParams.latitude!,
            searchParams.longitude!,
            studio.latitude,
            studio.longitude
          );
          return { ...studio, distance };
        }
        return { ...studio, distance: null };
      }) || [];

      // Filter by radius if specified
      if (searchParams.radius) {
        studiosWithDistance = studiosWithDistance.filter(studio => 
          !studio.distance || studio.distance <= searchParams.radius!
        );
      }

      // Sort by distance if requested
      if (searchParams.sortBy === 'distance') {
        studiosWithDistance.sort((a, b) => 
          (a.distance || Infinity) - (b.distance || Infinity)
        );
      }
    }

    return new Response(
      JSON.stringify({
        studios: studiosWithDistance,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: count,
          hasMore: count ? from + searchParams.limit! < count : false
        }
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in mobile-studios function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
