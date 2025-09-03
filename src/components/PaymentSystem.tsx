import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff,
  Download,
  Receipt,
  Calendar,
  Clock,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Banknote,
  Wallet,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface PaymentDetails {
  bookingId: string;
  studioName: string;
  hostName: string;
  date: string;
  time: string;
  duration: number;
  baseAmount: number;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
  currency: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  icon: string;
  last4?: string;
  isDefault?: boolean;
}

interface PaymentSystemProps {
  booking: PaymentDetails;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: string) => void;
}

const PaymentSystem = ({ booking, onSuccess, onFailure }: PaymentSystemProps) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      last4: '4242',
      isDefault: true
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI',
      icon: '📱'
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      name: 'Net Banking',
      icon: '🏦'
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Digital Wallets',
      icon: '👛'
    }
  ];

  const securityFeatures = [
    {
      icon: Shield,
      title: "SSL Encrypted",
      description: "256-bit encryption"
    },
    {
      icon: Lock,
      title: "PCI Compliant",
      description: "Secure payment processing"
    },
    {
      icon: CheckCircle,
      title: "Instant Confirmation",
      description: "Real-time booking confirmation"
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        variant: "destructive",
        title: "Payment Method Required",
        description: "Please select a payment method to continue."
      });
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would integrate with Razorpay
      const paymentData = {
        amount: booking.totalAmount * 100, // Razorpay expects amount in paise
        currency: booking.currency,
        receipt: `booking_${booking.bookingId}`,
        payment_method: selectedMethod,
        booking_details: booking
      };

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentId = `pay_${Date.now()}`;
      
      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed. You'll receive a confirmation email shortly."
      });

      onSuccess?.(paymentId);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again."
      });
      onFailure?.("Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Complete Your Booking</h1>
        <p className="text-neutral-600">Secure payment powered by Razorpay</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Booking Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-neutral-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900">{booking.studioName}</h4>
                  <p className="text-sm text-neutral-600">{booking.hostName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>{booking.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>Studio Location</span>
                </div>
              </div>
            </div>
          </AirbnbCard>

          {/* Payment Methods */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-airbnb-primary bg-airbnb-primary/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <h4 className="font-medium text-neutral-900">{method.name}</h4>
                        {method.last4 && (
                          <p className="text-sm text-neutral-600">•••• {method.last4}</p>
                        )}
                      </div>
                    </div>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Card Details Form */}
            {selectedMethod === 'card' && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-expiry">Expiry Date</Label>
                    <Input
                      id="card-expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="card-cvv"
                        type={showCardDetails ? "text" : "password"}
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCardDetails(!showCardDetails)}
                      >
                        {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AirbnbCard>

          {/* Security Features */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Security & Trust</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-neutral-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </AirbnbCard>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Base Amount</span>
                <span className="font-medium">{formatPrice(booking.baseAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Service Fee (10%)</span>
                <span className="font-medium">{formatPrice(booking.serviceFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Taxes (18%)</span>
                <span className="font-medium">{formatPrice(booking.taxes)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                  <span className="text-xl font-bold text-neutral-900">{formatPrice(booking.totalAmount)}</span>
                </div>
              </div>
            </div>
          </AirbnbCard>

          {/* Contact Information */}
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-600">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-600">support@creatorspaces.com</span>
              </div>
            </div>
          </AirbnbCard>

          {/* Payment Button */}
          <AirbnbButton
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Pay Securely - {formatPrice(booking.totalAmount)}
              </div>
            )}
          </AirbnbButton>

          {/* Additional Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button variant="outline" className="flex-1">
              <Receipt className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem; 