
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share, Star, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navigation from "@/components/Navigation";
import BookingForm from "@/components/BookingForm";
import CalendarAvailability from "@/components/CalendarAvailability";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";

const StudioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { favorites, toggleFavorite } = useFavorites();
  const [canReview, setCanReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Check if current studio is in favorites
  const isFavorite = favorites.some((fav) => fav.id === id);

  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to add studios to favorites."
      });
      return;
    }
    if (id) {
      toggleFavorite(id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: studio?.title,
        text: `Check out this amazing studio: ${studio?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Studio link copied to clipboard!"
      });
    }
  };



  useEffect(() => {
    const fetchStudio = async () => {
      if (!id) {
        setError("Studio ID not provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log("Fetching studio with ID:", id);
        // Get the studio data
        const { data: studioData, error: studioError } = await supabase
          .from("studios")
          .select("*")
          .eq("id", id)
          .single();
        
        if (studioError) {
          console.error("Error fetching studio:", studioError);
          throw studioError;
        }
        
        console.log("Studio data:", studioData);
        
        if (!studioData) {
          setError("Studio not found");
          return;
        }
        

        


        // Transform the data to match the expected format
        const transformedStudio = {
          id: studioData.id,
          title: studioData.title || "Untitled Studio",
          description: studioData.description || "No description available",
          location: studioData.location || "Location not specified",
          price_per_hour: studioData.price_per_hour || 0,
          rating: studioData.rating || 0,
          total_reviews: studioData.total_reviews || 0,
          images: studioData.images || ["/placeholder.svg"],
          image: (studioData.images && studioData.images[0]) || "/placeholder.svg",
          amenities: studioData.amenities || [],
          tags: studioData.tags || [],
          category: (studioData as any).category || null,
          features: [],
          host: {
            full_name: (studioData as any).host_name || `Host ${studioData.host_id?.slice(0, 8)}`,
            avatar_url: "/placeholder.svg"
          },
          is_active: studioData.is_active,
          created_at: studioData.created_at,
          updated_at: studioData.updated_at,
          host_id: studioData.host_id
        };

        console.log("Raw studio data:", studioData);
        console.log("Host name:", (studioData as any).host_name);
        console.log("Host ID:", studioData.host_id);

        console.log("Transformed studio data:", transformedStudio);
        setStudio(transformedStudio);
      } catch (err: any) {
        console.error("Error fetching studio:", err);
        setError(err.message || "Failed to load studio.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;

      try {
        // Get all reviews for this studio with user_full_name
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("studio_id", id)
          .order("created_at", { ascending: false });
        
        if (reviewsError) throw reviewsError;
        
        if (!reviewsData || reviewsData.length === 0) {
          setReviews([]);
          return;
        }

        // Process reviews with user_full_name
        const processedReviews = reviewsData.map((review) => {
          const result = {
            ...review,
            user: (review as any).user_full_name || `User ${review.user_id?.slice(0, 8)}`,
            avatar: "/placeholder.svg", // Using placeholder since we don't have avatar in reviews table
            date: new Date(review.created_at).toLocaleDateString(),
          };
          console.log(`Review ${review.id}: user_id=${review.user_id}, user_full_name=`, (review as any).user_full_name, "final user name=", result.user);
          return result;
        });
        
        console.log("Final processed reviews:", processedReviews);
        setReviews(processedReviews);
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

    fetchStudio();
    fetchReviews();
    checkCanReview();
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
      const { data: reviewsData, error: reviewFetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("studio_id", id)
        .order("created_at", { ascending: false });
      
      if (!reviewFetchError && reviewsData) {
        // Process reviews with user_full_name
        const processedReviews = reviewsData.map((review) => {
          return {
            ...review,
            user: (review as any).user_full_name || `User ${review.user_id?.slice(0, 8)}`,
            avatar: "/placeholder.svg", // Using placeholder since we don't have avatar in reviews table
            date: new Date(review.created_at).toLocaleDateString(),
          };
        });
        setReviews(processedReviews);
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500 text-lg">Loading studio details...</div>
        </div>
      </div>
    );
  }
  
  if (error || !studio) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">{error || "Studio not found"}</div>
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      <div className="pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-4 sm:mb-6 hover:bg-white/80 backdrop-blur-sm transition-all duration-200" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>
          
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="lg:col-span-3">
              <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={[
                    studio.image,
                    ...(studio.images || [])
                  ][selectedImageIndex] || studio.image}
                  alt={studio.title}
                  className="w-full h-64 sm:h-80 lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Image Navigation Arrows */}
                {[studio.image, ...(studio.images || [])].length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev === 0 ? [studio.image, ...(studio.images || [])].length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev === [studio.image, ...(studio.images || [])].length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {[studio.image, ...(studio.images || [])].length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {[studio.image, ...(studio.images || [])].length}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 sm:gap-3">
              {/* All image thumbnails including main image */}
              {[
                studio.image,
                ...(studio.images || [])
              ].slice(0, 4).map((image: string, index: number) => (
                <div 
                  key={index} 
                  className={`relative group overflow-hidden rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                    selectedImageIndex === index ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${studio.title} ${index + 1}`}
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 leading-tight">
                      {studio.title}
                    </h1>
                    <div className="flex items-center text-slate-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="text-sm sm:text-base">{studio.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShare}
                      className="hover:bg-orange-50 hover:border-orange-200 transition-all duration-200"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleFavoriteClick}
                      className={`transition-all duration-200 ${
                        isFavorite 
                          ? "text-red-500 hover:text-red-600 bg-red-50 border-red-200" 
                          : "hover:text-red-500 hover:bg-red-50 hover:border-red-200"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500" : ""}`} />
                    </Button>
                  </div>
                </div>
                
                {/* Category and Tags */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {studio.category && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                      {studio.category}
                    </Badge>
                  )}
                  {studio.tags && studio.tags.length > 0 && (
                    <>
                      {studio.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700 px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
                
                {/* Rating and Price */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-2 text-slate-700 font-semibold">{studio.rating || 0}</span>
                    <span className="ml-2 text-slate-500 text-sm">rating</span>
                  </div>
                  <div className="hidden sm:block text-slate-300">•</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-slate-800">₹{studio.price_per_hour}</span>
                    <span className="ml-1 text-slate-600 text-sm">/hour</span>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">About this studio</h2>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                  {studio.description}
                </p>
              </div>
              
              {/* Amenities */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(studio.amenities || []).map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-all duration-200 border border-transparent hover:border-orange-200">
                      <div className="w-6 h-6 text-orange-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700 font-medium text-sm sm:text-base">{amenity}</span>
                    </div>
                  ))}
                  {(!studio.amenities || studio.amenities.length === 0) && (
                    <div className="text-slate-500 col-span-2 text-center py-8">
                      No amenities listed for this studio
                    </div>
                  )}
                </div>
                {studio.amenities && studio.amenities.length > 6 && (
                  <div className="mt-4">
                    <Button variant="outline" className="w-full md:w-auto">
                      Show all {studio.amenities.length} amenities
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Host */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 ring-2 ring-orange-200">
                      <AvatarImage src={studio.host.avatar_url} />
                      <AvatarFallback className="bg-orange-100 text-orange-700">{(studio.host.full_name || "H").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">
                        Hosted by {studio.host.full_name}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600">
                        <svg className="w-4 h-4 text-green-500 fill-current mr-1" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span>Verified Host</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Reviews */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">Reviews</h2>
                  <Sheet open={showAllReviews} onOpenChange={setShowAllReviews}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="hover:bg-orange-50 hover:border-orange-200 transition-all duration-200">
                        See all reviews
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="text-xl font-semibold text-slate-800">
                          All Reviews for {studio?.title}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {reviews.length === 0 ? (
                          <div className="text-slate-500 text-center py-12">
                            <div className="text-4xl mb-4">⭐</div>
                            <p className="text-lg font-medium">No reviews yet</p>
                            <p className="text-sm text-slate-400 mt-2">Be the first to review this studio!</p>
                          </div>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="border-b border-slate-200 pb-6 last:border-0">
                              <div className="flex items-start space-x-4">
                                <Avatar className="ring-2 ring-orange-100">
                                  <AvatarImage src={review.avatar} />
                                  <AvatarFallback className="bg-orange-100 text-orange-700">
                                    {review.user.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <h4 className="font-medium text-slate-800">{review.user}</h4>
                                    <span className="text-sm text-slate-500">{review.date}</span>
                                  </div>
                                  <div className="flex items-center mb-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-200 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <Avatar className="ring-2 ring-orange-100">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback className="bg-orange-100 text-orange-700">
                            {review.user.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="font-medium text-slate-800">{review.user}</h4>
                            <span className="text-sm text-slate-500">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-slate-500 text-center py-8">
                      <div className="text-4xl mb-2">⭐</div>
                      <p>No reviews yet.</p>
                      <p className="text-sm text-slate-400">Be the first to review this studio!</p>
                    </div>
                  )}
                </div>
                
                {canReview && (
                  <form onSubmit={handleReviewSubmit} className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl shadow-lg border border-orange-200 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Leave a Review</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 text-sm sm:text-base">Your Rating:</span>
                      {[1,2,3,4,5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`transition-all duration-200 hover:scale-110 ${
                            star <= reviewRating ? "text-yellow-400" : "text-slate-300"
                          }`}
                        >
                          <Star className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200 resize-none"
                      rows={3}
                      placeholder="Share your experience with this studio..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={submittingReview} 
                      className="bg-orange-500 hover:bg-orange-600 text-white min-w-32 rounded-xl transition-all duration-200 hover:shadow-lg"
                    >
                      {submittingReview ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                    {reviewError && <div className="text-red-500 text-sm mt-2">{reviewError}</div>}
                  </form>
                )}
              </div>
            </div>
            
            {/* Booking Form and Calendar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24">
                <CalendarAvailability studioId={studio.id} />
                <div className="mt-6">
                  <BookingForm studio={studio} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDetail;
