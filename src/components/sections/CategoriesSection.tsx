import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Camera, Video, Music, Headphones, Monitor, Palette, Users, Building, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const categoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'podcast': Mic,
  'photography': Camera,
  'video': Video,
  'videography': Video,
  'music': Music,
  'recording': Music,
  'voiceover': Headphones,
  'streaming': Monitor,
  'live streaming': Monitor,
  'art': Palette,
  'event': Users,
  'general': Settings,
  'other': Building,
};

const categoryColors: { [key: string]: string } = {
  'podcast': 'from-blue-500 to-blue-600',
  'photography': 'from-purple-500 to-purple-600',
  'video': 'from-red-500 to-red-600',
  'videography': 'from-red-500 to-red-600',
  'music': 'from-green-500 to-green-600',
  'recording': 'from-green-500 to-green-600',
  'voiceover': 'from-yellow-500 to-yellow-600',
  'streaming': 'from-indigo-500 to-indigo-600',
  'live streaming': 'from-indigo-500 to-indigo-600',
  'art': 'from-orange-500 to-orange-600',
  'event': 'from-pink-500 to-pink-600',
  'general': 'from-gray-500 to-gray-600',
  'other': 'from-gray-500 to-gray-600',
};

const CategoriesSection = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['studio-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('studios')
          .select('category')
          .eq('is_active', true);
        
        if (error) throw error;
        
        // Count studios by category
        const categoryCount: { [key: string]: number } = {};
        data?.forEach(studio => {
          if (studio.category) {
            categoryCount[studio.category] = (categoryCount[studio.category] || 0) + 1;
          }
        });
        
        // Convert to array format and filter out categories with 0 studios
        return Object.entries(categoryCount)
          .map(([category, count]) => ({ 
            category, 
            count,
            icon: categoryIcons[category.toLowerCase()] || Building,
            color: categoryColors[category.toLowerCase()] || categoryColors.other,
            title: category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1'),
            description: getDescription(category),
            link: `/studios?category=${encodeURIComponent(category)}`
          }))
          .filter(item => item.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Show top 6 categories
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
  });

  const getDescription = (category: string): string => {
    const descriptions: { [key: string]: string } = {
      'podcast': 'Professional audio recording spaces',
      'photography': 'Perfect lighting and backdrops', 
      'videography': 'Cinema-quality video studios',
      'video': 'Cinema-quality video studios',
      'music': 'Acoustic-perfect music studios',
      'recording': 'Professional recording studios',
      'voiceover': 'Soundproof voice recording',
      'streaming': 'Professional streaming setups',
      'live_streaming': 'Professional streaming setups',
      'art': 'Creative art and design spaces',
      'event': 'Versatile event hosting spaces',
      'general': 'Multi-purpose creative spaces',
      'other': 'Unique creative spaces',
    };
    return descriptions[category.toLowerCase()] || 'Professional creative spaces';
  };

  if (isLoading || categories.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect studio for your creative needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link key={index} to={category.link} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border-0 shadow-elegant">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${category.color} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          {category.count} studio{category.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="text-white/90 text-sm">{category.description}</p>
                    </div>
                    <div className="p-4">
                      <span className="text-sm text-primary font-medium group-hover:text-primary-hover transition-colors">
                        Explore Studios →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;