import React, { useState, useEffect } from 'react';
import { AppRole, User, StudentProfile, CanteenProfile, AdminProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, ArrowRight, Mail, User as UserIcon, ShieldCheck, 
  ArrowLeft, Building2, Check, AlertTriangle, Phone, GraduationCap, 
  Calendar, Lock, Eye, EyeOff, Sparkles, LogIn
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

interface College {
  id: string;
  college_name: string;
  email_domain: string;
  logoUrl?: string;
  status: 'active' | 'inactive';
}

const REGISTERED_COLLEGES: College[] = [
  { id: 'c-1', college_name: 'KPR College of Arts Science and Research', email_domain: 'kprcas.ac.in', status: 'active' },
  { id: 'c-2', college_name: 'TimeToMeal University', email_domain: 'timetomeal.com', status: 'active' },
  { id: 'c-3', college_name: 'Hostel Administration Block', email_domain: 'hostel.com', status: 'active' },
  { id: 'c-4', college_name: 'Google Developer Academy', email_domain: 'gmail.com', status: 'active' },
  { id: 'c-5', college_name: 'KPR Institute of Engineering and Technology', email_domain: 'kpret.ac.in', status: 'active' }
];

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Business Administration (BBA)',
  'Commerce (B.Com)',
  'Science & Humanities (S&H)',
  'Master of Computer Applications (MCA)',
  'Master of Business Administration (MBA)'
];

const YEARS = [
  'I Year',
  'II Year',
  'III Year',
  'IV Year'
];

interface MockUserPreset {
  name: string;
  email: string;
  password?: string;
  googleId: string;
  photo?: string;
  role: AppRole;
  label: string;
}

const MOCK_USER_PRESETS: MockUserPreset[] = [
  { 
    name: 'Sanjay Kumar', 
    email: '26k24@kprcas.ac.in', 
    password: 'sanjay123',
    googleId: 'g-sanjay-1',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    role: 'student',
    label: 'Student (Sanjay)'
  },
  { 
    name: 'Demo Student', 
    email: 'student@timetomeal.com', 
    password: 'student123',
    googleId: 'g-student-1',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150',
    role: 'student',
    label: 'Demo Student'
  },
  { 
    name: 'Raga Prasad', 
    email: 'staff@timetomeal.com', 
    password: 'staff123',
    googleId: 'g-staff-1',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
    role: 'staff',
    label: 'Canteen Staff'
  },
  { 
    name: 'System Controller', 
    email: 'admin@hostel.com', 
    password: 'admin123',
    googleId: 'g-admin-1',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150',
    role: 'admin',
    label: 'System Admin'
  }
];

type AuthStage = 'splash' | 'login' | 'profile' | 'unregistered';
type ViewMode = 'signin' | 'signup';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [stage, setStage] = useState<AuthStage>('splash');
  const [viewMode, setViewMode] = useState<ViewMode>('signin');
  
  // Credentials Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used for Sign Up
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Authenticated user tracking for Profile step
  const [authenticatedUserMeta, setAuthenticatedUserMeta] = useState<{
    name: string;
    email: string;
    photo?: string;
    googleId: string;
    role: AppRole;
  } | null>(null);

  // Profile completion states
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [hostelSelection, setHostelSelection] = useState<'Hosteller' | 'Day Scholar'>('Hosteller');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [supportRequested, setSupportRequested] = useState(false);

  // Seed default database users
  useEffect(() => {
    const existingUsers = localStorage.getItem('hb_users');
    if (!existingUsers) {
      const defaultUsers: User[] = [
        {
          id: 'student-1',
          email: 'student@timetomeal.com',
          role: 'student',
          password: 'student123',
          google_id: 'g-student-1',
          name: 'Demo Student',
          profile_photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150',
          college_id: 'c-2',
          college_name: 'TimeToMeal University',
          roll_number: 'STU-2026-99',
          mobile_number: '9876543210',
          department: 'Computer Science & Engineering (CSE)',
          year: 'IV Year',
          section: 'A',
          profile: {
            student_id: 'S-99120',
            full_name: 'Demo Student',
            register_number: 'STU-2026-99',
            hostel_name: 'Vinci Hostel Block A',
            room_number: '304',
            phone_number: '9876543210',
            google_id: 'g-student-1',
            college_id: 'c-2',
            college_name: 'TimeToMeal University',
            roll_number: 'STU-2026-99',
            mobile_number: '9876543210',
            department: 'Computer Science & Engineering (CSE)',
            year: 'IV Year',
            section: 'A'
          } as StudentProfile
        },
        {
          id: 'student-sanjay',
          email: '26k24@kprcas.ac.in',
          role: 'student',
          password: 'sanjay123',
          google_id: 'g-sanjay-1',
          name: 'Sanjay Kumar',
          profile_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          college_id: 'c-1',
          college_name: 'KPR College of Arts Science and Research',
          roll_number: 'KPR-CS-026',
          mobile_number: '9876543210',
          department: 'Computer Science & Engineering (CSE)',
          year: 'III Year',
          section: 'A',
          profile: {
            student_id: 'S-99121',
            full_name: 'Sanjay Kumar',
            register_number: 'KPR-CS-026',
            hostel_name: 'Vinci Hostel Block A',
            room_number: '305',
            phone_number: '9876543210',
            google_id: 'g-sanjay-1',
            college_id: 'c-1',
            college_name: 'KPR College of Arts Science and Research',
            roll_number: 'KPR-CS-026',
            mobile_number: '9876543210',
            department: 'Computer Science & Engineering (CSE)',
            year: 'III Year',
            section: 'A'
          } as StudentProfile
        },
        {
          id: 'staff-1',
          email: 'staff@timetomeal.com',
          role: 'staff',
          password: 'staff123',
          google_id: 'g-staff-1',
          name: 'Raga Prasad',
          profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
          profile: {
            canteen_id: 'C-88130',
            canteen_name: 'TimeToMeal Main Canteen',
            owner_name: 'Raga Prasad',
            address: 'Ground Floor, Block A',
            contact_number: '044 258636222',
            email: 'staff@timetomeal.com',
            is_online: true,
            status: 'active',
            operating_hours: { open: '08:00', close: '22:00' },
            printer_settings: {
              printer_name: 'Thermal BP-100',
              printer_type: 'thermal',
              font_size: 'medium',
              show_logo: true,
              show_datetime: true,
              show_ordertype: true,
              show_prices: true,
              paper_size: '80mm',
              print_speed: 'medium',
              auto_cut: true,
              print_header_text: 'TimeToMeal Canteen',
              print_footer_text: 'Visit Again!'
            },
            payment_settings: { qr_enabled: true, default_payment_mode: 'mixed' },
            notification_settings: { low_stock_threshold: 10, enable_pwa_notifications: true }
          } as CanteenProfile
        },
        {
          id: 'admin-1',
          email: 'admin@hostel.com',
          role: 'admin',
          password: 'admin123',
          google_id: 'g-admin-1',
          name: 'System Controller',
          profile_photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150',
          profile: {
            admin_id: 'admin-1',
            full_name: 'System Controller',
            roll_number: 'ADM-001',
            email: 'admin@hostel.com'
          } as AdminProfile
        }
      ];
      localStorage.setItem('hb_users', JSON.stringify(defaultUsers));
    }

    const splashTimer = setTimeout(() => {
      setStage('login');
    }, 1200);

    return () => clearTimeout(splashTimer);
  }, []);

  const getEmailDomain = (emailStr: string): string => {
    const parts = emailStr.trim().split('@');
    return parts.length > 1 ? parts[1].toLowerCase() : '';
  };

  // Preset picker quick login fill
  const handleQuickPresetFill = (preset: MockUserPreset) => {
    setEmail(preset.email);
    setPassword(preset.password || 'student123');
    setFormError('');
  };

  // Main login / signup form execution
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setFormError('Password must be at least 4 characters.');
      return;
    }

    if (viewMode === 'signup' && !name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    setAuthLoading(true);
    // Simulate premium validation lag
    await new Promise(resolve => setTimeout(resolve, 800));
    setAuthLoading(false);

    const emailDomain = getEmailDomain(email);
    const matchedCollege = REGISTERED_COLLEGES.find(c => c.email_domain === emailDomain);

    if (!matchedCollege) {
      // Keep track of domain to show the warning screen
      setAuthenticatedUserMeta({
        name: viewMode === 'signup' ? name.trim() : email.split('@')[0],
        email: email.trim().toLowerCase(),
        googleId: 'g-' + Math.floor(100000 + Math.random() * 900000),
        role: 'student'
      });
      setStage('unregistered');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('hb_users') || '[]');
    const existingUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (viewMode === 'signin') {
      if (!existingUser) {
        // If they enter valid details of a registered college domain but don't exist, we can transition them to signup easily!
        setFormError('No account found with this email. Do you want to Sign Up instead?');
        return;
      }

      // Check simple password matching (or support any password for preset emails to avoid lockout)
      const matchesPreset = MOCK_USER_PRESETS.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (existingUser.password && existingUser.password !== password && password !== 'admin123' && password !== 'student123') {
        setFormError('Incorrect password. Please try again.');
        return;
      }

      // Skip profile completion for Staff & Admin or students with profiles
      if (existingUser.role !== 'student') {
        onLogin(existingUser);
      } else if (existingUser.profile && (existingUser.profile as StudentProfile).roll_number) {
        onLogin(existingUser);
      } else {
        setAuthenticatedUserMeta({
          name: existingUser.name || existingUser.email.split('@')[0],
          email: existingUser.email,
          googleId: existingUser.google_id || 'g-' + Math.random().toString(36).substring(2, 9),
          role: 'student',
          photo: existingUser.profile_photo
        });
        setStage('profile');
      }
    } else {
      // SIGN UP MODE
      if (existingUser) {
        setFormError('An account with this email already exists. Please Sign In.');
        return;
      }

      // Create transient student credentials meta to fulfill profile registration
      setAuthenticatedUserMeta({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        googleId: 'g-' + Math.random().toString(36).substring(2, 9),
        role: 'student',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'
      });
      setStage('profile');
    }
  };

  // Google sign in simulation button
  const handleGoogleMockClick = () => {
    // Fill first preset to keep testing extremely easy
    const preset = MOCK_USER_PRESETS[0]; // Sanjay
    setEmail(preset.email);
    setPassword(preset.password || 'sanjay123');
    setFormError('');
  };

  // Profile Save implementation
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (!rollNumber.trim()) {
      setProfileError('Roll Number is required.');
      return;
    }

    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber.trim())) {
      setProfileError('Mobile Number must be exactly 10 digits.');
      return;
    }

    if (!department) {
      setProfileError('Please select your Department.');
      return;
    }

    if (!year) {
      setProfileError('Please select your Year of study.');
      return;
    }

    if (!acceptTerms) {
      setProfileError('You must accept the terms and conditions to proceed.');
      return;
    }

    if (!authenticatedUserMeta) return;

    setSavingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const emailDomain = getEmailDomain(authenticatedUserMeta.email);
    const matchedCollege = REGISTERED_COLLEGES.find(c => c.email_domain === emailDomain)!;

    const users: User[] = JSON.parse(localStorage.getItem('hb_users') || '[]');

    // Uniqueness validation within the college
    const isRollInUse = users.some(u => {
      if (u.role === 'student' && u.profile) {
        const prof = u.profile as StudentProfile;
        return (
          prof.college_id === matchedCollege.id && 
          prof.roll_number?.trim().toLowerCase() === rollNumber.trim().toLowerCase()
        );
      }
      return false;
    });

    if (isRollInUse) {
      setProfileError('This Roll Number is already registered for this college.');
      setSavingProfile(false);
      return;
    }

    const studentId = 'S-' + Math.floor(100000 + Math.random() * 900000);

    const completedProfile: StudentProfile = {
      student_id: studentId,
      full_name: authenticatedUserMeta.name,
      register_number: rollNumber.trim(),
      hostel_name: hostelSelection === 'Hosteller' ? 'Vinci Hostel Block A' : 'N/A',
      room_number: hostelSelection === 'Hosteller' ? '101' : 'N/A',
      phone_number: mobileNumber.trim(),
      photo_url: authenticatedUserMeta.photo,
      google_id: authenticatedUserMeta.googleId,
      college_id: matchedCollege.id,
      college_name: matchedCollege.college_name,
      roll_number: rollNumber.trim(),
      mobile_number: mobileNumber.trim(),
      department: department,
      year: year,
      section: section.trim() || 'N/A',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newUser: User = {
      id: 'u-' + Math.floor(100000 + Math.random() * 900000),
      email: authenticatedUserMeta.email,
      role: 'student',
      password: password, // Store password
      profile: completedProfile,
      last_login: new Date().toISOString(),
      google_id: authenticatedUserMeta.googleId,
      name: authenticatedUserMeta.name,
      profile_photo: authenticatedUserMeta.photo,
      college_id: matchedCollege.id,
      college_name: matchedCollege.college_name,
      roll_number: rollNumber.trim(),
      mobile_number: mobileNumber.trim(),
      department: department,
      year: year,
      section: section.trim() || 'N/A',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedUsersList = [...users.filter(u => u.email.toLowerCase() !== authenticatedUserMeta.email.toLowerCase()), newUser];
    localStorage.setItem('hb_users', JSON.stringify(updatedUsersList));

    setSavingProfile(false);
    onLogin(newUser);
  };

  const renderGoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between p-4 selection:bg-emerald-600 selection:text-white overflow-x-hidden relative">
      {/* Soft Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/20 dark:bg-emerald-950/20 rounded-full blur-[130px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-55/10 dark:bg-emerald-900/10 rounded-full blur-[110px] -z-10" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center w-full py-8">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: SPLASH SCREEN */}
          {stage === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex flex-col items-center justify-center text-center space-y-5"
            >
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-600/30 border-4 border-white dark:border-slate-900 animate-pulse">
                <Coffee className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  TimeTo<span className="text-emerald-600">Meal</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">canteen smart portal</p>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: CREDENTIALS LOGIN SCREEN */}
          {stage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.06)] p-8 border border-gray-100/80 dark:border-slate-800 space-y-7 relative z-10"
            >
              {/* App Brand Header */}
              <div className="flex flex-col items-center text-center space-y-3.5">
                <div className="bg-emerald-600 p-4 rounded-3xl shadow-lg shadow-emerald-250/20 dark:shadow-none text-white transform hover:rotate-6 transition-transform">
                  <Coffee className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    TimeTo<span className="text-emerald-600">Meal</span>
                  </h1>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    College Canteen Ordering Platform
                  </p>
                </div>
              </div>

              {/* Login/Signup Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signin');
                    setFormError('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    viewMode === 'signin'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signup');
                    setFormError('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    viewMode === 'signup'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Input Form Fields */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {viewMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sanjay Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. 26k24@kprcas.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-xs text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {formError && (
                  <p className="text-[10px] font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/50 text-center animate-in zoom-in-95 leading-relaxed">
                    {formError}
                  </p>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow-md shadow-emerald-600/10 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{viewMode === 'signin' ? 'Sign In to Account' : 'Register Account'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Fill Preset Accounts helper - styled in ultra clean, space-saving layout */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Quick Fill Test Accounts:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOCK_USER_PRESETS.map((preset) => (
                    <button
                      key={preset.email}
                      type="button"
                      onClick={() => handleQuickPresetFill(preset)}
                      className="py-2 px-2.5 bg-slate-50/50 hover:bg-emerald-50/40 dark:bg-slate-950 dark:hover:bg-emerald-950/20 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg border border-slate-150 dark:border-slate-900 transition-all text-center truncate"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* STAGE 3: UNREGISTERED COLLEGE EXCEPTION SCREEN */}
          {stage === 'unregistered' && (
            <motion.div
              key="unregistered"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(244,63,94,0.08)] p-8 border border-rose-150 dark:border-slate-800/80 space-y-7 text-center relative z-10"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border-2 border-rose-100 dark:border-rose-900">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  College Not Registered
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                  The domain <span className="text-rose-600 font-extrabold">@{authenticatedUserMeta ? getEmailDomain(authenticatedUserMeta.email) : 'unknown'}</span> is not yet registered with TimeToMeal.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                  To utilize canteen preordering systems, live canteen dashboard tokens, and hostel delivery receipts, please contact your university administration.
                </p>
              </div>

              {supportRequested ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/60 animate-in zoom-in-95">
                  ✓ Campus support request sent successfully! We will contact your college shortly.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => setStage('login')}
                    className="py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setSupportRequested(true)}
                    className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-600/10"
                  >
                    Contact Support
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 4: FIRST LOGIN STUDENT PROFILE COMPLETION WIZARD */}
          {stage === 'profile' && authenticatedUserMeta && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_24px_50px_rgba(0,0,0,0.05)] p-6 md:p-8 border border-slate-100 dark:border-slate-800 space-y-6 relative z-10"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
                <button
                  onClick={() => setStage('login')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Complete Your Profile
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    First-Time Setup Wizard
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* Meta Read-Only Verified details */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Verified User Info
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-900/40 space-y-0.5">
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Full Name</span>
                      <p className="truncate text-slate-800 dark:text-slate-250 font-black">{authenticatedUserMeta.name}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-900/40 space-y-0.5">
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Email Address</span>
                      <p className="truncate text-slate-800 dark:text-slate-250 font-black">{authenticatedUserMeta.email}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/40 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-black uppercase tracking-wider block">
                        Auto-Detected Campus
                      </span>
                      <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">
                        {REGISTERED_COLLEGES.find(c => c.email_domain === getEmailDomain(authenticatedUserMeta.email))?.college_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enrolment Form Inputs */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Campus Enrollment Details
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                        Roll Number / Reg No <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 26K24"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 transition-all font-bold text-xs"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                        Mobile Number (10d) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 transition-all font-bold text-xs"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                        <select
                          required
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 transition-all font-bold text-xs appearance-none cursor-pointer"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          <option value="">Select Dept</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept.split('(')[1]?.replace(')', '') || dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                        Year of Study <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                        <select
                          required
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 transition-all font-bold text-xs appearance-none cursor-pointer"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                        >
                          <option value="">Select Year</option>
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                        Section <span className="text-slate-400 font-medium">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. A, B"
                        className="w-full px-3 py-3 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 rounded-xl outline-none border border-slate-150 dark:border-slate-800 focus:border-emerald-500 transition-all font-bold text-xs"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                        Stay Classification <span className="text-slate-400 font-medium">(Optional)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-55 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800">
                        {['Hosteller', 'Day Scholar'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setHostelSelection(option as any)}
                            className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                              hostelSelection === option 
                                ? 'bg-white dark:bg-slate-850 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {option.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-1 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 accent-emerald-600 shrink-0"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span className="text-[10px] leading-relaxed text-slate-550 dark:text-slate-450 font-semibold">
                    I agree to the college rules and authorize TimeToMeal to verify my enrollment.
                  </span>
                </label>

                {profileError && (
                  <p className="text-[10px] font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-950/30 p-2.5 rounded-xl text-center border border-rose-100 dark:border-rose-900/50 leading-relaxed animate-in zoom-in-95">
                    {profileError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200/50 dark:shadow-none flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-[0.18em] text-xs disabled:opacity-50"
                >
                  {savingProfile ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Profile...</span>
                    </div>
                  ) : (
                    <>
                      <span>Save Profile & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Attributions */}
      <div className="w-full text-center text-slate-300 dark:text-slate-700 text-[8px] font-black uppercase tracking-[0.45em] py-4 shrink-0">
        © 2026 timetomeal.com • Secure Access Portal
      </div>
    </div>
  );
};

export default Login;
