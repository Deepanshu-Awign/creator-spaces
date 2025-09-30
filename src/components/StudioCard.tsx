
import { Heart, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import type { Studio } from "@/types/studio";
import { useRef } from "react";

const STUDIO_TAGS = [
  { value: 'hot-selling', label: 'Hot Selling', color: 'bg-red-100 text-red-800' },
  { value: 'featured', label: 'Featured', color: 'bg-blue-100 text-blue-800' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'popular', label: 'Popular', color: 'bg-orange-100 text-orange-800' },
];

interface StudioCardProps {
  studio: Studio;
}

const StudioCard = ({ studio }: StudioCardProps) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some((fav) => fav.id === studio.id);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastDragTouchTimeRef = useRef<number>(0);

  const handleCardClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent navigation if clicking on the favorite button
    const target = e.target as Element;
    if (target.closest('button')) {
      return;
    }
    // Prevent synthetic click right after a drag/swipe end
    const now = Date.now();
    if (now - lastDragTouchTimeRef.current < 300) {
      return;
    }
    navigate(`/studio/${studio.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(studio.id);
  };

  // Get the first image or use placeholder
  const displayImage = studio.images && studio.images.length > 0 
    ? studio.images[0] 
    : "/placeholder.svg";

  // Format location display
  const locationDisplay = studio.city && studio.state 
    ? `${studio.city}, ${studio.state}`
    : studio.location;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer border border-neutral-200 shadow-sm bg-white rounded-xl sm:rounded-2xl w-[200px] lg:w-[250px] transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
      onClick={handleCardClick}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStartX.current = t.clientX;
        touchStartY.current = t.clientY;
        isDraggingRef.current = false;
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        const dx = Math.abs(t.clientX - touchStartX.current);
        const dy = Math.abs(t.clientY - touchStartY.current);
        if (dx > 10 || dy > 10) {
          isDraggingRef.current = true;
        }
      }}
      onTouchEnd={(e) => {
        const target = e.target as Element;
        if (target.closest('button')) return;
        if (isDraggingRef.current) {
          lastDragTouchTimeRef.current = Date.now();
          return;
        }
        handleCardClick(e);
      }}
    >
      <div className="relative">
        <div className="w-full h-[140px] lg:h-[160px]">
          <img
            src={displayImage}
            alt={studio.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300 pointer-events-none"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 shadow-sm z-20 touch-manipulation"
          onClick={handleFavoriteClick}
          onTouchEnd={handleFavoriteClick}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-brand text-brand" : "text-neutral-600"}`} />
        </Button>
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 pointer-events-none">
          {studio.tags?.map((tagValue) => {
            const tag = STUDIO_TAGS.find(t => t.value === tagValue);
            return tag ? (
              <Badge key={tagValue} className="text-xs bg-white/90 text-neutral-800 border-none font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                {tag.label}
              </Badge>
            ) : null;
          })}
        </div>
      </div>
      
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-sm lg:text-base text-neutral-900 line-clamp-1 leading-tight flex-1 mr-2 group-hover:text-brand transition-colors">
            {studio.title}
          </h3>
          <div className="flex items-center flex-shrink-0">
            <Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm lg:text-base font-medium text-neutral-800">{studio.rating || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm lg:text-base text-neutral-600 mb-3">
          <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1 text-neutral-400" />
          <span className="line-clamp-1">{locationDisplay}</span>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline">
            <span className="text-base lg:text-lg font-semibold text-neutral-900">₹{studio.price_per_hour}</span>
            <span className="text-xs lg:text-sm text-neutral-500 ml-1">per hour</span>
          </div>
          <div className="text-xs lg:text-sm text-brand font-medium group-hover:scale-105 transition-transform">
            View Details →
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudioCard;
