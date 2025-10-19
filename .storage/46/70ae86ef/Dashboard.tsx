import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase, User, Letter } from '@/lib/supabase';
import LetterGenerator from '@/components/LetterGenerator';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { FileText, LogOut, User as UserIcon, Briefcase, Copy, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
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
      loadLetters();
      const interval = setInterval(loadLetters, 2000); // Refresh every 2 seconds to update letter status
      return () => clearInterval(interval);
    }
  }, [user.id, user.role]);

  const loadLetters = () => {
    const userLetters = supabase.getUserLetters(user.id);
    setLetters(userLetters);
  };

  const handleLetterGenerated = () => {
    loadLetters();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Employee Portal</h1>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Performance Overview */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Performance Dashboard
                </CardTitle>
                <CardDescription>Your referral performance and earnings overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{user.referrals || 0}</div>
                    <div className="text-sm text-blue-700 font-medium">Total Referrals</div>
                    <div className="text-xs text-blue-600 mt-1">+1 point per referral</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${(user.earnings || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Total Earnings</div>
                    <div className="text-xs text-green-600 mt-1">5% commission per sale</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {user.referrals ? ((user.earnings || 0) / (user.referrals || 1)).toFixed(0) : '0'}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Avg. per Referral</div>
                    <div className="text-xs text-purple-600 mt-1">Average commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Code Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-purple-600" />
                  Your Coupon Code
                </CardTitle>
                <CardDescription>Share this code to earn 5% commission</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                    <div className="text-center">
                      <div className="font-mono text-2xl font-bold text-purple-700 mb-2">
                        {user.couponCode}
                      </div>
                      <div className="text-sm text-purple-600 mb-3">20% discount for customers</div>
                      <Button
                        onClick={copyCouponCode}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        {copiedCode ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Share this code with potential customers to earn commission on their purchases
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Structure */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Commission Structure
                </CardTitle>
                <CardDescription>How you earn with each referral</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Single Letter ($299)</span>
                    <span className="text-green-600 font-bold">$11.96</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Annual 4 Letters ($299)</span>
                    <span className="text-green-600 font-bold">$11.96</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Annual 8 Letters ($599)</span>
                    <span className="text-green-600 font-bold">$23.96</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 p-2 bg-blue-50 rounded">
                    <strong>Note:</strong> Commission calculated on discounted price (after 20% customer discount)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How to Share Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How to Share Your Coupon Code</CardTitle>
              <CardDescription>Maximize your referrals with these sharing strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">📱 Social Media</h4>
                  <p className="text-sm text-gray-600">Share on LinkedIn, Twitter, Facebook with your personal network</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">📧 Email Signature</h4>
                  <p className="text-sm text-gray-600">Add your coupon code to your email signature for passive promotion</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">🤝 Direct Referrals</h4>
                  <p className="text-sm text-gray-600">Personally recommend to friends, family, and colleagues</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">💼 Professional Networks</h4>
                  <p className="text-sm text-gray-600">Share with business contacts who might need legal letters</p>
                </div>
              </div>
            </CardContent>
          </Card>
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