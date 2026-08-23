import React, { useState } from 'react';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { supabase } from './supabaseClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Live Login directly against Supabase 'app_users' table
  const handleLoginSuccess = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .eq('password_hash', password.trim())
        .single();

      if (error || !data) {
        alert('Invalid Username or Password! Please check your credentials.');
        return;
      }

      if (!data.is_active) {
        alert('This account has been deactivated by Super Admin.');
        return;
      }

      setCurrentUser(data);
    } catch (err) {
      console.error('Login error:', err);
      alert('Database connection error.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
  };

  // View 1: Not Authenticated (Login Screen)
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // View 2: Super Admin / Main ERP Console
  return (
    <SuperAdminDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  );
}
