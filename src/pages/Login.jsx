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
      {/* 4K Cinematic Ultra-HD Logistics Highway Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2560&auto=format&fit=crop')`,
        }}
      ></div>

      {/* Subtle Depth Gradient & Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 backdrop-blur-[0.5px]"></div>

      {/* Top spacing */}
      <div className="w-full h-6"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[430px] px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/80 space-y-6">
          {/* Header Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Login</h1>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 pl-0.5">Username</label>
              <input
                type="text"
                required
                placeholder="ABV2@test.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition text-xs font-medium"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 pl-0.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-transparent rounded-xl pl-4 pr-11 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition text-xs font-medium"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0099ff] focus:ring-[#0099ff]/30 cursor-pointer accent-[#0099ff]"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-500 font-medium cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Blue Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#0099ff] hover:bg-[#0088e6] text-white font-semibold rounded-xl text-xs tracking-wide transition shadow-lg shadow-[#0099ff]/25 active:scale-[0.99] cursor-pointer"
            >
              Sign In
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-[#0099ff] hover:text-[#007acc] hover:underline font-semibold transition cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Crisp Glass Bottom Badge Footer */}
      <footer className="relative z-10 w-full py-6 flex justify-center px-4">
        <div className="backdrop-blur-md bg-black/40 border border-white/15 px-6 py-2.5 rounded-full shadow-2xl text-center">
          <p className="text-xs text-slate-200 font-medium tracking-wide">
            Powered by <span className="font-extrabold text-white">Buddy Computers</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
            Design By{' '}
            <a
              href="https://www.instagram.com/happiest_banda"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-2 decoration-sky-500/50 hover:decoration-sky-400"
            >
              Shubham Jangir
            </a>
          </p>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-11 h-11 bg-sky-50 text-[#0099ff] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Reset Credentials</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Contact your Head Office dispatch manager or administrator to reset your login access.
              </p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}