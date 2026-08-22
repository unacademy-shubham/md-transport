import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  FileSpreadsheet, 
  Fuel, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ArrowRight,
  LogOut,
  DollarSign,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

// Hardcoded Master Users for Instant Demo
const AUTH_USERS = [
  { email: 'director@mdtransport.com', password: '123', name: 'Mukesh Dave (Director)', role: 'DIRECTOR', site: 'ALL', branch: 'Ahmedabad HO' },
  { email: 'ops@mdtransport.com', password: '123', name: 'Rajiv Sharma (Ops Head)', role: 'HO_OPS', site: 'ALL', branch: 'Ahmedabad HO' },
  { email: 'accounts@mdtransport.com', password: '123', name: 'Praveen Jain (Chief Acc)', role: 'HO_ACCOUNTS', site: 'ALL', branch: 'Ahmedabad HO' },
  { email: 'dhar@mdtransport.com', password: '123', name: 'Anil Verma (Plant Incharge)', role: 'SITE_EXEC', site: 'DHAR', branch: 'Dhar Plant (MP)' },
  { email: 'banswara@mdtransport.com', password: '123', name: 'Kishan Meena (Plant Incharge)', role: 'SITE_EXEC', site: 'BANSWARA', branch: 'Banswara Plant (RJ)' },
  { email: 'dhule@mdtransport.com', password: '123', name: 'Sanjay Patil (Plant Incharge)', role: 'SITE_EXEC', site: 'DHULE', branch: 'Dhule Plant (MH)' },
];

const INITIAL_TRIPS = [
  {
    id: 'LR-DHR-8801',
    site: 'DHAR',
    plantName: 'UltraTech Dhar Works',
    destination: 'Indore Depot, MP',
    vehicleNo: 'MP-09-HH-4412',
    driver: 'Rameshwar Gurjar',
    cementType: 'OPC 53 (Bagged)',
    weightTons: 38.5,
    advanceCash: 4500,
    dieselLiters: 140,
    freightTotal: 34650,
    status: 'In-Transit',
    invoiceNo: 'UT-DHR-24-909',
    loadedAt: 'Today, 06:30 AM',
  },
  {
    id: 'LR-BSW-4102',
    site: 'BANSWARA',
    plantName: 'UltraTech Banswara Unit',
    destination: 'Udaipur RMC Plant, RJ',
    vehicleNo: 'RJ-03-GA-1109',
    driver: 'Kailash Meena',
    cementType: 'PPC (Loose / Bulker)',
    weightTons: 42.0,
    advanceCash: 3000,
    dieselLiters: 120,
    freightTotal: 29400,
    status: 'In-Transit',
    invoiceNo: 'UT-BSW-24-118',
    loadedAt: 'Today, 08:15 AM',
  },
  {
    id: 'LR-DHL-2091',
    site: 'DHULE',
    plantName: 'UltraTech Dhule Grinding Unit',
    destination: 'Nashik Warehouse, MH',
    vehicleNo: 'MH-18-BQ-7740',
    driver: 'Sanjay Patil',
    cementType: 'Super Cement (Bagged)',
    weightTons: 35.0,
    advanceCash: 5000,
    dieselLiters: 160,
    freightTotal: 38500,
    status: 'Loaded - In Plant',
    invoiceNo: 'UT-DHL-24-554',
    loadedAt: 'Today, 10:45 AM',
  },
  {
    id: 'LR-DHR-8798',
    site: 'DHAR',
    plantName: 'UltraTech Dhar Works',
    destination: 'Bhopal Project Site, MP',
    vehicleNo: 'MP-11-AB-9811',
    driver: 'Vikram Yadav',
    cementType: 'Weather Pro (Bagged)',
    weightTons: 40.0,
    advanceCash: 6000,
    dieselLiters: 190,
    freightTotal: 48000,
    status: 'Delivered',
    invoiceNo: 'UT-DHR-24-890',
    loadedAt: 'Yesterday',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newLR, setNewLR] = useState({
    site: 'DHAR',
    invoiceNo: '',
    destination: '',
    vehicleNo: '',
    driver: '',
    cementType: 'OPC 53 (Bagged)',
    weightTons: '',
    advanceCash: '',
    dieselLiters: '',
    freightTotal: '',
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const user = AUTH_USERS.find(
      u => u.email.trim().toLowerCase() === emailInput.trim().toLowerCase() && u.password === passwordInput.trim()
    );
    if (user) {
      setCurrentUser(user);
      setSelectedSiteFilter(user.site);
      setLoginError('');
      if (user.role === 'SITE_EXEC') {
        setNewLR(prev => ({ ...prev, site: user.site }));
      }
    } else {
      setLoginError('Invalid Email or Password! (Password is: 123)');
    }
  };

  const handleQuickLogin = (email) => {
    const user = AUTH_USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setSelectedSiteFilter(user.site);
      setLoginError('');
      if (user.role === 'SITE_EXEC') {
        setNewLR(prev => ({ ...prev, site: user.site }));
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  const handleCreateLR = (e) => {
    e.preventDefault();
    const siteToUse = currentUser.role === 'SITE_EXEC' ? currentUser.site : newLR.site;
    const sitePrefix = siteToUse === 'DHAR' ? 'DHR' : siteToUse === 'BANSWARA' ? 'BSW' : 'DHL';
    
    const entry = {
      id: `LR-${sitePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      site: siteToUse,
      plantName: `UltraTech ${siteToUse} Unit`,
      invoiceNo: newLR.invoiceNo,
      destination: newLR.destination,
      vehicleNo: newLR.vehicleNo.toUpperCase(),
      driver: newLR.driver,
      cementType: newLR.cementType,
      weightTons: parseFloat(newLR.weightTons) || 0,
      advanceCash: parseInt(newLR.advanceCash) || 0,
      dieselLiters: parseInt(newLR.dieselLiters) || 0,
      freightTotal: parseInt(newLR.freightTotal) || 0,
      status: 'Loaded - In Plant',
      loadedAt: 'Just Now',
    };

    setTrips([entry, ...trips]);
    setIsModalOpen(false);
    setNewLR({
      site: currentUser.role === 'SITE_EXEC' ? currentUser.site : 'DHAR',
      invoiceNo: '',
      destination: '',
      vehicleNo: '',
      driver: '',
      cementType: 'OPC 53 (Bagged)',
      weightTons: '',
      advanceCash: '',
      dieselLiters: '',
      freightTotal: '',
    });
  };

  // 1. LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-amber-500 rounded-2xl text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              <Truck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">MD Transport Portal</h1>
            <p className="text-xs text-slate-400">UltraTech Cement Dedicated Fleet</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Sign in to your account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter credentials or use 1-click login below</p>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@mdtransport.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password (123)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demo: 1-Click Role Login</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('director@mdtransport.com')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                >
                  <p className="text-xs font-semibold text-purple-300">Director / Owner</p>
                  <p className="text-[10px] text-slate-500">Ahmedabad HQ (Full)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('accounts@mdtransport.com')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                >
                  <p className="text-xs font-semibold text-emerald-300">HO Accounts</p>
                  <p className="text-[10px] text-slate-500">Billing & Fuel Ledger</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('ops@mdtransport.com')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                >
                  <p className="text-xs font-semibold text-blue-300">HO Operations</p>
                  <p className="text-[10px] text-slate-500">400 Fleet Tracking</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('dhar@mdtransport.com')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                >
                  <p className="text-xs font-semibold text-amber-300">Site Incharge</p>
                  <p className="text-[10px] text-slate-500">Dhar Plant (LR Entry)</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW
  const visibleTrips = trips.filter(t => {
    if (currentUser.role === 'SITE_EXEC') {
      if (t.site !== currentUser.site) return false;
    } else {
      if (selectedSiteFilter !== 'ALL' && t.site !== selectedSiteFilter) return false;
    }

    return (
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalLoadedMT = visibleTrips.reduce((sum, item) => sum + item.weightTons, 0);
  const totalFreightRevenue = visibleTrips.reduce((sum, item) => sum + item.freightTotal, 0);
  const totalAdvancesIssued = visibleTrips.reduce((sum, item) => sum + item.advanceCash, 0);
  const totalDieselIssued = visibleTrips.reduce((sum, item) => sum + item.dieselLiters, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30 px-6 py-3 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950 font-black tracking-wider flex items-center gap-1">
              <Truck className="w-5 h-5" />
              <span>MDT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-slate-100">MD Transport Management</h1>
                <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                  {currentUser.branch}
                </span>
              </div>
              <p className="text-xs text-slate-400">UltraTech Logistics • ~400 Fleet</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role !== 'SITE_EXEC' && (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-slate-400 font-medium">Plant:</span>
                <select 
                  value={selectedSiteFilter} 
                  onChange={(e) => setSelectedSiteFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Sites</option>
                  <option value="DHAR" className="bg-slate-900">Dhar Plant (MP)</option>
                  <option value="BANSWARA" className="bg-slate-900">Banswara Plant (RJ)</option>
                  <option value="DHULE" className="bg-slate-900">Dhule Plant (MH)</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.role.replace('_', ' ')}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 border border-slate-700 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Active Dispatches</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">{visibleTrips.length} Loads</h3>
                <p className="text-xs text-amber-400 mt-1">
                  {currentUser.role === 'SITE_EXEC' ? `${currentUser.site} Plant` : `Filter: ${selectedSiteFilter}`}
                </p>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Cement Dispatched</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalLoadedMT.toFixed(1)} MT</h3>
                <p className="text-xs text-slate-500 mt-1">UltraTech OPC / PPC</p>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {(currentUser.role === 'DIRECTOR' || currentUser.role === 'HO_ACCOUNTS') ? (
            <>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Total Freight Billed</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                      ₹{totalFreightRevenue.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">UltraTech Billing</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Advances & Diesel Issued</p>
                    <h3 className="text-2xl font-bold text-rose-400 mt-1">
                      ₹{totalAdvancesIssued.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Diesel: {totalDieselIssued} L</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg text-rose-400">
                    <Fuel className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Site Diesel Issued</p>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-1">{totalDieselIssued} Liters</h3>
                    <p className="text-xs text-slate-500 mt-1">Fuel Slip Issued</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
                    <Fuel className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400">En-Route Status</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                      {visibleTrips.filter(t => t.status === 'In-Transit').length} Trucks
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Live In Transit</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search LR No, Truck, Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            {currentUser.role === 'SITE_EXEC' ? `Create LR (${currentUser.site})` : 'Create UltraTech LR'}
          </button>
        </div>

        {/* LR Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <div>
              <h2 className="text-sm font-bold text-slate-200">UltraTech Plant Dispatch Register</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.role === 'SITE_EXEC' ? `Records for ${currentUser.site} Plant` : 'Consolidated Plant Records'}
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded-md">
              {visibleTrips.length} Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">LR Details</th>
                  <th className="p-3.5">Plant Site</th>
                  <th className="p-3.5">Truck & Driver</th>
                  <th className="p-3.5">Destination & Cargo</th>
                  <th className="p-3.5">Tonnage / Diesel</th>
                  {(currentUser.role === 'DIRECTOR' || currentUser.role === 'HO_ACCOUNTS') && (
                    <th className="p-3.5">Freight & Advance</th>
                  )}
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {visibleTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-amber-400">{trip.id}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Inv: {trip.invoiceNo}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-300">{trip.site}</td>
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-slate-200">{trip.vehicleNo}</p>
                      <p className="text-slate-400 text-[11px]">{trip.driver}</p>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{trip.destination}</span>
                      </div>
                      <p className="text-[11px] text-amber-400/80 mt-0.5">{trip.cementType}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-100">{trip.weightTons} MT</td>
                    {(currentUser.role === 'DIRECTOR' || currentUser.role === 'HO_ACCOUNTS') && (
                      <td className="p-3.5">
                        <p className="font-semibold text-emerald-400">₹{trip.freightTotal.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-rose-400">Adv: ₹{trip.advanceCash.toLocaleString('en-IN')}</p>
                      </td>
                    )}
                    <td className="p-3.5">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Create UltraTech Plant LR (Bilty)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLR} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Dispatch Site</label>
                  <select
                    disabled={currentUser.role === 'SITE_EXEC'}
                    value={currentUser.role === 'SITE_EXEC' ? currentUser.site : newLR.site}
                    onChange={(e) => setNewLR({...newLR, site: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  >
                    <option value="DHAR">Dhar Plant (MP)</option>
                    <option value="BANSWARA">Banswara Plant (RJ)</option>
                    <option value="DHULE">Dhule Plant (MH)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold">UltraTech DC / Invoice</label>
                  <input
                    required
                    type="text"
                    placeholder="UT-24-XXXX"
                    value={newLR.invoiceNo}
                    onChange={(e) => setNewLR({...newLR, invoiceNo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Truck Number</label>
                  <input
                    required
                    type="text"
                    placeholder="MP-09-AB-1234"
                    value={newLR.vehicleNo}
                    onChange={(e) => setNewLR({...newLR, vehicleNo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Driver Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Driver Name"
                    value={newLR.driver}
                    onChange={(e) => setNewLR({...newLR, driver: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Cement Grade</label>
                  <select
                    value={newLR.cementType}
                    onChange={(e) => setNewLR({...newLR, cementType: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  >
                    <option value="OPC 53 (Bagged)">OPC 53 (Bagged)</option>
                    <option value="PPC 43 (Bagged)">PPC 43 (Bagged)</option>
                    <option value="Super Cement (Bagged)">Super Cement (Bagged)</option>
                    <option value="Loose Bulk Cement (Bulker)">Loose Bulk Cement (Bulker)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Net Weight (Tons)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="38.5"
                    value={newLR.weightTons}
                    onChange={(e) => setNewLR({...newLR, weightTons: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Destination Depot / Dealer</label>
                <input
                  required
                  type="text"
                  placeholder="Dealer Name, City"
                  value={newLR.destination}
                  onChange={(e) => setNewLR({...newLR, destination: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Cash Advance (₹)</label>
                  <input
                    type="number"
                    placeholder="4000"
                    value={newLR.advanceCash}
                    onChange={(e) => setNewLR({...newLR, advanceCash: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Diesel (Liters)</label>
                  <input
                    type="number"
                    placeholder="140"
                    value={newLR.dieselLiters}
                    onChange={(e) => setNewLR({...newLR, dieselLiters: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Freight (₹)</label>
                  <input
                    type="number"
                    placeholder="32000"
                    value={newLR.freightTotal}
                    onChange={(e) => setNewLR({...newLR, freightTotal: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save & Print LR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}