
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  X,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { useIsAdmin } from '@/hooks/useUserRole';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });
  const [cancelReason, setCancelReason] = useState('');
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_user_id_fkey(full_name, email, phone),
          studios!bookings_studio_id_fkey(title, location, images, price_per_hour, amenities)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user has permission to view this booking
      if (!isAdmin && data.user_id !== user?.id) {
        toast.error('You do not have permission to view this booking');
        navigate('/profile');
        return;
      }

      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error('Please select both date and time');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: rescheduleData.date,
          start_time: rescheduleData.time,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Booking rescheduled successfully');
      setIsRescheduling(false);
      fetchBookingDetails();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule booking');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          admin_notes: cancelReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Booking cancelled successfully');
      setIsCancelling(false);
      fetchBookingDetails();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: id,
          user_id: user?.id,
          studio_id: booking.studio_id,
          rating: reviewData.rating,
          comment: reviewData.comment
        });

      if (error) throw error;

      toast.success('Review submitted successfully');
      setIsReviewing(false);
      fetchBookingDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canReschedule = booking?.status === 'confirmed' || booking?.status === 'pending';
  const canCancel = booking?.status !== 'cancelled' && booking?.status !== 'completed';
  const canReview = booking?.status === 'completed' && !isAdmin;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-gray-500">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">Booking not found</div>
            <Button onClick={() => navigate('/profile')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate(isAdmin ? '/admin/bookings' : '/profile')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {isAdmin ? 'Admin' : 'My'} Bookings
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{booking.studios?.title}</CardTitle>
                      <div className="flex items-center text-gray-600 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking.studios?.location}
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-gray-600">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div className="text-gray-600">
                          {booking.start_time} ({booking.duration_hours}h)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Guests</div>
                      <div className="text-gray-600">{booking.guest_count} people</div>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div>
                      <div className="font-medium mb-2">Special Requests</div>
                      <div className="text-gray-600 bg-gray-50 p-3 rounded">
                        {booking.special_requests}
                      </div>
                    </div>
                  )}

                  {booking.admin_notes && (
                    <div>
                      <div className="font-medium mb-2">Admin Notes</div>
                      <div className="text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                        {booking.admin_notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Studio Images */}
              {booking.studios?.images && booking.studios.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Studio Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {booking.studios.images.slice(0, 4).map((image: string, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Studio ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Price per hour</span>
                    <span>₹{booking.studios?.price_per_hour?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>{booking.duration_hours} hours</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{booking.total_price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Payment Status: {booking.payment_status || 'Pending'}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details (Admin Only) */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">{booking.profiles?.full_name}</div>
                      <div className="text-gray-600">{booking.profiles?.email}</div>
                      {booking.profiles?.phone && (
                        <div className="text-gray-600">{booking.profiles.phone}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canReschedule && (
                    <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reschedule Booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="new-date">New Date</Label>
                            <Input
                              id="new-date"
                              type="date"
                              value={rescheduleData.date}
                              onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-time">New Time</Label>
                            <Input
                              id="new-time"
                              type="time"
                              value={rescheduleData.time}
                              onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleReschedule} className="flex-1">
                              Confirm
                            </Button>
                            <Button variant="outline" onClick={() => setIsRescheduling(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {canCancel && (
                    <Dialog open={isCancelling} onOpenChange={setIsCancelling}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <X className="w-4 h-4 mr-2" />
                          Cancel Booking
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                            <span>This action cannot be undone</span>
                          </div>
                          <div>
                            <Label htmlFor="cancel-reason">Reason for cancellation</Label>
                            <Textarea
                              id="cancel-reason"
                              placeholder="Please provide a reason..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="destructive" onClick={handleCancel} className="flex-1">
                              Confirm Cancel
                            </Button>
                            <Button variant="outline" onClick={() => setIsCancelling(false)}>
                              Keep Booking
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {canReview && (
                    <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          <Star className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Write a Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Rating</Label>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                  className={`${
                                    star <= reviewData.rating 
                                      ? 'text-yellow-400' 
                                      : 'text-gray-300'
                                  } hover:text-yellow-400 transition-colors`}
                                >
                                  <Star className="w-6 h-6 fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="review-comment">Your Review</Label>
                            <Textarea
                              id="review-comment"
                              placeholder="Share your experience..."
                              value={reviewData.comment}
                              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleReview} className="flex-1">
                              Submit Review
                            </Button>
                            <Button variant="outline" onClick={() => setIsReviewing(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
