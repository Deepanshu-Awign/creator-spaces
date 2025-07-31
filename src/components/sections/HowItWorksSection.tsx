import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, CreditCard, Camera } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-12 h-12" />,
    title: 'Discover Studios',
    description: 'Browse through hundreds of professional studios in your city. Filter by type, amenities, and price.',
    step: '01'
  },
  {
    icon: <Calendar className="w-12 h-12" />,
    title: 'Check Availability',
    description: 'View real-time availability and select the perfect time slot for your creative session.',
    step: '02'
  },
  {
    icon: <CreditCard className="w-12 h-12" />,
    title: 'Book & Pay',
    description: 'Secure your booking with instant payment. Get confirmation and studio details immediately.',
    step: '03'
  },
  {
    icon: <Camera className="w-12 h-12" />,
    title: 'Create Magic',
    description: 'Show up and create amazing content. Everything you need is ready and waiting for you.',
    step: '04'
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Creator Spaces Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book your perfect studio in just 4 simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
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
        
        <div className="text-center mt-12">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary-hover transition-colors shadow-glow">
            Start Booking Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;