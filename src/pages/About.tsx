
import Navigation from "@/components/Navigation";
import { Users, Award, Heart, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-orange-500" />,
      title: "Passion for Creativity",
      description: "We believe every creative project deserves the perfect space to come to life."
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Community First",
      description: "Building connections between creative professionals and studio owners across the globe."
    },
    {
      icon: <Award className="w-8 h-8 text-orange-500" />,
      title: "Quality Assured",
      description: "Every studio on our platform is verified and meets our high standards for equipment and space."
    },
    {
      icon: <Target className="w-8 h-8 text-orange-500" />,
      title: "Your Success",
      description: "We're committed to helping you find the perfect studio for your next big project."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              About Creator Spaces
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing how creative professionals find and book studio spaces. 
              From podcast recordings to photo shoots, we connect you with the perfect space for your vision.
            </p>
          </div>

          {/* Story Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Story</h2>
              <p className="text-slate-600 mb-4">
                Creator Spaces was born from a simple frustration: finding the right studio space 
                shouldn't be harder than creating your content. As content creators ourselves, 
                we experienced the endless hours spent searching for studios, dealing with 
                complicated booking processes, and settling for spaces that didn't quite fit our vision.
              </p>
              <p className="text-slate-600 mb-4">
                In 2024, we decided to change that. We built a platform where studio discovery 
                is effortless, booking is seamless, and every creative professional can find 
                their perfect space in minutes, not days.
              </p>
              <p className="text-slate-600">
                Today, we're proud to connect thousands of creators with amazing studio spaces 
                across the globe, making creativity more accessible than ever before.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&h=400" 
                alt="Creative studio space" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">500+</div>
                <div className="text-slate-600">Studios Listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">10K+</div>
                <div className="text-slate-600">Bookings Made</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">50+</div>
                <div className="text-slate-600">Cities Covered</div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Join Our Mission</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Whether you're a creator looking for the perfect space or a studio owner 
              wanting to share your amazing facility, we're here to make it happen.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/studios">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg">
                  🎙 Explore Studios
                </Button>
              </Link>
              <Link to="/host/signup">
                <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-full">
                  🏠 List Your Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
