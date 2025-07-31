
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const useBookingPayment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const launchRazorpay = (bookingId: string, amount: number, studioTitle?: string) => {
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "Creator Spaces",
      description: `Booking for ${studioTitle || 'Studio'}`,
      handler: async (response: RazorpayResponse) => {
        try {
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

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  return {
    launchRazorpay: async (bookingId: string, amount: number, studioTitle?: string) => {
      try {
        await loadRazorpayScript();
        launchRazorpay(bookingId, amount, studioTitle);
      } catch (error) {
        await supabase.from("bookings").delete().eq("id", bookingId);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "Failed to load payment gateway. Please try again."
        });
      }
    }
  };
};
