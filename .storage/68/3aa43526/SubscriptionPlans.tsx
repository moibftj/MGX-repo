import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, User } from '@/lib/supabase';
import { Check, Sparkles, Crown, Star, Gift, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  user: User;
}

const plans = [
  {
    id: 'single',
    name: 'Single Letter',
    price: 299,
    originalPrice: 299,
    description: 'Perfect for one-time legal document needs',
    features: [
      '1 Professional Legal Letter',
      'AI-Powered Generation',
      'Instant Download',
      'Professional Formatting',
      '24/7 Support'
    ],
    icon: Star,
    popular: false
  },
  {
    id: 'annual4',
    name: 'Annual 4 Letters',
    price: 299,
    originalPrice: 299,
    description: 'Best value for regular legal document needs',
    features: [
      '4 Professional Legal Letters',
      'AI-Powered Generation',
      'Priority Support',
      'Advanced Templates',
      'Letter History & Management',
      'Bulk Download Options'
    ],
    icon: Crown,
    popular: true
  },
  {
    id: 'annual8',
    name: 'Annual 8 Letters',
    price: 599,
    originalPrice: 599,
    description: 'Ultimate package for businesses and frequent users',
    features: [
      '8 Professional Legal Letters',
      'AI-Powered Generation',
      'Premium Support',
      'All Template Access',
      'Advanced Letter Management',
      'Bulk Operations',
      'Custom Branding Options',
      'Priority Processing'
    ],
    icon: Sparkles,
    popular: false
  }
];

export default function SubscriptionPlans({ user }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, employeeId: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [error, setError] = useState('');

  // Dummy payment form
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: ''
  });

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    const employee = supabase.getEmployeeByCode(couponCode.trim().toUpperCase());
    
    if (employee) {
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discount: 20, // 20% discount for customers
        employeeId: employee.id
      });
      setError('');
      toast.success('Coupon applied! 20% discount activated');
    } else {
      setError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError('');
    toast.success('Coupon removed');
  };

  const calculatePrice = (originalPrice: number) => {
    if (appliedCoupon) {
      return originalPrice * (1 - appliedCoupon.discount / 100);
    }
    return originalPrice;
  };

  const calculateDiscount = (originalPrice: number) => {
    if (appliedCoupon) {
      return originalPrice * (appliedCoupon.discount / 100);
    }
    return 0;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
    setCheckoutStep(1);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Validate payment form
      if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
        setError('Please fill in all payment details');
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      if (!selectedPlanData) {
        setError('Invalid plan selected');
        setIsProcessing(false);
        return;
      }

      const finalPrice = calculatePrice(selectedPlanData.price);
      
      // Create subscription record
      const subscriptionData = {
        userId: user.id,
        plan: selectedPlan as 'single' | 'annual4' | 'annual8',
        price: finalPrice,
        discount: calculateDiscount(selectedPlanData.price),
        couponCode: appliedCoupon?.code,
        employeeId: appliedCoupon?.employeeId
      };

      await supabase.createSubscription(subscriptionData);

      // Show success
      setCheckoutStep(3);
      toast.success('Payment successful! Your subscription is now active.');

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowCheckout(false);
        setSelectedPlan('');
        setAppliedCoupon(null);
        setCouponCode('');
        setCheckoutStep(1);
        setPaymentForm({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
          billingAddress: '',
          city: '',
          zipCode: ''
        });
      }, 3000);

    } catch (err) {
      setError('Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showCheckout) {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    return (
      <div className="max-w-2xl mx-auto">
        {checkoutStep === 3 ? (
          // Success Step
          <Card className="card-hover animate-fade-in-up" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow"
                   style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gradient mb-4">Payment Successful!</h2>
              <p className="text-blue-700 text-lg mb-6">
                Your {selectedPlanData?.name} subscription has been activated.
              </p>
              <div className="space-y-2 text-blue-600">
                <p>✅ Subscription activated</p>
                <p>✅ Payment processed</p>
                <p>✅ Ready to generate letters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Checkout Steps
          <Card className="card-hover animate-fade-in-up" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
            <CardHeader>
              <CardTitle className="text-gradient text-2xl flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                Checkout - {selectedPlanData?.name}
              </CardTitle>
              <CardDescription className="text-lg">
                Complete your subscription purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className={`flex items-center gap-2 ${checkoutStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 1 ? 'btn-shiny text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="font-medium">Order Summary</span>
                </div>
                <div className="w-8 h-px bg-gray-300"></div>
                <div className={`flex items-center gap-2 ${checkoutStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'btn-shiny text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
              </div>

              {checkoutStep === 1 && (
                <div className="space-y-6 animate-slide-in-left">
                  {/* Order Summary */}
                  <div className="p-6 rounded-xl border-2 border-blue-200" style={{background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'}}>
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">{selectedPlanData?.name}</span>
                        <span className="font-semibold text-blue-800">${selectedPlanData?.price}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span>-${calculateDiscount(selectedPlanData?.price || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-800">Total</span>
                        <span className="text-2xl font-bold text-gradient">
                          ${calculatePrice(selectedPlanData?.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-4">
                    <Label className="text-blue-800 font-medium">Have a coupon code?</Label>
                    {!appliedCoupon ? (
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="input-focus flex-1"
                        />
                        <Button onClick={applyCoupon} className="btn-shiny text-white px-6">
                          <Gift className="w-4 h-4 mr-2" />
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            Coupon {appliedCoupon.code} applied - 20% off
                          </span>
                        </div>
                        <Button variant="ghost" onClick={removeCoupon} className="text-green-600 hover:text-green-800">
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  {error && (
                    <Alert className="animate-slide-in-left" style={{background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'}}>
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setShowCheckout(false)} className="btn-shiny-secondary flex-1">
                      Back to Plans
                    </Button>
                    <Button onClick={() => setCheckoutStep(2)} className="btn-shiny text-white flex-1">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="space-y-6 animate-slide-in-right">
                  {/* Payment Form */}
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-blue-800 font-medium">Card Number</Label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                          className="input-focus"
                          maxLength={19}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-blue-800 font-medium">Cardholder Name</Label>
                        <Input
                          placeholder="John Doe"
                          value={paymentForm.cardholderName}
                          onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                          className="input-focus"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-blue-800 font-medium">Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          value={paymentForm.expiryDate}
                          onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                          className="input-focus"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-blue-800 font-medium">CVV</Label>
                        <Input
                          placeholder="123"
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                          className="input-focus"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-blue-800 font-medium">Billing Address</Label>
                      <Input
                        placeholder="123 Main Street"
                        value={paymentForm.billingAddress}
                        onChange={(e) => setPaymentForm({...paymentForm, billingAddress: e.target.value})}
                        className="input-focus"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-blue-800 font-medium">City</Label>
                        <Input
                          placeholder="New York"
                          value={paymentForm.city}
                          onChange={(e) => setPaymentForm({...paymentForm, city: e.target.value})}
                          className="input-focus"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-blue-800 font-medium">ZIP Code</Label>
                        <Input
                          placeholder="10001"
                          value={paymentForm.zipCode}
                          onChange={(e) => setPaymentForm({...paymentForm, zipCode: e.target.value})}
                          className="input-focus"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert className="animate-slide-in-right" style={{background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'}}>
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Final Order Summary */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-blue-800 font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-gradient">
                        ${calculatePrice(selectedPlanData?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCheckoutStep(1)} className="btn-shiny-secondary flex-1">
                      Back
                    </Button>
                    <Button onClick={processPayment} disabled={isProcessing} className="btn-shiny text-white flex-1">
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 spinner-gradient"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Complete Payment
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center animate-fade-in-up">
        <h2 className="text-3xl font-bold text-gradient mb-4">Choose Your Plan</h2>
        <p className="text-xl text-blue-700">Select the perfect plan for your legal document needs</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const finalPrice = calculatePrice(plan.price);
          const discount = calculateDiscount(plan.price);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative card-hover animate-slide-in-left stagger-${index + 1} ${plan.popular ? 'border-2 border-blue-400' : ''}`}
              style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="badge-gradient px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                     style={{background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)'}}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gradient">{plan.name}</CardTitle>
                <CardDescription className="text-lg">{plan.description}</CardDescription>
                
                <div className="space-y-2">
                  {appliedCoupon && discount > 0 ? (
                    <div className="space-y-1">
                      <div className="text-lg text-gray-500 line-through">${plan.price}</div>
                      <div className="text-4xl font-bold text-gradient">${finalPrice.toFixed(2)}</div>
                      <div className="text-green-600 font-medium">Save ${discount.toFixed(2)}</div>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-gradient">${plan.price}</div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-blue-800">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full ${plan.popular ? 'btn-shiny text-white' : 'btn-shiny-secondary'} py-3 text-lg font-semibold`}
                >
                  {plan.popular ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Choose Plan
                    </div>
                  ) : (
                    'Choose Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {appliedCoupon && (
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 border border-green-300">
            <Gift className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Coupon {appliedCoupon.code} is active - 20% off all plans!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}