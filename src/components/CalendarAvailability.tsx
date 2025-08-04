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





  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg font-semibold">Availability Calendar</CardTitle>
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              {format(calendarMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          className="rounded-md border pointer-events-auto w-full"
          classNames={{
            caption: "hidden",
            nav: "hidden",
            nav_button: "hidden",
            nav_button_previous: "hidden",
            nav_button_next: "hidden",
            months: "flex justify-center w-full",
            month: "space-y-4 w-full",
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-center w-full",
            row: "flex w-full mt-2 justify-center",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",

          }}
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
                  {(() => {
                    const now = new Date();
                    const isToday = isSameDay(currentDate, now);
                    const currentHour = now.getHours();
                    
                    // Filter out past time slots for today
                    const availableSlots = isToday ? 
                      bookedSlots.filter(slot => {
                        const slotHour = parseInt(slot.split(':')[0]);
                        return slotHour > currentHour;
                      }) : bookedSlots;
                    
                    const totalSlots = isToday ? (24 - currentHour) : 24;
                    const availableCount = totalSlots - availableSlots.length;
                    
                    return (
                      <>
                        <Badge variant="destructive">
                          {availableSlots.length} slots booked
                        </Badge>
                        <Badge variant="secondary">
                          {availableCount} slots available
                        </Badge>
                      </>
                    );
                  })()}
                </div>
                {bookedSlots.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {(() => {
                      const now = new Date();
                      const isToday = isSameDay(currentDate, now);
                      const currentHour = now.getHours();
                      
                      const futureBookedSlots = isToday ? 
                        bookedSlots.filter(slot => {
                          const slotHour = parseInt(slot.split(':')[0]);
                          return slotHour > currentHour;
                        }) : bookedSlots;
                      
                      return futureBookedSlots.length > 0 ? (
                        <>
                          Booked times: {futureBookedSlots.slice(0, 3).join(', ')}
                          {futureBookedSlots.length > 3 && ` +${futureBookedSlots.length - 3} more`}
                        </>
                      ) : null;
                    })()}
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