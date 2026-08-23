import React, { useState, useEffect, useRef, useCallback } from 'react';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'md_transport_session';
const ACTIVE_TAB_KEY = 'md_transport_active_tab';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  // 1. Session clear & Logout
  const handleLogout = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
    setCurrentUser(null);
  }, []);

  // 2. Reset Inactivity Timer on User Activity
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // Update last activity timestamp in localStorage
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        parsed.lastActivity = Date.now();
        localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
      } catch (err) {
        console.error('Session update error:', err);
      }
    }

    // Set 30-minute auto-logout timer
    inactivityTimerRef.current = setTimeout(() => {
      alert('Session expired due to 30 minutes of inactivity. Please login again.');
      handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [handleLogout]);

  // 3. Initial Load: Check Persistent Session from localStorage
  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const { user, lastActivity } = JSON.parse(savedSession);
          const timeElapsed = Date.now() - lastActivity;

          if (timeElapsed < INACTIVITY_TIMEOUT_MS) {
            // Re-verify if user is still active in database
            const { data, error } = await supabase
              .from('app_users')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            if (!error && data && data.is_active) {
              setCurrentUser(data);
              resetInactivityTimer();
            } else {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        }
      } catch (err) {
        console.error('Session restore error:', err);
        handleLogout();
      } finally {
        setIsSessionLoading(false);
      }
    };

    checkSavedSession();
  }, [handleLogout, resetInactivityTimer]);

  // 4. Attach Activity Event Listeners (Mouse, Keypress, Touch, Scroll)
  useEffect(() => {
    if (!currentUser) return;

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => resetInactivityTimer();

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [currentUser, resetInactivityTimer]);

  // 5. Login Handler (Exact 1:1 Match)
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
        alert('Invalid Username or Password! Please check your credentials.');
        return;
      }

      if (!data.is_active) {
        alert('This account has been deactivated.');
        return;
      }

      // Save persistent session
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user: data, lastActivity: Date.now() })
      );

      setCurrentUser(data);
    } catch (err) {
      console.error('Login error:', err);
      alert('Database connection error.');
    }
  };

  const handleUserUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user: updatedUserData, lastActivity: Date.now() })
    );
  };

  // Loading Screen while restoring session
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Restoring Secure Session...</p>
        </div>
      </div>
    );
  }

  // View 1: Not Authenticated (Login Page)
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // View 2: Authenticated ERP Console
  return (
    <SuperAdminDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  );
}
