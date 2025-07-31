import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Podcast Host',
    company: 'Tech Talks India',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?auto=format&fit=crop&w=150&h=150',
    rating: 5,
    review: 'Creator Spaces made finding the perfect podcast studio so easy. The booking process was seamless, and the audio quality was exceptional. Highly recommend for any content creator!'
  },
  {
    name: 'Rahul Verma',
    role: 'Photographer',
    company: 'RV Photography',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
    rating: 5,
    review: 'The photography studio I booked had amazing lighting and backdrops. The host was professional and the equipment was top-notch. Will definitely book again for my next shoot.'
  },
  {
    name: 'Aisha Patel',
    role: 'YouTuber',
    company: 'Cooking with Aisha',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
    rating: 5,
    review: 'Found the perfect video studio for my cooking channel. The kitchen setup was exactly what I needed, and the video quality turned out fantastic. Creator Spaces is a game-changer!'
  },
  {
    name: 'Vikram Singh',
    role: 'Music Producer',
    company: 'VS Music Studios',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
    rating: 5,
    review: 'The acoustic quality of the music studio was outstanding. Great equipment and a professional environment. Creator Spaces connects you with the best studios in the industry.'
  },
  {
    name: 'Sneha Reddy',
    role: 'Voice Artist',
    company: 'Golden Voice',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
    rating: 5,
    review: 'Perfect soundproof booth for voice-over work. The booking was instant and the studio exceeded my expectations. Creator Spaces is now my go-to platform for studio bookings.'
  },
  {
    name: 'Arjun Khanna',
    role: 'Film Director',
    company: 'Independent Films',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150',
    rating: 5,
    review: 'Booked a video production studio for my short film. The space was incredibly well-equipped with professional cameras and lighting. The platform made the entire process effortless.'
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4500); // 4.5 seconds per review

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            What Creators Say About Us
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied creators who trust Creator Spaces
          </p>
        </div>
        
        {/* Mobile: Carousel with one review visible at a time */}
        <div className="sm:hidden relative overflow-hidden">
          <div className="flex transition-transform duration-700 ease-in-out" 
               style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <Card className="w-[85vw] max-w-[350px] mx-auto border-0 shadow-elegant bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {/* Mobile unique design: Quote icon at top */}
                    <div className="flex justify-between items-start mb-3">
                      <Quote className="w-6 h-6 text-primary/30" />
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Mobile: Compact review text */}
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-4">
                      "{testimonial.review}"
                    </p>
                    
                    {/* Mobile: Horizontal layout for user info */}
                    <div className="flex items-center">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="text-xs">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{testimonial.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {testimonial.role} • {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop: Grid layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-elegant">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  "{testimonial.review}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;