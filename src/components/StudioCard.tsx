
import { Heart, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import type { Studio } from "@/types/studio";

const STUDIO_TAGS = [
  { value: 'hot-selling', label: 'Hot Selling', color: 'bg-red-100 text-red-800' },
  { value: 'featured', label: 'Featured', color: 'bg-blue-100 text-blue-800' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'popular', label: 'Popular', color: 'bg-orange-100 text-orange-800' },
];

// Studio interface moved to shared types file

interface StudioCardProps {
  studio: Studio;
}

const StudioCard = ({ studio }: StudioCardProps) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some((fav) => fav.id === studio.id);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/studio/${studio.id}`);
  };

  const handleCardClick = () => {
    navigate(`/studio/${studio.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
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
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer border border-neutral-200 shadow-sm bg-white rounded-xl sm:rounded-2xl">
      <div className="relative" onClick={handleCardClick}>
        <div className="aspect-[3/2] sm:aspect-[4/3] w-full max-h-[120px] sm:max-h-none">
          <img
            src={displayImage}
            alt={studio.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 shadow-sm"
          onClick={handleFavoriteClick}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-brand text-brand" : "text-neutral-600"}`} />
        </Button>
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
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
      
      <CardContent className="p-1.5 sm:p-3 md:p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-xs sm:text-sm md:text-base text-neutral-900 line-clamp-1 leading-tight flex-1 mr-1 sm:mr-2">
            {studio.title}
          </h3>
          <div className="flex items-center flex-shrink-0">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current mr-0.5 sm:mr-1" />
            <span className="text-xs sm:text-sm font-medium text-neutral-800">{studio.rating || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs sm:text-sm text-neutral-600 mb-1 sm:mb-2">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 text-neutral-400" />
          <span className="line-clamp-1">{locationDisplay}</span>
        </div>
        
        <div className="flex items-center justify-between mt-1.5 sm:mt-3">
          <div className="flex items-baseline">
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-neutral-900">₹{studio.price_per_hour}</span>
          <span className="text-xs text-neutral-500 ml-1">per hour</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-2 sm:px-3 py-1 h-7 sm:h-8 hover:bg-neutral-50 border-neutral-300"
            onClick={handleViewDetails}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudioCard;
