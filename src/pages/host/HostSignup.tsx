import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  Star, 
  Users, 
  Camera,
  ArrowRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';

const benefits = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Earn Extra Income',
    description: 'Generate passive income from your studio space when not in use'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Meet Creators',
    description: 'Connect with talented content creators and build your network'
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Build Your Reputation',
    description: 'Get reviewed and build a stellar reputation in the creator community'
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Professional Exposure',
    description: 'Showcase your studio to thousands of potential clients'
  }
];

const steps = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Tell us about yourself and your studio space'
  },
  {
    number: '02',
    title: 'Upload Photos & Details',
    description: 'Add high-quality photos and describe your amenities'
  },
  {
    number: '03',
    title: 'Set Your Pricing',
    description: 'Choose competitive rates for your studio'
  },
  {
    number: '04',
    title: 'Start Hosting',
    description: 'Approve bookings and welcome creators to your space'
  }
];

const HostSignup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20">
      <Navigation />
      
      <div>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Share Your Studio Space
                </h1>
                <p className="text-xl mb-8 text-white/90">
                  Turn your unused studio time into income. Join thousands of hosts earning money by sharing their creative spaces with content creators.
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <Badge className="bg-white/20 text-white text-sm px-3 py-1">
                    Average ₹2,500/day extra income
                  </Badge>
                  <Badge className="bg-white/20 text-white text-sm px-3 py-1">
                    24/7 support
                  </Badge>
                </div>
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Hosting Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&h=400"
                  alt="Professional studio space"
                  className="rounded-lg shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-black">Studio Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Host on Creator Spaces?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join our community of successful hosts and discover the benefits of sharing your studio space
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-orange-600">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to Start Hosting
              </h2>
              <p className="text-lg text-gray-600">
                Get your studio listed in just 4 simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-dark text-white relative overflow-hidden">
          {/* Background pattern for better contrast */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
              Ready to Sign Up as Host?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/95 drop-shadow-sm">
              Join our community of successful hosts and start earning from your studio space.
            </p>
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                // Set user type as host in localStorage
                localStorage.setItem('userType', 'host');
                // Navigate to login page with signup mode and host role
                navigate('/login?mode=signup&role=host');
              }}
            >
              Sign Up as Host
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HostSignup;