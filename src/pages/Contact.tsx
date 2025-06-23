
import Navigation from "@/components/Navigation";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-orange-500" />,
      title: "Email Us",
      info: "hello@bookmystage.com",
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="w-6 h-6 text-orange-500" />,
      title: "Call Us",
      info: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm"
    },
    {
      icon: <MapPin className="w-6 h-6 text-orange-500" />,
      title: "Visit Us",
      info: "123 Creative Street, Studio City, CA 90210",
      description: "Come say hello at our office"
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      title: "Business Hours",
      info: "Mon-Fri: 8am-6pm PST",
      description: "We're here to help during business hours"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions about booking a studio or listing your space? 
              We'd love to hear from you and help make your creative vision come to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-slate-600 font-medium mb-1">{item.info}</p>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        How do I book a studio?
                      </h4>
                      <p className="text-sm text-slate-600">
                        Simply browse our studios, select your preferred dates and times, 
                        and complete the booking process online.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        Can I cancel my booking?
                      </h4>
                      <p className="text-sm text-slate-600">
                        Yes, cancellation policies vary by studio. Check the specific 
                        terms when booking.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        How do I list my studio?
                      </h4>
                      <p className="text-sm text-slate-600">
                        Contact us directly and we'll help you get your studio listed 
                        on our platform.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
