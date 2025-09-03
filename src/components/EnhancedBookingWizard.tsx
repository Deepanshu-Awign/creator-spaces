import React, { useState } from 'react';
import { Calendar, Clock, Users, MessageSquare, Package, Shield, CreditCard, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedBookingWizardProps {
  studio: {
    id: string;
    title: string;
    price_per_hour: number;
    capacity?: number;
    amenities: string[];
  };
  onBookingComplete: (bookingData: any) => void;
  onClose: () => void;
}

interface BookingData {
  date: string;
  startTime: string;
  duration: number;
  guestCount: number;
  specialRequests: string;
  equipmentRental: string[];
  insurance: boolean;
  insuranceType: string;
  paymentMethod: string;
  totalPrice: number;
  deposit: number;
  finalPayment: number;
}

const EnhancedBookingWizard: React.FC<EnhancedBookingWizardProps> = ({
  studio,
  onBookingComplete,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: '',
    startTime: '',
    duration: 1,
    guestCount: 1,
    specialRequests: '',
    equipmentRental: [],
    insurance: false,
    insuranceType: '',
    paymentMethod: 'card',
    totalPrice: studio.price_per_hour,
    deposit: studio.price_per_hour * 0.3,
    finalPayment: studio.price_per_hour * 0.7
  });

  const [availableSlots] = useState([
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]);

  const [equipmentOptions] = useState([
    { id: 'camera', name: 'Professional Camera', price: 500, description: '4K camera with tripod' },
    { id: 'lighting', name: 'Lighting Kit', price: 300, description: 'Professional lighting setup' },
    { id: 'audio', name: 'Audio Equipment', price: 400, description: 'Microphones and audio interface' },
    { id: 'backdrop', name: 'Backdrop Set', price: 200, description: 'Various backdrop options' },
    { id: 'props', name: 'Props Collection', price: 150, description: 'Professional props and accessories' }
  ]);

  const [insuranceOptions] = useState([
    { id: 'basic', name: 'Basic Coverage', price: 100, description: 'Equipment damage protection' },
    { id: 'premium', name: 'Premium Coverage', price: 200, description: 'Full coverage including liability' },
    { id: 'none', name: 'No Insurance', price: 0, description: 'You are responsible for any damages' }
  ]);

  const [paymentMethods] = useState([
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI Payment', icon: '📱' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Digital Wallet', icon: '👛' }
  ]);

  const steps = [
    { id: 1, title: 'Date & Time', icon: Calendar },
    { id: 2, title: 'Guests & Requests', icon: Users },
    { id: 3, title: 'Equipment & Insurance', icon: Package },
    { id: 4, title: 'Payment', icon: CreditCard },
    { id: 5, title: 'Confirmation', icon: Check }
  ];

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate pricing
      const basePrice = studio.price_per_hour * updated.duration;
      const equipmentPrice = equipmentOptions
        .filter(eq => updated.equipmentRental?.includes(eq.id))
        .reduce((sum, eq) => sum + eq.price, 0);
      const insurancePrice = updated.insurance ? 
        insuranceOptions.find(ins => ins.id === updated.insuranceType)?.price || 0 : 0;
      
      const totalPrice = basePrice + equipmentPrice + insurancePrice;
      const deposit = totalPrice * 0.3;
      const finalPayment = totalPrice * 0.7;

      return {
        ...updated,
        totalPrice,
        deposit,
        finalPayment
      };
    });
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    const currentEquipment = bookingData.equipmentRental || [];
    const updatedEquipment = currentEquipment.includes(equipmentId)
      ? currentEquipment.filter(id => id !== equipmentId)
      : [...currentEquipment, equipmentId];
    
    updateBookingData({ equipmentRental: updatedEquipment });
  };

  const handleInsuranceChange = (insuranceType: string) => {
    updateBookingData({ 
      insuranceType,
      insurance: insuranceType !== 'none'
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onBookingComplete(bookingData);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="date" className="text-base font-medium">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) => updateBookingData({ date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="startTime" className="text-base font-medium">Select Start Time</Label>
              <Select value={bookingData.startTime} onValueChange={(value) => updateBookingData({ startTime: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose start time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-base font-medium">Duration (hours)</Label>
              <Select 
                value={bookingData.duration.toString()} 
                onValueChange={(value) => updateBookingData({ duration: parseInt(value) })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} hour{hours > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
              <p className="text-blue-700">
                {bookingData.date && bookingData.startTime && bookingData.duration ? (
                  <>
                    {new Date(bookingData.date).toLocaleDateString()} at {bookingData.startTime} 
                    for {bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}
                  </>
                ) : (
                  'Please select date, time, and duration'
                )}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="guestCount" className="text-base font-medium">Number of Guests</Label>
              <Select 
                value={bookingData.guestCount.toString()} 
                onValueChange={(value) => updateBookingData({ guestCount: parseInt(value) })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select guest count" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: studio.capacity || 10 }, (_, i) => i + 1).map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} guest{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialRequests" className="text-base font-medium">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requirements, equipment needs, or requests for the host..."
                value={bookingData.specialRequests}
                onChange={(e) => updateBookingData({ specialRequests: e.target.value })}
                className="mt-2"
                rows={4}
              />
            </div>

            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Special requests will be communicated to the host. They will respond within 24 hours to confirm availability.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Equipment Rental</h3>
              <div className="space-y-3">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={equipment.id}
                      checked={bookingData.equipmentRental?.includes(equipment.id)}
                      onCheckedChange={() => handleEquipmentToggle(equipment.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={equipment.id} className="font-medium cursor-pointer">
                        {equipment.name}
                      </Label>
                      <p className="text-sm text-gray-600">{equipment.description}</p>
                    </div>
                    <Badge variant="outline">{formatPrice(equipment.price)}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Insurance Coverage</h3>
              <div className="space-y-3">
                {insuranceOptions.map((insurance) => (
                  <div key={insurance.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="radio"
                      id={insurance.id}
                      name="insurance"
                      value={insurance.id}
                      checked={bookingData.insuranceType === insurance.id}
                      onChange={(e) => handleInsuranceChange(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <Label htmlFor={insurance.id} className="font-medium cursor-pointer">
                        {insurance.name}
                      </Label>
                      <p className="text-sm text-gray-600">{insurance.description}</p>
                    </div>
                    <Badge variant="outline">{formatPrice(insurance.price)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={bookingData.paymentMethod === method.id}
                      onChange={(e) => updateBookingData({ paymentMethod: e.target.value })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.icon} {method.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Payment Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Studio rental ({bookingData.duration} hours)</span>
                  <span>{formatPrice(studio.price_per_hour * bookingData.duration)}</span>
                </div>
                {bookingData.equipmentRental?.length > 0 && (
                  <div className="flex justify-between">
                    <span>Equipment rental</span>
                    <span>{formatPrice(equipmentOptions
                      .filter(eq => bookingData.equipmentRental?.includes(eq.id))
                      .reduce((sum, eq) => sum + eq.price, 0)
                    )}</span>
                  </div>
                )}
                {bookingData.insurance && (
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>{formatPrice(insuranceOptions
                      .find(ins => ins.id === bookingData.insuranceType)?.price || 0
                    )}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(bookingData.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Deposit (30%)</span>
                  <span>{formatPrice(bookingData.deposit)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Final Payment (70%)</span>
                  <span>{formatPrice(bookingData.finalPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Booking Summary</h3>
              <p className="text-gray-600">Please review your booking details before confirming</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Studio</span>
                    <span>{studio.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date & Time</span>
                    <span>
                      {new Date(bookingData.date).toLocaleDateString()} at {bookingData.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Duration</span>
                    <span>{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Guests</span>
                    <span>{bookingData.guestCount}</span>
                  </div>
                  {bookingData.equipmentRental?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">Equipment</span>
                      <span>{bookingData.equipmentRental.length} item{bookingData.equipmentRental.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {bookingData.insurance && (
                    <div className="flex justify-between">
                      <span className="font-medium">Insurance</span>
                      <span>{insuranceOptions.find(ins => ins.id === bookingData.insuranceType)?.name}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total Amount</span>
                    <span>{formatPrice(bookingData.totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your booking is protected by our secure payment system. You'll receive a confirmation email once payment is processed.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Book {studio.title}</h2>
              <p className="text-gray-600">Complete your booking in {steps.length} steps</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={(currentStep / steps.length) * 100} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step.id <= currentStep 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!bookingData.date || !bookingData.startTime || !bookingData.duration)) ||
                  (currentStep === 2 && !bookingData.guestCount)
                }
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                Confirm Booking
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingWizard; 