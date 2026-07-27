import React, { useState, useEffect } from 'react';
import { AppRole, User, StudentProfile, CanteenProfile, AdminProfile } from '../types';
import { Coffee, ArrowRight, Mail, Lock, User as UserIcon, Hash, ShieldCheck, Building2, Sparkles, UtensilsCrossed, GraduationCap, Shield, Printer, Receipt, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campusId, setCampusId] = useState('');
  const [role, setRole] = useState<AppRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // To show onboarding screen first!
  
  const [isNewUser, setIsNewUser] = useState(false);
  const [fullName, setFullName] = useState('');
  const [canteenName, setCanteenName] = useState('');

  // Pre-seed default users in localStorage if they don't exist
  useEffect(() => {
    const existingUsers = localStorage.getItem('hb_users');
    if (!existingUsers) {
      const defaultUsers: User[] = [
        {
          id: 'student-1',
          email: 'student@timetomeal.com',
          role: 'student',
          password: 'student123',
          profile: {
            student_id: 'S-99120',
            full_name: 'Sanjay Kumar',
            register_number: 'STU-2026-99',
            hostel_name: 'Vinci Hostel Block A',
            room_number: '304',
            phone_number: '9876543210'
          } as StudentProfile
        },
        {
          id: 'staff-1',
          email: 'staff@timetomeal.com',
          role: 'staff',
          password: 'staff123',
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
  }, []);

  // Fill in preset credentials for painless previewing
  const loadPreset = (presetRole: AppRole) => {
    setRole(presetRole);
    if (presetRole === 'student') {
      setCampusId('STU-2026-99');
      setEmail('student@timetomeal.com');
      setPassword('student123');
    } else if (presetRole === 'staff') {
      setCampusId('C-88130');
      setEmail('staff@timetomeal.com');
      setPassword('staff123');
    } else {
      setCampusId('ADM-001');
      setEmail('admin@hostel.com');
      setPassword('admin123');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulated network delay
    await new Promise(r => setTimeout(r, 1000));
    
    const usersStr = localStorage.getItem('hb_users') || '[]';
    const users: User[] = JSON.parse(usersStr);

    try {
      if (!isNewUser) {
        // Master Admin fallback
        if (email === 'admin@hostel.com' && password === 'admin123' && campusId === 'ADM-001') {
           const admin: User = { 
             id: 'admin-1', 
             email: 'admin@hostel.com', 
             role: 'admin', 
             profile: { admin_id: 'admin-1', full_name: 'System Controller', roll_number: 'ADM-001', email: 'admin@hostel.com' } 
           };
           onLogin(admin);
           return;
        }

        // Search user in mock DB
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (foundUser) {
          if (foundUser.password !== password) {
            setError('Incorrect password. Please try again.');
            setLoading(false);
            return;
          }

          // Check role and confirm correct Campus ID
          if (foundUser.role !== role) {
            setError(`Account exists but not as a ${role}. Check your role selection.`);
            setLoading(false);
            return;
          }

          let campusIdMatch = false;
          if (role === 'student') {
            const prof = foundUser.profile as StudentProfile;
            if (prof.register_number.toLowerCase() === campusId.toLowerCase()) campusIdMatch = true;
          } else if (role === 'staff') {
            const prof = foundUser.profile as CanteenProfile;
            if (prof.canteen_id.toLowerCase() === campusId.toLowerCase()) campusIdMatch = true;
          } else if (role === 'admin') {
            const prof = foundUser.profile as AdminProfile;
            if (prof.roll_number.toLowerCase() === campusId.toLowerCase()) campusIdMatch = true;
          }

          if (campusIdMatch) {
            onLogin(foundUser);
          } else {
            setError(`Validation error: Campus ID "${campusId}" does not match this account.`);
          }
        } else {
          setError('No matching account with this email exists. Toggle "Request Access" to register!');
        }
      } else {
        // Registration Logic
        const nameToSave = role === 'staff' ? canteenName : fullName;
        
        if (!nameToSave) {
          setError(`Please enter your ${role === 'staff' ? 'Canteen' : 'Full'} Name.`);
          setLoading(false);
          return;
        }

        if (!campusId) {
          setError('Please assign a unique Campus ID.');
          setLoading(false);
          return;
        }

        const emailInUse = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailInUse) {
          setError('This email address is already registered.');
          setLoading(false);
          return;
        }

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          role: role,
          password: password || '123456',
          last_login: new Date().toISOString(),
          profile: role === 'student' 
            ? { student_id: 'S-' + Date.now().toString().slice(-6), full_name: fullName, register_number: campusId, hostel_name: 'Main Hostel Block', room_number: '101', phone_number: '9999988888' } as StudentProfile
            : role === 'admin'
            ? { admin_id: 'A-' + Date.now().toString().slice(-6), full_name: fullName, roll_number: campusId, email: email } as AdminProfile
            : { 
                canteen_id: campusId, 
                canteen_name: canteenName, 
                owner_name: fullName, 
                address: 'Main Campus',
                contact_number: '9876543210',
                email: email,
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
                  print_header_text: canteenName,
                  print_footer_text: 'Visit Again!'
                },
                payment_settings: { qr_enabled: true, default_payment_mode: 'mixed' },
                notification_settings: { low_stock_threshold: 10, enable_pwa_notifications: true }
              } as CanteenProfile
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('hb_users', JSON.stringify(updatedUsers));
        onLogin(newUser);
      }
    } catch (err: any) {
      setError('Validation error. Please verify input fields.');
    } finally {
      setLoading(false);
    }
  };

  // Onboarding landing view as requested from the beautiful green screenshot
  if (!showForm) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-emerald-600 rounded-[3rem] overflow-hidden shadow-[0_24px_60px_rgba(16,185,129,0.3)] flex flex-col relative aspect-[9/16] max-h-[850px]">
          {/* Subtle accent elements */}
          <div className="absolute top-12 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl" />

          {/* Large Hero Image Container */}
          <div className="relative flex-1 flex items-center justify-center px-8 pt-12">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-700/50 z-0" />
            <div className="relative z-10 flex flex-col items-center">
              {/* Modern high-quality illustration representation */}
              <div className="relative w-72 h-72 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20 bg-white flex flex-col items-center justify-center group transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600" 
                  alt="Delicious pizza" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <span className="bg-yellow-400 text-emerald-950 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest">Hot & Fresh</span>
                  <h4 className="text-lg font-black tracking-tight mt-2 leading-none">TimeToMeal App</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Text and Call to Action */}
          <div className="p-10 bg-emerald-700/40 backdrop-blur-md border-t border-white/10 text-center relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              Order Your Favorite Meals Anytime, Anywhere Today
            </h2>
            <p className="text-emerald-100 text-xs mt-3 leading-relaxed opacity-90 font-medium">
              Discover delicious hot meals, preorder to bypass queues, and trace your meal tickets live from your hostel block.
            </p>

            <button 
              onClick={() => setShowForm(true)}
              className="mt-8 w-full bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black py-5 px-8 rounded-2xl shadow-xl hover:shadow-yellow-400/20 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // The premium food delivery login screen
  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
      {/* Decorative Blur Layers */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[130px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-100/30 rounded-full blur-[110px] -z-10" />

      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8 border border-gray-100 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-200 mb-4 text-white">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight text-center leading-none">
            TimeTo<span className="text-emerald-600">Meal</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.35em] mt-2.5">timetomeal.com</p>
        </div>

        {/* Demo Preset Credentials section - Styled like mini dining passports */}
        <div className="mb-5 bg-slate-50 border border-slate-100 rounded-3xl p-4">
          <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest text-center mb-3 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> One-Tap Demo Quick Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'student', label: 'Student', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800' },
              { role: 'staff', label: 'Canteen', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800' },
              { role: 'admin', label: 'Admin', color: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800' }
            ].map((preset) => (
              <button
                key={preset.role}
                type="button"
                onClick={() => loadPreset(preset.role as AppRole)}
                className={`py-2 px-1 text-[10px] font-black rounded-xl border text-center transition-all active:scale-95 hover:shadow-sm ${preset.color}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role Function Feature Badges Banner */}
        <div className="mb-5 bg-emerald-950/90 text-emerald-100 p-3.5 rounded-2xl border border-emerald-800/60 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-emerald-800/80">
            {role === 'staff' ? (
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            ) : role === 'student' ? (
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            ) : (
              <Shield className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              {role === 'staff' ? 'Canteen Dashboard Features' : role === 'student' ? 'Student Portal Access' : 'System Controller Access'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold text-emerald-200/90">
            {role === 'staff' ? (
              <>
                <span className="flex items-center gap-1"><Receipt className="w-3 h-3 text-emerald-400 shrink-0" /> Counter Billing</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400 shrink-0" /> Live Queue</span>
                <span className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3 text-emerald-400 shrink-0" /> Menu Catalog</span>
                <span className="flex items-center gap-1"><Printer className="w-3 h-3 text-emerald-400 shrink-0" /> Thermal Print</span>
              </>
            ) : role === 'student' ? (
              <>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" /> Preorder Meals</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400 shrink-0" /> Token Ticket</span>
                <span className="flex items-center gap-1"><Receipt className="w-3 h-3 text-indigo-400 shrink-0" /> Digital Receipts</span>
                <span className="flex items-center gap-1"><Coffee className="w-3 h-3 text-indigo-400 shrink-0" /> Live Status</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-rose-400 shrink-0" /> System Metrics</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-rose-400 shrink-0" /> Sales Audit</span>
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-rose-400 shrink-0" /> Staff Profiles</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-rose-400 shrink-0" /> Outlets Control</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Role Segmented Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex relative overflow-hidden">
            {(['student', 'staff', 'admin'] as AppRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider relative z-10 ${
                  role === r ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
            <div 
              className="absolute top-1 bottom-1 bg-white shadow-sm border border-slate-200 rounded-xl transition-all duration-300 ease-out"
              style={{ 
                left: `calc(${role === 'student' ? '0px' : (role === 'staff' ? '33.33%' : '66.66%')} + 4px)`,
                width: 'calc(33.33% - 8px)'
              }}
            />
          </div>

          <div className="space-y-3.5">
            {/* Campus / Register / ID - MANDATORY FOR VALID LOGIN */}
            <div className="relative">
              <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                required
                className="w-full pl-14 pr-5 py-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-xs text-slate-800 shadow-sm placeholder:text-slate-400"
                placeholder={
                  role === 'student' 
                    ? "Campus ID (e.g. STU-2026-99)" 
                    : role === 'staff' 
                    ? "Canteen Code (e.g. C-88130)" 
                    : "Administrative ID (e.g. ADM-001)"
                }
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
              />
            </div>

            {isNewUser && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    className="w-full pl-14 pr-5 py-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-xs text-slate-800 shadow-sm"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                
                {role === 'staff' && (
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      className="w-full pl-14 pr-5 py-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-xs text-slate-800 shadow-sm"
                      placeholder="Canteen / Stall Name"
                      value={canteenName}
                      onChange={(e) => setCanteenName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Email Address */}
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                required
                className="w-full pl-14 pr-5 py-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-xs text-slate-800 shadow-sm placeholder:text-slate-400"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                required
                className="w-full pl-14 pr-5 py-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-xs text-slate-800 shadow-sm placeholder:text-slate-400"
                placeholder="Account Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="w-full p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-center leading-relaxed animate-in fade-in zoom-in-95 bg-rose-50 text-rose-600 border border-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200/50 flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Validating credentials</span>
              </div>
            ) : (
              <>
                {isNewUser ? 'Create Profile' : 'Authenticate Login'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 flex flex-col items-center gap-4">
            <button 
              type="button" 
              onClick={() => { setIsNewUser(!isNewUser); setError(''); }}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 tracking-wider transition-colors"
            >
              {isNewUser ? 'Already Registered? Login' : 'Request Canteen Access'}
            </button>
            
            <div className="flex items-center gap-1.5 opacity-30">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">TimeToMeal Verified</span>
            </div>
          </div>
        </form>
      </div>
      
      <div className="fixed bottom-6 text-center text-slate-300 text-[9px] font-black uppercase tracking-[0.4em]">
        © 2026 timetomeal.com • Secure Portal
      </div>
    </div>
  );
};

export default Login;
