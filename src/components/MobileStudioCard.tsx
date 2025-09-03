
import { useState } from "react";
import { Heart, Star, MapPin, Share2, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useMobileLocation } from "@/hooks/useMobileLocation";
import { Share } from '@capacitor/share';
import type { Studio } from "@/types/studio";

// Studio interface moved to shared types file

interface MobileStudioCardProps {
  studio: Studio;
}

const MobileStudioCard = ({ studio }: MobileStudioCardProps) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { location, calculateDistance } = useMobileLocation();
  const [imageIndex, setImageIndex] = useState(0);
  
  const isFavorite = favorites.some((fav) => fav.id === studio.id);
  const displayImage = studio.images && studio.images.length > 0 
    ? studio.images[imageIndex] 
    : "/placeholder.svg";

  const distance = location && studio.latitude && studio.longitude
    ? calculateDistance(location.latitude, location.longitude, studio.latitude, studio.longitude)
    : null;

  const handleSwipeImage = (direction: 'left' | 'right') => {
    if (!studio.images || studio.images.length <= 1) return;
    
    if (direction === 'right' && imageIndex < studio.images.length - 1) {
      setImageIndex(imageIndex + 1);
    } else if (direction === 'left' && imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await Share.share({
        title: studio.title,
        text: `Check out ${studio.title} - ₹${studio.price_per_hour}/hr`,
        url: `${window.location.origin}/studio/${studio.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (studio.latitude && studio.longitude) {
      const url = `https://maps.google.com/?q=${studio.latitude},${studio.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 mb-4 touch-manipulation">
      <div 
        className="relative h-48 cursor-pointer"
        onClick={(e) => {
          // Prevent navigation if clicking on buttons
          const target = e.target as Element;
          if (target.closest('button')) {
            return;
          }
          navigate(`/studio/${studio.id}`);
        }}
        onTouchEnd={(e) => {
          // Prevent navigation if touching on buttons
          const target = e.target as Element;
          if (target.closest('button')) {
            return;
          }
          navigate(`/studio/${studio.id}`);
        }}
      >
        <img
          src={displayImage}
          alt={studio.title}
          className="w-full h-full object-cover pointer-events-none"
          onTouchStart={(e) => {
            const startX = e.touches[0].clientX;
            const handleTouchEnd = (endEvent: TouchEvent) => {
              const endX = endEvent.changedTouches[0].clientX;
              const diff = startX - endX;
              if (Math.abs(diff) > 50) {
                handleSwipeImage(diff > 0 ? 'right' : 'left');
              }
              document.removeEventListener('touchend', handleTouchEnd);
            };
            document.addEventListener('touchend', handleTouchEnd);
          }}
        />
        
        {/* Image indicators */}
        {studio.images && studio.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 pointer-events-none">
            {studio.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === imageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/80 hover:bg-white p-2 z-20 touch-manipulation"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(studio.id);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(studio.id);
            }}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/80 hover:bg-white p-2 z-20 touch-manipulation"
            onClick={handleShare}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare(e as any);
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Distance badge */}
        {distance && (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white pointer-events-none">
            {distance.toFixed(1)} km away
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-1">
          {studio.title}
        </h3>
        
        <div className="flex items-center text-sm text-slate-600 mb-2">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{studio.location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium ml-1">{studio.rating || 0}</span>
            <span className="text-sm text-slate-500 ml-1">({studio.total_reviews || 0})</span>
          </div>
          <span className="text-lg font-bold text-slate-800">₹{studio.price_per_hour}/hr</span>
        </div>

        {/* Mobile action buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate(`/studio/${studio.id}`)}
          >
            Book Now
          </Button>
          {studio.latitude && studio.longitude && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDirections}
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileStudioCard;
