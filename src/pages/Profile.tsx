
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Heart, Star, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useBookings } from "@/hooks/useBookings";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites();
  const { bookings, loading: bookingsLoading } = useBookings();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        location: data.location || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile information."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name || null,
          phone: editForm.phone || null,
          location: editForm.location || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: editForm.full_name || null,
        phone: editForm.phone || null,
        location: editForm.location || null
      } : null);

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStudioClick = (studioId: string) => {
    navigate(`/studio/${studioId}`);
  };

  const handleBookNow = (studioId: string) => {
    navigate(`/studio/${studioId}`);
  };

  const handleRemoveFavorite = async (studioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeFavorite(studioId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Profile not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name 
                      ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : profile.email.slice(0, 2).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-slate-800">
                      {profile.full_name || 'User'}
                    </h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-600 mb-6">
                      <div className="flex items-center justify-center md:justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        {profile.email}
                      </div>
                      {profile.phone && (
                        <div className="flex items-center justify-center md:justify-start">
                          <Phone className="w-4 h-4 mr-2" />
                          {profile.phone}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center justify-center md:justify-start">
                          <MapPin className="w-4 h-4 mr-2" />
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center justify-center md:justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}
                  
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            full_name: profile.full_name || '',
                            phone: profile.phone || '',
                            location: profile.location || ''
                          });
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="text-center py-8">Loading bookings...</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No bookings found. Start by booking your first studio!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <img
                            src={booking.image}
                            alt={booking.studio}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800">{booking.studio}</h3>
                            <div className="text-sm text-slate-600 space-y-1">
                              <p>{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                              <p>Duration: {booking.duration}</p>
                              <p className="font-medium text-slate-800">{booking.price}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Favorite Studios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <div className="text-center py-8">Loading favorites...</div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No favorite studios yet. Browse studios and add them to your favorites!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {favorites.map((studio) => (
                        <div 
                          key={studio.id} 
                          className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleStudioClick(studio.id)}
                        >
                          <img
                            src={studio.image}
                            alt={studio.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-800 mb-2">{studio.title}</h3>
                            <div className="flex items-center text-sm text-slate-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              {studio.location}
                            </div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm font-medium">{studio.rating}</span>
                                <span className="text-sm text-slate-500 ml-1">({studio.reviewCount} reviews)</span>
                              </div>
                              <span className="font-semibold text-slate-800">{studio.price}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookNow(studio.id);
                                }}
                              >
                                Book Now
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => handleRemoveFavorite(studio.id, e)}
                              >
                                <Heart className="w-4 h-4 text-red-500 fill-current" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
