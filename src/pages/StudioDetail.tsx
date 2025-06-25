import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share, Star, MapPin, Calendar, Clock, Users, Wifi, Car, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import BookingForm from "@/components/BookingForm";
import { supabase } from "@/integrations/supabase/client";

const StudioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudio = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("studios")
          .select("*, profiles:host_id(full_name, avatar_url, rating)")
          .eq("id", id)
          .single();
        if (error) throw error;
        setStudio({
          ...data,
          image: data.images?.[0] || "/placeholder.svg",
          amenities: data.amenities || [],
          features: [], // You can map features if you have them
          host: data.profiles || { full_name: "Host", avatar_url: "/placeholder.svg", rating: 0 },
        });
      } catch (err: any) {
        setError(err.message || "Failed to load studio.");
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*, profiles:user_id(full_name, avatar_url)")
          .eq("studio_id", id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setReviews(
          (data || []).map((review) => ({
            ...review,
            user: review.profiles?.full_name || "User",
            avatar: review.profiles?.avatar_url || "/placeholder.svg",
            date: new Date(review.created_at).toLocaleDateString(),
          }))
        );
      } catch (err) {
        setReviews([]);
      }
    };
    if (id) {
      fetchStudio();
      fetchReviews();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading studio...</div>;
  }
  if (error || !studio) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Studio not found."}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6 hover:bg-slate-100" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <div className="lg:col-span-3">
              <img
                src={studio.image}
                alt={studio.title}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
              {(studio.images || []).slice(0, 4).map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`${studio.title} ${index + 1}`}
                  className={`w-full h-20 lg:h-24 object-cover rounded-lg cursor-pointer transition-all`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {/* Add tags if available */}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {studio.title}
                    </h1>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {studio.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium ml-1">{studio.rating}</span>
                  </div>
                  <span className="text-slate-600">
                    {studio.total_reviews || 0} reviews
                  </span>
                </div>
              </div>
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">About this studio</h2>
                <p className="text-slate-700 leading-relaxed">
                  {studio.description}
                </p>
              </div>
              {/* Features */}
              {/* You can add features if available in your schema */}
              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(studio.amenities || []).map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center">
                      {/* You can map icons if you want */}
                      <span className="text-slate-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Host */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={studio.host.avatar_url} />
                        <AvatarFallback>{(studio.host.full_name || "H").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Hosted by {studio.host.full_name}
                        </h3>
                        <div className="flex items-center text-sm text-slate-600">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          {studio.host.rating || 0} rating
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">Contact Host</Button>
                  </div>
                </CardContent>
              </Card>
              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                  <Button variant="outline">See all reviews</Button>
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-200 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>
                            {review.user.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{review.user}</h4>
                            <span className="text-sm text-slate-500">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && <div className="text-slate-500">No reviews yet.</div>}
                </div>
                {/* TODO: Add review submission form for eligible users */}
              </div>
            </div>
            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm studio={studio} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDetail;
