import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Truck, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Fast Client Public IP with Timeout Protection
  const getClientIp = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s max timeout

      const res = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      return data.ip || '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  };

  // Helper: Reliable Audit Log Insert
  const recordAuditLog = async (logData) => {
    try {
      await supabase.from('audit_logs').insert([logData]);
    } catch (err) {
      console.error('Audit log failed to record:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const ip = await getClientIp();

      // Check Super Admin Root Account
      if (cleanUser === 'admin' && cleanPass === 'admin123') {
        const rootUser = {
          id: 'root-admin',
          username: 'admin',
          name: 'Buddy Computers',
          role: 'SUPER_ADMIN',
          branch: 'Head Office',
          site_access: 'ALL',
          password_hash: 'admin123'
        };

        // 1. Live Audit Log: Super Admin Login
        await recordAuditLog({
          module: 'AUTH',
          action_type: 'LOGIN',
          description: `Super Admin @${rootUser.username} (${rootUser.name}) logged in successfully via Web Console`,
          performed_by: rootUser.name,
          performed_by_username: rootUser.username,
          ip_address: ip,
          user_agent: navigator.userAgent || 'Web Console Client',
          metadata: {
            auth_type: 'ROOT_DIRECT',
            role: rootUser.role,
            screen_size: `${window.screen.width}x${window.screen.height}`
          }
        });

        if (onLoginSuccess) {
          onLoginSuccess(rootUser);
        }
        return;
      }

      // Query Staff Database Users
      const { data: dbUser, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', cleanUser)
        .maybeSingle();

      if (error || !dbUser) {
        // 2. Live Audit Log: Failed Login (User Not Found)
        await recordAuditLog({
          module: 'AUTH',
          action_type: 'FAILED_LOGIN',
          description: `Failed login attempt for username: @${cleanUser}`,
          performed_by: cleanUser,
          performed_by_username: cleanUser,
          ip_address: ip,
          user_agent: navigator.userAgent || 'Web Console Client',
          metadata: { reason: 'User not found in database', timestamp: new Date().toISOString() }
        });

        setErrorMessage('Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // Check Account Status
      if (dbUser.is_active === false) {
        // 3. Live Audit Log: Suspended Account Login Attempt
        await recordAuditLog({
          module: 'AUTH',
          action_type: 'FAILED_LOGIN',
          description: `Blocked login attempt on suspended account: @${cleanUser}`,
          performed_by: dbUser.name,
          performed_by_username: cleanUser,
          ip_address: ip,
          user_agent: navigator.userAgent || 'Web Console Client',
          metadata: { reason: 'Account Suspended', role: dbUser.role }
        });

        setErrorMessage('This account is suspended. Contact system administrator.');
        setIsLoading(false);
        return;
      }

      // Check Password
      if (dbUser.password_hash !== cleanPass) {
        // 4. Live Audit Log: Failed Password Attempt
        await recordAuditLog({
          module: 'AUTH',
          action_type: 'FAILED_LOGIN',
          description: `Incorrect password attempt for @${cleanUser}`,
          performed_by: dbUser.name,
          performed_by_username: cleanUser,
          ip_address: ip,
          user_agent: navigator.userAgent || 'Web Console Client',
          metadata: { reason: 'Incorrect Password Hash', role: dbUser.role }
        });

        setErrorMessage('Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // 5. Live Audit Log: Successful Staff Login
      await recordAuditLog({
        module: 'AUTH',
        action_type: 'LOGIN',
        description: `User @${dbUser.username} (${dbUser.name}) logged into system session`,
        performed_by: dbUser.name,
        performed_by_username: dbUser.username,
        ip_address: ip,
        user_agent: navigator.userAgent || 'Web Console Client',
        metadata: {
          role: dbUser.role,
          branch: dbUser.branch || 'Head Office',
          site_access: dbUser.site_access || 'ALL',
          screen_size: `${window.screen.width}x${window.screen.height}`
        }
      });

      if (onLoginSuccess) {
        onLoginSuccess(dbUser);
      }
    } catch (err) {
      console.error('Login process error:', err);
      setErrorMessage('Authentication server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#050505] overflow-hidden font-sans select-none">

      {/* Cinematic Truck Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('/bg-truck.png')`,
          filter: 'brightness(0.95) contrast(1.05)',
        }}
      />

      {/* Light Clean Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Bottom Subtle Shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Top Spacing */}
      <div className="w-full h-8 relative z-10"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] px-4">

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] border border-white/40 space-y-6">

          {/* Header with Buddy Fleets Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20 font-black text-lg">
              BF
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Buddy Fleets
              </h1>
              <p className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase mt-1">
                Transport Management System
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center shadow-xs flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">

            {/* Username */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5 pl-0.5">
                Username / System ID
              </label>

              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="e.g. admin or site_executive"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5 pl-0.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 rounded-xl pl-4 pr-11 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs tracking-wide transition shadow-lg shadow-blue-500/30 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying Session & Telemetry...' : 'Access Console'}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold transition cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full pb-6 pt-4 text-center">
        <p className="text-[11px] text-white/70 font-medium tracking-wide">
          Copyright by{' '}
          <span className="font-bold text-white uppercase tracking-wider">
            BUDDY COMPUTERS
          </span>
          . All rights reserved.
        </p>

        <p className="text-[10px] text-white/50 mt-1 uppercase tracking-[0.1em]">
          Designed by{' '}
          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300"
          >
            SHUBHAM JANGIR
          </a>
        </p>
      </footer>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Forgot Password?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Contact your Head Office dispatch manager or system administrator
                to reset your login credentials.
              </p>
            </div>

            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}