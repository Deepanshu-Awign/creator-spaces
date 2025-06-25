import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import BookingForm from "@/components/BookingForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const StudioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [canReview, setCanReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudio = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching studio with ID:", id);
        const { data, error } = await supabase
          .from("studios")
          .select("*, profiles:host_id(full_name, avatar_url)")
          .eq("id", id)
          .single();
        
        if (error) {
          console.error("Error fetching studio:", error);
          throw error;
        }
        
        console.log("Fetched studio data:", data);
        
        if (!data) {
          setError("Studio not found");
          return;
        }

        setStudio({
          ...data,
          image: data.images?.[0] || "/placeholder.svg",
          amenities: data.amenities || [],
          features: [],
          host: data.profiles || { full_name: "Host", avatar_url: "/placeholder.svg" },
          // Ensure price_per_hour is properly set
          price_per_hour: data.price_per_hour || 0
        });
      } catch (err: any) {
        console.error("Error fetching studio:", err);
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
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    const checkCanReview = async () => {
      if (!user || !id) return setCanReview(false);
      try {
        // Check for completed booking
        const { data: bookings, error: bookingError } = await supabase
          .from("bookings")
          .select("id")
          .eq("user_id", user.id)
          .eq("studio_id", id)
          .eq("status", "completed");
        if (bookingError || !bookings || bookings.length === 0) return setCanReview(false);
        // Check if already reviewed
        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("user_id", user.id)
          .eq("studio_id", id)
          .maybeSingle();
        setCanReview(!existingReview);
      } catch (err) {
        console.error("Error checking review eligibility:", err);
        setCanReview(false);
      }
    };

    if (id) {
      fetchStudio();
      fetchReviews();
      checkCanReview();
    }
  }, [user, id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError(null);
    try {
      // Find the completed booking for this user and studio
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("studio_id", id)
        .eq("status", "completed");
      if (!bookings || bookings.length === 0) {
        setReviewError("You must complete a booking before reviewing.");
        setSubmittingReview(false);
        return;
      }
      const bookingId = bookings[0].id;
      // Insert review
      const { error } = await supabase
        .from("reviews")
        .insert({
          booking_id: bookingId,
          user_id: user.id,
          studio_id: id,
          rating: reviewRating,
          comment: reviewText
        });
      if (error) throw error;
      setReviewText("");
      setReviewRating(5);
      setCanReview(false);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      // Refresh reviews
      const { data, error: reviewFetchError } = await supabase
        .from("reviews")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("studio_id", id)
        .order("created_at", { ascending: false });
      if (!reviewFetchError) {
        setReviews(
          (data || []).map((review) => ({
            ...review,
            user: review.profiles?.full_name || "User",
            avatar: review.profiles?.avatar_url || "/placeholder.svg",
            date: new Date(review.created_at).toLocaleDateString(),
          }))
        );
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

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
                    <span className="font-medium ml-1">{studio.rating || 0}</span>
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
              
              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(studio.amenities || []).map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center">
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
                          Host verified
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
                
                {canReview && (
                  <form onSubmit={handleReviewSubmit} className="mt-8 bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-lg font-semibold">Leave a Review</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700">Your Rating:</span>
                      {[1,2,3,4,5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={star <= reviewRating ? "text-yellow-400" : "text-slate-300"}
                        >
                          <Star className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={submittingReview} className="bg-orange-500 hover:bg-orange-600 text-white">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                    {reviewError && <div className="text-red-500 text-sm mt-2">{reviewError}</div>}
                  </form>
                )}
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
