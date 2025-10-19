import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase, User, Letter } from '@/lib/supabase';
import LetterGenerator from '@/components/LetterGenerator';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { FileText, LogOut, User as UserIcon, Briefcase, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadLetters();
    const interval = setInterval(loadLetters, 2000); // Refresh every 2 seconds to update letter status
    return () => clearInterval(interval);
  }, [user.id]);

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
              <Badge variant={user.role === 'employee' ? 'secondary' : 'default'}>
                {user.role === 'employee' ? 'Employee' : 'User'}
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
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">Generate Letter</TabsTrigger>
            <TabsTrigger value="letters">My Letters ({letters.length})</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            {user.role === 'employee' && <TabsTrigger value="employee">Employee Dashboard</TabsTrigger>}
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

          {user.role === 'employee' && (
            <TabsContent value="employee">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Employee Dashboard
                    </CardTitle>
                    <CardDescription>Your referral performance and earnings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{user.referrals || 0}</div>
                        <div className="text-sm text-gray-600">Referrals</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${(user.earnings || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Earnings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Coupon Code</CardTitle>
                    <CardDescription>Share this code to earn 5% commission on each sale</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                      <div className="flex-1">
                        <div className="font-mono text-lg font-bold text-purple-700">
                          {user.couponCode}
                        </div>
                        <div className="text-sm text-purple-600">20% discount for customers</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyCouponCode}
                        className="shrink-0"
                      >
                        {copiedCode ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}