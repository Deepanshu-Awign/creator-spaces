
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, ArrowLeft, Star, Clock, Users, Calendar } from 'lucide-react';

interface AdminStudioDetailsProps {
  studio: any;
  onEdit: () => void;
  onBack: () => void;
}

const AdminStudioDetails = ({ studio, onEdit, onBack }: AdminStudioDetailsProps) => {
  const formatLocation = (studio: any) => {
    if (studio.city && studio.state) {
      return `${studio.city}, ${studio.state}`;
    }
    return studio.location || 'No location';
  };

  const getStatusBadge = (studio: any) => {
    if (!studio.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Studios
        </Button>
        <h1 className="text-2xl font-bold">{studio.title}</h1>
        {getStatusBadge(studio)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {studio.images && studio.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Studio Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studio.images.slice(0, 6).map((image: string, index: number) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Studio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {studio.images.length > 6 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">+{studio.images.length - 6} more</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{studio.description || 'No description available'}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {studio.amenities && studio.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studio.amenities.map((amenity: string) => (
                    <Badge key={amenity} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {studio.tags && studio.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studio.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onEdit} className="w-full gap-2">
                <Edit className="w-4 h-4" />
                Edit Studio
              </Button>
            </CardContent>
          </Card>

          {/* Studio Info */}
          <Card>
            <CardHeader>
              <CardTitle>Studio Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">₹{studio.price_per_hour}/hour</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">{formatLocation(studio)}</p>
                  {studio.pincode && (
                    <p className="text-sm text-gray-500">{studio.pincode}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{studio.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{studio.rating || 0} Stars</p>
                  <p className="text-sm text-gray-500">{studio.total_reviews || 0} reviews</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Host</p>
                  <p className="text-sm text-gray-500">{studio.profiles?.full_name || 'No Host'}</p>
                  <p className="text-xs text-gray-400">{studio.profiles?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Bookings</p>
                  <p className="text-sm text-gray-500">{studio.bookings?.length || 0} total bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Studio ID:</span>
                <p className="text-gray-500 break-all">{studio.id}</p>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <p className="text-gray-500">{new Date(studio.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium">Updated:</span>
                <p className="text-gray-500">{new Date(studio.updated_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium">Approval Status:</span>
                <p className="text-gray-500">{studio.approval_status}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStudioDetails;
