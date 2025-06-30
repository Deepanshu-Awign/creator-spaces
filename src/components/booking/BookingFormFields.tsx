
import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingFormFieldsProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
}

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

export const BookingFormFields = ({
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  duration,
  setDuration
}: BookingFormFieldsProps) => {
  return (
    <>
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
    </>
  );
};
