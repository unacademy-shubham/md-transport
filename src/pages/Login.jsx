import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
    if (onLoginSuccess) {
      onLoginSuccess(username, password);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-slate-900 overflow-hidden font-sans select-none">
      {/* Background Highway Truck Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-[1px]"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop')` 
        }}
      ></div>

      {/* Subtle Dark Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Top spacing */}
      <div className="w-full h-4"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[420px] px-4">
        <div className="bg-white rounded-xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Login</h1>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5">Username</label>
              <input
                type="text"
                required
                placeholder="ABV2@test.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#edf2f9] border border-transparent rounded-lg px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition text-xs font-medium"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#edf2f9] border border-transparent rounded-lg pl-3.5 pr-10 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-500 font-medium cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#0099ff] hover:bg-[#0088e6] text-white font-semibold rounded-lg text-xs transition shadow-md shadow-sky-500/20 active:scale-[0.99] cursor-pointer"
            >
              Sign In
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-[#0099ff] hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Clean Footer Credits */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-white/90 drop-shadow-md">
        <p className="font-semibold tracking-wide">
          Powered by <span className="font-bold text-white">Buddy Computers</span>
        </p>
        <p className="text-[11px] text-white/80 mt-0.5">
          Design By{' '}
          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-white hover:text-sky-300 transition underline underline-offset-2"
          >
            Shubham Jangir
          </a>
        </p>
      </footer>

      {/* Forgot Password Dialog Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Forgot Password</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Please contact the system administrator or IT team to reset your password.
              </p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}