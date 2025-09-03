import { Shield, CheckCircle, Star, Clock, Award, Users, MapPin, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AirbnbCard } from "@/components/ui/airbnb-card";

interface TrustIndicatorsProps {
  studio?: any;
  host?: any;
  showDetails?: boolean;
}

const TrustIndicators = ({ studio, host, showDetails = false }: TrustIndicatorsProps) => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Verified Studio",
      description: "Safety inspected and verified",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: CheckCircle,
      title: "Instant Booking",
      description: "Book instantly with verified hosts",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Award,
      title: "Superhost",
      description: "Top-rated host with excellent reviews",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const safetyFeatures = [
    "Professional cleaning between bookings",
    "Contactless check-in available",
    "Enhanced cleaning protocols",
    "Safety guidelines provided",
    "Emergency contact information",
    "Insurance coverage included"
  ];

  const hostStats = {
    responseTime: "1 hour",
    responseRate: "98%",
    totalBookings: "150+",
    rating: "4.9",
    verifiedSince: "2022"
  };

  return (
    <div className="space-y-6">
      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustFeatures.map((feature, index) => (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${feature.bgColor} flex items-center justify-center`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h4 className="font-semibold text-sm text-neutral-900 mb-1">{feature.title}</h4>
            <p className="text-xs text-neutral-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {showDetails && (
        <>
          {/* Host Verification */}
          <AirbnbCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-airbnb-primary to-airbnb-accent rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Verified Host - {host?.full_name || "Studio Host"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{hostStats.rating}</div>
                    <div className="text-sm text-neutral-600">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{hostStats.responseTime}</div>
                    <div className="text-sm text-neutral-600">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{hostStats.responseRate}</div>
                    <div className="text-sm text-neutral-600">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">{hostStats.totalBookings}</div>
                    <div className="text-sm text-neutral-600">Total Bookings</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Verified since {hostStats.verifiedSince}</span>
                </div>
              </div>
            </div>
          </AirbnbCard>

          {/* Safety Features */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Safety & Cleanliness
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safetyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>
          </AirbnbCard>

          {/* Studio Verification */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Studio Verification</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Equipment Verification</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Safety Inspection</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Passed
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Accessibility</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Wheelchair Accessible
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Insurance Coverage</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Covered
                </Badge>
              </div>
            </div>
          </AirbnbCard>

          {/* Contact Information */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact & Support</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-600" />
                <span className="text-sm text-neutral-700">24/7 Emergency: +1-800-STUDIO</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-600" />
                <span className="text-sm text-neutral-700">support@studiobookings.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neutral-600" />
                <span className="text-sm text-neutral-700">Local support available</span>
              </div>
            </div>
          </AirbnbCard>
        </>
      )}
    </div>
  );
};

export default TrustIndicators; 