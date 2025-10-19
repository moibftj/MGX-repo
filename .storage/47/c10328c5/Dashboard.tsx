import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase, User, Letter } from '@/lib/supabase';
import LetterGenerator from '@/components/LetterGenerator';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { FileText, LogOut, Briefcase, Copy, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // Only load letters for regular users, not employees
    if (user.role === 'user') {
      const loadLetters = () => {
        const userLetters = supabase.getUserLetters(user.id);
        setLetters(userLetters);
      };
      
      loadLetters();
      const interval = setInterval(loadLetters, 2000); // Refresh every 2 seconds to update letter status
      return () => clearInterval(interval);
    }
  }, [user.id, user.role]); // Fixed: removed loadLetters from dependency array to prevent infinite loop

  const handleLetterGenerated = () => {
    if (user.role === 'user') {
      const userLetters = supabase.getUserLetters(user.id);
      setLetters(userLetters);
    }
  };

  const downloadPDF = (letter: Letter) => {
    // Simple PDF generation using jsPDF simulation
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

  // Employee Dashboard - No letter generation
  if (user.role === 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome, {user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Employee
                </Badge>
                <Button variant="outline" onClick={onSignOut}>
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
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{user.referrals || 0}</div>
                    <div className="text-blue-800 font-medium">Total Referrals</div>
                    <div className="text-sm text-blue-600 mt-1">+1 point per referral</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${(user.earnings || 0).toFixed(2)}
                    </div>
                    <div className="text-green-800 font-medium">Total Earnings</div>
                    <div className="text-sm text-green-600 mt-1">5% commission per sale</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {user.referrals ? ((user.earnings || 0) / user.referrals).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-purple-800 font-medium">Avg per Referral</div>
                    <div className="text-sm text-purple-600 mt-1">Average commission</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coupon Code Section */}
            <Card className="border-2 border-dashed border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Briefcase className="w-6 h-6" />
                  Your Referral Coupon Code
                </CardTitle>
                <CardDescription>
                  Share this code with customers to earn 5% commission on each sale. Customers get 20% discount!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-xl border-2 border-dashed border-purple-300">
                  <div className="flex-1 text-center">
                    <div className="font-mono text-3xl font-bold text-purple-700 mb-2">
                      {user.couponCode}
                    </div>
                    <div className="text-purple-600 font-medium">20% Customer Discount</div>
                    <div className="text-sm text-purple-500 mt-1">You earn 5% commission</div>
                  </div>
                  <Button
                    size="lg"
                    onClick={copyCouponCode}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How the Referral System Works</CardTitle>
                <CardDescription>Maximize your earnings with our employee referral program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-blue-800 mb-2">Share Your Code</h3>
                    <p className="text-sm text-blue-600">Give your unique coupon code to potential customers</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-green-800 mb-2">Customer Subscribes</h3>
                    <p className="text-sm text-green-600">They get 20% off their subscription using your code</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-purple-800 mb-2">You Earn Commission</h3>
                    <p className="text-sm text-purple-600">Receive 5% commission + 1 referral point</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Regular User Dashboard - With letter generation
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LegalLetter AI</h1>
                <p className="text-sm text-gray-500">Welcome, {user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default">User</Badge>
              <Button variant="outline" onClick={onSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Letter</TabsTrigger>
            <TabsTrigger value="letters">My Letters ({letters.length})</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <LetterGenerator user={user} onLetterGenerated={handleLetterGenerated} />
          </TabsContent>

          <TabsContent value="letters">
            <Card>
              <CardHeader>
                <CardTitle>My Letters</CardTitle>
                <CardDescription>View and download your generated legal letters</CardDescription>
              </CardHeader>
              <CardContent>
                {letters.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No letters generated yet</p>
                    <p className="text-sm text-gray-400">Create your first letter using the Generate Letter tab</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {letters.map((letter) => (
                      <div key={letter.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{letter.matter}</h3>
                            <p className="text-sm text-gray-600">To: {letter.recipientName}</p>
                            <p className="text-xs text-gray-400">
                              Created: {new Date(letter.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={letter.status === 'completed' ? 'default' : 'secondary'}>
                              {letter.status === 'completed' ? 'Ready' : 'Generating...'}
                            </Badge>
                            {letter.status === 'completed' && (
                              <Button size="sm" onClick={() => downloadPDF(letter)}>
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                        {letter.status === 'completed' && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                            <p className="line-clamp-3">{letter.content}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionPlans user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}