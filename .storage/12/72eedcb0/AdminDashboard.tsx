import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase, User, Letter, Subscription } from '@/lib/supabase';
import { Shield, Users, FileText, DollarSign, LogOut, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onSignOut: () => void;
}

export default function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(supabase.getAllUsers());
    setLetters(supabase.getAllLetters());
    setSubscriptions(supabase.getAllSubscriptions());
  };

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalReferrals = users.filter(u => u.role === 'employee').reduce((sum, emp) => sum + (emp.referrals || 0), 0);
  const regularUsers = users.filter(u => u.role === 'user').length;
  const employees = users.filter(u => u.role === 'employee').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <header className="bg-slate-800 shadow-lg border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-300">Welcome, {user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="destructive">Administrator</Badge>
              <Button variant="outline" onClick={onSignOut} className="text-white border-slate-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{regularUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Employees</p>
                  <p className="text-2xl font-bold text-white">{employees}</p>
                </div>
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Letters</p>
                  <p className="text-2xl font-bold text-white">{letters.length}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">Users</TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-slate-700">Employees</TabsTrigger>
            <TabsTrigger value="letters" className="data-[state=active]:bg-slate-700">Letters</TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-slate-700">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Users</CardTitle>
                <CardDescription className="text-slate-400">Manage user accounts and view activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300">Joined</TableHead>
                      <TableHead className="text-slate-300">Letters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.role === 'user').map((user) => (
                      <TableRow key={user.id} className="border-slate-700">
                        <TableCell className="text-white">{user.fullName}</TableCell>
                        <TableCell className="text-slate-300">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {letters.filter(l => l.userId === user.id).length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Employee Performance</CardTitle>
                <CardDescription className="text-slate-400">Track employee referrals and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Coupon Code</TableHead>
                      <TableHead className="text-slate-300">Referrals</TableHead>
                      <TableHead className="text-slate-300">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.role === 'employee').map((employee) => (
                      <TableRow key={employee.id} className="border-slate-700">
                        <TableCell className="text-white">{employee.fullName}</TableCell>
                        <TableCell className="text-slate-300">{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {employee.couponCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            {employee.referrals || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-400 font-semibold">
                          ${(employee.earnings || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="letters">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Letters</CardTitle>
                <CardDescription className="text-slate-400">View all generated legal letters</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">User</TableHead>
                      <TableHead className="text-slate-300">Matter</TableHead>
                      <TableHead className="text-slate-300">Recipient</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {letters.map((letter) => {
                      const letterUser = users.find(u => u.id === letter.userId);
                      return (
                        <TableRow key={letter.id} className="border-slate-700">
                          <TableCell className="text-white">
                            {letterUser?.fullName || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-slate-300">{letter.matter}</TableCell>
                          <TableCell className="text-slate-300">{letter.recipientName}</TableCell>
                          <TableCell>
                            <Badge variant={letter.status === 'completed' ? 'default' : 'secondary'}>
                              {letter.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(letter.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Subscription History</CardTitle>
                <CardDescription className="text-slate-400">Track all subscription purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">User</TableHead>
                      <TableHead className="text-slate-300">Plan</TableHead>
                      <TableHead className="text-slate-300">Price</TableHead>
                      <TableHead className="text-slate-300">Discount</TableHead>
                      <TableHead className="text-slate-300">Coupon</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => {
                      const subUser = users.find(u => u.id === subscription.userId);
                      const employee = subscription.employeeId ? users.find(u => u.id === subscription.employeeId) : null;
                      return (
                        <TableRow key={subscription.id} className="border-slate-700">
                          <TableCell className="text-white">
                            {subUser?.fullName || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {subscription.plan.replace('annual', 'Annual ').replace('single', 'Single Letter')}
                          </TableCell>
                          <TableCell className="text-green-400 font-semibold">
                            ${subscription.price.toFixed(0)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {subscription.discount > 0 ? `${subscription.discount}%` : 'None'}
                          </TableCell>
                          <TableCell>
                            {subscription.couponCode ? (
                              <Badge variant="outline" className="font-mono text-xs">
                                {subscription.couponCode}
                              </Badge>
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(subscription.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}