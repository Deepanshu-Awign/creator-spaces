import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Studio } from "@/types/studio";
import { 
  Camera, 
  Mic, 
  Video, 
  Music, 
  Palette, 
  Users, 
  Settings,
  Building
} from "lucide-react";

const categoryIcons = {
  'photography': Camera,
  'recording': Mic,
  'videography': Video,
  'music': Music,
  'art': Palette,
  'event': Users,
  'general': Settings,
  'other': Building,
};

const categoryColors = {
  'photography': 'bg-blue-50 text-blue-600 border-blue-200',
  'recording': 'bg-purple-50 text-purple-600 border-purple-200',
  'videography': 'bg-red-50 text-red-600 border-red-200',
  'music': 'bg-green-50 text-green-600 border-green-200',
  'art': 'bg-orange-50 text-orange-600 border-orange-200',
  'event': 'bg-pink-50 text-pink-600 border-pink-200',
  'general': 'bg-gray-50 text-gray-600 border-gray-200',
  'other': 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

interface ImprovedCategoriesSectionProps {
  selectedCity?: string;
}

const ImprovedCategoriesSection = ({ selectedCity }: ImprovedCategoriesSectionProps) => {
  const navigate = useNavigate();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['studio-categories', selectedCity],
    queryFn: async () => {
      try {
        let query = supabase
          .from('studios')
          .select('category')
          .eq('is_active', true);
        
        if (selectedCity) {
          query = query.eq('city', selectedCity);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Count studios by category
        const categoryCount: { [key: string]: number } = {};
        (data as unknown as Studio[])?.forEach(studio => {
          if (studio.category) {
            categoryCount[studio.category] = (categoryCount[studio.category] || 0) + 1;
          }
        });
        
        // Convert to array format and filter out categories with 0 studios
        return Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .filter(item => item.count > 0)
          .sort((a, b) => b.count - a.count);
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
  });

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams();
    if (selectedCity) {
      params.set('city', selectedCity);
    }
    params.set('category', category);
    navigate(`/studios?${params.toString()}`);
  };

  if (isLoading || categories.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Browse by Category
          {selectedCity && (
            <span className="block text-lg font-normal text-neutral-600 mt-2">
              in {selectedCity}
            </span>
          )}
        </h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Find the perfect studio space for your creative needs
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map(({ category, count }) => {
          const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Building;
          const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.other;
          
          return (
            <Card 
              key={category} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-neutral-200 hover:border-neutral-300 overflow-hidden"
              onClick={() => handleCategoryClick(category)}
            >
              <CardContent className="p-4 md:p-6 text-center">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${colorClass} flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1 text-sm md:text-base capitalize">
                  {category.replace('_', ' ')}
                </h3>
                <p className="text-xs md:text-sm text-neutral-600">
                  {count} studio{count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default ImprovedCategoriesSection;