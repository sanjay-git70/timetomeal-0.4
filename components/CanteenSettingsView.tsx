import React, { useState } from 'react';
import { User, CanteenProfile } from '../types';
import { 
  Store, Clock, ShoppingCart, Menu, CreditCard, Printer, 
  Bell, Box, LayoutDashboard, Shield, Users, Save, AlertCircle, CheckCircle2, 
  Tv2, Lock, MonitorPlay, Activity, Volume2, PlayCircle, Settings, ChevronRight,
  QrCode, Sliders, Smartphone, HelpCircle, Eye, Moon, Sun, Check, RefreshCw,
  Download, Upload, Database, Key, Terminal, FileText
} from 'lucide-react';

interface CanteenSettingsViewProps {
  user: User;
  onLogout: () => void;
}

type SettingsSection = 
  | 'general-profile' | 'general-hours' | 'general-orders' | 'general-menu'
  | 'notifications-sounds' | 'notifications-prefs'
  | 'payments-methods' | 'payments-printer'
  | 'inventory-stock' | 'inventory-alerts'
  | 'kitchen-display' | 'kitchen-prep'
  | 'staff-management'
  | 'security-password' | 'security-sessions'
  | 'integrations-razorpay' | 'integrations-printer' | 'integrations-qr'
  | 'appearance-theme' | 'appearance-dashboard'
  | 'backup-export' | 'backup-restore'
  | 'about-version' | 'about-support';

export const CanteenSettingsView: React.FC<CanteenSettingsViewProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general-profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const canteenProfile = user.profile as CanteenProfile;

  // Sound test states
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // Notification sounds settings state (11 requested notification triggers)
  const [soundConfigs] = useState([
    { id: 'walkin', title: 'New Walk-in Order', desc: 'Played when a walk-in POS order is confirmed', enabled: true, sound: 'Chime', volume: 80 },
    { id: 'online', title: 'New Online Order', desc: 'Played when a mobile app order is received', enabled: true, sound: 'Bell', volume: 90 },
    { id: 'preorder', title: 'Pre-Order Received', desc: 'Played when a scheduled advance order is placed', enabled: true, sound: 'Ding', volume: 70 },
    { id: 'kitchen', title: 'Kitchen Order Ready', desc: 'Alert for staff when kitchen marks item ready', enabled: true, sound: 'Alert', volume: 100 },
    { id: 'cancelled', title: 'Order Cancelled', desc: 'Alert for cancelled online orders', enabled: true, sound: 'Chime', volume: 60 },
    { id: 'payment_success', title: 'Payment Success', desc: 'Played on UPI/Razorpay success', enabled: true, sound: 'Ding', volume: 80 },
    { id: 'payment_failed', title: 'Payment Failed', desc: 'Played when payment transaction fails', enabled: true, sound: 'Alert', volume: 90 },
    { id: 'low_stock', title: 'Low Stock Alert', desc: 'Alert when item stock dips below threshold', enabled: true, sound: 'Bell', volume: 80 },
    { id: 'min_stock', title: 'Minimum Stock Warning', desc: 'Urgent warning for critical stock levels', enabled: true, sound: 'Alert', volume: 100 },
    { id: 'out_of_stock', title: 'Out of Stock', desc: 'Played when an item becomes unavailable', enabled: true, sound: 'Ding', volume: 75 },
    { id: 'staff_login', title: 'Staff Login', desc: 'Played when staff member logs into terminal', enabled: false, sound: 'Chime', volume: 50 },
  ]);

  const handleTestSound = (id: string) => {
    setPlayingSoundId(id);
    setTimeout(() => {
      setPlayingSoundId(null);
    }, 1200);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 600);
  };

  const navItems = [
    { 
      group: 'General', 
      items: [
        { id: 'general-profile', label: 'Canteen Profile' },
        { id: 'general-hours', label: 'Operating Hours' },
        { id: 'general-orders', label: 'Order Settings' },
        { id: 'general-menu', label: 'Menu Settings' },
      ]
    },
    { 
      group: 'Notifications', 
      items: [
        { id: 'notifications-sounds', label: 'Notification Sounds' },
        { id: 'notifications-prefs', label: 'Notification Preferences' },
      ]
    },
    { 
      group: 'Payments', 
      items: [
        { id: 'payments-methods', label: 'Payment Methods' },
        { id: 'payments-printer', label: 'Printer Settings' },
      ]
    },
    { 
      group: 'Inventory', 
      items: [
        { id: 'inventory-stock', label: 'Stock Management' },
        { id: 'inventory-alerts', label: 'Low Stock Alerts' },
      ]
    },
    { 
      group: 'Kitchen', 
      items: [
        { id: 'kitchen-display', label: 'Kitchen Display Settings' },
        { id: 'kitchen-prep', label: 'Preparation Settings' },
      ]
    },
    {
      group: 'Staff',
      items: [
        { id: 'staff-management', label: 'Staff Management' },
      ]
    },
    {
      group: 'Security',
      items: [
        { id: 'security-password', label: 'Password' },
        { id: 'security-sessions', label: 'Login Sessions' },
      ]
    },
    {
      group: 'Integrations',
      items: [
        { id: 'integrations-razorpay', label: 'Razorpay' },
        { id: 'integrations-printer', label: 'Receipt Printer' },
        { id: 'integrations-qr', label: 'QR Scanner' },
      ]
    },
    {
      group: 'Appearance',
      items: [
        { id: 'appearance-theme', label: 'Theme' },
        { id: 'appearance-dashboard', label: 'Dashboard Preferences' },
      ]
    },
    {
      group: 'Backup',
      items: [
        { id: 'backup-export', label: 'Export Data' },
        { id: 'backup-restore', label: 'Restore Backup' },
      ]
    },
    {
      group: 'About',
      items: [
        { id: 'about-version', label: 'Version' },
        { id: 'about-support', label: 'Help & Support' },
      ]
    }
  ];

  const activeGroup = navItems.find(g => g.items.some(i => i.id === activeSection))?.group || 'General';
  const currentGroupObj = navItems.find(g => g.group === activeGroup) || navItems[0];
  const allItems = navItems.reduce((acc, g) => [...acc, ...g.items], [] as { id: string; label: string }[]);
  const currentCategoryLabel = allItems.find(i => i.id === activeSection)?.label || 'Settings';

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general-profile':
        return (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Canteen Name</label>
                <input 
                  defaultValue={canteenProfile?.canteen_name || "TimeToMeal Main Canteen"} 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">College / Institution</label>
                <input 
                  defaultValue="SVCE College" 
                  readOnly
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 outline-none cursor-not-allowed" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Contact Number</label>
                <input 
                  defaultValue="+91 9876543210" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input 
                  defaultValue={user.email} 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  defaultValue="Main campus canteen serving hot meals, snacks, and beverages to students and staff."
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-emerald-500 outline-none resize-none" 
                />
              </div>
            </div>
          </div>
        );
      case 'general-hours':
        return (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Opening Time</label>
                <input type="time" defaultValue="08:00" className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-800 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Closing Time</label>
                <input type="time" defaultValue="20:00" className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-800 outline-none" />
              </div>
            </div>
          </div>
        );
      case 'general-orders':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Accept Online Orders</p>
                <p className="text-[11px] text-slate-500">Allow students to order directly through mobile devices.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Auto-accept Orders</p>
                <p className="text-[11px] text-slate-500">Automatically send incoming orders straight to kitchen display.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer">
                <span className="translate-x-1 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'general-menu':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Show Out-of-Stock Items</p>
                <p className="text-[11px] text-slate-500">Display unavailable items grayed out in customer menu.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'notifications-sounds':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-slate-500 mb-2">
              Configure audio alert tones, volume levels, and triggers for all 11 system events.
            </p>
            {soundConfigs.map((config) => (
              <div key={config.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">{config.title}</p>
                  <p className="text-[10px] text-slate-500">{config.desc}</p>
                </div>
                
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <button 
                    onClick={() => handleTestSound(config.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                      playingSoundId === config.id 
                        ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <PlayCircle className="w-3 h-3" />
                    {playingSoundId === config.id ? 'Playing...' : 'Test'}
                  </button>

                  <select 
                    defaultValue={config.sound}
                    className="bg-slate-50 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 px-2 py-1 outline-none"
                  >
                    <option>Chime</option>
                    <option>Bell</option>
                    <option>Ding</option>
                    <option>Alert</option>
                  </select>
                  
                  <div className="flex items-center gap-1 text-slate-400">
                    <Volume2 className="w-3 h-3" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue={config.volume}
                      className="w-14 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600" 
                    />
                  </div>

                  <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors cursor-pointer ${config.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'notifications-prefs':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Push Notifications</p>
                <p className="text-[11px] text-slate-500">Receive real-time desktop popups for new incoming orders.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Email Digest</p>
                <p className="text-[11px] text-slate-500">Send daily sales summary report to admin email.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'payments-methods':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200">
            <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase">Connected</span>
              </div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Razorpay UPI / Gateway</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Accept student payments via UPI, QR, and Cards.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Store className="w-4 h-4 text-emerald-500" />
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase">Active</span>
              </div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Counter Cash Billing</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Accept cash payments directly at counter.</p>
            </div>
          </div>
        );
      case 'payments-printer':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Auto-print Receipt on Order</p>
                <p className="text-[11px] text-slate-500">Automatically print kitchen ticket and customer receipt.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'inventory-stock':
        return (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Stock Threshold Rule</h3>
            <p className="text-[11px] text-slate-500">Set default low inventory warning level across all menu items.</p>
            <input type="number" defaultValue="5" className="w-36 px-3 py-1.5 bg-white dark:bg-slate-900 rounded text-xs border border-slate-200 dark:border-slate-800 outline-none" />
          </div>
        );
      case 'inventory-alerts':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Instant SMS / Push Alert</p>
                <p className="text-[11px] text-slate-500">Notify canteen manager immediately when stock is critically low.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'kitchen-display':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Audio Chime on New Kitchen Order</p>
                <p className="text-[11px] text-slate-500">Play a loud chime on KDS tablet when a new order arrives.</p>
              </div>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'kitchen-prep':
        return (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Default Estimated Prep Time (Minutes)</label>
              <input type="number" defaultValue="15" className="w-36 px-3 py-1.5 bg-white dark:bg-slate-900 rounded text-xs border border-slate-200 dark:border-slate-800 outline-none" />
            </div>
          </div>
        );
      case 'staff-management':
        return (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden animate-in fade-in duration-200">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Authorized Staff Members</h3>
              <button className="px-2.5 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded text-[11px] font-semibold">
                + Add Staff
              </button>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.email}</p>
                  <p className="text-[10px] text-slate-500">Canteen Manager / Administrator</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">Active</span>
            </div>
          </div>
        );
      case 'security-password':
        return (
          <div className="space-y-3 max-w-md animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-800 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-800 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-800 outline-none" />
            </div>
          </div>
        );
      case 'security-sessions':
        return (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Active Sessions</h3>
                <p className="text-[11px] text-slate-500">Manage devices currently logged into this account.</p>
              </div>
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3" /> Logout All
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    Current Browser Session 
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase">Active</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Windows • Chrome • IP 192.168.1.105</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'integrations-razorpay':
        return (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Razorpay Gateway Credentials</h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">Connected</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Key ID</label>
                <input type="text" readOnly defaultValue={import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TJCR2oIU69Zu0j"} className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Key Secret</label>
                <input type="password" readOnly defaultValue="••••••••••••••••" className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800" />
              </div>
            </div>
          </div>
        );
      case 'integrations-printer':
        return (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Thermal Receipt Printer</h3>
            <p className="text-[11px] text-slate-500">Connected via Bluetooth / USB to billing terminal.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Epson TM-T82 Thermal Printer (Ready)</span>
            </div>
          </div>
        );
      case 'integrations-qr':
        return (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Student ID QR Scanner</h3>
            <p className="text-[11px] text-slate-500">Camera-based or hardware laser scanner for instant student meal pass validation.</p>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Enable Camera Scanner</span>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 cursor-pointer">
                <span className="translate-x-4 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        );
      case 'appearance-theme':
        return (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Interface Theme</h3>
            <p className="text-[11px] text-slate-500">Select light or dark mode appearance for your canteen console.</p>
            <div className="flex gap-3">
              <button className="flex-1 p-3 rounded-lg border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2">
                <Sun className="w-4 h-4" /> Light System Default
              </button>
              <button className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2">
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
            </div>
          </div>
        );
      case 'appearance-dashboard':
        return (
          <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Default Landing Tab</h3>
            <p className="text-[11px] text-slate-500">Choose which screen opens immediately upon logging in.</p>
            <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded text-xs border border-slate-200 dark:border-slate-800 outline-none">
              <option>Dashboard Overview</option>
              <option>New Bill (POS)</option>
              <option>Live Order Queue</option>
              <option>Menu Catalog</option>
            </select>
          </div>
        );
      case 'backup-export':
        return (
          <div className="p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Export System Database</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Download a complete JSON snapshot of all orders, menu catalog, and logs.</p>
            </div>
            <button 
              onClick={() => {}}
              className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON Backup
            </button>
          </div>
        );
      case 'backup-restore':
        return (
          <div className="p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Restore Database Snapshot</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Upload a previously exported backup file to restore canteen state.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="file" accept=".json" className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300" />
            </div>
          </div>
        );
      case 'about-version':
        return (
          <div className="p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">TimeToMeal Canteen OS</h3>
            <p className="text-[11px] text-slate-500">Version 3.4.2-production (Enterprise Edition)</p>
            <p className="text-[11px] text-slate-500">SVCE Campus Canteen Management System.</p>
          </div>
        );
      case 'about-support':
        return (
          <div className="p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Customer Support & Assistance</h3>
            <p className="text-[11px] text-slate-500">Need help with hardware, printing, or UPI gateway integration? Contact our support desk anytime.</p>
            <a href="mailto:support@timetomeal.com" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded text-xs font-semibold">
              Contact Support Desk
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 right-8 z-[200] bg-slate-900 text-white dark:bg-emerald-600 font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white" /> Settings saved successfully
        </div>
      )}

      {/* Horizontal Settings Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-6 flex-shrink-0 select-none">
        {/* Primary Horizontal Categories */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
          {navItems.map((group) => {
            const isSelected = activeGroup === group.group;
            return (
              <button
                key={group.group}
                onClick={() => {
                  if (group.items.length > 0) {
                    setActiveSection(group.items[0].id as SettingsSection);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {group.group}
              </button>
            );
          })}
        </div>

        {/* Secondary Horizontal Sub-Tabs (if group has multiple items) */}
        {currentGroupObj.items.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            {currentGroupObj.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 pb-24">
        <div className="max-w-4xl mx-auto w-full p-6 lg:p-10 space-y-6">
          
          {/* Section Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentCategoryLabel}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage configuration for {currentCategoryLabel.toLowerCase()}.
            </p>
          </div>

          {/* Section Content */}
          {renderSectionContent()}

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
             <button className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm transition-all flex items-center justify-center min-w-[100px] hover:opacity-90"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CanteenSettingsView;
