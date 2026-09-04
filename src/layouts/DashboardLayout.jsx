import React from 'react';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout({ currentUser, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* 1. SIDEBAR (Left Menu) */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-lg">
        <div className="p-6 text-xl font-extrabold tracking-tight text-cyan-400 border-b border-slate-800">
          BuddyFleets<span className="text-white">.</span>
        </div>
        
        <div className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          ERP Navigation
        </div>
        
        {/* Navigation Links can be added here */}
        <div className="px-4 space-y-1">
          <span className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-cyan-600 text-white">
            📊 Dashboard Overview
          </span>
        </div>

        {/* User Profile at bottom */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/50">
          <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'Admin User'}</p>
          <p className="text-xs text-cyan-400 capitalize">Role: {currentUser?.role || 'SaaS Client'}</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h1 className="text-base font-bold text-slate-800">Transport Management & Fleet Console</h1>
          
          <button 
            onClick={onLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Secure Sign Out
          </button>
        </header>

        {/* Dashboard Dynamic Content / Child Pages */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}