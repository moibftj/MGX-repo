import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, User } from '@/lib/supabase';
import { Check, Star, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  user: User;
}

const plans = [
  {
    id: 'single',
    name: 'Single Letter',
    price: 299,
    description: 'Perfect for one-time legal letter needs',
    features: [
      '1 AI-generated legal letter',
      'Professional formatting',
      'PDF download',
      'Email delivery',
      '30-day support'
    ],
    popular: false
  },
  {
    id: 'annual4',
    name: 'Annual 4 Letters',
    price: 299,
    description: 'Most popular choice for regular users',
    features: [
      '4 AI-generated legal letters per year',
      'Professional formatting',
      'PDF download',
      'Email delivery',
      'Priority support',
      'Letter templates library'
    ],
    popular: true
  },
  {
    id: 'annual8',
    name: 'Annual 8 Letters',
    price: 599,
    description: 'Best value for frequent users',
    features: [
      '8 AI-generated legal letters per year',
      'Professional formatting',
      'PDF download',
      'Email delivery',
      'Priority support',
      'Letter templates library',
      'Legal consultation discount'
    ],
    popular: false
  }
];

export default function SubscriptionPlans({ user }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    const employee = supabase.getEmployeeByCode(couponCode.trim());
    if (employee) {
      setDiscount(0.2); // 20% discount
      setEmployeeId(employee.id);
      setError('');
      toast.success('Coupon applied! 20% discount activated');
    } else {
      setError('Invalid coupon code');
      setDiscount(0);
      setEmployeeId(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setIsProcessing(true);
    setError('');

    try {
      const finalPrice = plan.price * (1 - discount);
      
      await supabase.createSubscription({
        userId: user.id,
        plan: planId as 'single' | 'annual4' | 'annual8',
        price: finalPrice,
        discount: discount * 100,
        couponCode: couponCode || undefined,
        employeeId: employeeId || undefined
      });

      toast.success('Subscription activated successfully!');
      setSelectedPlan(null);
      setCouponCode('');
      setDiscount(0);
      setEmployeeId(null);
    } catch (err) {
      setError('Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Select the perfect plan for your legal letter needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${
              selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  ${discount > 0 ? (plan.price * (1 - discount)).toFixed(0) : plan.price}
                  {discount > 0 && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ${plan.price}
                    </span>
                  )}
                </div>
                {plan.id.includes('annual') && (
                  <div className="text-sm text-gray-500">per year</div>
                )}
                {discount > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    <Gift className="w-3 h-3 mr-1" />
                    {(discount * 100).toFixed(0)}% OFF
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                variant={selectedPlan === plan.id ? 'default' : 'outline'}
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>Apply coupon code and confirm your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="coupon">Employee Coupon Code (Optional)</Label>
                <Input
                  id="coupon"
                  placeholder="Enter coupon code for 20% discount"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={applyCoupon}
                className="mt-6"
                disabled={!couponCode.trim()}
              >
                Apply
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {discount > 0 && (
              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  Coupon applied! You're saving ${((plans.find(p => p.id === selectedPlan)?.price || 0) * discount).toFixed(0)}
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold">
                  ${((plans.find(p => p.id === selectedPlan)?.price || 0) * (1 - discount)).toFixed(0)}
                </span>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}