import React, { useState, useEffect, useRef, useCallback } from 'react';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'buddy_fleets_session';
const ACTIVE_TAB_KEY = 'buddy_fleets_active_tab';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  // Helper: Fetch Client Public IP
  const getClientIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  };

  // 1. Session Clear & Forensic Logout
  const handleLogout = useCallback(async (isAutoTimeout = false) => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    const savedSession = localStorage.getItem(SESSION_KEY);
    let userToLog = currentUser;

    if (!userToLog && savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        userToLog = parsed.user;
      } catch (e) {}
    }

    // Insert Live Forensic Logout Audit Log
    if (userToLog) {
      try {
        const ip = await getClientIp();
        await supabase.from('audit_logs').insert([{
          module: 'AUTH',
          action_type: isAutoTimeout ? 'TIMEOUT_LOGOUT' : 'LOGOUT',
          description: isAutoTimeout
            ? `User @${userToLog.username} (${userToLog.name}) auto-logged out due to 30 mins inactivity`
            : `User @${userToLog.username} (${userToLog.name}) signed out securely`,
          performed_by: userToLog.name,
          performed_by_username: userToLog.username,
          ip_address: ip,
          user_agent: navigator.userAgent || 'Web Console Client',
          metadata: {
            role: userToLog.role,
            reason: isAutoTimeout ? 'INACTIVITY_TIMEOUT_30M' : 'USER_TRIGGERED_SIGNOUT',
            session_ended_at: new Date().toISOString()
          }
        }]);
      } catch (err) {
        console.error('Logout audit log error:', err);
      }
    }

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
    setCurrentUser(null);
  }, [currentUser]);

  // 2. Reset Inactivity Timer on User Interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

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

    // 30-minute auto-logout timer
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout(true);
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
            // Root Admin Hardcoded fallback check
            if (user.id === 'root-admin' || user.username === 'admin') {
              setCurrentUser(user);
              resetInactivityTimer();
              setIsSessionLoading(false);
              return;
            }

            // Re-verify if user is still active in database
            const { data, error } = await supabase
              .from('app_users')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            if (!error && data && data.is_active !== false) {
              setCurrentUser(data);
              resetInactivityTimer();
            } else {
              handleLogout();
            }
          } else {
            handleLogout(true);
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

  // 4. Attach Activity Event Listeners (Mouse, Keyboard, Touch, Scroll)
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

  // 5. Login Handler
  const handleLoginSuccess = (authenticatedUser) => {
    // Save persistent session
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user: authenticatedUser, lastActivity: Date.now() })
    );

    setCurrentUser(authenticatedUser);
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 tracking-wider">Restoring Secure Session...</p>
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
      onLogout={() => handleLogout(false)}
      onUserUpdate={handleUserUpdate}
    />
  );
}