import React, { useState } from 'react';
import { User, Lock, ArrowRight, KeyRound } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#f4f7fa] overflow-hidden font-sans select-none">
      {/* Liquid Ambient Light Drops */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-br from-sky-200/50 to-blue-300/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-tl from-amber-100/60 to-orange-200/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full h-4"></div>

      {/* Water-Glass Login Box */}
      <div className="relative z-10 w-full max-w-[400px] px-4">
        <div className="backdrop-blur-xl bg-white/70 border border-white/90 rounded-[28px] p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">MD Transport</h1>
            <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="text-slate-600 font-semibold block mb-1.5 pl-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200/70 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1.5 pl-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200/70 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Minimal Clean Footer */}
      <footer className="relative z-10 w-full py-5 text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} MD Transport. All rights reserved by <span className="text-slate-600 font-medium">Buddy Computers</span>.
        </p>
        <p className="mt-1 text-[11px]">
          Created by{' '}
          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-900 font-medium underline underline-offset-4 decoration-slate-300"
          >
            shubham jangir
          </a>
        </p>
      </footer>

      {/* Forgot Password Dialog */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Forgot Password</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Please contact the system administrator at Head Office to reset your credentials.
              </p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}