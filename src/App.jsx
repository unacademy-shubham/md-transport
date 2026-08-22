import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  FileSpreadsheet, 
  DollarSign, 
  Fuel, 
  PlusCircle, 
  Search, 
  LogOut, 
  Mail, 
  Lock, 
  ArrowRight,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form & App States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [trips, setTrips] = useState([]);
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New LR Form State
  const [newLR, setNewLR] = useState({
    site: 'DHAR',
    invoice_no: '',
    vehicle_no: '',
    driver_name: '',
    cement_grade: 'OPC 53 (Bagged)',
    weight_tons: '',
    destination: '',
    advance_cash: '',
    diesel_liters: '',
    freight_total: ''
  });

  // Check user session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
      setSiteFilter(data.site);
    }
    fetchDispatches();
    setLoading(false);
  };

  const fetchDispatches = async () => {
    const { data, error } = await supabase
      .from('lr_dispatches')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setTrips(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateLR = async (e) => {
    e.preventDefault();
    const siteToUse = profile.role === 'SITE_EXEC' ? profile.site : newLR.site;
    const sitePrefix = siteToUse === 'DHAR' ? 'DHR' : siteToUse === 'BANSWARA' ? 'BSW' : 'DHL';
    const lrNumber = `LR-${sitePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from('lr_dispatches').insert([{
      lr_number: lrNumber,
      invoice_no: newLR.invoice_no,
      site: siteToUse,
      vehicle_no: newLR.vehicle_no.toUpperCase(),
      driver_name: newLR.driver_name,
      cement_grade: newLR.cement_grade,
      weight_tons: parseFloat(newLR.weight_tons) || 0,
      destination: newLR.destination,
      advance_cash: parseInt(newLR.advance_cash) || 0,
      diesel_liters: parseInt(newLR.diesel_liters) || 0,
      freight_total: parseInt(newLR.freight_total) || 0,
      created_by: session.user.id
    }]);

    if (!error) {
      setIsModalOpen(false);
      fetchDispatches();
      setNewLR({
        site: profile.role === 'SITE_EXEC' ? profile.site : 'DHAR',
        invoice_no: '',
        vehicle_no: '',
        driver_name: '',
        cement_grade: 'OPC 53 (Bagged)',
        weight_tons: '',
        destination: '',
        advance_cash: '',
        diesel_liters: '',
        freight_total: ''
      });
    } else {
      alert('Error creating LR: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-mono text-sm">
        Connecting to MD Transport Secure Cloud...
      </div>
    );
  }

  // 1. REAL LOGIN VIEW
  if (!session || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-amber-500 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Truck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">MD Transport Workstation</h1>
            <p className="text-xs text-slate-400">UltraTech Fleet Management Portal</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Authorized Personnel Sign In</h2>
              <p className="text-xs text-slate-500">Access protected by Row-Level Cloud Security</p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Company Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@mdtransport.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED REAL-TIME WORKSPACE
  const visibleTrips = trips.filter(t => {
    if (profile.role === 'SITE_EXEC') {
      if (t.site !== profile.site) return false;
    } else {
      if (siteFilter !== 'ALL' && t.site !== siteFilter) return false;
    }

    return (
      t.lr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicle_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.invoice_no.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30 px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950 font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-slate-100">MD Transport</h1>
                <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  {profile.branch_name}
                </span>
              </div>
              <p className="text-xs text-slate-400">UltraTech Fleet Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile.role !== 'SITE_EXEC' && (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <select 
                  value={siteFilter} 
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none"
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
              <div>
                <p className="text-xs font-bold text-slate-200 leading-none">{profile.full_name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{profile.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 border border-slate-700 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search LR No, Vehicle, Driver..."
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
            Create UltraTech LR
          </button>
        </div>

        {/* Real-time Cloud Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Cloud Dispatch Register (Live Database)</h2>
              <p className="text-xs text-slate-400">Syncing live entries from Dhar, Banswara & Dhule</p>
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
                  <th className="p-3.5">Site</th>
                  <th className="p-3.5">Truck & Driver</th>
                  <th className="p-3.5">Destination & Cargo</th>
                  <th className="p-3.5">Weight (MT)</th>
                  {(profile.role === 'DIRECTOR' || profile.role === 'HO_ACCOUNTS') && (
                    <th className="p-3.5">Freight & Advance</th>
                  )}
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {visibleTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-amber-400">{trip.lr_number}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Inv: {trip.invoice_no}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-300">{trip.site}</td>
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-slate-200">{trip.vehicle_no}</p>
                      <p className="text-slate-400 text-[11px]">{trip.driver_name}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200">{trip.destination}</p>
                      <p className="text-[11px] text-amber-400/80">{trip.cement_grade}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-100">{trip.weight_tons} MT</td>
                    {(profile.role === 'DIRECTOR' || profile.role === 'HO_ACCOUNTS') && (
                      <td className="p-3.5">
                        <p className="font-semibold text-emerald-400">₹{trip.freight_total.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-rose-400">Adv: ₹{trip.advance_cash.toLocaleString('en-IN')}</p>
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

      {/* Modal: New LR Creation Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Create Live Plant LR (Cloud Save)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLR} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Dispatch Site</label>
                  <select
                    disabled={profile.role === 'SITE_EXEC'}
                    value={profile.role === 'SITE_EXEC' ? profile.site : newLR.site}
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
                    value={newLR.invoice_no}
                    onChange={(e) => setNewLR({...newLR, invoice_no: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
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
                    value={newLR.vehicle_no}
                    onChange={(e) => setNewLR({...newLR, vehicle_no: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200 uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Driver Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Driver Name"
                    value={newLR.driver_name}
                    onChange={(e) => setNewLR({...newLR, driver_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Cement Grade</label>
                  <select
                    value={newLR.cement_grade}
                    onChange={(e) => setNewLR({...newLR, cement_grade: e.target.value})}
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
                    value={newLR.weight_tons}
                    onChange={(e) => setNewLR({...newLR, weight_tons: e.target.value})}
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
                    value={newLR.advance_cash}
                    onChange={(e) => setNewLR({...newLR, advance_cash: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Diesel (Liters)</label>
                  <input
                    type="number"
                    placeholder="140"
                    value={newLR.diesel_liters}
                    onChange={(e) => setNewLR({...newLR, diesel_liters: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Freight (₹)</label>
                  <input
                    type="number"
                    placeholder="32000"
                    value={newLR.freight_total}
                    onChange={(e) => setNewLR({...newLR, freight_total: e.target.value})}
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
                  Save to Cloud DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}