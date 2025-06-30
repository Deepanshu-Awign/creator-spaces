
import { CardHeader, CardTitle } from "@/components/ui/card";

interface BookingFormHeaderProps {
  hourlyPrice: number;
}

export const BookingFormHeader = ({ hourlyPrice }: BookingFormHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Book this studio</span>
        <span className="text-2xl font-bold text-orange-500">
          ₹{hourlyPrice.toLocaleString()}/hour
        </span>
      </CardTitle>
    </CardHeader>
  );
};
