import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  LayoutDashboard,
  Building2,
  Users,
  Truck,
  UserCheck,
  History,
  LogOut,
  Plus,
  Key,
  ChevronDown,
  CheckCircle2,
  Trash2,
  Edit3
} from 'lucide-react';

export default function SuperAdminDashboard({ currentUser, onLogout, onUserUpdate }) {
  // Navigation State with LocalStorage Persistence
  const [activeMenu, setActiveMenu] = useState(() => {
    return localStorage.getItem('md_transport_active_tab') || 'dashboard';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Live Data States
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([
    { id: 'DRV-1', name: 'Rameshwar Gurjar', phone: '9826012345', license_no: 'MP09-2018-8821', assigned_vehicle: 'MP-09-HH-4412', status: 'Active' },
    { id: 'DRV-2', name: 'Kailash Meena', phone: '9414098765', license_no: 'RJ03-2016-1144', assigned_vehicle: 'RJ-03-GA-1109', status: 'Active' },
    { id: 'DRV-3', name: 'Sanjay Patil', phone: '9822054321', license_no: 'MH18-2019-9022', assigned_vehicle: 'MH-18-BQ-7740', status: 'Active' },
  ]);

  // Modal States
  const [modalType, setModalType] = useState(null); 
  // 'ADD_SITE', 'ADD_USER', 'EDIT_USER', 'ADD_VEHICLE', 'ADD_DRIVER', 'EDIT_DRIVER', 'RESET_PASS', 'EDIT_PROFILE'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form Inputs
  const [siteForm, setSiteForm] = useState({ name: '', code: '', state: '' });
  const [vehicleForm, setVehicleForm] = useState({ vehicle_no: '', vehicle_type: 'Bulker', capacity_mt: 40, assigned_site: '' });
  const [userForm, setUserForm] = useState({ username: '', password_hash: '', name: '', role: 'SITE_EXEC', branch: 'Head Office', site_access: 'ALL' });
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', license_no: '', assigned_vehicle: '', status: 'Active' });
  const [resetPassValue, setResetPassValue] = useState('');
  const [profileForm, setProfileForm] = useState({ name: currentUser.name, password: currentUser.password_hash });

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    localStorage.setItem('md_transport_active_tab', menu);
  };

  // Fetch Live Data from Supabase
  const fetchAllData = async () => {
    try {
      const [sitesRes, usersRes, vehiclesRes] = await Promise.all([
        supabase.from('sites').select('*').order('created_at', { ascending: false }),
        supabase.from('app_users').select('*').order('created_at', { ascending: false }),
        supabase.from('vehicles').select('*').order('created_at', { ascending: false })
      ]);

      if (sitesRes.data) setSites(sitesRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  };

  // Real-time WebSocket Listeners (Sub-second DB syncing)
  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('realtime_erp_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => fetchAllData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 1. Create Site
  const handleCreateSite = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('sites').insert([{
      name: siteForm.name,
      code: siteForm.code.toUpperCase().trim(),
      state: siteForm.state,
      created_by: currentUser.name
    }]);

    if (error) alert('Error creating site: ' + error.message);
    else {
      setSiteForm({ name: '', code: '', state: '' });
      setModalType(null);
    }
  };

  // 2. Create Vehicle
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('vehicles').insert([{
      vehicle_no: vehicleForm.vehicle_no.toUpperCase().trim(),
      vehicle_type: vehicleForm.vehicle_type,
      capacity_mt: parseFloat(vehicleForm.capacity_mt),
      assigned_site: vehicleForm.assigned_site || null,
      created_by: currentUser.name
    }]);

    if (error) alert('Error creating vehicle: ' + error.message);
    else {
      setVehicleForm({ vehicle_no: '', vehicle_type: 'Bulker', capacity_mt: 40, assigned_site: '' });
      setModalType(null);
    }
  };

  // 3. Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const defaultPermissions = userForm.role === 'DIRECTOR'
      ? { canViewFinancials: true, canCreateLR: true, canEditLR: true, canManageFuel: true, canManageUsers: true }
      : userForm.role === 'HO_ACCOUNTS'
      ? { canViewFinancials: true, canCreateLR: false, canEditLR: true, canManageFuel: true, canManageUsers: false }
      : { canViewFinancials: false, canCreateLR: true, canEditLR: false, canManageFuel: true, canManageUsers: false };

    const { error } = await supabase.from('app_users').insert([{
      username: userForm.username.toLowerCase().trim(),
      password_hash: userForm.password_hash,
      name: userForm.name,
      role: userForm.role,
      branch: userForm.branch,
      site_access: userForm.site_access,
      permissions: defaultPermissions,
      created_by: currentUser.name,
      last_action_note: `Created by ${currentUser.name}`
    }]);

    if (error) alert('Error creating user: ' + error.message);
    else {
      setUserForm({ username: '', password_hash: '', name: '', role: 'SITE_EXEC', branch: 'Head Office', site_access: 'ALL' });
      setModalType(null);
    }
  };

  // 4. Update Existing User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const { error } = await supabase
      .from('app_users')
      .update({
        name: userForm.name,
        role: userForm.role,
        branch: userForm.branch,
        site_access: userForm.site_access,
        updated_by: currentUser.name,
        last_action_note: `Details updated by ${currentUser.name}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.id);

    if (error) alert('Error updating user: ' + error.message);
    else {
      setModalType(null);
      setSelectedUser(null);
    }
  };

  // 5. Delete User
  const handleDeleteUser = async (user) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete your own logged-in administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user @${user.username} (${user.name})?`)) return;

    const { error } = await supabase.from('app_users').delete().eq('id', user.id);
    if (error) alert('Error deleting user: ' + error.message);
  };

  // 6. Drivers CRUD
  const handleCreateDriver = (e) => {
    e.preventDefault();
    const newDrvr = {
      id: `DRV-${Date.now().toString().slice(-4)}`,
      name: driverForm.name,
      phone: driverForm.phone,
      license_no: driverForm.license_no.toUpperCase(),
      assigned_vehicle: driverForm.assigned_vehicle.toUpperCase() || 'Unassigned',
      status: 'Active'
    };
    setDrivers([newDrvr, ...drivers]);
    setDriverForm({ name: '', phone: '', license_no: '', assigned_vehicle: '', status: 'Active' });
    setModalType(null);
  };

  const handleUpdateDriver = (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...d, ...driverForm } : d));
    setModalType(null);
    setSelectedDriver(null);
  };

  const handleDeleteDriver = (driver) => {
    if (!window.confirm(`Are you sure you want to remove driver ${driver.name}?`)) return;
    setDrivers(drivers.filter(d => d.id !== driver.id));
  };

  // 7. Reset Password
  const handleResetPassword = async () => {
    if (!resetPassValue.trim() || !selectedUser) return;
    const { error } = await supabase
      .from('app_users')
      .update({
        password_hash: resetPassValue,
        updated_by: currentUser.name,
        last_action_note: `Password reset by ${currentUser.name}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.id);

    if (error) alert('Error resetting password: ' + error.message);
    else {
      alert(`Password updated for user: @${selectedUser.username}`);
      setResetPassValue('');
      setSelectedUser(null);
      setModalType(null);
    }
  };

  // 8. Update Self Profile
  const handleUpdateSelfProfile = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('app_users')
      .update({
        name: profileForm.name,
        password_hash: profileForm.password,
        updated_by: currentUser.name,
        last_action_note: 'Self-profile details updated',
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) alert('Error: ' + error.message);
    else {
      alert('Profile updated successfully!');
      if (onUserUpdate) onUserUpdate({ ...currentUser, name: profileForm.name, password_hash: profileForm.password });
      setModalType(null);
      setUserMenuOpen(false);
    }
  };

  // 9. Toggle User Status
  const handleToggleUserStatus = async (user) => {
    const nextStatus = !user.is_active;
    const { error } = await supabase
      .from('app_users')
      .update({
        is_active: nextStatus,
        updated_by: currentUser.name,
        last_action_note: `Status switched to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'} by ${currentUser.name}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) alert('Error: ' + error.message);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
      {/* =========================================================================
          1. ENTERPRISE HEADER
      ========================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 shadow-xs">
        <div className="flex items-center justify-between w-full">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0099ff] text-white flex items-center justify-center font-black shadow-md shadow-sky-500/20 text-lg">
              MD
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                MD Transport Management System
                <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </h1>
              <p className="text-xs text-slate-400">Integrated Logistics & Multi-Site Dispatch Suite</p>
            </div>
          </div>

          {/* User Profile Corner with Dropdown */}
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 rounded-2xl border border-slate-200 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-sky-600 font-semibold">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</p>
                  </div>

                  <button
                    onClick={() => { setModalType('EDIT_PROFILE'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-slate-400" />
                    <span>Edit My Profile</span>
                  </button>

                  <button
                    onClick={() => { handleMenuChange('logs'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    <span>System Audit Trail</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* =========================================================================
          2. MAIN BODY (SIDEBAR + CONTENT WORKSPACE)
      ========================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-xs">
          <div className="space-y-1">
            
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Main Modules
            </div>

            <button
              onClick={() => handleMenuChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMenu === 'dashboard' ? 'bg-[#0099ff] text-white shadow-md shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => handleMenuChange('sites')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMenu === 'sites' ? 'bg-[#0099ff] text-white shadow-md shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>Site / Plant Master</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeMenu === 'sites' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {sites.length}
              </span>
            </button>

            <button
              onClick={() => handleMenuChange('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMenu === 'users' ? 'bg-[#0099ff] text-white shadow-md shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>User & Access Matrix</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeMenu === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => handleMenuChange('vehicles')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMenu === 'vehicles' ? 'bg-[#0099ff] text-white shadow-md shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4" />
                <span>Vehicle & Fleet</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeMenu === 'vehicles' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {vehicles.length}
              </span>
            </button>

            <button
              onClick={() => handleMenuChange('drivers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMenu === 'drivers' ? 'bg-[#0099ff] text-white shadow-md shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" />
                <span>Driver Directory</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeMenu === 'drivers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {drivers.length}
              </span>
            </button>

            <div className="pt-4 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Governance & Logs
            </div>

            <button
              onClick={() => handleMenuChange('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMenu === 'logs' ? 'bg-[#0099ff] text-white shadow-md shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail Logs</span>
            </button>

          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1">
            <p className="text-[11px] font-bold text-slate-700">MD Transport Suite</p>
            <p className="text-[10px] text-slate-400">Real-time Architecture Active</p>
          </div>
        </aside>

        {/* Dynamic Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* =========================================================================
              VIEW 1: DASHBOARD OVERVIEW
          ========================================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">System Dashboard Overview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time statistics across all branches and fleet operations</p>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Active Plant Sites</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{sites.length} Units</h3>
                      <p className="text-xs text-sky-600 font-semibold mt-0.5">Operational Hubs</p>
                    </div>
                    <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Total Heavy Vehicles</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{vehicles.length} Trucks</h3>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">Registered Fleet</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400">System Staff Users</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{users.length} Users</h3>
                      <p className="text-xs text-purple-600 font-semibold mt-0.5">RBAC Active</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Registered Drivers</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{drivers.length} Drivers</h3>
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">Verified Commercial</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Jump Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Sites Preview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Plant Locations</h3>
                    <button onClick={() => handleMenuChange('sites')} className="text-xs text-sky-600 font-bold hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {sites.slice(0, 3).map(s => (
                      <div key={s.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="text-slate-400">{s.state}</p>
                        </div>
                        <span className="bg-sky-50 text-sky-700 font-mono font-bold px-2 py-0.5 rounded border border-sky-200">
                          {s.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Users & Audit Preview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Recent User Actions</h3>
                    <button onClick={() => handleMenuChange('logs')} className="text-xs text-sky-600 font-bold hover:underline">View Logs</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {users.slice(0, 3).map(u => (
                      <div key={u.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{u.name} <span className="text-slate-400 font-normal">(@{u.username})</span></p>
                          <p className="text-slate-400 text-[11px]">{u.last_action_note || 'Account Active'}</p>
                        </div>
                        <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200 text-[10px]">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: SITES / PLANTS MASTER
          ========================================================================== */}
          {activeMenu === 'sites' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Plant / Site Master</h2>
                  <p className="text-xs text-slate-500">Configure operational dispatch sites and branches</p>
                </div>
                <button
                  onClick={() => setModalType('ADD_SITE')}
                  className="flex items-center gap-2 bg-[#0099ff] hover:bg-[#0088e6] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Site</span>
                </button>
              </div>

              {/* Sites Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Plant Name</th>
                        <th className="p-3.5">Site Code</th>
                        <th className="p-3.5">State / Region</th>
                        <th className="p-3.5">Created By</th>
                        <th className="p-3.5">Date Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {sites.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-700 font-mono font-bold border border-sky-200">
                              {s.code}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600">{s.state}</td>
                          <td className="p-3.5 text-slate-500">{s.created_by}</td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: USER & RBAC ACCESS MATRIX (WITH EDIT & DELETE)
          ========================================================================== */}
          {activeMenu === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">User Management & Audit Control</h2>
                  <p className="text-xs text-slate-500">Provision Director, Accounts, and Site Executive logins</p>
                </div>
                <button
                  onClick={() => setModalType('ADD_USER')}
                  className="flex items-center gap-2 bg-[#0099ff] hover:bg-[#0088e6] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New User</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">User Profile</th>
                        <th className="p-3.5">Role & Scope</th>
                        <th className="p-3.5">Audit Trail (Last Modified)</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">@{u.username} • {u.branch}</p>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              {u.role}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">Site: {u.site_access === 'ALL' ? 'All Plants' : u.site_access}</p>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-start gap-1.5 text-[11px]">
                              <History className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-slate-800 font-semibold">{u.last_action_note || 'Account Created'}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  By: {u.updated_by !== 'None' ? u.updated_by : u.created_by} • {new Date(u.updated_at || u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                u.is_active 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {u.is_active ? 'Active' : 'Suspended'}
                            </button>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => { 
                                  setSelectedUser(u); 
                                  setUserForm({ username: u.username, name: u.name, role: u.role, branch: u.branch, site_access: u.site_access, password_hash: '' }); 
                                  setModalType('EDIT_USER'); 
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-lg transition cursor-pointer"
                                title="Edit User"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => { setSelectedUser(u); setResetPassValue(''); setModalType('RESET_PASS'); }}
                                className="p-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-lg transition cursor-pointer"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg transition cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: VEHICLE & FLEET MASTER
          ========================================================================== */}
          {activeMenu === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Fleet & Vehicle Master</h2>
                  <p className="text-xs text-slate-500">Register heavy bulkers, trailers, and capacity in MT</p>
                </div>
                <button
                  onClick={() => setModalType('ADD_VEHICLE')}
                  className="flex items-center gap-2 bg-[#0099ff] hover:bg-[#0088e6] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Vehicle</span>
                </button>
              </div>

              {/* Vehicles Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Vehicle Number</th>
                        <th className="p-3.5">Body Type</th>
                        <th className="p-3.5">Capacity (MT)</th>
                        <th className="p-3.5">Assigned Site</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {vehicles.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-400">No vehicles registered yet. Click above to add first truck.</td>
                        </tr>
                      ) : (
                        vehicles.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition">
                            <td className="p-3.5 font-mono font-bold text-slate-900">{v.vehicle_no}</td>
                            <td className="p-3.5 text-slate-600">{v.vehicle_type}</td>
                            <td className="p-3.5 font-mono font-bold text-sky-600">{v.capacity_mt} MT</td>
                            <td className="p-3.5">
                              {v.assigned_site ? (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                                  {v.assigned_site}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">General Pool</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 5: DRIVER DIRECTORY (WITH EDIT & DELETE)
          ========================================================================== */}
          {activeMenu === 'drivers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Commercial Driver Directory</h2>
                  <p className="text-xs text-slate-500">Manage heavy vehicle drivers, contact details and assigned trucks</p>
                </div>
                <button
                  onClick={() => {
                    setDriverForm({ name: '', phone: '', license_no: '', assigned_vehicle: '', status: 'Active' });
                    setModalType('ADD_DRIVER');
                  }}
                  className="flex items-center gap-2 bg-[#0099ff] hover:bg-[#0088e6] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Driver</span>
                </button>
              </div>

              {/* Drivers Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Driver Name</th>
                        <th className="p-3.5">Mobile Contact</th>
                        <th className="p-3.5">Commercial DL No</th>
                        <th className="p-3.5">Assigned Truck</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {drivers.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-bold text-slate-900">{d.name}</td>
                          <td className="p-3.5 font-mono text-slate-600">{d.phone}</td>
                          <td className="p-3.5 font-mono font-bold text-slate-700">{d.license_no}</td>
                          <td className="p-3.5 font-mono font-bold text-sky-600">{d.assigned_vehicle}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {d.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedDriver(d);
                                  setDriverForm({ ...d });
                                  setModalType('EDIT_DRIVER');
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-lg transition cursor-pointer"
                                title="Edit Driver"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDriver(d)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg transition cursor-pointer"
                                title="Delete Driver"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: AUDIT TRAIL LOGS
          ========================================================================== */}
          {activeMenu === 'logs' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">System Security & Modification Audit Logs</h2>
                <p className="text-xs text-slate-500">Live track of every user addition, permission update and password reset</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs divide-y divide-slate-100">
                {users.map((u) => (
                  <div key={u.id} className="py-3 flex items-start justify-between text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mt-0.5">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Account Action on <span className="text-sky-600">@{u.username}</span> ({u.name})
                        </p>
                        <p className="text-slate-600 font-medium mt-0.5">{u.last_action_note || 'Account provisioned'}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          Role: {u.role} • Site: {u.site_access} • Branch: {u.branch}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                        {new Date(u.updated_at || u.created_at).toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">By: {u.updated_by !== 'None' ? u.updated_by : u.created_by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          MODALS CONTAINER (CLEAN LIGHT THEME)
      ========================================================================== */}
      
      {/* 1. Modal: Add Site */}
      {modalType === 'ADD_SITE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create Operational Plant Site</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateSite} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Plant Name</label>
                <input
                  required
                  placeholder="e.g. Dhar Works"
                  value={siteForm.name}
                  onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Site Code</label>
                <input
                  required
                  placeholder="e.g. DHAR"
                  value={siteForm.code}
                  onChange={(e) => setSiteForm({ ...siteForm, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">State / Region</label>
                <input
                  required
                  placeholder="e.g. Madhya Pradesh"
                  value={siteForm.state}
                  onChange={(e) => setSiteForm({ ...siteForm, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Create Site</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Add Vehicle */}
      {modalType === 'ADD_VEHICLE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Register Master Vehicle</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Vehicle Number</label>
                <input
                  required
                  placeholder="e.g. MP-09-HH-4412"
                  value={vehicleForm.vehicle_no}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_no: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Body Type</label>
                  <select
                    value={vehicleForm.vehicle_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Bulker">Bulker (Loose)</option>
                    <option value="Flatbed">Flatbed (Bagged)</option>
                    <option value="High-side">High-side Multi-axle</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Capacity (MT)</label>
                  <input
                    required
                    type="number"
                    step="0.5"
                    value={vehicleForm.capacity_mt}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_mt: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Plant Site</label>
                <select
                  value={vehicleForm.assigned_site}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, assigned_site: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- General Pool (Any Site) --</option>
                  {sites.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Register Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Add User */}
      {modalType === 'ADD_USER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create Staff User Account</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name</label>
                <input
                  required
                  placeholder="e.g. Mukesh Dave"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Username</label>
                  <input
                    required
                    placeholder="e.g. director"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Password</label>
                  <input
                    required
                    placeholder="••••••••"
                    value={userForm.password_hash}
                    onChange={(e) => setUserForm({ ...userForm, password_hash: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="DIRECTOR">Director (Client Admin)</option>
                    <option value="HO_ACCOUNTS">HO Accounts</option>
                    <option value="SITE_EXEC">Site Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Site Scope</label>
                  <select
                    value={userForm.site_access}
                    onChange={(e) => setUserForm({ ...userForm, site_access: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">All Plants</option>
                    {sites.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Branch / Location</label>
                <input
                  value={userForm.branch}
                  onChange={(e) => setUserForm({ ...userForm, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Edit User */}
      {modalType === 'EDIT_USER' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit User Details</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Username (Read-Only)</label>
                <input
                  disabled
                  value={userForm.username}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name</label>
                <input
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="DIRECTOR">Director (Client Admin)</option>
                    <option value="HO_ACCOUNTS">HO Accounts</option>
                    <option value="SITE_EXEC">Site Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Site Scope</label>
                  <select
                    value={userForm.site_access}
                    onChange={(e) => setUserForm({ ...userForm, site_access: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">All Plants</option>
                    {sites.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Branch / Location</label>
                <input
                  value={userForm.branch}
                  onChange={(e) => setUserForm({ ...userForm, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Add Driver */}
      {modalType === 'ADD_DRIVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Commercial Driver</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Driver Full Name</label>
                <input
                  required
                  placeholder="e.g. Rameshwar Gurjar"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mobile Number</label>
                  <input
                    required
                    placeholder="98XXXXXXXX"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">License No</label>
                  <input
                    required
                    placeholder="MP09-XXXX"
                    value={driverForm.license_no}
                    onChange={(e) => setDriverForm({ ...driverForm, license_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Truck Number</label>
                <input
                  placeholder="e.g. MP-09-HH-4412"
                  value={driverForm.assigned_vehicle}
                  onChange={(e) => setDriverForm({ ...driverForm, assigned_vehicle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Edit Driver */}
      {modalType === 'EDIT_DRIVER' && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Commercial Driver</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Driver Full Name</label>
                <input
                  required
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mobile Number</label>
                  <input
                    required
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">License No</label>
                  <input
                    required
                    value={driverForm.license_no}
                    onChange={(e) => setDriverForm({ ...driverForm, license_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Truck Number</label>
                <input
                  value={driverForm.assigned_vehicle}
                  onChange={(e) => setDriverForm({ ...driverForm, assigned_vehicle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Update Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Reset Password */}
      {modalType === 'RESET_PASS' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600">
              <Key className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Reset User Password</h3>
            </div>
            <p className="text-xs text-slate-500">
              Enter new password for <span className="font-bold text-slate-800">@{selectedUser.username}</span> ({selectedUser.name}).
            </p>
            <div>
              <label className="text-slate-700 font-bold block mb-1 text-xs">New Password</label>
              <input
                required
                type="text"
                placeholder="Enter new password"
                value={resetPassValue}
                onChange={(e) => setResetPassValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setModalType(null)} className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={handleResetPassword} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer">Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Edit My Profile */}
      {modalType === 'EDIT_PROFILE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit My Profile</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateSelfProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">My Display Name</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">My Password</label>
                <input
                  required
                  type="text"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0099ff] text-white font-bold rounded-xl shadow-md shadow-sky-500/20 cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
