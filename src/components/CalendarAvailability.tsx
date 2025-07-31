import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookingSlots } from '@/hooks/useBookingSlots';
import { format, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarAvailabilityProps {
  studioId: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const CalendarAvailability = ({ studioId, onDateSelect, selectedDate }: CalendarAvailabilityProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(selectedDate || new Date());
  const { bookedSlots, loading } = useBookingSlots(studioId, format(currentDate, 'yyyy-MM-dd'));

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      onDateSelect?.(date);
    }
  };

  // Create availability indicators for calendar
  const getAvailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // For simplicity, we'll just check if the currently selected date has bookings
    if (isSameDay(date, currentDate)) {
      return bookedSlots.length > 16 ? 'fully-booked' : 
             bookedSlots.length > 8 ? 'partially-booked' : 'available';
    }
    return 'available'; // Default for other dates
  };

  const dayClassName = (date: Date) => {
    const availability = getAvailabilityForDate(date);
    const baseClasses = "relative";
    
    switch (availability) {
      case 'fully-booked':
        return cn(baseClasses, "after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-2 after:h-2 after:bg-red-500 after:rounded-full");
      case 'partially-booked':
        return cn(baseClasses, "after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-2 after:h-2 after:bg-yellow-500 after:rounded-full");
      case 'available':
        return cn(baseClasses, "after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-2 after:h-2 after:bg-green-500 after:rounded-full");
      default:
        return baseClasses;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Availability Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Partially Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Fully Booked</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleDateChange}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          disabled={(date) => date < new Date()}
          className="rounded-md border pointer-events-auto"
        />
        
        {currentDate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">
              {format(currentDate, 'MMMM d, yyyy')}
            </h4>
            {loading ? (
              <div className="text-sm text-gray-500">Loading availability...</div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {bookedSlots.length > 0 ? (
                    <>
                      <Badge variant="destructive">
                        {bookedSlots.length} slots booked
                      </Badge>
                      <Badge variant="secondary">
                        {24 - bookedSlots.length} slots available
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="secondary">
                      All 24 slots available
                    </Badge>
                  )}
                </div>
                {bookedSlots.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Booked times: {bookedSlots.slice(0, 3).join(', ')}
                    {bookedSlots.length > 3 && ` +${bookedSlots.length - 3} more`}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarAvailability;