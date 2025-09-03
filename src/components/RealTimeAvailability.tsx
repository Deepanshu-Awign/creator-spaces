import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Bell, Zap, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface RealTimeAvailabilityProps {
  studio: {
    id: string;
    title: string;
    price_per_hour: number;
    instantBooking: boolean;
  };
  onBookNow: (slot: any) => void;
  onRequestBooking: (slot: any) => void;
  onSetNotification: (date: string) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  bookedBy?: string;
  instantBookable: boolean;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
  fullyBooked: boolean;
  hasAvailableSlots: boolean;
}

const RealTimeAvailability: React.FC<RealTimeAvailabilityProps> = ({
  studio,
  onBookNow,
  onRequestBooking,
  onSetNotification
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationDate, setNotificationDate] = useState<string>('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Generate availability for next 30 days
  useEffect(() => {
    const generateAvailability = () => {
      const availability: DayAvailability[] = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        // Simulate availability (in real app, this would come from API)
        const slots: TimeSlot[] = timeSlots.map(time => ({
          time,
          available: Math.random() > 0.3, // 70% availability
          instantBookable: studio.instantBooking && Math.random() > 0.2,
          bookedBy: Math.random() > 0.8 ? 'John Doe' : undefined
        }));
        
        const hasAvailableSlots = slots.some(slot => slot.available);
        const fullyBooked = !hasAvailableSlots;
        
        availability.push({
          date: dateString,
          slots,
          fullyBooked,
          hasAvailableSlots
        });
      }
      
      setAvailability(availability);
    };
    
    generateAvailability();
  }, [studio.instantBooking]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleSlotClick = (slot: TimeSlot, date: string) => {
    if (!slot.available) return;
    
    if (user && slot.instantBookable) {
      onBookNow({ date, time: slot.time });
    } else {
      onRequestBooking({ date, time: slot.time });
    }
  };

  const handleNotificationToggle = (date: string) => {
    if (notificationDate === date) {
      setNotificationDate('');
      onSetNotification('');
    } else {
      setNotificationDate(date);
      onSetNotification(date);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.available) {
      return { status: 'booked', label: 'Booked', color: 'bg-gray-200 text-gray-500' };
    }
    if (slot.instantBookable && user) {
      return { status: 'instant', label: 'Instant Book', color: 'bg-green-100 text-green-700 hover:bg-green-200' };
    }
    return { status: 'request', label: 'Request', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' };
  };

  const selectedDayAvailability = availability.find(day => day.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-Time Availability</h3>
          <p className="text-sm text-gray-600">Check available time slots and book instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Zap className="w-3 h-3 mr-1" />
            Live Updates
          </Badge>
        </div>
      </div>

      {/* User Status */}
      <Alert>
        {user ? (
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <AlertDescription>
              You're a verified user. You can book instantly for available slots.
            </AlertDescription>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              New users need to request bookings. Hosts will respond within 24 hours.
            </AlertDescription>
          </div>
        )}
      </Alert>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {availability.slice(0, 35).map((day, index) => {
          const date = new Date(day.date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate === day.date;
          
          return (
            <button
              key={day.date}
              onClick={() => handleDateSelect(day.date)}
              className={`
                p-3 text-center rounded-lg border transition-all
                ${isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                ${isSelected ? 'border-blue-500 bg-blue-50' : ''}
                ${day.fullyBooked ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              <div className="text-sm font-medium">
                {date.getDate()}
              </div>
              <div className="flex justify-center mt-1">
                {day.fullyBooked ? (
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                ) : day.hasAvailableSlots ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDayAvailability && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{formatDate(selectedDate)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNotificationToggle(selectedDate)}
                className={notificationDate === selectedDate ? 'text-blue-600' : ''}
              >
                <Bell className="w-4 h-4 mr-1" />
                {notificationDate === selectedDate ? 'Remove Alert' : 'Set Alert'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayAvailability.fullyBooked ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Fully booked for this date</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleNotificationToggle(selectedDate)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Get notified when available
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {selectedDayAvailability.slots.map((slot) => {
                  const slotStatus = getSlotStatus(slot);
                  
                  return (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotClick(slot, selectedDate)}
                      disabled={!slot.available}
                      className={`
                        p-3 rounded-lg border text-sm font-medium transition-all
                        ${slotStatus.color}
                        ${!slot.available ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      `}
                    >
                      <div className="font-medium">{slot.time}</div>
                      <div className="text-xs mt-1">{slotStatus.label}</div>
                      {slot.bookedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          Booked by {slot.bookedBy}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Availability Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Limited</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Calendar className="w-4 h-4 mr-2" />
          View Full Calendar
        </Button>
        <Button variant="outline" className="flex-1">
          <Clock className="w-4 h-4 mr-2" />
          Check Other Dates
        </Button>
      </div>
    </div>
  );
};

export default RealTimeAvailability; 