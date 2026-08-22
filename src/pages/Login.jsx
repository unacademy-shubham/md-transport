import React, { useState, useRef } from 'react';
import { Truck, User, Lock, ArrowRight, ShieldCheck, KeyRound, Sparkles, Building, Phone } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  // 3D Tilt Dynamic Physics
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 20 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({
      rotateX,
      rotateY,
      shadowX: (centerX - x) * 0.15,
      shadowY: Math.max(15, (centerY - y) * 0.15 + 25),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 20 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Kripya username aur password enter karein.');
      return;
    }
    if (onLoginSuccess) {
      onLoginSuccess(username, password);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-slate-100 via-sky-50/40 to-amber-50/30 overflow-hidden font-sans select-none"
      style={{ perspective: '1200px' }}
    >
      {/* 3D Soft Light Ambient Elements */}
      <div className="absolute top-10 left-12 w-80 h-80 bg-gradient-to-tr from-amber-200/40 to-yellow-100/60 rounded-full blur-3xl pointer-events-none transform -rotate-12 animate-pulse"></div>
      <div className="absolute bottom-16 right-10 w-96 h-96 bg-gradient-to-br from-sky-200/40 to-indigo-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-slate-200/30 rounded-full blur-2xl pointer-events-none"></div>

      {/* Engineering Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      ></div>

      <div className="w-full h-4"></div>

      {/* 3D Glass Interactive Main Box */}
      <div className="relative z-10 w-full max-w-md px-6 py-4">
        <div
          ref={cardRef}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(20px)`,
            boxShadow: `${tilt.shadowX}px ${tilt.shadowY}px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8) inset`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out',
          }}
          className="relative backdrop-blur-2xl bg-white/70 rounded-3xl p-8 sm:p-9 border border-white/90"
        >
          {/* 3D Floating Plant Badges */}
          <div 
            style={{ transform: 'translateZ(30px)' }}
            className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase rounded-full shadow-md shadow-amber-500/20 border border-white/80 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>UltraTech Dedicated</span>
          </div>

          {/* 3D Header & Logo */}
          <div style={{ transform: 'translateZ(25px)' }} className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="p-4 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 rounded-2xl shadow-xl shadow-amber-500/30 border-2 border-white/80 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <Truck className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 drop-shadow-sm">MD Transport</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Fleet & Logistics Portal • Dhar | Banswara | Dhule</p>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div style={{ transform: 'translateZ(20px)' }} className="mb-4 p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ transform: 'translateZ(20px)' }} className="space-y-4 text-xs font-medium">
            <div>
              <label className="text-slate-700 font-bold block mb-1.5 pl-1">Username / User ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter User ID (e.g. director, dhar.exec)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200/90 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition shadow-inner font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 pl-1">Password</label>
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
                  className="w-full bg-white/90 border border-slate-200/90 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition shadow-inner font-medium"
                />
              </div>
            </div>

            {/* Forgot Password Trigger */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* 3D Action Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 border border-amber-300/60 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>Sign In to Workstation</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Security Badge */}
          <div style={{ transform: 'translateZ(15px)' }} className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Multi-Plant RBAC Cloud Security</span>
          </div>
        </div>
      </div>

      {/* Footer with Buddy Computers & Shubham Jangir Credit */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-600">
          &copy; {new Date().getFullYear()} <span className="font-black text-slate-800">MD Transport</span>. All rights reserved by <span className="font-bold text-slate-800">Buddy Computers</span>.
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">
          Created by{' '}
          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-800 hover:text-amber-600 transition-colors underline decoration-slate-300 underline-offset-4 hover:decoration-amber-500"
          >
            shubham jangir
          </a>
        </p>
      </footer>

      {/* Forgot Password 3D Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Reset Credentials</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Contact the Ahmedabad Head Office administration team or plant IT support to issue a secure password reset.
              </p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-slate-900/20"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}