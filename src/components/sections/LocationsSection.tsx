import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const popularLocations = [
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    count: 145,
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&h=400',
    description: 'Bollywood capital with premium studios'
  },
  {
    city: 'Delhi',
    state: 'Delhi',
    count: 120,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&h=400',
    description: 'Political center with diverse creative spaces'
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    count: 98,
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&h=400',
    description: 'Tech hub with modern recording facilities'
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    count: 87,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&h=400',
    description: 'South Indian film industry headquarters'
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    count: 65,
    image: 'https://images.unsplash.com/photo-1605043204790-cbef5def93b9?auto=format&fit=crop&w=600&h=400',
    description: 'Growing creative community'
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    count: 52,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&h=400',
    description: 'Emerging tech and media destination'
  }
];

const LocationsSection = () => {
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
          {popularLocations.map((location, index) => (
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
                        {location.count} studios
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
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/studios">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary-hover transition-colors shadow-glow">
              View All Cities
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;