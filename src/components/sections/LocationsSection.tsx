import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const popularLocations = [
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    image: 'https://images.memphistours.com/xlarge/1014015423_Mumbai.jpg',
    description: 'Bollywood capital with premium studios'
  },
  {
    city: 'Delhi',
    state: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&h=400',
    description: 'Political center with diverse creative spaces'
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    image: 'https://www.redefine.co/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F3sjsytt3tkv5%2F46bboLK0kJZZz0vkNTlfva%2F9bcf0bd693c960ee5f36ffc5de842e40%2FAdobeStock_341950409.jpeg&w=3840&q=75',
    description: 'Tech hub with modern recording facilities'
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&h=400',
    description: 'South Indian film industry headquarters'
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    image: 'https://www.adanirealty.com/-/media/Project/Realty/Blogs/images/Next-Sought-after-Location-in-Pune.png',
    description: 'Growing creative community'
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    image: 'https://c.ndtvimg.com/2025-03/7ndi40jo_hyderabad-_625x300_11_March_25.jpg',
    description: 'Emerging tech and media destination'
  }
];

const LocationsSection = () => {
  const [locationCounts, setLocationCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationCounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('studios')
          .select('city')
          .eq('is_active', true)
          .not('city', 'is', null);

        if (error) throw error;

        // Count studios by city
        const counts: {[key: string]: number} = {};
        data?.forEach(studio => {
          if (studio.city) {
            const cleanCity = studio.city.replace(/\s+division$/i, '').trim();
            counts[cleanCity] = (counts[cleanCity] || 0) + 1;
          }
        });

        setLocationCounts(counts);
      } catch (error) {
        console.error('Error fetching location counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationCounts();
  }, []);

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing studios in India's creative capitals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularLocations.map((location, index) => {
            const studioCount = locationCounts[location.city] || 0;
            return (
              <Link 
                key={index} 
                to={`/studios?city=${encodeURIComponent(location.city)}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-elegant">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={location.image}
                        alt={location.city}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{location.state}</span>
                        </div>
                        <h3 className="text-xl font-bold">{location.city}</h3>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                          {loading ? '...' : `${studioCount} studio${studioCount !== 1 ? 's' : ''}`}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-muted-foreground text-sm mb-3">
                        {location.description}
                      </p>
                      <span className="text-primary font-medium group-hover:text-primary-hover transition-colors">
                        Browse Studios →
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

export default LocationsSection;