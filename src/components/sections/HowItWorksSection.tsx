import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, CreditCard, Camera } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-8 h-8 sm:w-12 sm:h-12" />,
    title: 'Discover Studios',
    description: 'Browse through hundreds of professional studios in your city. Filter by type, amenities, and price.',
    step: '01'
  },
  {
    icon: <Calendar className="w-8 h-8 sm:w-12 sm:h-12" />,
    title: 'Check Availability',
    description: 'View real-time availability and select the perfect time slot for your creative session.',
    step: '02'
  },
  {
    icon: <CreditCard className="w-8 h-8 sm:w-12 sm:h-12" />,
    title: 'Book & Pay',
    description: 'Secure your booking with instant payment. Get confirmation and studio details immediately.',
    step: '03'
  },
  {
    icon: <Camera className="w-8 h-8 sm:w-12 sm:h-12" />,
    title: 'Create Magic',
    description: 'Show up and create amazing content. Everything you need is ready and waiting for you.',
    step: '04'
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            How Creator Spaces Works
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Book your perfect studio in just 4 simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-elegant">
                <CardContent className="p-4 sm:p-6">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white mx-auto mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12">
                        {step.icon}
                      </div>
                    </div>
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Connecting arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;