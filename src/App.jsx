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
        .eq('username', username.trim())
        .eq('password_hash', password.trim())
        .maybeSingle();

      if (error) {
        alert('Supabase Error: ' + error.message);
        return;
      }

      if (!data) {
        alert('Invalid Username or Password! (No match found in app_users table)');
        return;
      }

      if (!data.is_active) {
        alert('This account has been deactivated.');
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

  // View 1: Login Page
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // View 2: Super Admin Dashboard
  return (
    <SuperAdminDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  );
}
