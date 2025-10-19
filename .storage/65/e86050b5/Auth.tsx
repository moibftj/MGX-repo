import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Scale, Shield, Users, Sparkles, Star } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'employee'
  });

  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    adminSecret: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await supabase.signIn(loginForm.email, loginForm.password);
      if (error) {
        setError(error);
      } else if (user) {
        onAuthSuccess();
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await supabase.signUp(
        signupForm.email,
        signupForm.password,
        signupForm.fullName,
        signupForm.role
      );
      if (error) {
        setError(error);
      } else if (user) {
        onAuthSuccess();
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await supabase.signUp(
        adminForm.email,
        adminForm.password,
        adminForm.fullName,
        'admin',
        adminForm.adminSecret
      );
      if (error) {
        setError(error);
      } else if (user) {
        onAuthSuccess();
      }
    } catch (err) {
      setError('Admin signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--primary-gradient)' }}>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <Star className="w-4 h-4 text-white/20" />
            </div>
          ))}
        </div>
        
        <Card className="w-full max-w-md glass-card animate-fade-in-scale relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: 'var(--accent-gradient)' }}>
              <Shield className="w-8 h-8 text-white animate-icon-bounce" />
            </div>
            <CardTitle className="text-2xl gradient-text">Admin Access</CardTitle>
            <CardDescription className="text-blue-600">Create admin account with secret key</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminFullName" className="text-blue-700 font-medium">Full Name</Label>
                <Input
                  id="adminFullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-blue-700 font-medium">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-blue-700 font-medium">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminSecret" className="text-blue-700 font-medium">Admin Secret Key</Label>
                <Input
                  id="adminSecret"
                  type="password"
                  placeholder="Enter admin secret key"
                  value={adminForm.adminSecret}
                  onChange={(e) => setAdminForm({ ...adminForm, adminSecret: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              {error && (
                <Alert className="alert-error animate-slide-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 spinner"></div>
                    Creating Admin Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Create Admin Account
                  </div>
                )}
              </Button>
              <Button
                type="button"
                className="btn-secondary w-full"
                onClick={() => setShowAdminAccess(false)}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--primary-gradient)' }}>
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-white/20 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-slide-in">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: 'var(--accent-gradient)' }}>
            <Scale className="w-10 h-10 text-white animate-float" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 gradient-text">LegalLetter AI</h1>
          <p className="text-blue-100 text-lg">Professional Legal Document Generation</p>
        </div>

        <Card className="glass-card animate-fade-in-scale">
          <CardHeader>
            <CardTitle className="gradient-text text-center">Welcome</CardTitle>
            <CardDescription className="text-blue-600 text-center">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger value="login" className="tab-inactive data-[state=active]:tab-active rounded-md">Login</TabsTrigger>
                <TabsTrigger value="signup" className="tab-inactive data-[state=active]:tab-active rounded-md">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-slide-in">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-blue-700 font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  {error && (
                    <Alert className="alert-error animate-slide-in">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 spinner"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-slide-in">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-blue-700 font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-blue-700 font-medium">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-blue-700 font-medium">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-blue-700 font-medium">Account Type</Label>
                    <RadioGroup
                      value={signupForm.role}
                      onValueChange={(value) => setSignupForm({ ...signupForm, role: value as 'user' | 'employee' })}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">User - Generate legal letters</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300">
                        <RadioGroupItem value="employee" id="employee" />
                        <Label htmlFor="employee" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">Employee - Earn referral commissions</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {error && (
                    <Alert className="alert-error animate-slide-in">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 spinner"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                className="btn-ghost text-sm"
                onClick={() => setShowAdminAccess(true)}
              >
                Admin Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}