import { AlertTriangle, Shield, Phone, MapPin, Clock, Users, Heart, FireExtinguisher, Camera, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";

interface SafetyGuidelinesProps {
  studio?: any;
  showEmergency?: boolean;
}

const SafetyGuidelines = ({ studio, showEmergency = false }: SafetyGuidelinesProps) => {
  const safetyProtocols = [
    {
      icon: Shield,
      title: "Enhanced Cleaning",
      description: "Professional cleaning between all bookings",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Users,
      title: "Social Distancing",
      description: "Limited capacity and spacing guidelines",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Camera,
      title: "Contactless Check-in",
      description: "Self-check-in available with digital keys",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Heart,
      title: "First Aid Kit",
      description: "Emergency medical supplies available",
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const emergencyContacts = [
    {
      type: "Emergency Services",
      number: "911",
      description: "For immediate emergencies"
    },
    {
      type: "Studio Support",
      number: "+1-800-STUDIO",
      description: "24/7 customer support"
    },
    {
      type: "Local Police",
      number: "+1-555-0123",
      description: "Non-emergency police contact"
    },
    {
      type: "Fire Department",
      number: "+1-555-0124",
      description: "Fire and rescue services"
    }
  ];

  const safetyGuidelines = [
    "Maximum capacity: 10 people",
    "No smoking or vaping inside the studio",
    "Keep emergency exits clear at all times",
    "Report any equipment issues immediately",
    "Follow posted safety instructions",
    "Use provided safety equipment when required",
    "No open flames or candles",
    "Keep food and drinks in designated areas"
  ];

  const accessibilityFeatures = [
    "Wheelchair accessible entrance",
    "Accessible restroom facilities",
    "Elevator access to studio",
    "Assistive listening devices available",
    "Service animal friendly",
    "Accessible parking available"
  ];

  return (
    <div className="space-y-6">
      {/* Safety Protocols */}
      <AirbnbCard className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Safety & Cleanliness Protocols
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyProtocols.map((protocol, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${protocol.bgColor} flex items-center justify-center flex-shrink-0`}>
                <protocol.icon className={`w-5 h-5 ${protocol.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">{protocol.title}</h4>
                <p className="text-sm text-neutral-600">{protocol.description}</p>
              </div>
            </div>
          ))}
        </div>
      </AirbnbCard>

      {/* Safety Guidelines */}
      <AirbnbCard className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Studio Safety Guidelines</h3>
        <div className="space-y-3">
          {safetyGuidelines.map((guideline, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-neutral-700">{guideline}</span>
            </div>
          ))}
        </div>
      </AirbnbCard>

      {/* Accessibility Features */}
      <AirbnbCard className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Accessibility Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accessibilityFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-neutral-700">{feature}</span>
            </div>
          ))}
        </div>
      </AirbnbCard>

      {/* Emergency Information */}
      {showEmergency && (
        <AirbnbCard className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Information
          </h3>
          
          <div className="space-y-4">
            {/* Emergency Contacts */}
            <div>
              <h4 className="font-semibold text-red-900 mb-3">Emergency Contacts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="font-semibold text-red-900">{contact.type}</div>
                    <div className="text-lg font-bold text-red-600">{contact.number}</div>
                    <div className="text-sm text-red-700">{contact.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Procedures */}
            <div>
              <h4 className="font-semibold text-red-900 mb-3">Emergency Procedures</h4>
              <div className="space-y-2 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>In case of fire, evacuate immediately using marked exits</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>For medical emergencies, call 911 first, then notify studio staff</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Emergency lighting and exit signs are clearly marked</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>First aid kit located near the entrance</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4 border-t border-red-200">
              <AirbnbButton
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => window.open('tel:911', '_self')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 911
              </AirbnbButton>
              <AirbnbButton
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => window.open('tel:+1-800-STUDIO', '_self')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Studio Support
              </AirbnbButton>
            </div>
          </div>
        </AirbnbCard>
      )}

      {/* Insurance Information */}
      <AirbnbCard className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Insurance & Protection</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-neutral-700">Studio Liability Insurance</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Covered
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-neutral-700">Equipment Insurance</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Covered
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm text-neutral-700">Guest Protection</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Included
            </Badge>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-4">
          All bookings include comprehensive insurance coverage. Contact support for detailed policy information.
        </p>
      </AirbnbCard>
    </div>
  );
};

export default SafetyGuidelines; 