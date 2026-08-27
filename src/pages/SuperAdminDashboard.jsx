import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Truck,
  UserCheck,
  FileText,
  DollarSign,
  Disc,
  ShieldCheck,
  Wrench,
  Users,
  Key,
  BarChart3,
  History,
  LogOut,
  Plus,
  ChevronDown,
  CheckCircle2,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  Check,
  AlertCircle,
  Eye,
  Globe,
  Monitor,
  Clock,
  Shield,
  Search,
  ExternalLink
} from 'lucide-react';

export default function SuperAdminDashboard({ currentUser, onLogout, onUserUpdate }) {
  const [activeMenu, setActiveMenu] = useState(() => {
    return localStorage.getItem('buddy_fleets_active_tab') || 'dashboard';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Live Master Data
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Forensic Audit States
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [clientIp, setClientIp] = useState('Fetching...');
  const [hasNewAuditPulse, setHasNewAuditPulse] = useState(false);

  // Modals & UI States
  const [modalType, setModalType] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Custom Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Custom Toast Notification
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  // Forms
  const [siteForm, setSiteForm] = useState({ name: '', code: '', state: '' });
  const [vehicleForm, setVehicleForm] = useState({ vehicle_no: '', vehicle_type: 'Bulker', capacity_mt: 40, assigned_site: '' });
  const [userForm, setUserForm] = useState({ username: '', password_hash: '', name: '', role: 'SITE_EXEC', branch: 'Head Office', site_access: 'ALL' });
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', license_no: '', assigned_vehicle: '', status: 'Active' });
  const [resetPassValue, setResetPassValue] = useState('');
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || 'Admin', password: currentUser?.password_hash || '' });

  // 1. Fetch Client IP on Mount for Security Tracking
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIp(data.ip || '127.0.0.1'))
      .catch(() => setClientIp('127.0.0.1 (Local)'));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type });
    setTimeout(() => {
      setToast({ open: false, message: '', type: 'success' });
    }, 3500);
  };

  // Helper: Log forensic level activity (7-days retained)
  const logAuditActivity = async (module, action_type, description, metadata = {}) => {
    try {
      await supabase.from('audit_logs').insert([{
        module,
        action_type,
        description,
        performed_by: currentUser?.name || 'SuperAdmin',
        performed_by_username: currentUser?.username || 'admin',
        ip_address: clientIp,
        user_agent: navigator.userAgent || 'Unknown Browser',
        metadata: {
          ...metadata,
          timestamp_iso: new Date().toISOString(),
          screen_resolution: `${window.screen.width}x${window.screen.height}`
        }
      }]);
    } catch (err) {
      console.error('Audit log insertion failed:', err);
    }
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    localStorage.setItem('buddy_fleets_active_tab', menu);
  };

  // Fetch Live Data (Strict 7-Day Window for Audit Logs)
  const fetchAllData = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [sitesRes, usersRes, vehiclesRes, driversRes, logsRes] = await Promise.all([
        supabase.from('sites').select('*').order('created_at', { ascending: false }),
        supabase.from('app_users').select('*').order('created_at', { ascending: false }),
        supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
        supabase.from('drivers').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs')
          .select('*')
          .gte('created_at', sevenDaysAgo)
          .order('created_at', { ascending: false })
          .limit(250)
      ]);

      if (sitesRes.data) setSites(sitesRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
      if (logsRes.data) setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  // Real-time Subscriptions
  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('realtime_buddy_fleets_audit_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => fetchAllData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setAuditLogs(prev => [payload.new, ...prev]);
        setHasNewAuditPulse(true);
        setTimeout(() => setHasNewAuditPulse(false), 2000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientIp]);

  // 1. Create Site
  const handleCreateSite = async (e) => {
    e.preventDefault();
    const siteCode = siteForm.code.toUpperCase().trim();
    const { error } = await supabase.from('sites').insert([{
      name: siteForm.name,
      code: siteCode,
      state: siteForm.state,
      created_by: currentUser?.name || 'SuperAdmin'
    }]);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('SITE', 'CREATE', `Created operational plant ${siteForm.name} (${siteCode})`, {
        site_name: siteForm.name,
        code: siteCode,
        state: siteForm.state
      });
      setSiteForm({ name: '', code: '', state: '' });
      setModalType(null);
      showToast('Plant site created successfully!');
    }
  };

  // 2. Create Vehicle
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    const vehicleNo = vehicleForm.vehicle_no.toUpperCase().trim();
    const { error } = await supabase.from('vehicles').insert([{
      vehicle_no: vehicleNo,
      vehicle_type: vehicleForm.vehicle_type,
      capacity_mt: parseFloat(vehicleForm.capacity_mt),
      assigned_site: vehicleForm.assigned_site || null,
      created_by: currentUser?.name || 'SuperAdmin'
    }]);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('FLEET', 'CREATE', `Registered truck ${vehicleNo} (${vehicleForm.vehicle_type} - ${vehicleForm.capacity_mt} MT)`, {
        vehicle_no: vehicleNo,
        type: vehicleForm.vehicle_type,
        capacity_mt: vehicleForm.capacity_mt,
        site: vehicleForm.assigned_site
      });
      setVehicleForm({ vehicle_no: '', vehicle_type: 'Bulker', capacity_mt: 40, assigned_site: '' });
      setModalType(null);
      showToast('Vehicle registered in fleet inventory!');
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

    const cleanUser = userForm.username.trim();
    const { error } = await supabase.from('app_users').insert([{
      username: cleanUser,
      password_hash: userForm.password_hash,
      name: userForm.name,
      role: userForm.role,
      branch: userForm.branch,
      site_access: userForm.site_access,
      permissions: defaultPermissions,
      created_by: currentUser?.name || 'SuperAdmin',
      last_action_note: `Created by ${currentUser?.name || 'SuperAdmin'}`
    }]);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'CREATE', `Provisioned account @${cleanUser} for ${userForm.name} (${userForm.role})`, {
        username: cleanUser,
        role: userForm.role,
        branch: userForm.branch,
        site_access: userForm.site_access
      });
      setUserForm({ username: '', password_hash: '', name: '', role: 'SITE_EXEC', branch: 'Head Office', site_access: 'ALL' });
      setModalType(null);
      showToast(`User @${cleanUser} provisioned!`);
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
        updated_by: currentUser?.name || 'SuperAdmin',
        last_action_note: `Details updated by ${currentUser?.name || 'SuperAdmin'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.id);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'UPDATE', `Updated user details for @${selectedUser.username} (${userForm.name})`, {
        user_id: selectedUser.id,
        new_name: userForm.name,
        new_role: userForm.role,
        new_branch: userForm.branch
      });
      setModalType(null);
      setSelectedUser(null);
      showToast('User details updated!');
    }
  };

  // 5. Delete User
  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      showToast('You cannot delete your own logged-in administrator account.', 'error');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Staff User Account',
      message: `Are you sure you want to permanently delete user @${user.username} (${user.name})?`,
      onConfirm: async () => {
        const { error } = await supabase.from('app_users').delete().eq('id', user.id);
        if (error) {
          showToast('Error deleting user: ' + error.message, 'error');
        } else {
          await logAuditActivity('USER', 'DELETE', `Deleted staff account @${user.username} (${user.name})`, {
            deleted_user_id: user.id,
            name: user.name,
            role: user.role
          });
          showToast(`User @${user.username} deleted successfully!`);
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // 6. Drivers CRUD
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('drivers').insert([{
      name: driverForm.name,
      phone: driverForm.phone,
      license_no: driverForm.license_no.toUpperCase().trim(),
      assigned_vehicle: driverForm.assigned_vehicle.toUpperCase().trim() || 'Unassigned',
      status: 'Active',
      created_by: currentUser?.name || 'SuperAdmin'
    }]);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('DRIVER', 'CREATE', `Added commercial driver ${driverForm.name} (DL: ${driverForm.license_no.toUpperCase()})`, {
        driver_name: driverForm.name,
        phone: driverForm.phone,
        license_no: driverForm.license_no.toUpperCase(),
        assigned_vehicle: driverForm.assigned_vehicle
      });
      setDriverForm({ name: '', phone: '', license_no: '', assigned_vehicle: '', status: 'Active' });
      setModalType(null);
      showToast(`Driver ${driverForm.name} registered!`);
    }
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;

    const { error } = await supabase
      .from('drivers')
      .update({
        name: driverForm.name,
        phone: driverForm.phone,
        license_no: driverForm.license_no.toUpperCase().trim(),
        assigned_vehicle: driverForm.assigned_vehicle.toUpperCase().trim() || 'Unassigned',
        status: driverForm.status
      })
      .eq('id', selectedDriver.id);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('DRIVER', 'UPDATE', `Updated driver ${driverForm.name} (DL: ${driverForm.license_no})`, {
        driver_id: selectedDriver.id,
        name: driverForm.name,
        phone: driverForm.phone,
        license_no: driverForm.license_no,
        assigned_vehicle: driverForm.assigned_vehicle
      });
      setModalType(null);
      setSelectedDriver(null);
      showToast('Driver details updated!');
    }
  };

  const handleDeleteDriver = (driver) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Driver',
      message: `Are you sure you want to remove driver ${driver.name} (${driver.license_no})?`,
      onConfirm: async () => {
        const { error } = await supabase.from('drivers').delete().eq('id', driver.id);
        if (error) {
          showToast('Error: ' + error.message, 'error');
        } else {
          await logAuditActivity('DRIVER', 'DELETE', `Deleted commercial driver ${driver.name} (DL: ${driver.license_no})`, {
            driver_id: driver.id,
            name: driver.name,
            license_no: driver.license_no
          });
          showToast(`Driver ${driver.name} removed successfully!`);
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // 7. Reset Password
  const handleResetPassword = async () => {
    if (!resetPassValue.trim() || !selectedUser) return;
    const { error } = await supabase
      .from('app_users')
      .update({
        password_hash: resetPassValue,
        updated_by: currentUser?.name || 'SuperAdmin',
        last_action_note: `Password reset by ${currentUser?.name || 'SuperAdmin'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.id);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('AUTH', 'PASSWORD_RESET', `Admin reset credentials for user @${selectedUser.username}`, {
        target_user: selectedUser.username,
        reset_by: currentUser?.username
      });
      showToast(`Password updated for user: @${selectedUser.username}!`);
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
        updated_by: currentUser?.name || 'SuperAdmin',
        last_action_note: 'Self-profile details updated',
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser?.id);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'UPDATE', `Super Admin updated personal root profile`);
      showToast('Your profile has been updated!');
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
        updated_by: currentUser?.name || 'SuperAdmin',
        last_action_note: `Status switched to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'} by ${currentUser?.name || 'SuperAdmin'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'UPDATE', `Changed @${user.username} account status to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}`);
      showToast(`User @${user.username} set to ${nextStatus ? 'Active' : 'Suspended'}`);
    }
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (!auditSearch.trim()) return true;
    const query = auditSearch.toLowerCase();
    return (
      log.description?.toLowerCase().includes(query) ||
      log.performed_by?.toLowerCase().includes(query) ||
      log.performed_by_username?.toLowerCase().includes(query) ||
      log.action_type?.toLowerCase().includes(query) ||
      log.module?.toLowerCase().includes(query) ||
      log.ip_address?.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
      {/* Toast Notification */}
      {toast.open && (
        <div className="fixed top-5 right-5 z-60 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-700/80 text-rose-200 shadow-rose-950/50'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-700/80 text-amber-200 shadow-amber-950/50'
              : 'bg-emerald-950/90 border-emerald-700/80 text-emerald-200 shadow-emerald-950/50'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ open: false, message: '', type: 'success' })}
              className="p-1 text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">{confirmDialog.message}</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/25 transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Top Header (Dark & Colorful Theme) */}
      <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-40 px-6 py-3 shadow-md">
        <div className="flex items-center justify-between w-full">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-cyan-500/25 text-lg tracking-wider border border-white/10">
              BF
            </div>
            <div>
              <h1 className="font-black text-base text-white tracking-tight flex items-center gap-2">
                Buddy Fleets
                <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Transport Management System</p>
            </div>
          </div>

          {/* User Profile Section (Circular Avatar) */}
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-800 p-1.5 pr-3.5 rounded-full border border-slate-700/80 transition cursor-pointer shadow-sm"
              >
                {/* Circular Profile Avatar */}
                {currentUser?.photo_url ? (
                  <img
                    src={currentUser.photo_url}
                    alt={currentUser?.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-slate-700">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{currentUser?.name || 'Super Admin'}</p>
                  <p className="text-[10px] text-cyan-400 font-extrabold">{currentUser?.role || 'SUPER_ADMIN'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{currentUser?.name || 'Super Admin'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">@{currentUser?.username || 'admin'}</p>
                  </div>

                  <button
                    onClick={() => { setModalType('EDIT_PROFILE'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2 font-medium cursor-pointer transition"
                  >
                    <Edit3 className="w-4 h-4 text-slate-400" />
                    <span>Edit My Profile</span>
                  </button>

                  <button
                    onClick={() => { handleMenuChange('audit-logs'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2 font-medium cursor-pointer transition"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    <span>System Audit Trail</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2 font-bold cursor-pointer transition"
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

      {/* 2. Main Body (Dark Sidebar + Bright Clean Workspace) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (No numbers/pills, Glowing Live Dot on Audit Trail) */}
        <aside className="w-68 bg-[#0f172a] border-r border-slate-800 flex flex-col p-3 shrink-0 shadow-lg overflow-y-auto">
          <div className="space-y-4 flex-1">
            
            {/* GROUP 1: OPERATIONS & DISPATCH */}
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Operations & Dispatch
              </div>

              <button
                onClick={() => handleMenuChange('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'dashboard' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeMenu === 'dashboard' ? 'text-white' : 'text-blue-400'}`} />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => handleMenuChange('sites')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'sites' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeMenu === 'sites' ? 'text-white' : 'text-indigo-400'}`} />
                <span>Site / Plant Master</span>
              </button>

              <button
                onClick={() => handleMenuChange('destinations')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'destinations' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <MapPin className={`w-4 h-4 ${activeMenu === 'destinations' ? 'text-white' : 'text-amber-400'}`} />
                <span>Destination Hubs</span>
              </button>

              <button
                onClick={() => handleMenuChange('vehicles')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'vehicles' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Truck className={`w-4 h-4 ${activeMenu === 'vehicles' ? 'text-white' : 'text-emerald-400'}`} />
                <span>Vehicle & Fleet</span>
              </button>

              <button
                onClick={() => handleMenuChange('drivers')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'drivers' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${activeMenu === 'drivers' ? 'text-white' : 'text-purple-400'}`} />
                <span>Driver Directory</span>
              </button>

              <button
                onClick={() => handleMenuChange('trips')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'trips' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeMenu === 'trips' ? 'text-white' : 'text-cyan-400'}`} />
                <span>Trip & LR Register</span>
              </button>
            </div>

            {/* GROUP 2: ACCOUNTS & ASSETS */}
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Accounts & Assets
              </div>

              <button
                onClick={() => handleMenuChange('finance')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'finance' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <DollarSign className={`w-4 h-4 ${activeMenu === 'finance' ? 'text-white' : 'text-emerald-400'}`} />
                <span>Finance & Diesel</span>
              </button>

              <button
                onClick={() => handleMenuChange('tyres')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'tyres' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Disc className={`w-4 h-4 ${activeMenu === 'tyres' ? 'text-white' : 'text-amber-400'}`} />
                <span>Tyre Inventory</span>
              </button>

              <button
                onClick={() => handleMenuChange('compliance')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'compliance' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeMenu === 'compliance' ? 'text-white' : 'text-rose-400'}`} />
                <span>Vehicle Compliance</span>
              </button>

              <button
                onClick={() => handleMenuChange('workshop')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'workshop' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Wrench className={`w-4 h-4 ${activeMenu === 'workshop' ? 'text-white' : 'text-orange-400'}`} />
                <span>Workshop & Repairs</span>
              </button>
            </div>

            {/* GROUP 3: SYSTEM & GOVERNANCE */}
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                System & Governance
              </div>

              <button
                onClick={() => handleMenuChange('users')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'users' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Users className={`w-4 h-4 ${activeMenu === 'users' ? 'text-white' : 'text-purple-400'}`} />
                <span>User & Staff Accounts</span>
              </button>

              <button
                onClick={() => handleMenuChange('access')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'access' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Key className={`w-4 h-4 ${activeMenu === 'access' ? 'text-white' : 'text-amber-400'}`} />
                <span>Access & RBAC Matrix</span>
              </button>

              <button
                onClick={() => handleMenuChange('reports')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'reports' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeMenu === 'reports' ? 'text-white' : 'text-teal-400'}`} />
                <span>Reports & MIS</span>
              </button>

              {/* AUDIT TRAIL TAB WITH LIVE GLOWING GREEN DOT */}
              <button
                onClick={() => handleMenuChange('audit-logs')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMenu === 'audit-logs' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <History className={`w-4 h-4 ${activeMenu === 'audit-logs' ? 'text-white' : 'text-sky-400'}`} />
                  <span>Audit Trail Logs</span>
                </div>
                
                {/* Glowing Live Green Dot */}
                <div className="flex items-center gap-1.5" title="Live Telemetry Listener Active">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${hasNewAuditPulse ? 'bg-cyan-300 scale-125 transition-transform' : 'bg-emerald-500'}`}></span>
                  </span>
                </div>
              </button>
            </div>

          </div>
        </aside>

        {/* Dynamic Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. DASHBOARD OVERVIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operations Dashboard</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time telemetry and resource allocation overview</p>
                </div>
              </div>

              {/* 4 Rich Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Active Plant Sites</p>
                      <h3 className="text-3xl font-black mt-2 tracking-tight">{sites.length} Sites</h3>
                      <p className="text-[11px] text-blue-200 font-semibold mt-1">Operational Hubs</p>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 rounded-3xl p-5 text-white shadow-xl shadow-emerald-500/15 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Heavy Fleet Inventory</p>
                      <h3 className="text-3xl font-black mt-2 tracking-tight">{vehicles.length} Trucks</h3>
                      <p className="text-[11px] text-emerald-200 font-semibold mt-1">Bulkers & Trailers</p>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                      <Truck className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold text-amber-100 uppercase tracking-wider">Driver Directory</p>
                      <h3 className="text-3xl font-black mt-2 tracking-tight">{drivers.length} Drivers</h3>
                      <p className="text-[11px] text-amber-200 font-semibold mt-1">Commercial DL Verified</p>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                      <UserCheck className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 rounded-3xl p-5 text-white shadow-xl shadow-purple-500/15 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold text-purple-200 uppercase tracking-wider">System Staff Users</p>
                      <h3 className="text-3xl font-black mt-2 tracking-tight">{users.length} Users</h3>
                      <p className="text-[11px] text-purple-200 font-semibold mt-1">RBAC Security Active</p>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Jump Live Streams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h3 className="text-sm font-extrabold text-slate-900">Loading Plant Locations</h3>
                    </div>
                    <button onClick={() => handleMenuChange('sites')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                      View All →
                    </button>
                  </div>

                  {sites.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No loading plants configured yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {sites.slice(0, 4).map(s => (
                        <div key={s.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{s.name}</p>
                            <p className="text-slate-400 text-[11px]">{s.state}</p>
                          </div>
                          <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-mono font-bold px-2.5 py-1 rounded-xl border border-blue-200/60 shadow-xs">
                            {s.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h3 className="text-sm font-extrabold text-slate-900">Recent Live Security Telemetry</h3>
                    </div>
                    <button onClick={() => handleMenuChange('audit-logs')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                      Full Log (7-Days) →
                    </button>
                  </div>

                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No audit records logged yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {auditLogs.slice(0, 4).map(log => (
                        <div key={log.id} className="py-3 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 line-clamp-1">{log.description}</p>
                            <p className="text-slate-400 text-[10px]">
                              By <span className="text-slate-700 font-semibold">{log.performed_by}</span> • IP: <span className="font-mono">{log.ip_address || '127.0.0.1'}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 2. SITES MASTER */}
          {activeMenu === 'sites' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Site / Plant Master</h2>
                  <p className="text-xs text-slate-500">Configure origin dispatch plants and operational units</p>
                </div>
                <button
                  onClick={() => setModalType('ADD_SITE')}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Site</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">Plant Name</th>
                        <th className="p-4">Site Code</th>
                        <th className="p-4">State / Region</th>
                        <th className="p-4">Created By</th>
                        <th className="p-4">Date Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {sites.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">No plant sites added yet.</td>
                        </tr>
                      ) : (
                        sites.map((s) => (
                          <tr key={s.id} className="hover:bg-blue-50/30 transition">
                            <td className="p-4 font-bold text-slate-900">{s.name}</td>
                            <td className="p-4">
                              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200/80">
                                {s.code}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">{s.state}</td>
                            <td className="p-4 text-slate-500 font-medium">{s.created_by}</td>
                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                              {new Date(s.created_at).toLocaleDateString()}
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

          {/* 3. VEHICLES MASTER */}
          {activeMenu === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Vehicle & Fleet Master</h2>
                  <p className="text-xs text-slate-500">Register bulkers, high-side trailers, and capacity in MT</p>
                </div>
                <button
                  onClick={() => setModalType('ADD_VEHICLE')}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Vehicle</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">Vehicle Number</th>
                        <th className="p-4">Body Type</th>
                        <th className="p-4">Capacity (MT)</th>
                        <th className="p-4">Assigned Site</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {vehicles.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">No vehicles registered yet.</td>
                        </tr>
                      ) : (
                        vehicles.map((v) => (
                          <tr key={v.id} className="hover:bg-emerald-50/30 transition">
                            <td className="p-4 font-mono font-black text-slate-900">{v.vehicle_no}</td>
                            <td className="p-4 text-slate-600">{v.vehicle_type}</td>
                            <td className="p-4 font-mono font-bold text-emerald-600">{v.capacity_mt} MT</td>
                            <td className="p-4">
                              {v.assigned_site ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                                  {v.assigned_site}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">General Pool</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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

          {/* 4. DRIVERS MASTER */}
          {activeMenu === 'drivers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Driver Directory</h2>
                  <p className="text-xs text-slate-500">Commercial heavy licenses, phone directory, and truck pairing</p>
                </div>
                <button
                  onClick={() => {
                    setDriverForm({ name: '', phone: '', license_no: '', assigned_vehicle: '', status: 'Active' });
                    setModalType('ADD_DRIVER');
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Driver</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">Driver Name</th>
                        <th className="p-4">Mobile Contact</th>
                        <th className="p-4">Commercial DL No</th>
                        <th className="p-4">Assigned Vehicle</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {drivers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">No drivers added yet.</td>
                        </tr>
                      ) : (
                        drivers.map((d) => (
                          <tr key={d.id} className="hover:bg-amber-50/30 transition">
                            <td className="p-4 font-bold text-slate-900">{d.name}</td>
                            <td className="p-4 font-mono text-slate-600">{d.phone}</td>
                            <td className="p-4 font-mono font-bold text-slate-700">{d.license_no}</td>
                            <td className="p-4 font-mono font-bold text-blue-600">{d.assigned_vehicle}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {d.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedDriver(d);
                                    setDriverForm({ ...d });
                                    setModalType('EDIT_DRIVER');
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-xl transition cursor-pointer"
                                  title="Edit Driver"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDriver(d)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl transition cursor-pointer"
                                  title="Delete Driver"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* 5. USER & STAFF ACCOUNTS */}
          {activeMenu === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">User & Staff Accounts</h2>
                  <p className="text-xs text-slate-500">Manage Directors, Accounts Officers, and Plant Executives</p>
                </div>
                <button
                  onClick={() => setModalType('ADD_USER')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">User Profile</th>
                        <th className="p-4">Role & Scope</th>
                        <th className="p-4">Audit Note</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-purple-50/30 transition">
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">@{u.username} • {u.branch}</p>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                              {u.role}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">Site: {u.site_access === 'ALL' ? 'All Plants' : u.site_access}</p>
                          </td>

                          <td className="p-4">
                            <p className="text-slate-800 font-semibold">{u.last_action_note || 'Account Created'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              By: {u.updated_by !== 'None' ? u.updated_by : u.created_by}
                            </p>
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                u.is_active 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {u.is_active ? 'Active' : 'Suspended'}
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => { 
                                  setSelectedUser(u); 
                                  setUserForm({ username: u.username, name: u.name, role: u.role, branch: u.branch, site_access: u.site_access, password_hash: '' }); 
                                  setModalType('EDIT_USER'); 
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-xl transition cursor-pointer"
                                title="Edit User"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => { setSelectedUser(u); setResetPassValue(''); setModalType('RESET_PASS'); }}
                                className="p-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-xl transition cursor-pointer"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl transition cursor-pointer"
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

          {/* 6. PLACEHOLDER VIEWS */}
          {(['destinations', 'trips', 'finance', 'tyres', 'compliance', 'workshop', 'access', 'reports'].includes(activeMenu)) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                {activeMenu === 'destinations' && <MapPin className="w-8 h-8" />}
                {activeMenu === 'trips' && <FileText className="w-8 h-8" />}
                {activeMenu === 'finance' && <DollarSign className="w-8 h-8" />}
                {activeMenu === 'tyres' && <Disc className="w-8 h-8" />}
                {activeMenu === 'compliance' && <ShieldCheck className="w-8 h-8" />}
                {activeMenu === 'workshop' && <Wrench className="w-8 h-8" />}
                {activeMenu === 'access' && <Key className="w-8 h-8" />}
                {activeMenu === 'reports' && <BarChart3 className="w-8 h-8" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  {activeMenu === 'destinations' && 'Destination Hubs Management'}
                  {activeMenu === 'trips' && 'Trip & LR Register (Dispatch)'}
                  {activeMenu === 'finance' && 'Finance, Freight & Diesel Advances'}
                  {activeMenu === 'tyres' && 'Tyre Inventory & Fitment System'}
                  {activeMenu === 'compliance' && 'Vehicle Compliance & Expiry Alerts'}
                  {activeMenu === 'workshop' && 'Workshop, Job Cards & Spare Parts'}
                  {activeMenu === 'access' && 'Access Control & Granular RBAC Matrix'}
                  {activeMenu === 'reports' && 'Reports & Executive MIS Analytics'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This core module is integrated into the Buddy Fleets schema and ready for full live configuration.
                </p>
              </div>
            </div>
          )}

          {/* 7. LIVE AUDIT TRAIL LOGS (SINGLE-LINE DENSE TABLE + VIEW DETAILS MODAL) */}
          {activeMenu === 'audit-logs' && (
            <div className="space-y-4">
              
              {/* Header & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                    Security & Live Audit Trail Logs
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Stream Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sub-second immutable telemetry • Auto-purged after 7 days (Zero DB Bloat)
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs by IP, User, Action..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Single-Line Compact Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50/90 text-slate-500 font-extrabold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Timestamp (UTC)</th>
                        <th className="p-3.5">User Identity</th>
                        <th className="p-3.5">IP Address</th>
                        <th className="p-3.5">Module & Action</th>
                        <th className="p-3.5">Event Description (Single Line)</th>
                        <th className="p-3.5 text-right">Forensic Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No telemetry logs found matching your filter within the last 7 days.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition group">
                            {/* Timestamp */}
                            <td className="p-3.5 font-mono text-[11px] text-slate-500">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                            </td>

                            {/* User Profile */}
                            <td className="p-3.5">
                              <span className="font-extrabold text-slate-900">{log.performed_by}</span>
                              <span className="text-slate-400 text-[11px] font-mono ml-1.5">(@{log.performed_by_username || 'system'})</span>
                            </td>

                            {/* IP Address */}
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                                {log.ip_address || '127.0.0.1'}
                              </span>
                            </td>

                            {/* Module & Action Pill */}
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-md font-mono font-black text-[10px] ${
                                log.action_type === 'DELETE' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : log.action_type === 'CREATE' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : log.action_type === 'PASSWORD_RESET'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {log.module}:{log.action_type}
                              </span>
                            </td>

                            {/* Single Line Description */}
                            <td className="p-3.5 max-w-md truncate text-slate-800 font-medium" title={log.description}>
                              {log.description}
                            </td>

                            {/* Action Button */}
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedAuditLog(log)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Details</span>
                              </button>
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

        </main>
      </div>

      {/* =========================================================================
          FORENSIC AUDIT DETAILS DRAWER / MODAL
      ========================================================================== */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  selectedAuditLog.action_type === 'DELETE' 
                    ? 'bg-rose-50 text-rose-600' 
                    : selectedAuditLog.action_type === 'CREATE' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Forensic Audit Inspection</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Log ID: {selectedAuditLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Forensic Detail Grid */}
            <div className="space-y-3 text-xs">
              
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Summary</span>
                <p className="font-bold text-slate-900 text-sm">{selectedAuditLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Network & Public IP</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900">{selectedAuditLog.ip_address || '127.0.0.1'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Exact Timestamp</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900">{new Date(selectedAuditLog.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Operator Identity</span>
                  <p className="font-bold text-slate-900">{selectedAuditLog.performed_by}</p>
                  <p className="text-[11px] text-slate-400 font-mono">@{selectedAuditLog.performed_by_username || 'system'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Action Tag</span>
                  <p className="font-mono font-extrabold text-blue-600">{selectedAuditLog.module} : {selectedAuditLog.action_type}</p>
                </div>
              </div>

              {/* User Agent / Device Signature */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Device Signature & Browser Agent</span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 break-all">{selectedAuditLog.user_agent || 'Standard Web Console Client'}</p>
              </div>

              {/* Payload Metadata JSON */}
              {selectedAuditLog.metadata && Object.keys(selectedAuditLog.metadata).length > 0 && (
                <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl space-y-1 font-mono text-[11px] overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Payload (State Diff)</span>
                  <pre className="overflow-x-auto p-2 bg-slate-950/80 rounded-xl text-emerald-400">
                    {JSON.stringify(selectedAuditLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS CONTAINER
      ========================================================================== */}
      
      {/* 1. Add Site */}
      {modalType === 'ADD_SITE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Add Site</h3>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Site Code</label>
                <input
                  required
                  placeholder="e.g. DHAR"
                  value={siteForm.code}
                  onChange={(e) => setSiteForm({ ...siteForm, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">State / Region</label>
                <input
                  required
                  placeholder="e.g. Madhya Pradesh"
                  value={siteForm.state}
                  onChange={(e) => setSiteForm({ ...siteForm, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer">Create Site</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Vehicle */}
      {modalType === 'ADD_VEHICLE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Register Vehicle</h3>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Body Type</label>
                  <select
                    value={vehicleForm.vehicle_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bulker">Bulker (Loose Cement)</option>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Site</label>
                <select
                  value={vehicleForm.assigned_site}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, assigned_site: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- General Fleet Pool --</option>
                  {sites.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer">Register Truck</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add User */}
      {modalType === 'ADD_USER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Create Staff User</h3>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Password</label>
                  <input
                    required
                    placeholder="••••••••"
                    value={userForm.password_hash}
                    onChange={(e) => setUserForm({ ...userForm, password_hash: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">System Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="DIRECTOR">Director (Client Admin)</option>
                    <option value="HO_ACCOUNTS">Head Office Accounts</option>
                    <option value="SITE_EXEC">Site Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Site Scope</label>
                  <select
                    value={userForm.site_access}
                    onChange={(e) => setUserForm({ ...userForm, site_access: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-purple-500/20 cursor-pointer">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit User */}
      {modalType === 'EDIT_USER' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Edit User Details</h3>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">System Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="DIRECTOR">Director (Client Admin)</option>
                    <option value="HO_ACCOUNTS">Head Office Accounts</option>
                    <option value="SITE_EXEC">Site Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Site Scope</label>
                  <select
                    value={userForm.site_access}
                    onChange={(e) => setUserForm({ ...userForm, site_access: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-purple-500/20 cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Driver */}
      {modalType === 'ADD_DRIVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Add Commercial Driver</h3>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">License No</label>
                  <input
                    required
                    placeholder="MP09-XXXX"
                    value={driverForm.license_no}
                    onChange={(e) => setDriverForm({ ...driverForm, license_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Vehicle</label>
                <input
                  placeholder="e.g. MP-09-HH-4412"
                  value={driverForm.assigned_vehicle}
                  onChange={(e) => setDriverForm({ ...driverForm, assigned_vehicle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Driver */}
      {modalType === 'EDIT_DRIVER' && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Edit Commercial Driver</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Driver Full Name</label>
                <input
                  required
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mobile Number</label>
                  <input
                    required
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">License No</label>
                  <input
                    required
                    value={driverForm.license_no}
                    onChange={(e) => setDriverForm({ ...driverForm, license_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Vehicle</label>
                <input
                  value={driverForm.assigned_vehicle}
                  onChange={(e) => setDriverForm({ ...driverForm, assigned_vehicle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer">Update Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Reset Password */}
      {modalType === 'RESET_PASS' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600">
              <Key className="w-5 h-5" />
              <h3 className="font-black text-base text-slate-900">Reset Password</h3>
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setModalType(null)} className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={handleResetPassword} className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 cursor-pointer">Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Edit Profile */}
      {modalType === 'EDIT_PROFILE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Edit Root Profile</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateSelfProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Display Name</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Password</label>
                <input
                  required
                  type="text"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}