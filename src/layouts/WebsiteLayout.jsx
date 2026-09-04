import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

export default function WebsiteLayout() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-slate-950">
      
      {/* GLOWING AI NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between shadow-2xl">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition">
            BF
          </div>
          <div className="text-xl font-extrabold tracking-tight text-white">
            Buddy Fleets<span className="text-purple-400">.</span>
          </div>
        </Link>
        
        {/* NAV LINKS WITH LARGER FONT & GLOW */}
        <div className="hidden md:flex items-center space-x-10 text-base md:text-lg font-semibold">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] ${isActive ? 'text-purple-400 font-bold drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]' : 'text-slate-300'}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/features" 
            className={({ isActive }) => 
              `transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] ${isActive ? 'text-purple-400 font-bold drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]' : 'text-slate-300'}`
            }
          >
            Features
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              `transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] ${isActive ? 'text-purple-400 font-bold drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]' : 'text-slate-300'}`
            }
          >
            About Us
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => 
              `transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] ${isActive ? 'text-purple-400 font-bold drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]' : 'text-slate-300'}`
            }
          >
            Contact
          </NavLink>
        </div>

        {/* CLIENT LOGIN ON A DISTINCT GLASS CARD */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-purple-500/60 px-5 py-2.5 rounded-xl text-white font-bold text-sm backdrop-blur-md shadow-lg shadow-purple-950/50 hover:scale-105 hover:border-purple-400 transition duration-300"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* DYNAMIC MAIN CONTENT */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* EXACT FOOTER CREDITS MATCHING IMAGE & INSTAGRAM LINK */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-6 text-center text-xs text-slate-400 space-y-2">
        <p className="tracking-wide font-medium">
          Copyright by <span className="text-white font-bold">BUDDY COMPUTERS</span>. All rights reserved.
        </p>
        <p className="tracking-widest uppercase font-semibold text-slate-400">
          DESIGNED BY{' '}
          <a 
            href="https://www.instagram.com/happiest_banda" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline decoration-purple-400 hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)] transition duration-300"
          >
            SHUBHAM JANGIR
          </a>
        </p>
      </footer>
    </div>
  );
}