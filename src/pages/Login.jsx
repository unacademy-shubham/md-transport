import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#050505] overflow-hidden font-sans select-none">

      {/* =========================================
          CINEMATIC TRUCK BACKGROUND
      ========================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1580211186716-43b9d07361de?q=90&w=2400&auto=format&fit=crop')`,
          filter: 'blur(2px) brightness(0.45)',
        }}
      />

      {/* Cinematic Dark Overlay */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      {/* Left/Right cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Bottom cinematic shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/50 pointer-events-none" />

      {/* =========================================
          TOP SPACING
      ========================================== */}
      <div className="w-full h-8 relative z-10"></div>

      {/* =========================================
          LOGIN CARD
      ========================================== */}
      <div className="relative z-10 w-full max-w-[420px] px-4">

        <div className="bg-white rounded-xl p-8 sm:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] border border-white/20 space-y-7">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              MD Transport
            </h1>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center shadow-sm">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">

            {/* Username */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 pl-0.5">
                Username
              </label>

              <input
                type="text"
                required
                placeholder="ABV2@test.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f4f7fb] border border-transparent rounded-lg px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 pl-0.5">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f4f7fb] border border-transparent rounded-lg pl-4 pr-11 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition font-medium"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                className="w-full py-3.5 bg-[#0099ff] hover:bg-[#0088e6] text-white font-bold rounded-lg text-xs tracking-wide transition shadow-md shadow-[#0099ff]/30 active:scale-[0.98] cursor-pointer"
              >
                Login
              </button>

            </div>

            {/* Forgot Password */}
            <div className="text-center pt-1.5">

              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-[#0099ff] hover:text-[#007acc] hover:underline font-bold transition cursor-pointer"
              >
                Forgot Password?
              </button>

            </div>

          </form>
        </div>
      </div>

      {/* =========================================
          FOOTER
      ========================================== */}
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
            className="font-bold text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-4 decoration-sky-400/40 hover:decoration-sky-300"
          >
            SHUBHAM JANGIR
          </a>

        </p>

      </footer>

      {/* =========================================
          FORGOT PASSWORD MODAL
      ========================================== */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl text-center space-y-4">

            <div className="w-11 h-11 bg-sky-50 text-[#0099ff] rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">
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