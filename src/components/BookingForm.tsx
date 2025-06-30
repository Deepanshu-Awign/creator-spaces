
import { useState } from "react";
import { Calendar, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface Studio {
  id: string;
  price_per_hour: number;
  title: string;
}

interface BookingFormProps {
  studio: Studio;
}

const BookingForm = ({ studio }: BookingFormProps) => {
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure price_per_hour is a valid number with fallback
  const hourlyPrice = studio?.price_per_hour || 0;

  const calculateTotal = () => {
    const hours = parseInt(duration);
    const basePrice = hourlyPrice * hours;
    const serviceFee = Math.round(basePrice * 0.1);
    const taxes = Math.round((basePrice + serviceFee) * 0.18);
    return {
      basePrice,
      serviceFee,
      taxes,
      total: basePrice + serviceFee + taxes
    };
  };

  const pricing = calculateTotal();

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const durationOptions = [
    { value: "1", label: "1 hr" },
    { value: "2", label: "2 hrs" },
    { value: "3", label: "3 hrs" },
    { value: "4", label: "4 hrs" },
    { value: "8", label: "Full Day (8 hrs)" }
  ];

  // Enhanced Razorpay payment handler
  const launchRazorpay = (bookingId: string, amount: number) => {
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "BookMyStudio",
      description: `Booking for ${studio?.title || 'Studio'}`,
      handler: async (response: RazorpayResponse) => {
        try {
          // Update booking/payment status in Supabase
          const { error } = await supabase
            .from("bookings")
            .update({ 
              payment_status: "paid", 
              status: "confirmed", 
              payment_id: response.razorpay_payment_id 
            })
            .eq("id", bookingId);

          if (error) throw error;

          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed."
          });
          
          navigate("/profile");
        } catch (err) {
          console.error("Payment confirmation error:", err);
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Payment was successful but confirmation failed. Please contact support."
          });
        }
      },
      prefill: {
        email: user?.email,
      },
      theme: {
        color: "#ff6600"
      },
      modal: {
        ondismiss: () => {
          // Delete the booking if payment is cancelled/failed
          supabase
            .from("bookings")
            .delete()
            .eq("id", bookingId)
            .then(() => {
              toast({
                title: "Payment Cancelled",
                description: "Your booking has been cancelled."
              });
            });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async () => {
      // Delete the booking if payment fails
      await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Your booking has been cancelled due to payment failure."
      });
    });
    
    rzp.open();
  };

  const handleBookNow = async () => {
    setError(null);
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedDate || !startTime) {
      setError("Please select date and time.");
      return;
    }
    setIsBooking(true);
    try {
      // Conflict prevention: check for existing booking
      const { data: existing, error: conflictError } = await supabase
        .from('bookings')
        .select('id')
        .eq('studio_id', studio.id)
        .eq('booking_date', selectedDate)
        .eq('start_time', startTime)
        .single();
      
      if (existing) {
        setError("This time slot is already booked. Please choose another.");
        setIsBooking(false);
        return;
      }
      
      if (conflictError && conflictError.code !== 'PGRST116') {
        setError("Error checking availability. Please try again.");
        setIsBooking(false);
        return;
      }
      
      // Create booking with pending payment
      const booking = await createBooking({
        studioId: studio.id,
        date: selectedDate,
        startTime: startTime,
        duration: parseInt(duration),
        guestCount: 1, // Default to 1 since we're not asking for guest count
        totalPrice: pricing.total
      });
      
      if (booking && RAZORPAY_KEY_ID) {
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => launchRazorpay(booking.id, pricing.total);
          script.onerror = () => {
            // Delete booking if script fails to load
            supabase.from("bookings").delete().eq("id", booking.id);
            toast({
              variant: "destructive",
              title: "Payment Error",
              description: "Failed to load payment gateway. Please try again."
            });
            setIsBooking(false);
          };
          document.body.appendChild(script);
        } else {
          launchRazorpay(booking.id, pricing.total);
        }
      } else if (booking) {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully."
        });
        navigate('/profile');
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Booking error. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Early return if studio data is not available
  if (!studio || !studio.id) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            Loading booking form...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Book this studio</span>
          <span className="text-2xl font-bold text-orange-500">
            ₹{hourlyPrice.toLocaleString()}/hour
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div>
          <Label className="flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Select Date
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        {/* Time Selection */}
        <div>
          <Label className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2" />
            Start Time
          </Label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger>
              <SelectValue placeholder="Choose start time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Duration */}
        <div>
          <Label className="flex items-center mb-2">
            Duration
          </Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator />
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>₹{hourlyPrice.toLocaleString()} × {duration} {parseInt(duration) === 8 ? 'hrs (Full Day)' : parseInt(duration) > 1 ? 'hrs' : 'hr'}</span>
            <span>₹{pricing.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Service fee</span>
            <span>₹{pricing.serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Taxes (18%)</span>
            <span>₹{pricing.taxes.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{pricing.total.toLocaleString()}</span>
          </div>
        </div>
        {/* Booking Button */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold"
          disabled={!selectedDate || !startTime || isBooking}
          onClick={handleBookNow}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isBooking ? 'Processing...' : user ? 'Pay Now' : 'Login to Book'}
        </Button>
        {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
        <p className="text-sm text-slate-500 text-center">
          {user ? "Complete payment to confirm your booking instantly." : "Please login to continue with booking."}
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
