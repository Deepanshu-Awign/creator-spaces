
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BookingFormHeader } from "./booking/BookingFormHeader";
import { BookingFormFields } from "./booking/BookingFormFields";
import { BookingPricing } from "./booking/BookingPricing";
import { useBookingPayment } from "@/hooks/useBookingPayment";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createBooking } = useBookings();
  const { launchRazorpay } = useBookingPayment();

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
      const booking = await createBooking({
        studioId: studio.id,
        date: selectedDate,
        startTime: startTime,
        duration: parseInt(duration),
        guestCount: 1,
        totalPrice: pricing.total,
        specialRequests: specialRequests.trim() || undefined
      });
      
      if (booking) {
        launchRazorpay(booking.id, pricing.total, studio.title);
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
      <BookingFormHeader hourlyPrice={hourlyPrice} />
      <CardContent className="space-y-6">
        <BookingFormFields
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          startTime={startTime}
          setStartTime={setStartTime}
          duration={duration}
          setDuration={setDuration}
          studioId={studio.id}
        />
        
        {/* Special Requests */}
        <div>
          <Label htmlFor="special-requests" className="mb-2 block">
            Special Requests (Optional)
          </Label>
          <Textarea
            id="special-requests"
            placeholder="Any special requirements or requests for your booking..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
          />
        </div>

        <Separator />
        
        <BookingPricing 
          hourlyPrice={hourlyPrice}
          duration={duration}
          pricing={pricing}
        />

        {/* Booking Button */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold"
          disabled={!selectedDate || !startTime || isBooking}
          onClick={handleBookNow}
        >
          {isBooking ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {user ? 'Pay Now' : 'Login to Book'}
            </>
          )}
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
