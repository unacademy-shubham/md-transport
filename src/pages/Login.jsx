import React, { useState } from 'react';
import { Truck, User, Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

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
    
    // Auth Callback (Parent component ko user pass karega)
    if (onLoginSuccess) {
      onLoginSuccess(username, password);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-slate-100 overflow-hidden font-sans select-none">
      {/* Background Liquid / Ambient Blobs for Glass Refraction */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Subtle Mesh Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      {/* Top Space Filler */}
      <div className="w-full h-8"></div>

      {/* Main Glassmorphism Login Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="relative backdrop-blur-2xl bg-white/60 border border-white/80 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-300">
          
          {/* Glass Reflection Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 rounded-t-3xl"></div>

          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="p-3.5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-900 rounded-2xl shadow-lg shadow-amber-500/25 ring-4 ring-white/60 flex items-center justify-center">
              <Truck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">MD Transport</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5 tracking-wide">Enterprise Fleet & Plant Logistics</p>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="text-slate-600 font-semibold block mb-1.5 pl-1">Username / User ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1.5 pl-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Authorized Plant & HO Personnel Only</span>
          </div>
        </div>
      </div>

      {/* Footer / Copyright / Creator Credit Link */}
      <footer className="relative z-10 w-full py-5 text-center text-xs text-slate-500">
        <p className="font-normal">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-700">MD Transport</span>. All rights reserved.
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">
          Created by{' '}
          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-700 hover:text-amber-600 transition-colors underline decoration-slate-300 underline-offset-4 hover:decoration-amber-500"
          >
            shubham jangir
          </a>
        </p>
      </footer>

      {/* Forgot Password Glass Modal Popup */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Forgot Password?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Contact your Head Office administrator at Ahmedabad or the IT Dispatch manager to reset your credentials.
              </p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}