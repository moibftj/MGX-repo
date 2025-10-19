import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase, User, Letter } from '@/lib/supabase';
import LetterGenerator from '@/components/LetterGenerator';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { FileText, LogOut, Briefcase, Copy, CheckCircle, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (user.role === 'user') {
      const loadLetters = () => {
        const userLetters = supabase.getUserLetters(user.id);
        setLetters(userLetters);
      };

      loadLetters();
      const interval = setInterval(loadLetters, 2000);
      return () => clearInterval(interval);
    }
  }, [user.id, user.role]);

  const handleLetterGenerated = () => {
    if (user.role === 'user') {
      const userLetters = supabase.getUserLetters(user.id);
      setLetters(userLetters);
    }
  };

  const downloadPDF = (letter: Letter) => {
    const element = document.createElement('a');
    const file = new Blob([letter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `legal-letter-${letter.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Letter downloaded successfully!');
  };

  const copyCouponCode = () => {
    if (user.couponCode) {
      navigator.clipboard.writeText(user.couponCode);
      setCopiedCode(true);
      toast.success('Coupon code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Employee Dashboard - NO letter generation or subscription access
  if (user.role === 'employee') {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)'}}>
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4 animate-slide-in-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse-glow" 
                     style={{background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)'}}>
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Employee Portal</h1>
                  <p className="text-blue-700">Welcome, {user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 animate-slide-in-right">
                <Badge className="badge-gradient px-4 py-2 text-sm font-semibold">
                  Employee
                </Badge>
                <Button variant="outline" onClick={onSignOut} className="btn-shiny-secondary">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8">
            {/* Performance Overview */}
            <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up">
              <Card className="card-hover stagger-1" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient mb-2">{user.referrals || 0}</div>
                    <div className="text-blue-800 font-semibold">Total Referrals</div>
                    <div className="text-sm text-blue-600 mt-1">+1 point per referral</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover stagger-2" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient mb-2">
                      ${(user.earnings || 0).toFixed(2)}
                    </div>
                    <div className="text-blue-800 font-semibold">Total Earnings</div>
                    <div className="text-sm text-blue-600 mt-1">5% commission per sale</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover stagger-3" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient mb-2">
                      {user.referrals ? ((user.earnings || 0) / user.referrals).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-blue-800 font-semibold">Avg per Referral</div>
                    <div className="text-sm text-blue-600 mt-1">Average commission</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coupon Code Section */}
            <Card className="card-hover animate-slide-in-left border-2 border-dashed border-blue-300" 
                  style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gradient text-xl">
                  <Sparkles className="w-6 h-6" />
                  Your Referral Coupon Code
                </CardTitle>
                <CardDescription className="text-lg">
                  Share this code with customers to earn 5% commission on each sale. Customers get 20% discount!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 p-8 rounded-2xl border-2 border-dashed border-blue-300 animate-shimmer">
                  <div className="flex-1 text-center">
                    <div className="font-mono text-4xl font-bold text-gradient mb-3">
                      {user.couponCode}
                    </div>
                    <div className="text-blue-700 font-semibold text-lg">20% Customer Discount</div>
                    <div className="text-blue-600 mt-1">You earn 5% commission</div>
                  </div>
                  <Button
                    size="lg"
                    onClick={copyCouponCode}
                    className="btn-shiny text-white font-semibold px-8 py-4"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-6 h-6 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Commission Structure */}
            <Card className="card-hover animate-fade-in-up" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gradient text-xl">
                  <DollarSign className="w-6 h-6" />
                  Commission Structure
                </CardTitle>
                <CardDescription className="text-lg">How you earn with each referral</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-6 rounded-xl card-hover" style={{background: 'linear-gradient(135deg, #e1f5fe 0%, #b2ebf2 100%)'}}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-800 mb-2">Single Letter</div>
                      <div className="text-blue-600 mb-2">$299 → $239.20</div>
                      <div className="text-green-600 font-bold text-xl">$11.96</div>
                      <div className="text-sm text-blue-600">Your commission</div>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-xl card-hover" style={{background: 'linear-gradient(135deg, #e1f5fe 0%, #b2ebf2 100%)'}}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-800 mb-2">Annual 4 Letters</div>
                      <div className="text-blue-600 mb-2">$299 → $239.20</div>
                      <div className="text-green-600 font-bold text-xl">$11.96</div>
                      <div className="text-sm text-blue-600">Your commission</div>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-xl card-hover" style={{background: 'linear-gradient(135deg, #e1f5fe 0%, #b2ebf2 100%)'}}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-800 mb-2">Annual 8 Letters</div>
                      <div className="text-blue-600 mb-2">$599 → $479.20</div>
                      <div className="text-green-600 font-bold text-xl">$23.96</div>
                      <div className="text-sm text-blue-600">Your commission</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-center">
                    <strong>Note:</strong> Commission is calculated on the discounted price (after 20% customer discount)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="card-hover animate-fade-in-up" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
              <CardHeader>
                <CardTitle className="text-gradient text-xl">How the Referral System Works</CardTitle>
                <CardDescription className="text-lg">Maximize your earnings with our employee referral program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center p-6 rounded-xl card-hover stagger-1" style={{background: 'linear-gradient(135deg, #e1f5fe 0%, #b2ebf2 100%)'}}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                         style={{background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)'}}>
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="font-bold text-blue-800 mb-3 text-lg">Share Your Code</h3>
                    <p className="text-blue-700">Give your unique coupon code to potential customers</p>
                  </div>
                  
                  <div className="text-center p-6 rounded-xl card-hover stagger-2" style={{background: 'linear-gradient(135deg, #e1f5fe 0%, #b2ebf2 100%)'}}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                         style={{background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)'}}>
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="font-bold text-blue-800 mb-3 text-lg">Customer Subscribes</h3>
                    <p className="text-blue-700">They get 20% off their subscription using your code</p>
                  </div>
                  
                  <div className="text-center p-6 rounded-xl card-hover stagger-3" style={{background: 'linear-gradient(135deg, #e1f5fe 0%, #b2ebf2 100%)'}}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                         style={{background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100())'}}>
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="font-bold text-blue-800 mb-3 text-lg">You Earn Commission</h3>
                    <p className="text-blue-700">Receive 5% commission + 1 referral point</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Regular User Dashboard - WITH letter generation AND subscription access
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)'}}>
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4 animate-slide-in-left">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse-glow" 
                   style={{background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)'}}>
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">LegalLetter AI</h1>
                <p className="text-blue-700">Welcome, {user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-right">
              <Badge className="badge-gradient px-4 py-2 text-sm font-semibold">User</Badge>
              <Button variant="outline" onClick={onSignOut} className="btn-shiny-secondary">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="generate" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 p-2 rounded-xl" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
            <TabsTrigger value="generate" className="data-[state=active]:btn-shiny data-[state=active]:text-white transition-all duration-300 py-3">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Letter
            </TabsTrigger>
            <TabsTrigger value="letters" className="data-[state=active]:btn-shiny data-[state=active]:text-white transition-all duration-300 py-3">
              <FileText className="w-4 h-4 mr-2" />
              My Letters ({letters.length})
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:btn-shiny data-[state=active]:text-white transition-all duration-300 py-3">
              <TrendingUp className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="animate-fade-in-up">
            <LetterGenerator user={user} onLetterGenerated={handleLetterGenerated} />
          </TabsContent>

          <TabsContent value="letters" className="animate-fade-in-up">
            <Card className="card-hover" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'}}>
              <CardHeader>
                <CardTitle className="text-gradient text-xl">My Letters</CardTitle>
                <CardDescription className="text-lg">View and download your generated legal letters</CardDescription>
              </CardHeader>
              <CardContent>
                {letters.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                    <p className="text-blue-700 text-lg mb-2">No letters generated yet</p>
                    <p className="text-blue-600">Create your first letter using the Generate Letter tab</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {letters.map((letter, index) => (
                      <div key={letter.id} className={`border border-blue-200 rounded-xl p-6 card-hover animate-slide-in-left stagger-${Math.min(index + 1, 5)}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-blue-800 text-lg">{letter.matter}</h3>
                            <p className="text-blue-700">To: {letter.recipientName}</p>
                            <p className="text-blue-600 text-sm">
                              Created: {new Date(letter.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={letter.status === 'completed' ? 'badge-gradient' : 'bg-blue-100 text-blue-700'}>
                              {letter.status === 'completed' ? 'Ready' : 'Generating...'}
                            </Badge>
                            {letter.status === 'completed' && (
                              <Button size="sm" onClick={() => downloadPDF(letter)} className="btn-shiny text-white">
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                        {letter.status === 'completed' && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                            <p className="line-clamp-3 text-blue-800">{letter.content}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="animate-fade-in-up">
            <SubscriptionPlans user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}