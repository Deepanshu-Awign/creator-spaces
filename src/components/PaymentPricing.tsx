import React, { useState } from 'react';
import { CreditCard, Wallet, Shield, Users, Clock, Calendar, Package, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentPricingProps {
  studio: {
    id: string;
    title: string;
    basePrice: number;
    pricing: {
      hourly: number;
      daily: number;
      weekly: number;
      peakHourly: number;
      offPeakHourly: number;
    };
    groupDiscounts: {
      minGuests: number;
      discountPercent: number;
    }[];
    equipmentRental: {
      id: string;
      name: string;
      price: number;
      description: string;
    }[];
  };
  onPaymentComplete: (paymentData: any) => void;
}

interface PaymentData {
  pricingType: 'hourly' | 'daily' | 'weekly';
  duration: number;
  guestCount: number;
  isPeakTime: boolean;
  selectedEquipment: string[];
  paymentMethod: string;
  splitPayment: boolean;
  splitCount: number;
  depositAmount: number;
  finalAmount: number;
  insurance: boolean;
  refundProtection: boolean;
}

const PaymentPricing: React.FC<PaymentPricingProps> = ({
  studio,
  onPaymentComplete
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    pricingType: 'hourly',
    duration: 1,
    guestCount: 1,
    isPeakTime: false,
    selectedEquipment: [],
    paymentMethod: 'card',
    splitPayment: false,
    splitCount: 2,
    depositAmount: 0,
    finalAmount: 0,
    insurance: false,
    refundProtection: true
  });

  const [paymentMethods] = useState([
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'upi', name: 'UPI Payment', icon: Wallet, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', name: 'Net Banking', icon: Wallet, description: 'All major banks' },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, description: 'PayPal, Amazon Pay' },
    { id: 'crypto', name: 'Cryptocurrency', icon: Wallet, description: 'Bitcoin, Ethereum' }
  ]);

  const [insuranceOptions] = useState([
    { id: 'basic', name: 'Basic Coverage', price: 100, description: 'Equipment damage protection' },
    { id: 'premium', name: 'Premium Coverage', price: 200, description: 'Full coverage including liability' },
    { id: 'none', name: 'No Insurance', price: 0, description: 'You are responsible for any damages' }
  ]);

  const calculateBasePrice = () => {
    let basePrice = 0;
    
    switch (paymentData.pricingType) {
      case 'hourly':
        basePrice = paymentData.isPeakTime ? studio.pricing.peakHourly : studio.pricing.offPeakHourly;
        basePrice *= paymentData.duration;
        break;
      case 'daily':
        basePrice = studio.pricing.daily;
        break;
      case 'weekly':
        basePrice = studio.pricing.weekly;
        break;
    }
    
    return basePrice;
  };

  const calculateGroupDiscount = () => {
    const applicableDiscount = studio.groupDiscounts
      .filter(discount => paymentData.guestCount >= discount.minGuests)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0];
    
    return applicableDiscount || { discountPercent: 0 };
  };

  const calculateEquipmentPrice = () => {
    return studio.equipmentRental
      .filter(equipment => paymentData.selectedEquipment.includes(equipment.id))
      .reduce((sum, equipment) => sum + equipment.price, 0);
  };

  const calculateInsurancePrice = () => {
    if (!paymentData.insurance) return 0;
    const selectedInsurance = insuranceOptions.find(ins => ins.id === 'basic');
    return selectedInsurance?.price || 0;
  };

  const calculateTotalPrice = () => {
    const basePrice = calculateBasePrice();
    const groupDiscount = calculateGroupDiscount();
    const equipmentPrice = calculateEquipmentPrice();
    const insurancePrice = calculateInsurancePrice();
    
    const subtotal = basePrice + equipmentPrice + insurancePrice;
    const discountAmount = (subtotal * groupDiscount.discountPercent) / 100;
    const total = subtotal - discountAmount;
    
    return {
      basePrice,
      equipmentPrice,
      insurancePrice,
      subtotal,
      discountAmount,
      total,
      groupDiscount
    };
  };

  const updatePaymentData = (updates: Partial<PaymentData>) => {
    setPaymentData(prev => ({ ...prev, ...updates }));
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    const currentEquipment = paymentData.selectedEquipment;
    const updatedEquipment = currentEquipment.includes(equipmentId)
      ? currentEquipment.filter(id => id !== equipmentId)
      : [...currentEquipment, equipmentId];
    
    updatePaymentData({ selectedEquipment: updatedEquipment });
  };

  const handlePaymentComplete = () => {
    const pricing = calculateTotalPrice();
    onPaymentComplete({
      ...paymentData,
      pricing,
      depositAmount: pricing.total * 0.3,
      finalAmount: pricing.total * 0.7
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const pricing = calculateTotalPrice();

  return (
    <div className="space-y-6">
      {/* Pricing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Flexible Pricing Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
              paymentData.pricingType === 'hourly' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => updatePaymentData({ pricingType: 'hourly' })}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Hourly Rate</h4>
                <Badge variant="outline">Most Popular</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(studio.pricing.hourly)}
              </div>
              <p className="text-sm text-gray-600">per hour</p>
              {paymentData.isPeakTime && (
                <p className="text-xs text-orange-600 mt-1">
                  Peak: {formatPrice(studio.pricing.peakHourly)}/hour
                </p>
              )}
            </div>

            <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
              paymentData.pricingType === 'daily' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => updatePaymentData({ pricingType: 'daily' })}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Daily Rate</h4>
                <Badge variant="outline">Save 20%</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(studio.pricing.daily)}
              </div>
              <p className="text-sm text-gray-600">per day</p>
            </div>

            <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
              paymentData.pricingType === 'weekly' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => updatePaymentData({ pricingType: 'weekly' })}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Weekly Rate</h4>
                <Badge variant="outline">Best Value</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(studio.pricing.weekly)}
              </div>
              <p className="text-sm text-gray-600">per week</p>
            </div>
          </div>

          {/* Peak/Off-Peak Toggle */}
          {paymentData.pricingType === 'hourly' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Peak Hours (10 AM - 6 PM)</h5>
                  <p className="text-sm text-gray-600">Higher rates during busy hours</p>
                </div>
                <Checkbox
                  checked={paymentData.isPeakTime}
                  onCheckedChange={(checked) => updatePaymentData({ isPeakTime: !!checked })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration & Guest Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Duration & Guests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="duration" className="text-base font-medium">Duration</Label>
              <Select 
                value={paymentData.duration.toString()} 
                onValueChange={(value) => updatePaymentData({ duration: parseInt(value) })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {paymentData.pricingType === 'hourly' ? (
                    [1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                      <SelectItem key={hours} value={hours.toString()}>
                        {hours} hour{hours > 1 ? 's' : ''}
                      </SelectItem>
                    ))
                  ) : (
                    [1, 2, 3, 4, 5, 6, 7].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} day{days > 1 ? 's' : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="guestCount" className="text-base font-medium">Number of Guests</Label>
              <Select 
                value={paymentData.guestCount.toString()} 
                onValueChange={(value) => updatePaymentData({ guestCount: parseInt(value) })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select guest count" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} guest{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Group Discount */}
          {paymentData.guestCount > 1 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <h5 className="font-medium text-green-800">Group Discount Applied!</h5>
                  <p className="text-sm text-green-700">
                    {pricing.groupDiscount.discountPercent}% off for {paymentData.guestCount} guests
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Rental */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Equipment Rental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studio.equipmentRental.map((equipment) => (
              <div key={equipment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={equipment.id}
                  checked={paymentData.selectedEquipment.includes(equipment.id)}
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
        </CardContent>
      </Card>

      {/* Insurance & Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Insurance & Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insurance Options */}
            <div>
              <h4 className="font-medium mb-3">Insurance Coverage</h4>
              <div className="space-y-3">
                {insuranceOptions.map((insurance) => (
                  <div key={insurance.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="radio"
                      id={insurance.id}
                      name="insurance"
                      value={insurance.id}
                      checked={paymentData.insurance && insurance.id === 'basic'}
                      onChange={() => updatePaymentData({ insurance: insurance.id !== 'none' })}
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

            {/* Refund Protection */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="refundProtection"
                checked={paymentData.refundProtection}
                onCheckedChange={(checked) => updatePaymentData({ refundProtection: !!checked })}
              />
              <div className="flex-1">
                <Label htmlFor="refundProtection" className="font-medium cursor-pointer">
                  Refund Protection
                </Label>
                <p className="text-sm text-gray-600">Full refund if you cancel 24 hours before booking</p>
              </div>
              <Badge variant="outline">Free</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  type="radio"
                  id={method.id}
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentData.paymentMethod === method.id}
                  onChange={(e) => updatePaymentData({ paymentMethod: e.target.value })}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Split Payment */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-blue-900">Split Payment</h5>
                <p className="text-sm text-blue-700">Split the payment with your group</p>
              </div>
              <Checkbox
                checked={paymentData.splitPayment}
                onCheckedChange={(checked) => updatePaymentData({ splitPayment: !!checked })}
              />
            </div>
            {paymentData.splitPayment && (
              <div className="mt-3">
                <Label htmlFor="splitCount" className="text-sm font-medium">Number of people to split with:</Label>
                <Select 
                  value={paymentData.splitCount.toString()} 
                  onValueChange={(value) => updatePaymentData({ splitCount: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} people
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Base price ({paymentData.duration} {paymentData.pricingType === 'hourly' ? 'hours' : 'days'})</span>
              <span>{formatPrice(pricing.basePrice)}</span>
            </div>
            
            {pricing.equipmentPrice > 0 && (
              <div className="flex justify-between">
                <span>Equipment rental</span>
                <span>{formatPrice(pricing.equipmentPrice)}</span>
              </div>
            )}
            
            {pricing.insurancePrice > 0 && (
              <div className="flex justify-between">
                <span>Insurance</span>
                <span>{formatPrice(pricing.insurancePrice)}</span>
              </div>
            )}
            
            {pricing.groupDiscount.discountPercent > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Group discount ({pricing.groupDiscount.discountPercent}%)</span>
                <span>-{formatPrice(pricing.discountAmount)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>{formatPrice(pricing.total)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Deposit (30%)</span>
              <span>{formatPrice(pricing.total * 0.3)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Final Payment (70%)</span>
              <span>{formatPrice(pricing.total * 0.7)}</span>
            </div>
            
            {paymentData.splitPayment && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Per person ({paymentData.splitCount} people)</span>
                <span>{formatPrice(pricing.total / paymentData.splitCount)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button 
        onClick={handlePaymentComplete}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Proceed to Payment
      </Button>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your payment is secured with bank-level encryption. We never store your payment information.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PaymentPricing; 