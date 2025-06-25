import { useState } from "react";
import { Calendar, Clock, Users, CreditCard } from "lucide-react";
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

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface Studio {
  id: string;
  price: number;
  title: string;
}

interface BookingFormProps {
  studio: Studio;
}

const BookingForm = ({ studio }: BookingFormProps) => {
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [guests, setGuests] = useState("1");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = () => {
    const hours = parseInt(duration);
    const basePrice = studio.price * hours;
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

  // Razorpay payment handler
  const launchRazorpay = (bookingId: string, amount: number) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "BookMyStudio",
      description: `Booking for ${studio.title}`,
      handler: async function (response: any) {
        // Update booking/payment status in Supabase
        await supabase
          .from("bookings")
          .update({ payment_status: "paid", status: "confirmed", payment_id: response.razorpay_payment_id })
          .eq("id", bookingId);
        navigate("/profile");
      },
      prefill: {
        email: user?.email,
      },
      theme: {
        color: "#ff6600"
      }
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
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
        guestCount: parseInt(guests),
        totalPrice: pricing.total
      });
      if (booking && RAZORPAY_KEY_ID) {
        launchRazorpay(booking.id, pricing.total);
      } else if (booking) {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || "Booking error. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Book this studio</span>
          <span className="text-2xl font-bold text-orange-500">
            ₹{studio.price.toLocaleString()}/hour
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
            Duration (hours)
          </Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 8].map((hours) => (
                <SelectItem key={hours} value={hours.toString()}>
                  {hours} hour{hours > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Guests */}
        <div>
          <Label className="flex items-center mb-2">
            <Users className="w-4 h-4 mr-2" />
            Number of Guests
          </Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  {count} guest{count > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator />
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>₹{studio.price.toLocaleString()} × {duration} hour{parseInt(duration) > 1 ? 's' : ''}</span>
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
          {isBooking ? 'Processing...' : user ? 'Book Now' : 'Login to Book'}
        </Button>
        {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
        <p className="text-sm text-slate-500 text-center">
          {user ? "You won't be charged yet. Review your booking details first." : "Please login to continue with booking."}
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
