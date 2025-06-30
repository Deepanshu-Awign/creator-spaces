
import { Separator } from "@/components/ui/separator";

interface BookingPricingProps {
  hourlyPrice: number;
  duration: string;
  pricing: {
    basePrice: number;
    serviceFee: number;
    taxes: number;
    total: number;
  };
}

export const BookingPricing = ({ hourlyPrice, duration, pricing }: BookingPricingProps) => {
  const durationHours = parseInt(duration);
  const durationLabel = durationHours === 8 ? 'hrs (Full Day)' : durationHours > 1 ? 'hrs' : 'hr';

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>₹{hourlyPrice.toLocaleString()} × {duration} {durationLabel}</span>
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
  );
};
