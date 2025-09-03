import React from 'react';
import { 
  Wifi, 
  Snowflake, 
  Car, 
  Camera, 
  Volume2, 
  Clock, 
  Lightbulb, 
  Image, 
  Users, 
  Coffee,
  Shield,
  Sparkles,
  MapPin,
  Ruler,
  Users2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StudioInformationProps {
  studio: {
    title: string;
    description: string;
    amenities: string[];
    location: string;
    city: string;
    capacity?: number;
    size?: string;
    rules?: string[];
    safetyProtocols?: string[];
    cleaningProtocols?: string[];
    host?: {
      full_name: string;
      response_time?: string;
      verification_status?: string;
    };
  };
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-5 h-5" />,
  'Air Conditioning': <Snowflake className="w-5 h-5" />,
  'Parking': <Car className="w-5 h-5" />,
  'Security Camera': <Camera className="w-5 h-5" />,
  'Sound System': <Volume2 className="w-5 h-5" />,
  '24x7 Access': <Clock className="w-5 h-5" />,
  'Lighting Equipment': <Lightbulb className="w-5 h-5" />,
  'Backdrop': <Image className="w-5 h-5" />,
  'Makeup Room': <Users className="w-5 h-5" />,
  'Waiting Area': <Coffee className="w-5 h-5" />,
  'Refreshments': <Coffee className="w-5 h-5" />,
  'Equipment Storage': <Shield className="w-5 h-5" />,
  'Wheelchair Accessible': <Users2 className="w-5 h-5" />,
  'Bathroom Facilities': <Users className="w-5 h-5" />,
  'Kitchen/Pantry': <Coffee className="w-5 h-5" />,
  'Reception Area': <Users className="w-5 h-5" />,
  'Conference Table': <Users className="w-5 h-5" />,
  'Projector': <Image className="w-5 h-5" />,
  'Whiteboard': <Image className="w-5 h-5" />,
  'Natural Light': <Lightbulb className="w-5 h-5" />,
  'Professional Microphones': <Volume2 className="w-5 h-5" />,
  'Audio Interface': <Volume2 className="w-5 h-5" />,
  'Headphones': <Volume2 className="w-5 h-5" />,
  'Acoustic Treatment': <Volume2 className="w-5 h-5" />,
  'Recording Software': <Volume2 className="w-5 h-5" />,
  'Soundproof Booth': <Volume2 className="w-5 h-5" />,
  'Professional Lighting': <Lightbulb className="w-5 h-5" />,
  'Multiple Backdrops': <Image className="w-5 h-5" />,
  'Props Collection': <Sparkles className="w-5 h-5" />,
  'Changing Room': <Users className="w-5 h-5" />,
  'High-Speed WiFi': <Wifi className="w-5 h-5" />,
  'Editing Station': <Image className="w-5 h-5" />,
  '4K Cameras': <Camera className="w-5 h-5" />,
  'Professional Lighting Kit': <Lightbulb className="w-5 h-5" />,
  'Green Screen': <Image className="w-5 h-5" />,
  'Editing Suite': <Image className="w-5 h-5" />,
  'Audio Equipment': <Volume2 className="w-5 h-5" />,
  'Teleprompter': <Image className="w-5 h-5" />,
  'Premium Instruments': <Volume2 className="w-5 h-5" />,
  'Mixing Console': <Volume2 className="w-5 h-5" />,
  'Studio Monitors': <Volume2 className="w-5 h-5" />,
  'Vocal Booth': <Volume2 className="w-5 h-5" />,
  'Producer Services': <Users className="w-5 h-5" />,
  'Mastering Suite': <Volume2 className="w-5 h-5" />,
  'Flexible Setup': <Sparkles className="w-5 h-5" />,
  'Projector': <Image className="w-5 h-5" />,
  'Whiteboard': <Image className="w-5 h-5" />,
  'Coffee Station': <Coffee className="w-5 h-5" />,
  'Meeting Rooms': <Users className="w-5 h-5" />,
  'Cyclorama Wall': <Image className="w-5 h-5" />,
  'Professional Strobes': <Lightbulb className="w-5 h-5" />,
  'Beauty Dish': <Lightbulb className="w-5 h-5" />,
  'Softboxes': <Lightbulb className="w-5 h-5" />,
  'Color Gels': <Sparkles className="w-5 h-5" />,
  'Tethering Station': <Image className="w-5 h-5" />,
};

const StudioInformation: React.FC<StudioInformationProps> = ({ studio }) => {
  const getAmenityIcon = (amenity: string) => {
    return amenityIcons[amenity] || <Sparkles className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Studio Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            About this studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{studio.description}</p>
        </CardContent>
      </Card>

      {/* Studio Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-green-600" />
            Studio Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">{studio.location}</p>
                <p className="text-sm text-gray-600">{studio.city}</p>
              </div>
            </div>
            
            {studio.capacity && (
              <div className="flex items-center gap-3">
                <Users2 className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Capacity</p>
                  <p className="text-sm text-gray-600">Up to {studio.capacity} people</p>
                </div>
              </div>
            )}
            
            {studio.size && (
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Studio Size</p>
                  <p className="text-sm text-gray-600">{studio.size}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            What this studio offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studio.amenities && studio.amenities.length > 0 ? (
              studio.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-gray-600">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No amenities listed</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Studio Rules */}
      {studio.rules && studio.rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Studio Rules & Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studio.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Protocols */}
      {studio.safetyProtocols && studio.safetyProtocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Safety & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studio.safetyProtocols.map((protocol, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{protocol}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cleaning Protocols */}
      {studio.cleaningProtocols && studio.cleaningProtocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Cleaning & Hygiene
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studio.cleaningProtocols.map((protocol, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{protocol}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Host Information */}
      {studio.host && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Hosted by {studio.host.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {studio.host.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{studio.host.full_name}</p>
                  <p className="text-sm text-gray-600">Professional Studio Host</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Host
                </Badge>
                {studio.host.response_time && (
                  <Badge variant="outline">
                    Responds within {studio.host.response_time}
                  </Badge>
                )}
                {studio.host.verification_status && (
                  <Badge variant="outline">
                    {studio.host.verification_status}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please review all studio rules and policies before booking. Contact the host if you have any questions about the studio setup or requirements.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StudioInformation; 