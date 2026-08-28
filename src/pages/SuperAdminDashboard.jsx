import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
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
  Clock,
  Shield,
  Search,
  Upload,
  Camera,
  Download,
  FileSpreadsheet,
  PhoneCall
} from 'lucide-react';
import { INDIAN_STATES, INDIA_STATES_DISTRICTS, fetchLocationByPincode } from '../utils/indiaGeoData';

const USER_ROLES = [
  { value: 'DIRECTOR', label: 'Director (Admin)' },
  { value: 'HO_ACCOUNTS', label: 'Head Office Accounts' },
  { value: 'HO_OPERATIONS', label: 'Head Office Operations' },
  { value: 'PLANT_MANAGER', label: 'Plant Manager' },
  { value: 'PLANT_INCHARGE', label: 'Plant Incharge' }
];

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

  // Driver Filters, Search & Bulk Delete States
  const [driverSearch, setDriverSearch] = useState('');
  const [driverPlantFilter, setDriverPlantFilter] = useState('ALL');
  const [driverStatusFilter, setDriverStatusFilter] = useState('ALL');
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  // Forensic Audit States
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [clientIp, setClientIp] = useState('Fetching...');
  const [hasNewAuditPulse, setHasNewAuditPulse] = useState(false);

  // Modals & UI States
  const [modalType, setModalType] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [plantDropdownOpen, setPlantDropdownOpen] = useState(false);

  // Custom Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Custom Toast Notification
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  // Site Form
  const [siteForm, setSiteForm] = useState({
    site_name: '',
    site_code: '',
    plant_type: 'Loose Cement',
    pincode: '',
    state: '',
    district: '',
    address: '',
    manager_name: '',
    manager_phone: '',
    manager_email: ''
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Vehicle Form
  const [vehicleForm, setVehicleForm] = useState({ vehicle_no: '', vehicle_type: 'Bulker', capacity_mt: 40, assigned_site: '' });
  
  // User Form
  const [userForm, setUserForm] = useState({
    username: '',
    password_hash: '',
    name: '',
    role: 'PLANT_MANAGER',
    phone: '',
    email: '',
    photo_url: '',
    assigned_plants: ['ALL']
  });

  // Complete Driver Form
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    emergency_phone: '',
    aadhaar_no: '',
    address: '',
    license_no: '',
    license_expiry: '',
    license_category: 'TRANS (Heavy Bulkers)',
    assigned_vehicle: 'Unassigned',
    assigned_plant: 'ALL',
    experience_years: '',
    bank_account_no: '',
    ifsc_code: '',
    bank_name: '',
    upi_id: '',
    status: 'Available',
    photo_url: '',
    license_doc_url: ''
  });

  const [resetPassValue, setResetPassValue] = useState('');
  
  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Admin',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    photo_url: currentUser?.photo_url || '',
    password: currentUser?.password_hash || ''
  });

  // Fetch Public IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIp(data.ip || '127.0.0.1'))
      .catch(() => setClientIp('127.0.0.1'));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type });
    setTimeout(() => {
      setToast({ open: false, message: '', type: 'success' });
    }, 3500);
  };

  const logAuditActivity = async (module, action_type, description, metadata = {}) => {
    try {
      await supabase.from('audit_logs').insert([{
        module,
        action_type,
        description,
        performed_by: currentUser?.name || 'SuperAdmin',
        performed_by_username: currentUser?.username || 'admin',
        ip_address: clientIp,
        user_agent: navigator.userAgent || 'Web Console Client',
        metadata: {
          ...metadata,
          timestamp_iso: new Date().toISOString()
        }
      }]);
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    localStorage.setItem('buddy_fleets_active_tab', menu);
  };

  // Fetch Live Data
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
          .limit(300)
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
      .channel('buddy_fleets_realtime_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSites(prev => [payload.new, ...prev.filter(s => s.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setSites(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        } else if (payload.eventType === 'DELETE') {
          setSites(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [payload.new, ...prev.filter(u => u.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVehicles(prev => [payload.new, ...prev.filter(v => v.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
        } else if (payload.eventType === 'DELETE') {
          setVehicles(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDrivers(prev => [payload.new, ...prev.filter(d => d.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setDrivers(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
        } else if (payload.eventType === 'DELETE') {
          setDrivers(prev => prev.filter(d => d.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAuditLogs(prev => [payload.new, ...prev]);
          setHasNewAuditPulse(true);
          setTimeout(() => setHasNewAuditPulse(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientIp]);

  // ================= SITE MASTER LOGIC =================
  const handleSitePincodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setSiteForm(prev => ({ ...prev, pincode: pin }));

    if (pin.length === 6) {
      setPincodeLoading(true);
      const res = await fetchLocationByPincode(pin);
      if (res.success) {
        setSiteForm(prev => ({
          ...prev,
          state: res.state || prev.state,
          district: res.district || prev.district
        }));
      }
      setPincodeLoading(false);
    }
  };

  const handleCreateSite = async (e) => {
    e.preventDefault();
    const siteCode = siteForm.site_code.toUpperCase().trim();
    const siteName = siteForm.site_name.trim();

    const isDuplicate = sites.some(
      s => (s.code || s.site_code)?.toUpperCase() === siteCode
    );

    if (isDuplicate) {
      showToast(`Plant Code '${siteCode}' already exists! Please enter a unique code.`, 'warning');
      return;
    }

    const newSitePayload = {
      name: siteName,
      code: siteCode,
      plant_type: siteForm.plant_type,
      pincode: siteForm.pincode,
      state: siteForm.state,
      district: siteForm.district,
      address: siteForm.address.trim(),
      manager_name: siteForm.manager_name.trim(),
      manager_phone: siteForm.manager_phone.trim(),
      manager_email: siteForm.manager_email.trim(),
      is_active: true,
      created_by: currentUser?.name || 'SuperAdmin'
    };

    const tempId = crypto.randomUUID();
    const optimisticSite = { ...newSitePayload, id: tempId, created_at: new Date().toISOString() };
    setSites(prev => [optimisticSite, ...prev]);
    setModalType(null);
    showToast(`Plant ${siteName} (${siteCode}) created successfully!`);

    setSiteForm({
      site_name: '',
      site_code: '',
      plant_type: 'Loose Cement',
      pincode: '',
      state: '',
      district: '',
      address: '',
      manager_name: '',
      manager_phone: '',
      manager_email: ''
    });

    (async () => {
      const { data, error } = await supabase
        .from('sites')
        .insert([newSitePayload])
        .select()
        .single();

      if (error) {
        fetchAllData();
        showToast('Error saving plant: ' + error.message, 'error');
      } else if (data) {
        setSites(prev => prev.map(s => s.id === tempId ? data : s));
        logAuditActivity('SITE', 'CREATE', `Created operational plant ${siteName} (${siteCode}) at ${newSitePayload.district}, ${newSitePayload.state}`, {
          site_name: siteName,
          code: siteCode
        });
      }
    })();
  };

  const handleUpdateSite = async (e) => {
    e.preventDefault();
    if (!selectedSite) return;

    const siteCode = siteForm.site_code.toUpperCase().trim();
    const siteName = siteForm.site_name.trim();

    const isDuplicate = sites.some(
      s => (s.code || s.site_code)?.toUpperCase() === siteCode && s.id !== selectedSite.id
    );

    if (isDuplicate) {
      showToast(`Plant Code '${siteCode}' is already used by another plant!`, 'warning');
      return;
    }

    const updatedData = {
      name: siteName,
      code: siteCode,
      plant_type: siteForm.plant_type,
      pincode: siteForm.pincode,
      state: siteForm.state,
      district: siteForm.district,
      address: siteForm.address.trim(),
      manager_name: siteForm.manager_name.trim(),
      manager_phone: siteForm.manager_phone.trim(),
      manager_email: siteForm.manager_email.trim(),
      updated_at: new Date().toISOString()
    };

    const targetSiteId = selectedSite.id;
    setSites(prev => prev.map(s => s.id === targetSiteId ? { ...s, ...updatedData } : s));
    setModalType(null);
    setSelectedSite(null);
    showToast('Plant details updated!');

    (async () => {
      const { error } = await supabase
        .from('sites')
        .update(updatedData)
        .eq('id', targetSiteId);

      if (error) {
        fetchAllData();
        showToast('Error updating plant: ' + error.message, 'error');
      } else {
        logAuditActivity('SITE', 'UPDATE', `Updated details for plant ${siteName} (${siteCode})`);
      }
    })();
  };

  const handleDeleteSite = (site) => {
    const siteName = site.name || site.site_name;
    const siteCode = site.code || site.site_code;

    setConfirmDialog({
      open: true,
      title: 'Delete Plant Site',
      message: `Are you sure you want to delete ${siteName} (${siteCode})? This cannot be undone.`,
      onConfirm: async () => {
        setSites(prev => prev.filter(s => s.id !== site.id));
        setConfirmDialog(prev => ({ ...prev, open: false }));
        showToast(`Plant ${siteName} deleted!`);

        const { error } = await supabase.from('sites').delete().eq('id', site.id);
        if (error) {
          fetchAllData();
          showToast('Error deleting plant: ' + error.message, 'error');
        } else {
          logAuditActivity('SITE', 'DELETE', `Deleted plant location ${siteName} (${siteCode})`);
        }
      }
    });
  };

  const handleToggleSiteStatus = async (site) => {
    const nextStatus = !site.is_active;
    const siteName = site.name || site.site_name;

    setSites(prev => prev.map(s => s.id === site.id ? { ...s, is_active: nextStatus } : s));
    showToast(`Plant status set to ${nextStatus ? 'Active' : 'Inactive'}`);

    (async () => {
      const { error } = await supabase
        .from('sites')
        .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', site.id);

      if (error) {
        setSites(prev => prev.map(s => s.id === site.id ? { ...s, is_active: !nextStatus } : s));
        showToast('Error updating status: ' + error.message, 'error');
      } else {
        logAuditActivity('SITE', 'UPDATE', `Switched plant ${siteName} status to ${nextStatus ? 'OPERATIONAL' : 'INACTIVE'}`);
      }
    })();
  };

  // ================= FLEET MASTER LOGIC =================
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    const vehicleNo = vehicleForm.vehicle_no.toUpperCase().trim();
    const newVehicle = {
      vehicle_no: vehicleNo,
      vehicle_type: vehicleForm.vehicle_type,
      capacity_mt: parseFloat(vehicleForm.capacity_mt),
      assigned_site: vehicleForm.assigned_site || null,
      created_by: currentUser?.name || 'SuperAdmin'
    };

    const { data, error } = await supabase.from('vehicles').insert([newVehicle]).select().single();

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      setVehicles(prev => [data || { ...newVehicle, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      await logAuditActivity('FLEET', 'CREATE', `Registered truck ${vehicleNo} (${vehicleForm.vehicle_type} - ${vehicleForm.capacity_mt} MT)`);
      setVehicleForm({ vehicle_no: '', vehicle_type: 'Bulker', capacity_mt: 40, assigned_site: '' });
      setModalType(null);
      showToast('Vehicle registered into fleet inventory!');
    }
  };

  const handlePhotoUpload = (e, formType = 'user') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (formType === 'profile') {
          setProfileForm(prev => ({ ...prev, photo_url: reader.result }));
        } else if (formType === 'driver') {
          setDriverForm(prev => ({ ...prev, photo_url: reader.result }));
        } else if (formType === 'driver_dl') {
          setDriverForm(prev => ({ ...prev, license_doc_url: reader.result }));
        } else {
          setUserForm(prev => ({ ...prev, photo_url: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlantToggle = (plantCode) => {
    setUserForm(prev => {
      let current = [...(prev.assigned_plants || [])];

      if (plantCode === 'ALL') {
        return { ...prev, assigned_plants: ['ALL'] };
      }

      current = current.filter(c => c !== 'ALL');
      if (current.includes(plantCode)) {
        current = current.filter(c => c !== plantCode);
      } else {
        current.push(plantCode);
      }

      if (current.length === 0) current = ['ALL'];
      return { ...prev, assigned_plants: current };
    });
  };

  // ================= USER ACCOUNTS LOGIC =================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const cleanUser = userForm.username.trim();

    const defaultPermissions = userForm.role === 'DIRECTOR'
      ? { canViewFinancials: true, canCreateLR: true, canEditLR: true, canManageFuel: true, canManageUsers: true }
      : userForm.role === 'HO_ACCOUNTS'
      ? { canViewFinancials: true, canCreateLR: false, canEditLR: true, canManageFuel: true, canManageUsers: false }
      : { canViewFinancials: false, canCreateLR: true, canEditLR: true, canManageFuel: true, canManageUsers: false };

    const newUserPayload = {
      username: cleanUser,
      password_hash: userForm.password_hash,
      name: userForm.name.trim(),
      role: userForm.role,
      phone: userForm.phone.trim(),
      email: userForm.email.trim(),
      photo_url: userForm.photo_url || null,
      assigned_plants: userForm.assigned_plants?.length > 0 ? userForm.assigned_plants : ['ALL'],
      permissions: defaultPermissions,
      is_active: true,
      created_by: currentUser?.name || 'SuperAdmin',
      last_action_note: `Created by ${currentUser?.name || 'SuperAdmin'}`
    };

    const { data, error } = await supabase.from('app_users').insert([newUserPayload]).select().single();

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      setUsers(prev => [data || { ...newUserPayload, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
      await logAuditActivity('USER', 'CREATE', `Provisioned account @${cleanUser} for ${userForm.name} (${userForm.role})`);
      setUserForm({
        username: '',
        password_hash: '',
        name: '',
        role: 'PLANT_MANAGER',
        phone: '',
        email: '',
        photo_url: '',
        assigned_plants: ['ALL']
      });
      setModalType(null);
      setPlantDropdownOpen(false);
      showToast(`User @${cleanUser} provisioned!`);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const cleanUser = userForm.username.trim();
    const updatedUserObj = {
      username: cleanUser,
      name: userForm.name.trim(),
      role: userForm.role,
      phone: userForm.phone.trim(),
      email: userForm.email.trim(),
      photo_url: userForm.photo_url || null,
      assigned_plants: userForm.assigned_plants?.length > 0 ? userForm.assigned_plants : ['ALL'],
      updated_by: currentUser?.name || 'SuperAdmin',
      last_action_note: `Details updated by ${currentUser?.name || 'SuperAdmin'}`,
      updated_at: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...updatedUserObj } : u));

    const { error } = await supabase
      .from('app_users')
      .update(updatedUserObj)
      .eq('id', selectedUser.id);

    if (error) {
      fetchAllData();
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'UPDATE', `Updated user details for @${cleanUser} (${userForm.name})`);
      setModalType(null);
      setSelectedUser(null);
      setPlantDropdownOpen(false);
      showToast('User details updated!');
    }
  };

  const handleDeleteUser = (user) => {
    const isSelf = user.id === currentUser?.id || user.username?.toLowerCase() === currentUser?.username?.toLowerCase();
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.username?.toLowerCase() === 'admin';

    if (isSelf || isSuperAdmin) {
      showToast('Security Alert: Administrator / Super Admin account cannot be deleted.', 'error');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Staff User Account',
      message: `Are you sure you want to permanently delete user @${user.username} (${user.name})?`,
      onConfirm: async () => {
        setUsers(prev => prev.filter(u => u.id !== user.id));

        const { error } = await supabase.from('app_users').delete().eq('id', user.id);
        if (error) {
          fetchAllData();
          showToast('Error deleting user: ' + error.message, 'error');
        } else {
          await logAuditActivity('USER', 'DELETE', `Deleted staff account @${user.username} (${user.name})`);
          showToast(`User @${user.username} deleted successfully!`);
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

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
      showToast('Error resetting password: ' + error.message, 'error');
    } else {
      await logAuditActivity('AUTH', 'PASSWORD_RESET', `Admin reset credentials for user @${selectedUser.username}`);
      showToast(`Password updated for user: @${selectedUser.username}!`);
      setResetPassValue('');
      setSelectedUser(null);
      setModalType(null);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const isSelf = user.id === currentUser?.id || user.username?.toLowerCase() === currentUser?.username?.toLowerCase();
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.username?.toLowerCase() === 'admin';

    if (isSelf || isSuperAdmin) {
      showToast('Security Alert: You cannot suspend your own active administrator account.', 'warning');
      return;
    }

    const nextStatus = !user.is_active;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: nextStatus } : u));

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
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !nextStatus } : u));
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'UPDATE', `Changed @${user.username} account status to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}`);
      showToast(`User @${user.username} set to ${nextStatus ? 'Active' : 'Suspended'}`);
    }
  };

  // ================= DRIVER LOGIC =================
  const getDlExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { label: 'No Date', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    const today = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expired', color: 'bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse' };
    } else if (diffDays <= 30) {
      return { label: `Expires in ${diffDays}d`, color: 'bg-amber-50 text-amber-700 border-amber-200 font-bold' };
    }
    return { label: 'Valid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' };
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    const cleanLicense = driverForm.license_no.toUpperCase().trim();
    const cleanPhone = driverForm.phone.trim();

    if (drivers.some(d => d.license_no?.toUpperCase() === cleanLicense)) {
      showToast(`DL Number '${cleanLicense}' already exists!`, 'warning');
      return;
    }

    const newDriverPayload = {
      name: driverForm.name.trim(),
      phone: cleanPhone,
      emergency_phone: (driverForm.emergency_phone || '').trim(),
      aadhaar_no: (driverForm.aadhaar_no || '').trim(),
      address: (driverForm.address || '').trim(),
      license_no: cleanLicense,
      license_expiry: driverForm.license_expiry || null,
      license_category: driverForm.license_category || 'TRANS (Heavy Bulkers)',
      assigned_vehicle: (driverForm.assigned_vehicle || 'Unassigned').toUpperCase().trim(),
      assigned_plant: driverForm.assigned_plant || 'ALL',
      experience_years: parseFloat(driverForm.experience_years) || 0,
      bank_account_no: (driverForm.bank_account_no || '').trim(),
      ifsc_code: (driverForm.ifsc_code || '').toUpperCase().trim(),
      bank_name: (driverForm.bank_name || '').trim(),
      upi_id: (driverForm.upi_id || '').trim(),
      status: driverForm.status || 'Available',
      photo_url: driverForm.photo_url || null,
      license_doc_url: driverForm.license_doc_url || null,
      created_by: currentUser?.name || 'SuperAdmin',
      last_action_note: `Driver profile created by ${currentUser?.name || 'SuperAdmin'}`
    };

    const tempId = crypto.randomUUID();
    const optimisticDriver = { ...newDriverPayload, id: tempId, created_at: new Date().toISOString() };
    setDrivers(prev => [optimisticDriver, ...prev]);
    setModalType(null);
    showToast(`Driver ${driverForm.name} registered successfully!`);

    (async () => {
      const { data, error } = await supabase.from('drivers').insert([newDriverPayload]).select().single();
      if (error) {
        fetchAllData();
        showToast('Error saving driver: ' + error.message, 'error');
      } else if (data) {
        setDrivers(prev => prev.map(d => d.id === tempId ? data : d));
        logAuditActivity('DRIVER', 'CREATE', `Added commercial driver ${driverForm.name} (DL: ${cleanLicense})`);
      }
    })();
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;

    const cleanLicense = driverForm.license_no.toUpperCase().trim();
    const isDuplicate = drivers.some(d => d.license_no?.toUpperCase() === cleanLicense && d.id !== selectedDriver.id);
    if (isDuplicate) {
      showToast(`DL Number '${cleanLicense}' is used by another driver!`, 'warning');
      return;
    }

    const updatedDriverPayload = {
      name: driverForm.name.trim(),
      phone: driverForm.phone.trim(),
      emergency_phone: (driverForm.emergency_phone || '').trim(),
      aadhaar_no: (driverForm.aadhaar_no || '').trim(),
      address: (driverForm.address || '').trim(),
      license_no: cleanLicense,
      license_expiry: driverForm.license_expiry || null,
      license_category: driverForm.license_category || 'TRANS (Heavy Bulkers)',
      assigned_vehicle: (driverForm.assigned_vehicle || 'Unassigned').toUpperCase().trim(),
      assigned_plant: driverForm.assigned_plant || 'ALL',
      experience_years: parseFloat(driverForm.experience_years) || 0,
      bank_account_no: (driverForm.bank_account_no || '').trim(),
      ifsc_code: (driverForm.ifsc_code || '').toUpperCase().trim(),
      bank_name: (driverForm.bank_name || '').trim(),
      upi_id: (driverForm.upi_id || '').trim(),
      status: driverForm.status,
      photo_url: driverForm.photo_url || null,
      license_doc_url: driverForm.license_doc_url || null,
      updated_by: currentUser?.name || 'SuperAdmin',
      last_action_note: `Profile updated by ${currentUser?.name || 'SuperAdmin'}`,
      updated_at: new Date().toISOString()
    };

    const targetId = selectedDriver.id;
    setDrivers(prev => prev.map(d => d.id === targetId ? { ...d, ...updatedDriverPayload } : d));
    setModalType(null);
    setSelectedDriver(null);
    showToast('Driver details updated!');

    (async () => {
      const { error } = await supabase.from('drivers').update(updatedDriverPayload).eq('id', targetId);
      if (error) {
        fetchAllData();
        showToast('Error updating driver: ' + error.message, 'error');
      } else {
        logAuditActivity('DRIVER', 'UPDATE', `Updated driver ${driverForm.name} (DL: ${cleanLicense})`);
      }
    })();
  };

  const handleDeleteDriver = (driver) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Driver',
      message: `Are you sure you want to remove driver ${driver.name} (${driver.license_no})?`,
      onConfirm: async () => {
        setDrivers(prev => prev.filter(d => d.id !== driver.id));
        setSelectedDriverIds(prev => prev.filter(id => id !== driver.id));

        const { error } = await supabase.from('drivers').delete().eq('id', driver.id);
        if (error) {
          fetchAllData();
          showToast('Error deleting driver: ' + error.message, 'error');
        } else {
          await logAuditActivity('DRIVER', 'DELETE', `Deleted commercial driver ${driver.name} (DL: ${driver.license_no})`);
          showToast(`Driver ${driver.name} removed successfully!`);
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Multi-Select Handlers
  const handleSelectAllDrivers = (e) => {
    if (e.target.checked) {
      setSelectedDriverIds(filteredDrivers.map(d => d.id));
    } else {
      setSelectedDriverIds([]);
    }
  };

  const handleToggleDriverSelect = (id) => {
    setSelectedDriverIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete Selected Drivers
  const handleBulkDeleteDrivers = () => {
    if (selectedDriverIds.length === 0) return;

    setConfirmDialog({
      open: true,
      title: `Delete ${selectedDriverIds.length} Driver(s)`,
      message: `Are you sure you want to permanently delete ${selectedDriverIds.length} selected driver record(s)? This action cannot be undone.`,
      onConfirm: () => {
        const idsToDelete = [...selectedDriverIds];
        const previousDrivers = [...drivers];

        setDrivers(prev => prev.filter(d => !idsToDelete.includes(d.id)));
        setSelectedDriverIds([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
        showToast(`Deleted ${idsToDelete.length} drivers successfully!`);

        (async () => {
          try {
            const { error } = await supabase
              .from('drivers')
              .delete()
              .in('id', idsToDelete);

            if (error) {
              setDrivers(previousDrivers);
              showToast('Error deleting drivers: ' + error.message, 'error');
            } else {
              logAuditActivity('DRIVER', 'BULK_DELETE', `Bulk removed ${idsToDelete.length} commercial drivers`);
            }
          } catch (err) {
            setDrivers(previousDrivers);
            console.error('Bulk delete error:', err);
          }
        })();
      }
    });
  };

  const handleExportDriversExcel = () => {
    if (filteredDrivers.length === 0) {
      showToast('No driver records found to export.', 'warning');
      return;
    }

    const exportRows = filteredDrivers.map((d, idx) => ({
      'S.No': idx + 1,
      'Driver Full Name *': d.name,
      'Mobile Number *': d.phone,
      'Emergency Contact *': d.emergency_phone || '-',
      'Commercial DL No *': d.license_no,
      'DL Expiry Date (YYYY-MM-DD) *': d.license_expiry || '-',
      'DL Category *': d.license_category || 'TRANS (Heavy Bulkers)',
      'Assigned Truck': d.assigned_vehicle || 'Unassigned',
      'Base Plant Code *': d.assigned_plant || 'ALL',
      'Driver Status *': d.status || 'Available',
      'Driving Experience (Years)': d.experience_years || 0,
      'Aadhaar Number': d.aadhaar_no || '-',
      'Permanent / Local Address': d.address || '-',
      'Bank Name': d.bank_name || '-',
      'Account Number': d.bank_account_no || '-',
      'IFSC Code': d.ifsc_code || '-',
      'UPI ID': d.upi_id || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drivers_Directory');
    XLSX.writeFile(wb, `BuddyFleets_Drivers_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Driver directory exported to Excel!');
    logAuditActivity('DRIVER', 'EXPORT', `Exported ${exportRows.length} driver records to Excel`);
  };

  const handleDownloadDriverTemplate = () => {
    const sampleData = [
      {
        'Driver Full Name *': 'Rameshwar Gurjar',
        'Mobile Number *': '9829012345',
        'Emergency Contact *': '9829054321',
        'Commercial DL No *': 'RJ14-20180012345',
        'DL Expiry Date (YYYY-MM-DD) *': '2028-12-31',
        'DL Category *': 'TRANS (Heavy Bulkers)',
        'Assigned Truck': 'RJ14-GH-1234',
        'Base Plant Code *': '12001',
        'Driver Status *': 'Available',
        'Driving Experience (Years)': '5',
        'Aadhaar Number': '',
        'Permanent / Local Address': 'Village Rampura, Post Bassi, Jaipur',
        'Bank Name': 'SBI',
        'Account Number': '30495839201',
        'IFSC Code': 'SBIN0001234',
        'UPI ID': 'ramesh@upi'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Template');
    XLSX.writeFile(wb, 'BuddyFleets_Driver_Import_Template.xlsx');
    showToast('Complete sample template downloaded!');
  };

  const handleImportDriversExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        if (rawData.length === 0) {
          showToast('Excel file is empty!', 'warning');
          return;
        }

        const validDrivers = [];
        let duplicateCount = 0;

        rawData.forEach(row => {
          const dlNo = (row['Commercial DL No *'] || row['Commercial DL No'] || row['license_no'] || '').toString().toUpperCase().trim();
          const phone = (row['Mobile Number *'] || row['Mobile Number'] || row['phone'] || '').toString().trim();
          const name = (row['Driver Full Name *'] || row['Driver Full Name'] || row['Driver Name'] || row['name'] || '').toString().trim();

          if (!name || !dlNo || !phone) return;

          const isDup = drivers.some(d => d.license_no?.toUpperCase() === dlNo) ||
                        validDrivers.some(d => d.license_no?.toUpperCase() === dlNo);

          if (isDup) {
            duplicateCount++;
          } else {
            let rawStatus = (row['Driver Status *'] || row['Driver Status'] || row['Status'] || 'Available').toString().trim();
            if (rawStatus.toLowerCase().includes('avail') || rawStatus.toLowerCase().includes('act')) {
              rawStatus = 'Available';
            } else if (rawStatus.toLowerCase().includes('trip')) {
              rawStatus = 'On Trip';
            } else if (rawStatus.toLowerCase().includes('leave') || rawStatus.toLowerCase().includes('rest')) {
              rawStatus = 'On Leave';
            } else if (rawStatus.toLowerCase().includes('black')) {
              rawStatus = 'Blacklisted';
            }

            validDrivers.push({
              name,
              phone,
              emergency_phone: (row['Emergency Contact *'] || row['Emergency Contact'] || '').toString().trim(),
              license_no: dlNo,
              license_expiry: row['DL Expiry Date (YYYY-MM-DD) *'] || row['DL Expiry Date (YYYY-MM-DD)'] || row['license_expiry'] || null,
              license_category: row['DL Category *'] || row['DL Category'] || 'TRANS (Heavy Bulkers)',
              assigned_vehicle: (row['Assigned Truck'] || 'Unassigned').toString().toUpperCase().trim(),
              assigned_plant: (row['Base Plant Code *'] || row['Base Plant Code'] || row['Base Plant'] || 'ALL').toString().trim(),
              experience_years: parseFloat(row['Driving Experience (Years)'] || row['experience_years']) || 0,
              aadhaar_no: (row['Aadhaar Number'] || row['aadhaar_no'] || '').toString().trim(),
              address: (row['Permanent / Local Address'] || row['Address'] || row['address'] || '').toString().trim(),
              bank_name: (row['Bank Name'] || '').toString().trim(),
              bank_account_no: (row['Account Number'] || '').toString().trim(),
              ifsc_code: (row['IFSC Code'] || '').toString().toUpperCase().trim(),
              upi_id: (row['UPI ID'] || '').toString().trim(),
              status: rawStatus,
              created_by: currentUser?.name || 'SuperAdmin',
              last_action_note: 'Bulk imported via Excel'
            });
          }
        });

        if (validDrivers.length === 0) {
          showToast(`No new drivers imported. (${duplicateCount} duplicates found)`, 'warning');
          return;
        }

        const { data, error } = await supabase.from('drivers').insert(validDrivers).select();
        if (error) {
          showToast('Error importing drivers: ' + error.message, 'error');
        } else {
          setDrivers(prev => [...(data || validDrivers), ...prev]);
          showToast(`Imported ${validDrivers.length} drivers successfully! ${duplicateCount > 0 ? `(${duplicateCount} duplicates skipped)` : ''}`);
          logAuditActivity('DRIVER', 'IMPORT', `Bulk imported ${validDrivers.length} commercial drivers from Excel`);
        }
      } catch (err) {
        showToast('Error reading Excel file: ' + err.message, 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // ================= PROFILE UPDATE =================
  const handleUpdateSelfProfile = async (e) => {
    e.preventDefault();
    const updatedProfilePayload = {
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      email: profileForm.email.trim(),
      photo_url: profileForm.photo_url || null,
      password_hash: profileForm.password,
      updated_by: currentUser?.name || 'SuperAdmin',
      last_action_note: 'Self-profile details updated',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('app_users')
      .update(updatedProfilePayload)
      .eq('id', currentUser?.id);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      await logAuditActivity('USER', 'UPDATE', `Super Admin updated personal root profile`);
      showToast('Your profile has been updated!');
      if (onUserUpdate) onUserUpdate({ ...currentUser, ...updatedProfilePayload });
      setModalType(null);
      setUserMenuOpen(false);
    }
  };

  const handleClearAllAuditLogs = () => {
    setConfirmDialog({
      open: true,
      title: 'Flush All Audit Trail Records',
      message: 'Are you sure you want to completely clear all system activity logs? This action cannot be undone.',
      onConfirm: () => {
        const previousLogs = [...auditLogs];
        setAuditLogs([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
        showToast('Audit trail logs cleared successfully!');

        (async () => {
          try {
            const { error } = await supabase
              .from('audit_logs')
              .delete()
              .gt('created_at', '1970-01-01');

            if (error) {
              setAuditLogs(previousLogs);
              showToast('Error clearing logs: ' + error.message, 'error');
            }
          } catch (err) {
            setAuditLogs(previousLogs);
            console.error('Clear logs error:', err);
          }
        })();
      }
    });
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

  // Filtered Drivers Logic
  const filteredDrivers = drivers.filter(d => {
    const query = driverSearch.toLowerCase().trim();
    const matchesSearch = !query || (
      d.name?.toLowerCase().includes(query) ||
      d.phone?.includes(query) ||
      d.license_no?.toLowerCase().includes(query) ||
      d.assigned_vehicle?.toLowerCase().includes(query)
    );

    const matchesPlant = driverPlantFilter === 'ALL' || d.assigned_plant === driverPlantFilter;

    let matchesStatus = true;
    if (driverStatusFilter !== 'ALL') {
      const currentStatus = (d.status || '').toLowerCase();
      if (driverStatusFilter === 'Available') {
        matchesStatus = currentStatus.includes('avail') || currentStatus.includes('act');
      } else if (driverStatusFilter === 'On Trip') {
        matchesStatus = currentStatus.includes('trip');
      } else if (driverStatusFilter === 'On Leave') {
        matchesStatus = currentStatus.includes('leave') || currentStatus.includes('rest');
      } else if (driverStatusFilter === 'Blacklisted') {
        matchesStatus = currentStatus.includes('black');
      }
    }

    return matchesSearch && matchesPlant && matchesStatus;
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
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
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-40 px-6 py-3 shadow-md shrink-0">
        <div className="flex items-center justify-between w-full">
          
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

          <div className="relative flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-800 p-1.5 pr-3.5 rounded-full border border-slate-700/80 transition cursor-pointer shadow-sm"
              >
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
                    onClick={() => {
                      setProfileForm({
                        name: currentUser?.name || 'Admin',
                        phone: currentUser?.phone || '',
                        email: currentUser?.email || '',
                        photo_url: currentUser?.photo_url || '',
                        password: currentUser?.password_hash || ''
                      });
                      setModalType('EDIT_PROFILE');
                      setUserMenuOpen(false);
                    }}
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

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col p-3.5 shrink-0 shadow-xl overflow-y-auto sticky top-0 h-[calc(100vh-65px)] select-none">
          <div className="space-y-4 flex-1">
            
            {/* OPERATIONS & DISPATCH */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Operations & Dispatch
              </div>

              <button
                onClick={() => handleMenuChange('dashboard')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'dashboard' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <LayoutDashboard className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'dashboard' ? 'text-white' : 'text-blue-400'}`} />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => handleMenuChange('sites')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'sites' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Building2 className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'sites' ? 'text-white' : 'text-indigo-400'}`} />
                <span>Site / Plant Master</span>
              </button>

              <button
                onClick={() => handleMenuChange('destinations')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'destinations' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <MapPin className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'destinations' ? 'text-white' : 'text-amber-400'}`} />
                <span>Destination Hubs</span>
              </button>

              <button
                onClick={() => handleMenuChange('vehicles')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'vehicles' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Truck className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'vehicles' ? 'text-white' : 'text-emerald-400'}`} />
                <span>Vehicle & Fleet</span>
              </button>

              <button
                onClick={() => handleMenuChange('drivers')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'drivers' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <UserCheck className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'drivers' ? 'text-white' : 'text-purple-400'}`} />
                <span>Driver Directory</span>
              </button>

              <button
                onClick={() => handleMenuChange('trips')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'trips' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <FileText className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'trips' ? 'text-white' : 'text-cyan-400'}`} />
                <span>Trip & LR Register</span>
              </button>
            </div>

            {/* ACCOUNTS & ASSETS */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Accounts & Assets
              </div>

              <button
                onClick={() => handleMenuChange('finance')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'finance' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <DollarSign className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'finance' ? 'text-white' : 'text-emerald-400'}`} />
                <span>Finance & Diesel</span>
              </button>

              <button
                onClick={() => handleMenuChange('tyres')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'tyres' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Disc className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'tyres' ? 'text-white' : 'text-amber-400'}`} />
                <span>Tyre Inventory</span>
              </button>

              <button
                onClick={() => handleMenuChange('compliance')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'compliance' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <ShieldCheck className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'compliance' ? 'text-white' : 'text-rose-400'}`} />
                <span>Vehicle Compliance</span>
              </button>

              <button
                onClick={() => handleMenuChange('workshop')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'workshop' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Wrench className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'workshop' ? 'text-white' : 'text-orange-400'}`} />
                <span>Workshop & Repairs</span>
              </button>
            </div>

            {/* SYSTEM & GOVERNANCE */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                System & Governance
              </div>

              <button
                onClick={() => handleMenuChange('users')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'users' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Users className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'users' ? 'text-white' : 'text-purple-400'}`} />
                <span>User & Staff Accounts</span>
              </button>

              <button
                onClick={() => handleMenuChange('access')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'access' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Key className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'access' ? 'text-white' : 'text-amber-400'}`} />
                <span>Access & RBAC Matrix</span>
              </button>

              <button
                onClick={() => handleMenuChange('reports')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'reports' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <BarChart3 className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'reports' ? 'text-white' : 'text-teal-400'}`} />
                <span>Reports & MIS</span>
              </button>

              <button
                onClick={() => handleMenuChange('audit-logs')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  activeMenu === 'audit-logs' 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <History className={`w-4.5 h-4.5 shrink-0 ${activeMenu === 'audit-logs' ? 'text-white' : 'text-sky-400'}`} />
                  <span>Audit Trail Logs</span>
                </div>
                
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
        <main className="flex-1 h-full overflow-y-auto p-6 space-y-6">

          {/* 1. DASHBOARD OVERVIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operations Dashboard</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time telemetry and resource allocation overview</p>
                </div>
              </div>

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
            </div>
          )}

          {/* 2. SITES MASTER */}
          {activeMenu === 'sites' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Site / Plant Master</h2>
                  <p className="text-xs text-slate-500">Configure origin dispatch plants, material types, and manager contacts</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSite(null);
                    setSiteForm({
                      site_name: '',
                      site_code: '',
                      plant_type: 'Loose Cement',
                      pincode: '',
                      state: '',
                      district: '',
                      address: '',
                      manager_name: '',
                      manager_phone: '',
                      manager_email: ''
                    });
                    setModalType('ADD_SITE');
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Plant / Site</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">Plant Identity</th>
                        <th className="p-4">Plant Type</th>
                        <th className="p-4">Location & Pincode</th>
                        <th className="p-4">Plant In-Charge</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {sites.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">No plant sites added yet. Click 'Add Plant / Site' to register one.</td>
                        </tr>
                      ) : (
                        sites.map((s) => (
                          <tr key={s.id} className="hover:bg-blue-50/30 transition">
                            <td className="p-4">
                              <p className="font-bold text-slate-900 text-sm">{s.name || s.site_name}</p>
                              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200/70 text-[10px]">
                                {s.code || s.site_code}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {s.plant_type || 'General'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">
                              <p className="font-bold text-slate-800">{s.district ? `${s.district}, ` : ''}{s.state}</p>
                              <p className="text-[11px] text-slate-400 font-mono">PIN: {s.pincode || 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              {s.manager_name ? (
                                <div>
                                  <p className="font-bold text-slate-900">{s.manager_name}</p>
                                  <p className="text-[11px] text-slate-500 font-mono">{s.manager_phone || s.manager_email || '-'}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Not Assigned</span>
                              )}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleSiteStatus(s)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                  s.is_active !== false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                {s.is_active !== false ? 'Operational' : 'Inactive'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedSite(s);
                                    setSiteForm({
                                      site_name: s.name || s.site_name || '',
                                      site_code: s.code || s.site_code || '',
                                      plant_type: s.plant_type || 'Loose Cement',
                                      pincode: s.pincode || '',
                                      state: s.state || '',
                                      district: s.district || '',
                                      address: s.address || '',
                                      manager_name: s.manager_name || '',
                                      manager_phone: s.manager_phone || '',
                                      manager_email: s.manager_email || ''
                                    });
                                    setModalType('EDIT_SITE');
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-xl transition cursor-pointer"
                                  title="Edit Plant Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSite(s)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl transition cursor-pointer"
                                  title="Delete Plant"
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

          {/* 4. DRIVER DIRECTORY MASTER */}
          {activeMenu === 'drivers' && (
            <div className="space-y-4">
              
              {/* Header & Excel Action Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Driver Directory
                    <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                      {filteredDrivers.length} Drivers
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">Commercial DL compliance, mobile pairing & vehicle allocations</p>
                </div>

                {/* Bulk Actions & Add Button */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Dynamic Bulk Delete Button */}
                  {selectedDriverIds.length > 0 && (
                    <button
                      onClick={handleBulkDeleteDrivers}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs animate-in zoom-in-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedDriverIds.length})</span>
                    </button>
                  )}

                  <button
                    onClick={handleDownloadDriverTemplate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    title="Download Sample Excel Template"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sample Template</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleImportDriversExcel}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleExportDriversExcel}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition cursor-pointer"
                    title="Export filtered drivers to Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDriver(null);
                      setDriverForm({
                        name: '',
                        phone: '',
                        emergency_phone: '',
                        aadhaar_no: '',
                        address: '',
                        license_no: '',
                        license_expiry: '',
                        license_category: 'TRANS (Heavy Bulkers)',
                        assigned_vehicle: 'Unassigned',
                        assigned_plant: 'ALL',
                        experience_years: '',
                        bank_account_no: '',
                        ifsc_code: '',
                        bank_name: '',
                        upi_id: '',
                        status: 'Available',
                        photo_url: '',
                        license_doc_url: ''
                      });
                      setModalType('ADD_DRIVER');
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Driver</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                
                {/* Search Input */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by Driver Name, Mobile, DL No, Truck No..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Base Plant Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={driverPlantFilter}
                    onChange={(e) => setDriverPlantFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">🏢 All Base Plants</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.code || s.site_code}>
                        {s.name || s.site_name} ({s.code || s.site_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={driverStatusFilter}
                    onChange={(e) => setDriverStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">🚦 All Statuses</option>
                    <option value="Available">🟢 Available</option>
                    <option value="On Trip">🔵 On Trip</option>
                    <option value="On Leave">🟡 On Leave</option>
                    <option value="Blacklisted">🔴 Blacklisted</option>
                  </select>
                </div>
              </div>

              {/* Records Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 text-slate-500 font-extrabold border-b border-slate-100">
                      <tr>
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={filteredDrivers.length > 0 && selectedDriverIds.length === filteredDrivers.length}
                            onChange={handleSelectAllDrivers}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-4">Driver Profile</th>
                        <th className="p-4">Mobile & Emergency</th>
                        <th className="p-4">Commercial DL & Expiry</th>
                        <th className="p-4">Assigned Truck & Plant</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredDrivers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            No drivers matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredDrivers.map((d) => {
                          const dlStatus = getDlExpiryStatus(d.license_expiry);
                          const isSelected = selectedDriverIds.includes(d.id);

                          return (
                            <tr key={d.id} className={`transition ${isSelected ? 'bg-amber-50/60' : 'hover:bg-amber-50/20'}`}>
                              
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleDriverSelect(d.id)}
                                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                                />
                              </td>

                              {/* Profile & Photo */}
                              <td className="p-4 flex items-center gap-3">
                                {d.photo_url ? (
                                  <img
                                    src={d.photo_url}
                                    alt={d.name}
                                    className="w-10 h-10 rounded-full object-cover border border-amber-300 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                    {d.name ? d.name.charAt(0).toUpperCase() : 'D'}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                                  <p className="text-[11px] text-slate-400">{d.experience_years ? `${d.experience_years} Yrs Exp` : 'Heavy Driver'}</p>
                                </div>
                              </td>

                              {/* Contact Info */}
                              <td className="p-4">
                                <p className="font-mono font-bold text-slate-800">{d.phone}</p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <PhoneCall className="w-3 h-3 text-rose-500" />
                                  <span className="font-mono">{d.emergency_phone || 'No Emergency No'}</span>
                                </p>
                              </td>

                              {/* DL & Expiry Badges */}
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-slate-900 text-[13px]">{d.license_no}</span>
                                  {d.license_doc_url && (
                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold border border-blue-200" title="DL Copy Attached">
                                      DOC
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] border ${dlStatus.color}`}>
                                    {dlStatus.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {d.license_expiry || 'N/A'}
                                  </span>
                                </div>
                              </td>

                              {/* Assigned Truck & Plant */}
                              <td className="p-4">
                                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-black text-[11px] border border-blue-200">
                                  {d.assigned_vehicle || 'Unassigned'}
                                </span>
                                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                                  Plant: <span className="text-slate-700">{d.assigned_plant === 'ALL' ? 'All Plants Pool' : d.assigned_plant}</span>
                                </p>
                              </td>

                              {/* Operational Status */}
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  (d.status || '').toLowerCase().includes('avail') || (d.status || '').toLowerCase().includes('act')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : (d.status || '').toLowerCase().includes('trip')
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : (d.status || '').toLowerCase().includes('leave')
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {d.status || 'Available'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedDriver(d);
                                      setDriverForm({
                                        name: d.name || '',
                                        phone: d.phone || '',
                                        emergency_phone: d.emergency_phone || '',
                                        aadhaar_no: d.aadhaar_no || '',
                                        address: d.address || '',
                                        license_no: d.license_no || '',
                                        license_expiry: d.license_expiry || '',
                                        license_category: d.license_category || 'TRANS (Heavy Bulkers)',
                                        assigned_vehicle: d.assigned_vehicle || 'Unassigned',
                                        assigned_plant: d.assigned_plant || 'ALL',
                                        experience_years: d.experience_years || '',
                                        bank_account_no: d.bank_account_no || '',
                                        ifsc_code: d.ifsc_code || '',
                                        bank_name: d.bank_name || '',
                                        upi_id: d.upi_id || '',
                                        status: d.status || 'Available',
                                        photo_url: d.photo_url || '',
                                        license_doc_url: d.license_doc_url || ''
                                      });
                                      setModalType('EDIT_DRIVER');
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-xl transition cursor-pointer"
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
                          );
                        })
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
                  <p className="text-xs text-slate-500">Manage Directors, Operations, Accounts & Plant Incharge credentials</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserForm({
                      username: '',
                      password_hash: '',
                      name: '',
                      role: 'PLANT_MANAGER',
                      phone: '',
                      email: '',
                      photo_url: '',
                      assigned_plants: ['ALL']
                    });
                    setPlantDropdownOpen(false);
                    setModalType('ADD_USER');
                  }}
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
                        <th className="p-4">User Identity</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">System Role</th>
                        <th className="p-4">Assigned Plant(s)</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {users.map((u) => {
                        const userRoleLabel = USER_ROLES.find(r => r.value === u.role)?.label || u.role;
                        const plants = Array.isArray(u.assigned_plants) ? u.assigned_plants : (u.site_access ? [u.site_access] : ['ALL']);
                        
                        const isSelf = u.id === currentUser?.id || u.username?.toLowerCase() === currentUser?.username?.toLowerCase();
                        const isSuperAdmin = u.role === 'SUPER_ADMIN' || u.username?.toLowerCase() === 'admin';
                        const isProtected = isSelf || isSuperAdmin;

                        return (
                          <tr key={u.id} className="hover:bg-purple-50/30 transition">
                            <td className="p-4 flex items-center gap-3">
                              {u.photo_url ? (
                                <img
                                  src={u.photo_url}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-full object-cover border border-purple-300 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-md">YOU</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                              </div>
                            </td>

                            <td className="p-4">
                              <p className="text-slate-800 font-mono font-medium">{u.phone || '-'}</p>
                              <p className="text-[11px] text-slate-400">{u.email || '-'}</p>
                            </td>

                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                                {userRoleLabel}
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {plants.includes('ALL') ? (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                                    All Plants
                                  </span>
                                ) : (
                                  plants.map(p => (
                                    <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200">
                                      {p}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <button
                                disabled={isProtected}
                                onClick={() => handleToggleUserStatus(u)}
                                title={isProtected ? 'You cannot suspend your own account / Super Admin' : 'Click to Toggle Status'}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                                  isProtected ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                                } ${
                                  u.is_active !== false 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                {u.is_active !== false ? 'Active' : 'Suspended'}
                              </button>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => { 
                                    setSelectedUser(u); 
                                    setUserForm({
                                      username: u.username || '',
                                      name: u.name || '',
                                      role: u.role || 'PLANT_MANAGER',
                                      phone: u.phone || '',
                                      email: u.email || '',
                                      photo_url: u.photo_url || '',
                                      assigned_plants: Array.isArray(u.assigned_plants) ? u.assigned_plants : (u.site_access ? [u.site_access] : ['ALL']),
                                      password_hash: ''
                                    }); 
                                    setPlantDropdownOpen(false);
                                    setModalType('EDIT_USER'); 
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-xl transition cursor-pointer"
                                  title="Edit User Details"
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
                                  disabled={isProtected}
                                  onClick={() => handleDeleteUser(u)}
                                  className={`p-1.5 rounded-xl transition ${
                                    isProtected 
                                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                                      : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 cursor-pointer'
                                  }`}
                                  title={isProtected ? 'Cannot delete own / Super Admin account' : 'Delete User'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

          {/* 7. LIVE AUDIT TRAIL LOGS */}
          {activeMenu === 'audit-logs' && (
            <div className="space-y-4">
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
                    Sub-second immutable telemetry • Auto-purged after 7 days
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by IP, User, Action..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <button
                    onClick={handleClearAllAuditLogs}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-2xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
                    title="Clear All Audit Trail History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50/90 text-slate-500 font-extrabold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Timestamp (UTC)</th>
                        <th className="p-3.5">User Identity</th>
                        <th className="p-3.5">Public IP Address</th>
                        <th className="p-3.5">Module & Action</th>
                        <th className="p-3.5">Event Description (Single Line)</th>
                        <th className="p-3.5 text-right">Forensic Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No telemetry logs found. All logs are clean.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition group">
                            <td className="p-3.5 font-mono text-[11px] text-slate-500">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-slate-900">{log.performed_by}</span>
                              <span className="text-slate-400 text-[11px] font-mono ml-1.5">(@{log.performed_by_username || 'system'})</span>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                                {log.ip_address || '127.0.0.1'}
                              </span>
                            </td>
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
                            <td className="p-3.5 max-w-md truncate text-slate-800 font-medium" title={log.description}>
                              {log.description}
                            </td>
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

      {/* FORENSIC AUDIT DETAILS MODAL */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
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

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Summary</span>
                <p className="font-bold text-slate-900 text-sm leading-snug">{selectedAuditLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Global Public IP</span>
                  </div>
                  <p className="font-mono font-extrabold text-blue-600">{selectedAuditLog.ip_address || '127.0.0.1'}</p>
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
            </div>

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
      
      {/* 1. Add / Edit Site Modal */}
      {(modalType === 'ADD_SITE' || modalType === 'EDIT_SITE') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {modalType === 'EDIT_SITE' ? 'Edit Plant / Site Details' : 'Add New Plant / Site'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={modalType === 'EDIT_SITE' ? handleUpdateSite : handleCreateSite} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Plant / Site Name *</label>
                  <input
                    required
                    placeholder="Enter Plant Name"
                    value={siteForm.site_name}
                    onChange={(e) => setSiteForm({ ...siteForm, site_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Site Code (Unique) *
                  </label>
                  <input
                    required
                    placeholder="Enter Site Code (e.g. 12001)"
                    value={siteForm.site_code}
                    onChange={(e) => setSiteForm({ ...siteForm, site_code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Plant Type *</label>
                <select
                  value={siteForm.plant_type}
                  onChange={(e) => setSiteForm({ ...siteForm, plant_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  required
                >
                  <option value="Loose Cement">Loose Cement (Bulkers)</option>
                  <option value="Clinker">Clinker (High-Side/Open Trailers)</option>
                  <option value="Bagged Cement">Bagged Cement (Flatbed/Trucks)</option>
                  <option value="Raw Material">Raw Material / Fly Ash</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    PIN Code * {pincodeLoading && <span className="text-blue-600 animate-pulse font-normal">(Fetching...)</span>}
                  </label>
                  <input
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit PIN"
                    value={siteForm.pincode}
                    onChange={handleSitePincodeChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">State *</label>
                  <select
                    required
                    value={siteForm.state}
                    onChange={(e) => setSiteForm({ ...siteForm, state: e.target.value, district: '' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">District / City *</label>
                  <input
                    required
                    list="district-datalist"
                    placeholder="Select or Type District"
                    value={siteForm.district}
                    onChange={(e) => setSiteForm({ ...siteForm, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <datalist id="district-datalist">
                    {siteForm.state && INDIA_STATES_DISTRICTS[siteForm.state]?.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Dispatch / Plant Address</label>
                <textarea
                  rows={2}
                  placeholder="Enter Complete Address / Industrial Area"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Plant In-Charge / Contact (Optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Manager Name</label>
                    <input
                      placeholder="Enter Manager Name"
                      value={siteForm.manager_name}
                      onChange={(e) => setSiteForm({ ...siteForm, manager_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Contact Number</label>
                    <input
                      placeholder="Enter Mobile Number"
                      value={siteForm.manager_phone}
                      onChange={(e) => setSiteForm({ ...siteForm, manager_phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter Email Address"
                      value={siteForm.manager_email}
                      onChange={(e) => setSiteForm({ ...siteForm, manager_email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  {modalType === 'EDIT_SITE' ? 'Update Plant' : 'Save Plant Site'}
                </button>
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
                  {sites.map(s => <option key={s.id} value={s.code || s.site_code}>{s.name || s.site_name} ({s.code || s.site_code})</option>)}
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

      {/* 3. ADD / EDIT USER MODAL */}
      {(modalType === 'ADD_USER' || modalType === 'EDIT_USER') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {modalType === 'EDIT_USER' ? 'Edit Staff User Details' : 'Create Staff User'}
              </h3>
              <button 
                onClick={() => { setModalType(null); setPlantDropdownOpen(false); }} 
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={modalType === 'EDIT_USER' ? handleUpdateUser : handleCreateUser} className="space-y-3.5 text-xs">
              
              {/* Photo Upload Row */}
              <div className="flex items-center gap-4 p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
                <div className="relative">
                  {userForm.photo_url ? (
                    <img
                      src={userForm.photo_url}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  {userForm.photo_url && (
                    <button
                      type="button"
                      onClick={() => setUserForm(prev => ({ ...prev, photo_url: '' }))}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-slate-800 font-bold block mb-1">Profile Photo (Optional)</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'user')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP up to 2MB</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name *</label>
                <input
                  required
                  placeholder="Enter User Full Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Username *</label>
                  <input
                    required
                    placeholder="Enter Username"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                {modalType === 'ADD_USER' ? (
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Password *</label>
                    <input
                      required
                      placeholder="Enter Password"
                      value={userForm.password_hash}
                      onChange={(e) => setUserForm({ ...userForm, password_hash: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">System Role *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                      required
                    >
                      {USER_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mobile Number *</label>
                  <input
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit Mobile Number"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="Enter Email Address"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Role for ADD_USER */}
              {modalType === 'ADD_USER' && (
                <div>
                  <label className="text-slate-700 font-bold block mb-1">System Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                    required
                  >
                    {USER_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Assigned Plant(s) */}
              <div className="relative">
                <label className="text-slate-700 font-bold block mb-1">Assigned Plant(s) *</label>
                
                <button
                  type="button"
                  onClick={() => setPlantDropdownOpen(!plantDropdownOpen)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left text-slate-900 flex justify-between items-center focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <span className="truncate font-medium">
                    {userForm.assigned_plants?.includes('ALL')
                      ? 'All Plants (Unrestricted Access)'
                      : userForm.assigned_plants?.length > 0
                      ? `${userForm.assigned_plants.length} Plant(s) Selected (${userForm.assigned_plants.join(', ')})`
                      : 'Select Assigned Plants *'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${plantDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {plantDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95">
                    <label className="flex items-center gap-2.5 p-2 hover:bg-purple-50 rounded-xl cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={userForm.assigned_plants?.includes('ALL')}
                        onChange={() => handlePlantToggle('ALL')}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">All Plants (All Access)</span>
                    </label>

                    <div className="border-t border-slate-100 my-1" />

                    {sites.map(s => {
                      const code = s.code || s.site_code;
                      const isChecked = userForm.assigned_plants?.includes(code);
                      return (
                        <label key={s.id} className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePlantToggle(code)}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                          />
                          <span className="text-slate-700 font-medium">
                            {s.name || s.site_name} <span className="text-slate-400 font-mono text-[10px]">({code})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setModalType(null); setPlantDropdownOpen(false); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  {modalType === 'EDIT_USER' ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Reset Password */}
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
              <label className="text-slate-700 font-bold block mb-1 text-xs">New Password *</label>
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

      {/* 5. EDIT SELF PROFILE MODAL */}
      {modalType === 'EDIT_PROFILE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Edit Root Profile</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateSelfProfile} className="space-y-3.5 text-xs">
              
              {/* Photo Upload Row */}
              <div className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="relative">
                  {profileForm.photo_url ? (
                    <img
                      src={profileForm.photo_url}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  {profileForm.photo_url && (
                    <button
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, photo_url: '' }))}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-slate-800 font-bold block mb-1">Profile Photo (Optional)</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'profile')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP up to 2MB</p>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Display Name *</label>
                <input
                  required
                  placeholder="Enter Administrator Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mobile Number *</label>
                  <input
                    required
                    maxLength={10}
                    placeholder="Enter Mobile Number"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="Enter Email Address"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Password *</label>
                <input
                  required
                  type="text"
                  placeholder="Enter Password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add / Edit Driver Modal (Complete with DL Upload) */}
      {(modalType === 'ADD_DRIVER' || modalType === 'EDIT_DRIVER') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {modalType === 'EDIT_DRIVER' ? 'Edit Commercial Driver Profile' : 'Register Commercial Driver'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={modalType === 'EDIT_DRIVER' ? handleUpdateDriver : handleCreateDriver} className="space-y-4 text-xs">
              
              {/* Photo Upload Row */}
              <div className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                <div className="relative">
                  {driverForm.photo_url ? (
                    <img
                      src={driverForm.photo_url}
                      alt="Driver Preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  {driverForm.photo_url && (
                    <button
                      type="button"
                      onClick={() => setDriverForm(prev => ({ ...prev, photo_url: '' }))}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-slate-800 font-bold block mb-1">Driver Photo (Optional)</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'driver')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>

              {/* SECTION 1: Personal Info */}
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">1. Personal & Contact Details</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Driver Full Name *</label>
                    <input
                      required
                      placeholder="e.g. Rameshwar Gurjar"
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Mobile Number *</label>
                    <input
                      required
                      maxLength={10}
                      placeholder="10-digit Mobile"
                      value={driverForm.phone}
                      onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Emergency Contact *</label>
                    <input
                      required
                      maxLength={10}
                      placeholder="Family / Guardian No"
                      value={driverForm.emergency_phone}
                      onChange={(e) => setDriverForm({ ...driverForm, emergency_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Aadhaar Card No (Optional)</label>
                    <input
                      maxLength={12}
                      placeholder="12-digit Aadhaar Number"
                      value={driverForm.aadhaar_no}
                      onChange={(e) => setDriverForm({ ...driverForm, aadhaar_no: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Driving Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 5"
                      value={driverForm.experience_years}
                      onChange={(e) => setDriverForm({ ...driverForm, experience_years: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Permanent / Local Address</label>
                  <textarea
                    rows={2}
                    placeholder="Enter complete permanent address"
                    value={driverForm.address}
                    onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* SECTION 2: License & Operations */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">2. Commercial License & Allocations</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Commercial DL No *</label>
                    <input
                      required
                      placeholder="e.g. RJ14-20180012345"
                      value={driverForm.license_no}
                      onChange={(e) => setDriverForm({ ...driverForm, license_no: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">DL Expiry Date *</label>
                    <input
                      required
                      type="date"
                      value={driverForm.license_expiry}
                      onChange={(e) => setDriverForm({ ...driverForm, license_expiry: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">DL Category *</label>
                    <select
                      value={driverForm.license_category}
                      onChange={(e) => setDriverForm({ ...driverForm, license_category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      required
                    >
                      <option value="TRANS (Heavy Bulkers)">TRANS (Heavy Bulkers)</option>
                      <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                      <option value="LMV-Commercial">LMV-Commercial</option>
                    </select>
                  </div>
                </div>

                {/* DL Document Upload Card */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-slate-800 font-bold">Driving License Copy (Front/Back)</p>
                    <p className="text-[10px] text-slate-400">Attach photo/scanned copy of DL</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {driverForm.license_doc_url ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={driverForm.license_doc_url}
                          alt="DL Document"
                          className="w-10 h-8 object-cover rounded-lg border border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => setDriverForm(prev => ({ ...prev, license_doc_url: '' }))}
                          className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload DL Document</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'driver_dl')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Assigned Truck</label>
                    <select
                      value={driverForm.assigned_vehicle}
                      onChange={(e) => setDriverForm({ ...driverForm, assigned_vehicle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="Unassigned">-- Unassigned / Pool --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.vehicle_no}>{v.vehicle_no} ({v.vehicle_type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Base Plant / Site *</label>
                    <select
                      value={driverForm.assigned_plant}
                      onChange={(e) => setDriverForm({ ...driverForm, assigned_plant: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      required
                    >
                      <option value="ALL">All Plants Pool</option>
                      {sites.map(s => (
                        <option key={s.id} value={s.code || s.site_code}>{s.name || s.site_name} ({s.code || s.site_code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Driver Status *</label>
                    <select
                      value={
                        driverForm.status?.includes('Trip') ? 'On Trip' :
                        driverForm.status?.includes('Leave') ? 'On Leave' :
                        driverForm.status?.includes('Black') ? 'Blacklisted' : 'Available'
                      }
                      onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      required
                    >
                      <option value="Available">Available (Duty Ready)</option>
                      <option value="On Trip">On Trip (In Transit)</option>
                      <option value="On Leave">On Leave / Rest</option>
                      <option value="Blacklisted">Blacklisted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Bank & Payouts */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">3. Bank & Payout Details (Optional)</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Bank Name</label>
                    <input
                      placeholder="e.g. SBI"
                      value={driverForm.bank_name}
                      onChange={(e) => setDriverForm({ ...driverForm, bank_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Account Number</label>
                    <input
                      placeholder="Account No"
                      value={driverForm.bank_account_no}
                      onChange={(e) => setDriverForm({ ...driverForm, bank_account_no: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">IFSC Code</label>
                    <input
                      placeholder="SBIN0001234"
                      value={driverForm.ifsc_code}
                      onChange={(e) => setDriverForm({ ...driverForm, ifsc_code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">UPI ID</label>
                    <input
                      placeholder="name@upi"
                      value={driverForm.upi_id}
                      onChange={(e) => setDriverForm({ ...driverForm, upi_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {modalType === 'EDIT_DRIVER' ? 'Update Driver Profile' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}