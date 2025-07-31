import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  Star, 
  Users, 
  Camera,
  ArrowRight,
  CheckCircle
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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studioName: '',
    studioType: '',
    location: '',
    description: '',
    experience: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-primary text-white py-20">
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
                    <span className="text-sm font-medium">Studio Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Host on Creator Spaces?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our community of successful hosts and discover the benefits of sharing your studio space
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <div className="text-primary">
                        {benefit.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                How to Start Hosting
              </h2>
              <p className="text-lg text-muted-foreground">
                Get your studio listed in just 4 simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Form */}
        <section id="signup-form" className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Hosting?
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get your studio listed
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Host Application Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="studioName">Studio Name *</Label>
                      <Input
                        id="studioName"
                        name="studioName"
                        value={formData.studioName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="studioType">Studio Type *</Label>
                      <Input
                        id="studioType"
                        name="studioType"
                        placeholder="e.g., Podcast, Photography, Video"
                        value={formData.studioType}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Studio Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your studio, equipment, and what makes it special..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Hosting Experience</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      placeholder="Tell us about your experience with hosting or studio management (optional)..."
                      value={formData.experience}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" size="lg" className="flex-1">
                      Submit Application
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="flex-1">
                      Save as Draft
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HostSignup;