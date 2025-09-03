import { useState } from "react";
import { Star, CheckCircle, Camera, ThumbsUp, MessageCircle, Award, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    superhost?: boolean;
  };
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
  categories: {
    cleanliness: number;
    equipment: number;
    location: number;
    value: number;
    communication: number;
  };
  verified: boolean;
  helpful: number;
  response?: {
    host: string;
    comment: string;
    date: string;
  };
}

interface EnhancedReviewSystemProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    [key: number]: number;
  };
  onReviewSubmit?: (review: any) => void;
  canReview?: boolean;
}

const EnhancedReviewSystem = ({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown,
  onReviewSubmit,
  canReview = false
}: EnhancedReviewSystemProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const ratingCategories = [
    { key: "cleanliness", label: "Cleanliness", icon: "🧹" },
    { key: "equipment", label: "Equipment", icon: "🎛️" },
    { key: "location", label: "Location", icon: "📍" },
    { key: "value", label: "Value", icon: "💰" },
    { key: "communication", label: "Communication", icon: "💬" }
  ];

  const filters = [
    { key: "all", label: "All Reviews" },
    { key: "verified", label: "Verified Stays" },
    { key: "photos", label: "With Photos" },
    { key: "recent", label: "Recent" }
  ];

  const sortOptions = [
    { key: "recent", label: "Most Recent" },
    { key: "helpful", label: "Most Helpful" },
    { key: "rating", label: "Highest Rated" },
    { key: "lowest", label: "Lowest Rated" }
  ];

  const filteredReviews = reviews.filter(review => {
    if (selectedFilter === "verified") return review.verified;
    if (selectedFilter === "photos") return review.photos && review.photos.length > 0;
    if (selectedFilter === "recent") {
      const reviewDate = new Date(review.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return reviewDate > threeMonthsAgo;
    }
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpful - a.helpful;
      case "rating":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5"
    };

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating ? "fill-current text-yellow-400" : "text-neutral-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCategoryRating = (category: string, rating: number) => {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600">{category}</span>
        <div className="flex items-center gap-2">
          {renderStars(rating, "sm")}
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <AirbnbCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl font-bold text-neutral-900">{averageRating.toFixed(1)}</div>
              {renderStars(averageRating, "lg")}
            </div>
            <p className="text-sm text-neutral-600">{totalReviews} reviews</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Reviews
            </Badge>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2">
          {Object.entries(ratingBreakdown).reverse().map(([rating, count]) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 w-8">{rating} stars</span>
              <div className="flex-1 bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${(count / totalReviews) * 100}%` }}
                />
              </div>
              <span className="text-sm text-neutral-600 w-12">{count}</span>
            </div>
          ))}
        </div>
      </AirbnbCard>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant={selectedFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.key)}
            className={selectedFilter === filter.key ? "bg-airbnb-primary hover:bg-airbnb-accent" : ""}
          >
            {filter.label}
          </Button>
        ))}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-airbnb-primary focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Review Form Toggle */}
      {canReview && (
        <div className="text-center">
          <AirbnbButton
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            className="w-full"
          >
            {showReviewForm ? "Cancel Review" : "Write a Review"}
          </AirbnbButton>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <AirbnbCard key={review.id} className="p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.user.avatar} />
                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{review.user.name}</span>
                    {review.user.verified && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {review.user.superhost && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Superhost
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    {renderStars(review.rating, "sm")}
                    <span>{review.rating} stars</span>
                    <span>•</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                    {review.verified && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified Stay
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
              <h4 className="font-semibold text-neutral-900 mb-3">Detailed Ratings</h4>
              <div className="space-y-2">
                {ratingCategories.map((category) => (
                  <div key={category.key} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStars(review.categories[category.key as keyof typeof review.categories], "sm")}
                      <span className="text-sm font-medium">
                        {review.categories[category.key as keyof typeof review.categories]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Content */}
            <p className="text-neutral-700 mb-4">{review.comment}</p>

            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto">
                  {review.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-neutral-600">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful ({review.helpful})
                </Button>
                <Button variant="ghost" size="sm" className="text-neutral-600">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>

            {/* Host Response */}
            {review.response && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Host Response</span>
                </div>
                <p className="text-blue-800 text-sm">{review.response.comment}</p>
                <span className="text-xs text-blue-600 mt-2 block">
                  {new Date(review.response.date).toLocaleDateString()}
                </span>
              </div>
            )}
          </AirbnbCard>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No reviews yet</h3>
          <p className="text-neutral-600">Be the first to review this studio!</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewSystem; 