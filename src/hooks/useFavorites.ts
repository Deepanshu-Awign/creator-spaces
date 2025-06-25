
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          studio_id,
          studios (
            id,
            title,
            location,
            price_per_hour,
            rating,
            total_reviews,
            images
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedFavorites = data?.map(fav => ({
        id: fav.studios?.id,
        title: fav.studios?.title,
        location: fav.studios?.location,
        price: `₹${fav.studios?.price_per_hour?.toLocaleString()}/hour`,
        rating: fav.studios?.rating || 0,
        reviewCount: fav.studios?.total_reviews || 0,
        image: fav.studios?.images?.[0] || "/placeholder.svg",
        favoriteId: fav.id
      })) || [];

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load favorite studios."
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (studioId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to manage favorites."
      });
      return;
    }

    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('studio_id', studioId)
        .single();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;

        setFavorites(prev => prev.filter(fav => fav.id !== studioId));
        toast({
          title: "Removed from favorites",
          description: "Studio removed from your favorites."
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            studio_id: studioId
          });

        if (error) throw error;

        toast({
          title: "Added to favorites",
          description: "Studio added to your favorites."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites."
      });
    }
  };

  const removeFavorite = async (studioId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('studio_id', studioId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== studioId));
      toast({
        title: "Removed from favorites",
        description: "Studio removed from your favorites."
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from favorites."
      });
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    toggleFavorite,
    removeFavorite,
    refetch: fetchFavorites
  };
};
