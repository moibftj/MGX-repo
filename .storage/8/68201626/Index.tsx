import React, { useState, useEffect } from 'react';
import { supabase, User } from '@/lib/supabase';
import Auth from './Auth';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = supabase.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    const currentUser = supabase.getCurrentUser();
    setUser(currentUser);
  };

  const handleSignOut = async () => {
    await supabase.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onSignOut={handleSignOut} />;
  }

  return <Dashboard user={user} onSignOut={handleSignOut} />;
}