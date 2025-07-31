
import { Heart, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";

const STUDIO_TAGS = [
  { value: 'hot-selling', label: 'Hot Selling', color: 'bg-red-100 text-red-800' },
  { value: 'featured', label: 'Featured', color: 'bg-blue-100 text-blue-800' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'popular', label: 'Popular', color: 'bg-orange-100 text-orange-800' },
];

interface Studio {
  id: string;
  title: string;
  location: string;
  city?: string;
  state?: string;
  price_per_hour: number;
  rating?: number;
  total_reviews?: number;
  images?: string[];
  amenities?: string[];
  description?: string;
  tags?: string[];
  profiles?: {
    full_name: string;
    email: string;
  };
}

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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white rounded-xl">
      <div className="relative" onClick={handleCardClick}>
        <img
          src={displayImage}
          alt={studio.title}
          className="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full w-8 h-8 p-0 shadow-sm"
          onClick={handleFavoriteClick}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-brand text-brand" : "text-neutral-600"}`} />
        </Button>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {studio.tags?.map((tagValue) => {
            const tag = STUDIO_TAGS.find(t => t.value === tagValue);
            return tag ? (
              <Badge key={tagValue} className="text-xs bg-white/90 text-neutral-800 border-none font-medium px-2 py-1 rounded-full shadow-sm">
                {tag.label}
              </Badge>
            ) : null;
          })}
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-neutral-800 group-hover:text-neutral-900 transition-colors leading-tight">
            {studio.title}
          </h3>
        </div>
        
        <div className="flex items-center text-sm text-neutral-600 mb-2">
          <MapPin className="w-4 h-4 mr-1.5 text-neutral-400" />
          <span className="font-medium">{locationDisplay}</span>
        </div>
        
        <div className="flex items-center mb-4">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span className="text-sm font-semibold text-neutral-800">{studio.rating || 0}</span>
          <span className="text-sm text-neutral-500 ml-1">({studio.total_reviews || 0})</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {studio.amenities?.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full font-medium"
            >
              {amenity}
            </span>
          ))}
          {studio.amenities && studio.amenities.length > 3 && (
            <span className="text-xs text-neutral-500 px-2.5 py-1">
              +{studio.amenities.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-neutral-900">₹{studio.price_per_hour}</span>
            <span className="text-sm text-neutral-500">per hour</span>
          </div>
          <Button
            size="sm"
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudioCard;
