
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

const Favorites = () => {
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleStudioClick = (studioId: string) => {
    navigate(`/studio/${studioId}`);
  };

  const handleBookNow = (studioId: string) => {
    navigate(`/studio/${studioId}`);
  };

  const handleRemoveFavorite = async (studioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeFavorite(studioId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Favorite Studios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="text-center py-8">Loading favorites...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No favorite studios yet. Browse studios and add them to your favorites!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map((studio) => (
                    <div 
                      key={studio.id} 
                      className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleStudioClick(studio.id)}
                    >
                      <img
                        src={studio.image}
                        alt={studio.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-800 mb-2">{studio.title}</h3>
                        <div className="flex items-center text-sm text-slate-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {studio.location}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium">{studio.rating}</span>
                            <span className="text-sm text-slate-500 ml-1">({studio.reviewCount} reviews)</span>
                          </div>
                          <span className="font-semibold text-slate-800">{studio.price}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookNow(studio.id);
                            }}
                          >
                            Book Now
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => handleRemoveFavorite(studio.id, e)}
                          >
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
