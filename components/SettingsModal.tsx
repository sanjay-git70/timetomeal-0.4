import React, { useState, useEffect } from 'react';
import { User, MenuItem, StudentProfile } from '../types';
import { 
  Settings, Moon, Sun, Monitor, Bell, Shield, Camera, Key, 
  CreditCard, Sliders, Check, X, Store, Trash2, Plus, Edit2, Volume2,
  ChevronRight, ArrowLeft, Utensils, Clock, MapPin, Heart, HelpCircle,
  MessageSquare, Star, ShieldCheck, FileText, User as UserIcon, LogOut,
  CheckCircle2, Sparkles, Smartphone, Wallet, Lock, RefreshCw, AlertCircle, PhoneCall,
  RotateCw, Crown, ShoppingBag, Bookmark, ArrowRight
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface SavedPaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'sodexo' | 'cash';
  name: string;
  details: string;
  isDefault?: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  hostelBlock: string;
  roomNumber: string;
  isDefault?: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  menu?: MenuItem[];
  onUpdateMenu?: (updatedMenu: MenuItem[]) => void;
  onOpenCamera?: () => void;
  permission?: NotificationPermission;
  onRequestPermission?: () => void;
  studentProfile?: StudentProfile;
  onUpdateProfile?: (updated: StudentProfile) => void;
  onLogout?: () => void;
  onNavigateToTab?: (tab: 'home' | 'orders' | 'history' | 'cart' | 'profile') => void;
  vegPreference?: 'all' | 'veg' | 'non-veg';
  onUpdateVegPreference?: (pref: 'all' | 'veg' | 'non-veg') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  menu = [],
  onUpdateMenu,
  onOpenCamera,
  permission,
  onRequestPermission,
  studentProfile,
  onUpdateProfile,
  onLogout,
  onNavigateToTab,
  vegPreference = 'all',
  onUpdateVegPreference
}) => {
  const { theme, setTheme } = useTheme();

  // Navigation sub-views state
  const [activeSubScreen, setActiveSubScreen] = useState<
    'main' | 'payment_methods' | 'add_payment' | 'addresses' | 'add_address' |
    'collections' | 'help' | 'feedback' | 'privacy' | 'terms' | 'about' |
    'edit_profile' | 'change_password'
  >('main');

  // Preferences State
  const [vegMode, setVegMode] = useState<'all' | 'veg' | 'non-veg'>(() => {
    return (localStorage.getItem('hb_veg_preference') as any) || vegPreference || 'all';
  });

  const [defaultPaymentRatio, setDefaultPaymentRatio] = useState<'half' | 'full'>(() => {
    return (localStorage.getItem('hb_default_pay_ratio') as any) || 'half';
  });

  // Notifications toggles state
  const [notifMasterEnabled, setNotifMasterEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hb_notif_master') !== 'false';
  });
  const [notifOrderAlerts, setNotifOrderAlerts] = useState<boolean>(() => {
    return localStorage.getItem('hb_notif_order_alerts') !== 'false';
  });
  const [notifConfirmation, setNotifConfirmation] = useState<boolean>(() => {
    return localStorage.getItem('hb_notif_confirmation') !== 'false';
  });
  const [notifCanteenOpen, setNotifCanteenOpen] = useState<boolean>(() => {
    return localStorage.getItem('hb_notif_canteen_open') !== 'false';
  });

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hb_sound_enabled') !== 'false';
  });

  // Saved Payment Methods state
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>(() => {
    const stored = localStorage.getItem('hb_saved_payment_methods');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'pm_1', type: 'upi', name: 'Google Pay / BHIM UPI', details: 'student.hostel@okaxis', isDefault: true },
      { id: 'pm_2', type: 'card', name: 'HDFC Student Debit Card', details: '•••• •••• •••• 4829' },
      { id: 'pm_3', type: 'sodexo', name: 'Zeta / Sodexo Food Pass', details: '•••• •••• •••• 9102' },
      { id: 'pm_4', type: 'cash', name: 'Cash on Canteen Counter', details: 'Pay physical cash at pickup' }
    ];
  });

  // New payment form state
  const [newPayType, setNewPayType] = useState<'upi' | 'card' | 'sodexo'>('upi');
  const [newPayName, setNewPayName] = useState('');
  const [newPayDetails, setNewPayDetails] = useState('');

  // Saved Addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    const stored = localStorage.getItem('hb_saved_addresses');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'addr_1', label: 'Hostel Room', hostelBlock: studentProfile?.hostel_name || 'Block A', roomNumber: studentProfile?.room_number || '304', isDefault: true },
      { id: 'addr_2', label: 'Central Library Study Hall', hostelBlock: 'Library Annex', roomNumber: 'Table 12' }
    ];
  });

  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrBlock, setNewAddrBlock] = useState('');
  const [newAddrRoom, setNewAddrRoom] = useState('');

  // Account Settings / Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: studentProfile?.full_name || user?.name || '',
    register_number: studentProfile?.register_number || '2024-CS-019',
    hostel_name: studentProfile?.hostel_name || 'Block A',
    room_number: studentProfile?.room_number || '304',
    phone_number: studentProfile?.phone_number || '+91 98765 43210'
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Rate app state
  const [appRated, setAppRated] = useState<boolean>(false);

  useEffect(() => {
    if (studentProfile) {
      setProfileForm({
        full_name: studentProfile.full_name || '',
        register_number: studentProfile.register_number || '',
        hostel_name: studentProfile.hostel_name || '',
        room_number: studentProfile.room_number || '',
        phone_number: studentProfile.phone_number || ''
      });
    }
  }, [studentProfile]);

  if (!isOpen) return null;

  // Persistence helpers
  const handleVegModeChange = (mode: 'all' | 'veg' | 'non-veg') => {
    setVegMode(mode);
    localStorage.setItem('hb_veg_preference', mode);
    if (onUpdateVegPreference) {
      onUpdateVegPreference(mode);
    }
  };

  const handleRatioChange = (ratio: 'half' | 'full') => {
    setDefaultPaymentRatio(ratio);
    localStorage.setItem('hb_default_pay_ratio', ratio);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('hb_sound_enabled', String(next));
  };

  const savePaymentMethodsToStorage = (methods: SavedPaymentMethod[]) => {
    setSavedPaymentMethods(methods);
    localStorage.setItem('hb_saved_payment_methods', JSON.stringify(methods));
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayName.trim() || !newPayDetails.trim()) return;
    const newPm: SavedPaymentMethod = {
      id: 'pm_' + Date.now(),
      type: newPayType,
      name: newPayName,
      details: newPayDetails
    };
    savePaymentMethodsToStorage([...savedPaymentMethods, newPm]);
    setNewPayName('');
    setNewPayDetails('');
    setActiveSubScreen('payment_methods');
  };

  const handleRemovePaymentMethod = (id: string) => {
    const updated = savedPaymentMethods.filter(pm => pm.id !== id);
    savePaymentMethodsToStorage(updated);
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    const updated = savedPaymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    }));
    savePaymentMethodsToStorage(updated);
  };

  const saveAddressesToStorage = (addrs: SavedAddress[]) => {
    setSavedAddresses(addrs);
    localStorage.setItem('hb_saved_addresses', JSON.stringify(addrs));
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLabel.trim() || !newAddrBlock.trim() || !newAddrRoom.trim()) return;
    const newAddr: SavedAddress = {
      id: 'addr_' + Date.now(),
      label: newAddrLabel,
      hostelBlock: newAddrBlock,
      roomNumber: newAddrRoom
    };
    saveAddressesToStorage([...savedAddresses, newAddr]);
    setNewAddrLabel('');
    setNewAddrBlock('');
    setNewAddrRoom('');
    setActiveSubScreen('addresses');
  };

  const handleRemoveAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    saveAddressesToStorage(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        student_id: studentProfile?.student_id || 'S-' + Date.now().toString().slice(-6),
        full_name: profileForm.full_name,
        register_number: profileForm.register_number,
        hostel_name: profileForm.hostel_name,
        room_number: profileForm.room_number,
        phone_number: profileForm.phone_number,
        photo_url: studentProfile?.photo_url
      });
    }
    setActiveSubScreen('main');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) {
      setPasswordMessage('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New password and confirm password do not match.');
      return;
    }
    setPasswordMessage('Password changed successfully! ✓');
    setTimeout(() => {
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage(null);
      setActiveSubScreen('main');
    }, 1200);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackComment('');
      setActiveSubScreen('main');
    }, 1500);
  };

  // Reusable Flutter Switch Component
  const FlutterSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
        checked ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );

  // Reusable Flutter ListTile Component
  const FlutterListTile = ({
    icon,
    title,
    subtitle,
    trailing,
    onClick,
    border = true
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    trailing?: React.ReactNode;
    onClick?: () => void;
    border?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer ${
        border ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
        <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</span>
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {trailing || <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />}
      </div>
    </div>
  );

  // Reusable Flutter RadioListTile Component
  const FlutterRadioListTile = ({
    selected,
    onSelect,
    icon,
    title,
    subtitle
  }: {
    selected: boolean;
    onSelect: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }) => (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-sm'
          : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1">
        <div className={`p-2.5 rounded-2xl ${
          selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        }`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{title}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</span>
        </div>
      </div>
      {/* Flutter Radio Button Circle */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-600 dark:bg-emerald-400' : 'border-slate-300 dark:border-slate-600'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 overflow-y-auto flex flex-col animate-in fade-in duration-200">
      
      {/* App Bar Header */}
      <header className="sticky top-0 z-20 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-gray-200/50 dark:border-slate-800/50">
        <button
          onClick={() => {
            if (activeSubScreen !== 'main') {
              setActiveSubScreen('main');
            } else {
              onClose();
            }
          }}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {activeSubScreen !== 'main' && (
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            {activeSubScreen === 'payment_methods' && 'Payment Methods'}
            {activeSubScreen === 'add_payment' && 'Add Payment Method'}
            {activeSubScreen === 'addresses' && 'Address Book'}
            {activeSubScreen === 'add_address' && 'Add Address'}
            {activeSubScreen === 'collections' && 'Your Collections'}
            {activeSubScreen === 'help' && 'Help & Support'}
            {activeSubScreen === 'feedback' && 'Send Feedback'}
            {activeSubScreen === 'privacy' && 'Privacy Policy'}
            {activeSubScreen === 'terms' && 'Terms & Conditions'}
            {activeSubScreen === 'about' && 'About App'}
            {activeSubScreen === 'edit_profile' && 'Edit Profile'}
            {activeSubScreen === 'change_password' && 'Change Password'}
          </h2>
        )}

        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Main Page Container */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-3 space-y-5 pb-24">

        {/* MAIN SETTINGS SCREEN */}
        {activeSubScreen === 'main' && (
          <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
            
            {/* Top Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] shadow-xs border border-gray-100 dark:border-slate-800/80 overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-black text-2xl flex items-center justify-center shrink-0">
                    {studentProfile?.full_name?.[0] || user?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {studentProfile?.full_name || user?.name || 'Sanjay'}
                    </h3>
                    <button 
                      onClick={() => setActiveSubScreen('edit_profile')}
                      className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                    >
                      Edit profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* App Update Available Card */}
            <div 
              onClick={() => setActiveSubScreen('about')}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 px-5 shadow-xs border border-gray-100 dark:border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <RotateCw className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">App update available</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* SECTION 1: YOUR PREFERENCES */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-1 h-4 bg-rose-500 rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">Your preferences</h3>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800/80 divide-y divide-gray-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
                
                {/* Veg Mode */}
                <div 
                  onClick={() => handleVegModeChange(vegMode === 'veg' ? 'all' : 'veg')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-5 h-5 rounded-md border-2 border-emerald-600 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Veg Mode</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>{vegMode === 'veg' ? 'On' : 'Off'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Show Personalised Ratings */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <Star className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Show personalised ratings</span>
                  </div>
                  <FlutterSwitch
                    checked={soundEnabled}
                    onChange={handleToggleSound}
                  />
                </div>

                {/* Appearance */}
                <div 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Appearance</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{theme}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Payment Methods */}
                <div 
                  onClick={() => setActiveSubScreen('payment_methods')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Payment methods</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

              </div>
            </div>

            {/* SECTION 2: FOOD DELIVERY */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-1 h-4 bg-rose-500 rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">Food delivery</h3>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800/80 divide-y divide-gray-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
                
                {/* Your Orders */}
                <div 
                  onClick={() => {
                    onClose();
                    if (onNavigateToTab) onNavigateToTab('orders');
                  }}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <ShoppingBag className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Your orders</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Address Book */}
                <div 
                  onClick={() => setActiveSubScreen('addresses')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Address book</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Your Collections */}
                <div 
                  onClick={() => setActiveSubScreen('collections')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <Bookmark className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Your collections</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Order History */}
                <div 
                  onClick={() => {
                    onClose();
                    if (onNavigateToTab) onNavigateToTab('history');
                  }}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Order History</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Manage Recommendations */}
                <div 
                  onClick={() => setActiveSubScreen('feedback')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <Sparkles className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Manage recommendations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

              </div>
            </div>

            {/* SECTION 3: MORE */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-1 h-4 bg-rose-500 rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">More</h3>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800/80 divide-y divide-gray-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
                
                <div 
                  onClick={() => setActiveSubScreen('about')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">About Canteen App</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div 
                  onClick={() => setActiveSubScreen('help')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Help & Support</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div 
                  onClick={() => setActiveSubScreen('feedback')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Send Feedback</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div 
                  onClick={() => setAppRated(true)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Rate the App</span>
                  <span className="text-xs font-bold text-amber-500">{appRated ? '5.0 ★' : '›'}</span>
                </div>

                <div 
                  onClick={() => setActiveSubScreen('privacy')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Privacy Policy</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div 
                  onClick={() => setActiveSubScreen('terms')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Terms & Conditions</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {onLogout && (
                  <div 
                    onClick={onLogout}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-600"
                  >
                    <span className="text-sm font-extrabold flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> End Security Session
                    </span>
                    <span className="text-xs font-black uppercase">Logout</span>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}


          {/* SUB-SCREEN 1: PAYMENT METHODS */}
          {activeSubScreen === 'payment_methods' && (
            <div className="space-y-6 animate-in slide-in-from-right-6 duration-300">
              
              {/* Upfront Payment Ratio Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">Default Checkout Deposit Ratio</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRatioChange('half')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      defaultPaymentRatio === 'half'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs font-black">50% Upfront Deposit</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Pay half online, rest at counter</p>
                  </button>

                  <button
                    onClick={() => handleRatioChange('full')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      defaultPaymentRatio === 'full'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs font-black">100% Full Payment</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Instant express meal pickup</p>
                  </button>
                </div>
              </div>

              {/* Saved Payment Methods List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Saved Payment Methods</span>
                  <button
                    onClick={() => setActiveSubScreen('add_payment')}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
                  {savedPaymentMethods.map(pm => (
                    <div key={pm.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          {pm.type === 'upi' && <Smartphone className="w-5 h-5 text-purple-500" />}
                          {pm.type === 'card' && <CreditCard className="w-5 h-5 text-blue-500" />}
                          {pm.type === 'sodexo' && <Wallet className="w-5 h-5 text-amber-500" />}
                          {pm.type === 'cash' && <Utensils className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{pm.name}</span>
                            {pm.isDefault && (
                              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Default</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono block">{pm.details}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!pm.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 text-[9px] font-black uppercase tracking-wider"
                            title="Set as Default"
                          >
                            Set Default
                          </button>
                        )}
                        {pm.type !== 'cash' && (
                          <button
                            onClick={() => handleRemovePaymentMethod(pm.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove Payment Method"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}


          {/* SUB-SCREEN 2: ADD PAYMENT METHOD FORM */}
          {activeSubScreen === 'add_payment' && (
            <form onSubmit={handleAddPaymentMethod} className="space-y-5 animate-in slide-in-from-right-6 duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Payment Method Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'BHIM UPI', icon: '📱' },
                      { id: 'card', label: 'Debit / Credit', icon: '💳' },
                      { id: 'sodexo', label: 'Food Card', icon: '🎫' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewPayType(t.id as any)}
                        className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all border ${
                          newPayType === t.id
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Display Name / Issuer</label>
                  <input
                    type="text"
                    required
                    placeholder={newPayType === 'upi' ? 'Google Pay / PhonePe UPI' : 'HDFC Debit Card'}
                    value={newPayName}
                    onChange={(e) => setNewPayName(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    {newPayType === 'upi' ? 'VPA / UPI Handle ID' : 'Card Number / Account Ref'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newPayType === 'upi' ? 'yourname@upi' : '•••• •••• •••• 1234'}
                    value={newPayDetails}
                    onChange={(e) => setNewPayDetails(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubScreen('payment_methods')}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-md"
                  >
                    Save Payment Method
                  </button>
                </div>

              </div>
            </form>
          )}


          {/* SUB-SCREEN 3: SAVED ADDRESSES */}
          {activeSubScreen === 'addresses' && (
            <div className="space-y-5 animate-in slide-in-from-right-6 duration-300">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Hostel Delivery Locations</span>
                <button
                  onClick={() => setActiveSubScreen('add_address')}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
                {savedAddresses.map(addr => (
                  <div key={addr.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Primary</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium block">
                          {addr.hostelBlock} • Room #{addr.roomNumber}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* SUB-SCREEN 4: ADD ADDRESS FORM */}
          {activeSubScreen === 'add_address' && (
            <form onSubmit={handleAddAddress} className="space-y-5 animate-in slide-in-from-right-6 duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Address Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hostel Room, Library Desk, Mess Annex"
                    value={newAddrLabel}
                    onChange={(e) => setNewAddrLabel(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Hostel Block</label>
                    <input
                      type="text"
                      required
                      placeholder="Block A / Block B"
                      value={newAddrBlock}
                      onChange={(e) => setNewAddrBlock(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Room Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Room 304"
                      value={newAddrRoom}
                      onChange={(e) => setNewAddrRoom(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubScreen('addresses')}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-md"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </form>
          )}


          {/* SUB-SCREEN 5: YOUR COLLECTIONS */}
          {activeSubScreen === 'collections' && (
            <div className="space-y-4 animate-in slide-in-from-right-6 duration-300">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider px-2 block">Your Favorite Collections</span>

              <div className="grid grid-cols-1 gap-3">
                {menu.slice(0, 4).map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl} className="w-14 h-14 rounded-2xl object-cover shrink-0" alt={item.item_name} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">{item.item_name}</h4>
                          {item.is_veg === false ? (
                            <span className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Non-Veg</span>
                          ) : (
                            <span className="bg-emerald-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Veg</span>
                          )}
                        </div>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{item.price}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigateToTab) onNavigateToTab('home');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[9px] uppercase tracking-wider shrink-0"
                    >
                      Order Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* SUB-SCREEN 6: HELP & SUPPORT */}
          {activeSubScreen === 'help' && (
            <div className="space-y-5 animate-in slide-in-from-right-6 duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Canteen Help Hotline</h4>
                    <p className="text-xs text-slate-400 font-medium">+91 98765 00112 • Available 7 AM - 10 PM</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Frequently Asked Questions</h5>
                  
                  <details className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl text-xs font-medium space-y-1">
                    <summary className="font-bold text-slate-900 dark:text-white cursor-pointer">How do I pick up my order token?</summary>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Show your 3-digit order token code at the designated express pickup counter in Block A hostel canteen.</p>
                  </details>

                  <details className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl text-xs font-medium space-y-1">
                    <summary className="font-bold text-slate-900 dark:text-white cursor-pointer">How does 50% deposit work?</summary>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Pay 50% of your bill via UPI or Razorpay online to reserve your meal. Pay the remaining 50% cash/UPI at pickup.</p>
                  </details>
                </div>
              </div>
            </div>
          )}


          {/* SUB-SCREEN 7: FEEDBACK */}
          {activeSubScreen === 'feedback' && (
            <form onSubmit={handleFeedbackSubmit} className="space-y-5 animate-in slide-in-from-right-6 duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">Share Your Canteen Experience</span>

                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1.5 transition-transform hover:scale-125"
                    >
                      <Star className={`w-8 h-8 ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Comments & Suggestions</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about food quality, taste, service speed or menu requests..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {feedbackSubmitted ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-black text-center animate-in fade-in">
                    Thank you! Your feedback has been sent to the Canteen Management team. ✓
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-md"
                  >
                    Submit Canteen Feedback
                  </button>
                )}
              </div>
            </form>
          )}


          {/* SUB-SCREEN 8: PRIVACY POLICY & TERMS */}
          {(activeSubScreen === 'privacy' || activeSubScreen === 'terms' || activeSubScreen === 'about') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs text-xs font-medium animate-in slide-in-from-right-6 duration-300">
              <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                {activeSubScreen === 'privacy' && 'Student Data Protection & Privacy Policy'}
                {activeSubScreen === 'terms' && 'Hostel Canteen Service Terms'}
                {activeSubScreen === 'about' && 'About Campus Canteen App'}
              </h4>

              <div className="text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                {activeSubScreen === 'privacy' && (
                  <>
                    <p>Your registration number, hostel room, and transaction records are stored securely strictly for meal fulfillment inside campus canteens.</p>
                    <p>Online payment transactions are processed securely via SSL encrypted gateways. We never share your contact information with external marketing services.</p>
                  </>
                )}
                {activeSubScreen === 'terms' && (
                  <>
                    <p>1. Orders placed online must be picked up within 45 minutes of preparation notification.</p>
                    <p>2. For 50% deposit orders, the remaining amount must be paid at the counter prior to ticket collection.</p>
                    <p>3. Cancellations are permitted prior to kitchen preparation initiation.</p>
                  </>
                )}
                {activeSubScreen === 'about' && (
                  <>
                    <p>Designed for college hostel students to skip long counter lines, reserve fresh meals, and manage digital meal passes.</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Version 3.2.0 • Built with Flutter Material Design Principles</p>
                  </>
                )}
              </div>
            </div>
          )}


          {/* SUB-SCREEN 9: EDIT PROFILE */}
          {activeSubScreen === 'edit_profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-in slide-in-from-right-6 duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Full Student Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Register Number / Roll No.</label>
                  <input
                    type="text"
                    required
                    value={profileForm.register_number}
                    onChange={(e) => setProfileForm({ ...profileForm, register_number: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Hostel Block</label>
                    <input
                      type="text"
                      required
                      value={profileForm.hostel_name}
                      onChange={(e) => setProfileForm({ ...profileForm, hostel_name: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Room Number</label>
                    <input
                      type="text"
                      required
                      value={profileForm.room_number}
                      onChange={(e) => setProfileForm({ ...profileForm, room_number: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Mobile Phone Number</label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubScreen('main')}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}


          {/* SUB-SCREEN 10: CHANGE PASSWORD */}
          {activeSubScreen === 'change_password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 animate-in slide-in-from-right-6 duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {passwordMessage && (
                  <div className={`p-3 rounded-2xl text-xs font-black text-center ${
                    passwordMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {passwordMessage}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubScreen('main')}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-md"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Flutter Style Footer */}
        <footer className="bg-white dark:bg-slate-900 px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">
            <span>Flutter Material 3</span>
            <span>•</span>
            <span>Canteen v3.2</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
          >
            Done
          </button>
        </footer>

    </div>
  );
};
