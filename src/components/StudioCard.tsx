
import { Heart, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Studio {
  id: number;
  title: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  tags: string[];
  amenities: string[];
}

interface StudioCardProps {
  studio: Studio;
}

const StudioCard = ({ studio }: StudioCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/studio/${studio.id}`);
  };

  const handleCardClick = () => {
    navigate(`/studio/${studio.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
      <div className="relative" onClick={handleCardClick}>
        <img
          src={studio.image}
          alt={studio.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite functionality here
          }}
        >
          <Heart className="w-4 h-4" />
        </Button>
        <div className="absolute top-3 left-3 flex gap-1">
          {studio.tags.map((tag) => (
            <Badge
              key={tag}
              variant={tag === "Hot Selling" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-2 group-hover:text-orange-500 transition-colors">
          {studio.title}
        </h3>
        
        <div className="flex items-center text-sm text-slate-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {studio.location}
        </div>
        
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium ml-1">{studio.rating}</span>
          <span className="text-sm text-slate-500 ml-1">({studio.reviewCount} reviews)</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {studio.amenities.slice(0, 2).map((amenity, index) => (
            <span
              key={index}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
          {studio.amenities.length > 2 && (
            <span className="text-xs text-slate-500">
              +{studio.amenities.length - 2} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-slate-800">{studio.price}</span>
          </div>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudioCard;
