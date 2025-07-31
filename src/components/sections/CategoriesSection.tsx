import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Camera, Video, Music, Headphones, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    icon: <Mic className="w-8 h-8" />,
    title: 'Podcast Studios',
    description: 'Professional audio recording spaces',
    count: '120+ Studios',
    color: 'from-blue-500 to-blue-600',
    link: '/studios?category=podcast'
  },
  {
    icon: <Camera className="w-8 h-8" />,
    title: 'Photography',
    description: 'Perfect lighting and backdrops',
    count: '85+ Studios',
    color: 'from-purple-500 to-purple-600',
    link: '/studios?category=photography'
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: 'Video Production',
    description: 'Cinema-quality video studios',
    count: '95+ Studios',
    color: 'from-red-500 to-red-600',
    link: '/studios?category=video'
  },
  {
    icon: <Music className="w-8 h-8" />,
    title: 'Music Recording',
    description: 'Acoustic-perfect music studios',
    count: '70+ Studios',
    color: 'from-green-500 to-green-600',
    link: '/studios?category=music'
  },
  {
    icon: <Headphones className="w-8 h-8" />,
    title: 'Voice Over',
    description: 'Soundproof voice recording',
    count: '60+ Studios',
    color: 'from-yellow-500 to-yellow-600',
    link: '/studios?category=voiceover'
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    title: 'Live Streaming',
    description: 'Professional streaming setups',
    count: '45+ Studios',
    color: 'from-indigo-500 to-indigo-600',
    link: '/studios?category=streaming'
  }
];

const CategoriesSection = () => {
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
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border-0 shadow-elegant">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${category.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        {category.icon}
                      </div>
                      <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        {category.count}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;