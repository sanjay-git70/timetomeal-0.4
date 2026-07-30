import React, { useState, useMemo } from 'react';
import { 
  Store, Search, Filter, ShieldCheck, AlertTriangle, XCircle, TrendingUp, 
  ShoppingBag, CheckCircle2, Clock, Plus, Eye, Edit, Trash2, Ban, Check, X,
  MapPin, Phone, Mail, Building2, User, FileText, Download, DollarSign,
  CreditCard, Sliders, Settings, BarChart3, ChevronRight, RefreshCw, Sparkles,
  ArrowUpRight, ExternalLink, Calendar, Percent, Shield, Compass, Navigation,
  CheckSquare, FileSpreadsheet, FileCode, Printer, Layers, Award, ArrowLeft,
  ChevronDown, CheckCircle, Lock, Key, AlertCircle, FileCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export interface CanteenRecord {
  id: string;
  name: string;
  owner: string;
  ownerPhoto?: string;
  college: string;
  collegeEmail: string;
  phone: string;
  email: string;
  todaySales: number;
  monthlySales: number;
  weeklySales: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  settlementType: 'Daily' | 'Weekly' | 'Monthly';
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  status: 'Active' | 'Suspended' | 'Inactive';
  logo: string;
  rating: number;
  topSellingFood: string;
  peakOrderingTime: string;
  registrationDate: string;
  businessDescription: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  geofenceActive: boolean;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  currentBalance: number;
  pendingSettlement: number;
  completedSettlement: number;
  platformCommissionRate: number; // percentage
  gatewayChargesRate: number; // percentage
  commissionEnabled: boolean;
  commissionType: 'Percentage' | 'Fixed' | 'Hybrid';
  commissionFixedAmount: number;
  minOrderValue: number;
  maxCommissionCap: number;
  fssaiLicense: string;
  gstNumber?: string;
  documentsVerified: boolean;
}

const INITIAL_CANTEENS_DATA: CanteenRecord[] = [
  {
    id: 'cnt-101',
    name: 'Tech Park Central Food Court',
    owner: 'Ramesh Kumar',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    college: 'SRM Institute of Science & Tech',
    collegeEmail: 'canteens@srmist.edu.in',
    phone: '+91 98765 43210',
    email: 'ramesh.techpark@ttmeal.in',
    todaySales: 18450,
    monthlySales: 485000,
    weeklySales: 124000,
    totalOrders: 2840,
    completedOrders: 2790,
    cancelledOrders: 50,
    avgOrderValue: 170,
    settlementType: 'Daily',
    verificationStatus: 'Verified',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    topSellingFood: 'Masala Dosa & Cold Coffee',
    peakOrderingTime: '12:30 PM - 02:00 PM',
    registrationDate: '15 Jan 2025',
    businessDescription: 'Multi-cuisine premier campus eatery serving fresh breakfast, thalis, and artisanal beverages.',
    address: 'Food Court Ground Floor, Tech Park Tower, SRM Kattankulathur Campus',
    latitude: 12.8231,
    longitude: 80.0442,
    radiusMeters: 250,
    geofenceActive: true,
    bankDetails: {
      accountHolder: 'Ramesh Kumar Enterprises',
      bankName: 'HDFC Bank',
      accountNumber: '50100234891234',
      ifsc: 'HDFC0001234'
    },
    currentBalance: 32450,
    pendingSettlement: 18450,
    completedSettlement: 434100,
    platformCommissionRate: 5.0,
    gatewayChargesRate: 1.8,
    commissionEnabled: true,
    commissionType: 'Percentage',
    commissionFixedAmount: 10,
    minOrderValue: 50,
    maxCommissionCap: 100,
    fssaiLicense: '12421023000412',
    gstNumber: '33AABCR1234F1Z5',
    documentsVerified: true
  },
  {
    id: 'cnt-102',
    name: 'Hostel Block B Night Canteen',
    owner: 'Suresh V',
    ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    college: 'Anna University Main Campus',
    collegeEmail: 'admin.canteen@annauniv.edu',
    phone: '+91 98123 45678',
    email: 'suresh.blockb@ttmeal.in',
    todaySales: 11200,
    monthlySales: 310000,
    weeklySales: 82000,
    totalOrders: 1950,
    completedOrders: 1910,
    cancelledOrders: 40,
    avgOrderValue: 158,
    settlementType: 'Weekly',
    verificationStatus: 'Verified',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    topSellingFood: 'Paneer Butter Masala Roti',
    peakOrderingTime: '10:00 PM - 01:30 AM',
    registrationDate: '01 Feb 2025',
    businessDescription: 'Late-night student fuel station serving quick bites, rolls, shakes, and hot beverages till 2 AM.',
    address: 'Men\'s Hostel Block B Courtyard, Anna University CEG Campus, Guindy',
    latitude: 13.0102,
    longitude: 80.2354,
    radiusMeters: 200,
    geofenceActive: true,
    bankDetails: {
      accountHolder: 'Suresh V Canteen Services',
      bankName: 'State Bank of India',
      accountNumber: '302918273645',
      ifsc: 'SBIN0000800'
    },
    currentBalance: 24500,
    pendingSettlement: 82000,
    completedSettlement: 203500,
    platformCommissionRate: 5.0,
    gatewayChargesRate: 1.8,
    commissionEnabled: true,
    commissionType: 'Percentage',
    commissionFixedAmount: 10,
    minOrderValue: 40,
    maxCommissionCap: 80,
    fssaiLicense: '12421023000889',
    gstNumber: '33AAECS5678G1Z2',
    documentsVerified: true
  },
  {
    id: 'cnt-103',
    name: 'Gourmet Campus Diner',
    owner: 'Anitha Sharma',
    ownerPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    college: 'IIT Madras Campus',
    collegeEmail: 'canteen.board@iitm.ac.in',
    phone: '+91 99887 76655',
    email: 'anitha.gourmet@ttmeal.in',
    todaySales: 24300,
    monthlySales: 610000,
    weeklySales: 165000,
    totalOrders: 3410,
    completedOrders: 3380,
    cancelledOrders: 30,
    avgOrderValue: 178,
    settlementType: 'Daily',
    verificationStatus: 'Verified',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    topSellingFood: 'Special Veg Thali & Ice Tea',
    peakOrderingTime: '01:00 PM - 02:30 PM',
    registrationDate: '10 Dec 2024',
    businessDescription: 'Eco-friendly cafeteria providing healthy organic bowls, north & south meals, and fresh juices.',
    address: 'Near Himalaya Mess Complex, IIT Madras Campus, Adyar',
    latitude: 12.9915,
    longitude: 80.2337,
    radiusMeters: 300,
    geofenceActive: true,
    bankDetails: {
      accountHolder: 'Gourmet Campus Diner LLP',
      bankName: 'ICICI Bank',
      accountNumber: '000405001298',
      ifsc: 'ICIC0000004'
    },
    currentBalance: 48900,
    pendingSettlement: 24300,
    completedSettlement: 536800,
    platformCommissionRate: 5.0,
    gatewayChargesRate: 1.8,
    commissionEnabled: true,
    commissionType: 'Percentage',
    commissionFixedAmount: 10,
    minOrderValue: 50,
    maxCommissionCap: 120,
    fssaiLicense: '12421023000109',
    gstNumber: '33AABCG9988H1Z8',
    documentsVerified: true
  },
  {
    id: 'cnt-104',
    name: 'Valley Snack Corner',
    owner: 'Praveen Raj',
    ownerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    college: 'Crescent Institute of Tech',
    collegeEmail: 'canteens@crescent.education',
    phone: '+91 97654 32109',
    email: 'praveen.valley@ttmeal.in',
    todaySales: 4800,
    monthlySales: 125000,
    weeklySales: 32000,
    totalOrders: 820,
    completedOrders: 800,
    cancelledOrders: 20,
    avgOrderValue: 152,
    settlementType: 'Monthly',
    verificationStatus: 'Pending',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=200',
    rating: 4.2,
    topSellingFood: 'Samosa & Cold Coffee',
    peakOrderingTime: '04:00 PM - 06:00 PM',
    registrationDate: '20 Jul 2026',
    businessDescription: 'Popular evening snack center offering quick samosas, sandwiches, and hot tea.',
    address: 'Near Student Activity Center, Crescent Campus, Vandalur',
    latitude: 12.8792,
    longitude: 80.0831,
    radiusMeters: 180,
    geofenceActive: false,
    bankDetails: {
      accountHolder: 'Praveen Raj Snacks',
      bankName: 'Axis Bank',
      accountNumber: '9180200384912',
      ifsc: 'UTIB0000123'
    },
    currentBalance: 12400,
    pendingSettlement: 32000,
    completedSettlement: 80600,
    platformCommissionRate: 5.0,
    gatewayChargesRate: 1.8,
    commissionEnabled: true,
    commissionType: 'Percentage',
    commissionFixedAmount: 10,
    minOrderValue: 30,
    maxCommissionCap: 60,
    fssaiLicense: '12426023001928',
    documentsVerified: false
  }
];

export const CanteenManagementView: React.FC = () => {
  const [canteens, setCanteens] = useState<CanteenRecord[]>(INITIAL_CANTEENS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('All');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<string>('All');
  const [selectedSettlementType, setSelectedSettlementType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<'todaySales' | 'monthlySales' | 'totalOrders' | 'name'>('todaySales');
  
  // Navigation & Page State
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'register'>('list');
  const [selectedCanteen, setSelectedCanteen] = useState<CanteenRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'dashboard' | 'orders' | 'payments' | 'reports' | 'location' | 'commission' | 'profile' | 'analytics'>('dashboard');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Multi-step Registration Form State
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [regData, setRegData] = useState({
    ownerName: '',
    businessName: '',
    college: 'SRM Institute of Science & Tech',
    phone: '',
    email: '',
    address: '',
    description: '',
    latitude: '12.8231',
    longitude: '80.0442',
    accountHolder: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    username: '',
    password: '',
    firstName: '',
    agreeTerms: false
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered List
  const filteredCanteens = useMemo(() => {
    return canteens.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      
      const matchCollege = selectedCollege === 'All' || c.college === selectedCollege;
      const matchVerification = selectedVerificationStatus === 'All' || c.verificationStatus === selectedVerificationStatus;
      const matchSettlement = selectedSettlementType === 'All' || c.settlementType === selectedSettlementType;
      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;

      return matchSearch && matchCollege && matchVerification && matchSettlement && matchStatus;
    }).sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name);
      return (b[sortField] as number) - (a[sortField] as number);
    });
  }, [canteens, searchQuery, selectedCollege, selectedVerificationStatus, selectedSettlementType, selectedStatus, sortField]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = canteens.length;
    const verified = canteens.filter(c => c.verificationStatus === 'Verified').length;
    const pending = canteens.filter(c => c.verificationStatus === 'Pending').length;
    const rejected = canteens.filter(c => c.verificationStatus === 'Rejected').length;
    const todayRevenue = canteens.reduce((acc, c) => acc + c.todaySales, 0);
    const monthlyRevenue = canteens.reduce((acc, c) => acc + c.monthlySales, 0);

    return { total, verified, pending, rejected, todayRevenue, monthlyRevenue };
  }, [canteens]);

  // Handle Quick Verification
  const handleVerify = (id: string, status: 'Verified' | 'Rejected') => {
    setCanteens(prev => prev.map(c => c.id === id ? { ...c, verificationStatus: status } : c));
    showToast(`Canteen status updated to ${status}`);
  };

  // Handle Multi-step Register Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.agreeTerms) {
      showToast('Please accept platform terms and conditions');
      return;
    }
    const newCnt: CanteenRecord = {
      id: `cnt-${Date.now()}`,
      name: regData.businessName || 'New Campus Diner',
      owner: regData.ownerName || 'New Owner',
      college: regData.college,
      collegeEmail: `${regData.username || 'vendor'}@${regData.college.toLowerCase().replace(/\s+/g, '')}.edu.in`,
      phone: regData.phone || '+91 98765 00000',
      email: regData.email || 'vendor@ttmeal.in',
      todaySales: 0,
      monthlySales: 0,
      weeklySales: 0,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      avgOrderValue: 150,
      settlementType: 'Daily',
      verificationStatus: 'Pending',
      status: 'Active',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200',
      rating: 5.0,
      topSellingFood: 'Fresh Breakfast Combo',
      peakOrderingTime: '12:00 PM - 02:00 PM',
      registrationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      businessDescription: regData.description || 'Newly onboarded campus food partner.',
      address: regData.address || 'Central Campus Block',
      latitude: parseFloat(regData.latitude) || 12.8231,
      longitude: parseFloat(regData.longitude) || 80.0442,
      radiusMeters: 200,
      geofenceActive: true,
      bankDetails: {
        accountHolder: regData.accountHolder || regData.ownerName,
        bankName: regData.bankName,
        accountNumber: regData.accountNumber,
        ifsc: regData.ifsc
      },
      currentBalance: 0,
      pendingSettlement: 0,
      completedSettlement: 0,
      platformCommissionRate: 5.0,
      gatewayChargesRate: 1.8,
      commissionEnabled: true,
      commissionType: 'Percentage',
      commissionFixedAmount: 10,
      minOrderValue: 40,
      maxCommissionCap: 100,
      fssaiLicense: '12426000998812',
      documentsVerified: false
    };

    setCanteens(prev => [newCnt, ...prev]);
    setRegStep(5); // Show "Waiting for Verification" screen
  };

  // Export helper
  const handleExport = () => {
    showToast('Exporting canteen registry to CSV report...');
  };

  // ==========================================
  // RENDER VIEW MODE 1: MULTI-STEP REGISTRATION PAGE
  // ==========================================
  if (viewMode === 'register') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-[1500px] mx-auto">
        {/* Breadcrumb & Navigation Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setViewMode('list'); setRegStep(1); }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Canteens
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-xs font-bold flex items-center gap-2">
              <span className="text-slate-400">Canteens</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-950 dark:text-white font-extrabold">Register New Canteen Partner</span>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            Multi-Step Vendor Onboarding
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-4 gap-4 relative">
            {[
              { num: 1, title: 'Welcome & Benefits', desc: 'Platform Overview' },
              { num: 2, title: 'Business Details', desc: 'Owner & Location' },
              { num: 3, title: 'Payment Details', desc: 'Bank & IFSC' },
              { num: 4, title: 'Create Login', desc: 'Credentials & Verification' },
            ].map((s) => {
              const isCompleted = regStep > s.num || regStep === 5;
              const isCurrent = regStep === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-10 h-10 rounded-2xl font-black flex items-center justify-center text-xs transition-all shadow-sm ${
                    isCompleted ? 'bg-emerald-600 text-white' :
                    isCurrent ? 'bg-slate-950 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 ring-4 ring-emerald-500/20' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <p className={`text-xs font-bold mt-2 ${isCurrent ? 'text-slate-950 dark:text-white' : 'text-slate-400'}`}>{s.title}</p>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: WELCOME & PLATFORM BENEFITS */}
        {regStep === 1 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <Store className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Onboard Canteen to Time To Meal Platform</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                Join our multi-campus food ordering network. Connect directly with thousands of verified college students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-950 dark:text-white">Guaranteed Student Reach</h4>
                <p className="text-[11px] text-slate-400">Direct visibility across assigned hostel blocks and academic campuses.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-950 dark:text-white">Automated Daily Settlements</h4>
                <p className="text-[11px] text-slate-400">Razorpay / UPI payouts dispatched directly to vendor bank account.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-950 dark:text-white">GPS Geofenced Access</h4>
                <p className="text-[11px] text-slate-400">Prevent fraudulent orders outside campus boundaries.</p>
              </div>
            </div>

            <button
              onClick={() => setRegStep(2)}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Get Started with Registration →
            </button>
          </div>
        )}

        {/* STEP 2: BUSINESS & LOCATION DETAILS */}
        {regStep === 2 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Step 2: Business & Owner Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Canteen / Outlet Name *</label>
                <input
                  type="text"
                  required
                  value={regData.businessName}
                  onChange={(e) => setRegData({ ...regData, businessName: e.target.value })}
                  placeholder="e.g. Mechanical Block Cafe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  required
                  value={regData.ownerName}
                  onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned College Campus *</label>
                <select
                  value={regData.college}
                  onChange={(e) => setRegData({ ...regData, college: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="SRM Institute of Science & Tech">SRM Institute of Science & Tech</option>
                  <option value="Anna University Main Campus">Anna University Main Campus</option>
                  <option value="IIT Madras Campus">IIT Madras Campus</option>
                  <option value="Crescent Institute of Tech">Crescent Institute of Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Physical Address / Campus Building *</label>
                <input
                  type="text"
                  required
                  value={regData.address}
                  onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                  placeholder="Ground Floor, Tech Park Tower, SRM Campus"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Latitude Coordinate</label>
                <input
                  type="text"
                  value={regData.latitude}
                  onChange={(e) => setRegData({ ...regData, latitude: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Longitude Coordinate</label>
                <input
                  type="text"
                  value={regData.longitude}
                  onChange={(e) => setRegData({ ...regData, longitude: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setRegStep(1)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!regData.businessName || !regData.ownerName) {
                    showToast('Please fill required fields');
                    return;
                  }
                  setRegStep(3);
                }}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Next: Payment Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & BANK DETAILS */}
        {regStep === 3 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Step 3: Bank Account & Settlement Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={regData.accountHolder}
                  onChange={(e) => setRegData({ ...regData, accountHolder: e.target.value })}
                  placeholder="e.g. Ramesh Kumar Enterprises"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bank Name *</label>
                <select
                  value={regData.bankName}
                  onChange={(e) => setRegData({ ...regData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={regData.ifsc}
                  onChange={(e) => setRegData({ ...regData, ifsc: e.target.value })}
                  placeholder="HDFC0001234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account Number *</label>
                <input
                  type="password"
                  required
                  value={regData.accountNumber}
                  onChange={(e) => setRegData({ ...regData, accountNumber: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Re-enter Account Number *</label>
                <input
                  type="text"
                  required
                  value={regData.confirmAccount}
                  onChange={(e) => setRegData({ ...regData, confirmAccount: e.target.value })}
                  placeholder="50100234891234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setRegStep(2)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!regData.accountHolder || !regData.ifsc) {
                    showToast('Please fill required bank details');
                    return;
                  }
                  setRegStep(4);
                }}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Save & Next: Credentials →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CREATE LOGIN CREDENTIALS */}
        {regStep === 4 && (
          <form onSubmit={handleRegisterSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Step 4: Create Vendor Portal Login</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Username / Staff ID *</label>
                <input
                  type="text"
                  required
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  placeholder="e.g. ramesh_techpark"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">First Name for Greeting *</label>
                <input
                  type="text"
                  required
                  value={regData.firstName}
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                  placeholder="Ramesh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regData.agreeTerms}
                    onChange={(e) => setRegData({ ...regData, agreeTerms: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    I agree to the <strong>5.0% platform commission fee</strong> and automated Razorpay payout terms.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRegStep(3)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Submit Application for Verification
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: SUCCESS - WAITING FOR VERIFICATION */}
        {regStep === 5 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-6 max-w-2xl mx-auto animate-in zoom-in-95">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>

            <div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider">
                Status: Waiting for Verification
              </span>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-3">Canteen Application Submitted!</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                Your canteen registration has been queued in the Super Admin Verification pipeline. Once the college node admin verifies FSSAI license and bank details, your canteen will go LIVE!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <p className="font-bold text-slate-950 dark:text-white">Registration Snapshot:</p>
              <p><strong className="text-slate-500">Outlet Name:</strong> {regData.businessName || 'New Campus Diner'}</p>
              <p><strong className="text-slate-500">College Node:</strong> {regData.college}</p>
              <p><strong className="text-slate-500">Owner Contact:</strong> {regData.phone}</p>
            </div>

            <button
              onClick={() => {
                setViewMode('list');
                setRegStep(1);
              }}
              className="px-8 py-3 bg-slate-950 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Return to Canteens Directory
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER VIEW MODE 2: FULL PAGE DETAIL VIEW (NOT MODAL)
  // ==========================================
  if (viewMode === 'detail' && selectedCanteen) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-[1700px] mx-auto">
        {/* Breadcrumb & Navigation Topbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Canteens List
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-xs font-bold flex items-center gap-2">
              <span className="text-slate-400">Canteens</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-950 dark:text-white font-black">{selectedCanteen.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              selectedCanteen.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-100 text-amber-800'
            }`}>
              {selectedCanteen.verificationStatus}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              Node ID: {selectedCanteen.id}
            </span>
          </div>
        </div>

        {/* Hero Info Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={selectedCanteen.logo} alt={selectedCanteen.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-950 dark:text-white">{selectedCanteen.name}</h1>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg">
                  ★ {selectedCanteen.rating}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedCanteen.college} • Owner: <strong className="text-slate-900 dark:text-slate-200">{selectedCanteen.owner}</strong> ({selectedCanteen.phone})
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedCanteen.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCanteens(prev => prev.map(c => c.id === selectedCanteen.id ? { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' } : c));
                setSelectedCanteen({ ...selectedCanteen, status: selectedCanteen.status === 'Active' ? 'Suspended' : 'Active' });
                showToast('Status updated');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCanteen.status === 'Active' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-600 text-white'
              }`}
            >
              {selectedCanteen.status === 'Active' ? 'Suspend Canteen' : 'Activate Canteen'}
            </button>
            <button
              onClick={() => handleExport()}
              className="px-4 py-2.5 bg-slate-950 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Statement
            </button>
          </div>
        </div>

        {/* Full Page Tabs Navigation */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'orders', label: 'Orders History', icon: ShoppingBag },
            { id: 'payments', label: 'Payments & Payouts', icon: CreditCard },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'location', label: 'Location & Geofence', icon: MapPin },
            { id: 'commission', label: 'Commission Settings', icon: Sliders },
            { id: 'profile', label: 'Profile & Business Details', icon: User },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = detailTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setDetailTab(t.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-slate-950 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD */}
        {detailTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in text-xs">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Today's Sales</span>
                <p className="text-xl font-black text-emerald-600 mt-1">₹{selectedCanteen.todaySales.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Weekly Revenue</span>
                <p className="text-xl font-black text-slate-950 dark:text-white mt-1">₹{selectedCanteen.weeklySales.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Revenue</span>
                <p className="text-xl font-black text-slate-950 dark:text-white mt-1">₹{selectedCanteen.monthlySales.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
                <p className="text-xl font-black text-blue-600 mt-1">{selectedCanteen.totalOrders}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg Order Value</span>
                <p className="text-xl font-black text-purple-600 mt-1">₹{selectedCanteen.avgOrderValue}</p>
              </div>
            </div>

            {/* Top Menu & Peak Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" /> Top Selling Food Items
                </h3>
                <p className="text-slate-500">{selectedCanteen.topSellingFood}</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between font-bold">
                  <span>Peak Ordering Hours</span>
                  <span className="text-emerald-600">{selectedCanteen.peakOrderingTime}</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" /> Platform Compliance & Verification
                </h3>
                <p className="text-slate-500">FSSAI License: <strong className="text-slate-900 dark:text-white">{selectedCanteen.fssaiLicense}</strong></p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between font-bold">
                  <span>Settlement Cycle</span>
                  <span className="text-slate-950 dark:text-white">{selectedCanteen.settlementType}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {detailTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-950 dark:text-white">Recent Orders for {selectedCanteen.name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Items</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: 'TM-8821', student: 'Aarav Sharma', items: 'Masala Dosa, Cold Coffee', amount: 180, status: 'Delivered' },
                    { id: 'TM-8820', student: 'Priya Sundaram', items: 'Veg Thali Special', amount: 150, status: 'Preparing' },
                    { id: 'TM-8819', student: 'Rohan Gupta', items: 'Paneer Butter Masala Roti', amount: 220, status: 'Delivered' },
                    { id: 'TM-8818', student: 'Kavya Reddy', items: 'Samosa Chat, Ice Tea', amount: 120, status: 'Delivered' },
                  ].map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium">
                      <td className="p-3 font-mono font-bold text-slate-950 dark:text-white">#{o.id}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{o.student}</td>
                      <td className="p-3 text-slate-500">{o.items}</td>
                      <td className="p-3 text-right font-black text-emerald-600">₹{o.amount}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {detailTab === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Unsettled Balance</span>
                <p className="text-2xl font-black text-amber-500 mt-1">₹{selectedCanteen.pendingSettlement.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Settled To Date</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{selectedCanteen.completedSettlement.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Bank Account</span>
                <p className="text-sm font-bold text-slate-950 dark:text-white mt-1">{selectedCanteen.bankDetails.bankName}</p>
                <p className="text-[10px] font-mono text-slate-400">A/C: {selectedCanteen.bankDetails.accountNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {detailTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-950 dark:text-white">Download Financial & Commission Reports</h3>
            <p className="text-xs text-slate-500">Generate itemized PDF/Excel statements including GST breakdown and platform fees.</p>
            <div className="flex gap-3">
              <button onClick={() => handleExport()} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Download Excel
              </button>
              <button onClick={() => handleExport()} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4" /> Download CSV
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: LOCATION & GEOFENCE */}
        {detailTab === 'location' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm text-slate-950 dark:text-white">Geofence Satellite Configuration</h3>
                <p className="text-slate-500">Configure radius boundaries and GPS latitude/longitude coordinates.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCanteen({ ...selectedCanteen, geofenceActive: !selectedCanteen.geofenceActive });
                  showToast('Geofence updated');
                }}
                className={`px-4 py-2 rounded-xl font-bold ${
                  selectedCanteen.geofenceActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                Geofence: {selectedCanteen.geofenceActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Latitude</span>
                <p className="text-sm font-mono font-bold text-slate-950 dark:text-white mt-1">{selectedCanteen.latitude}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Longitude</span>
                <p className="text-sm font-mono font-bold text-slate-950 dark:text-white mt-1">{selectedCanteen.longitude}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Allowed Ordering Radius</span>
                <p className="text-sm font-bold text-emerald-600 mt-1">{selectedCanteen.radiusMeters} meters</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMMISSION */}
        {detailTab === 'commission' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Platform Commission & Settlement Cycle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Commission Rate</span>
                <p className="text-2xl font-black text-emerald-600">{selectedCanteen.platformCommissionRate}%</p>
                <p className="text-[10px] text-slate-400">Deducted automatically per order prior to settlement.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Settlement Frequency</span>
                <p className="text-lg font-extrabold text-slate-950 dark:text-white">{selectedCanteen.settlementType} Payout</p>
                <p className="text-[10px] text-slate-400">Direct NEFT/UPI transfer.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PROFILE */}
        {detailTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Vendor Profile & Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-950 dark:text-white">Description:</p>
                <p className="text-slate-500">{selectedCanteen.businessDescription}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-950 dark:text-white">Bank Details:</p>
                <p className="text-slate-500">{selectedCanteen.bankDetails.bankName} - IFSC: {selectedCanteen.bankDetails.ifsc}</p>
                <p className="text-slate-500">Account: {selectedCanteen.bankDetails.accountNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ANALYTICS */}
        {detailTab === 'analytics' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Advanced Canteen Revenue & Order Velocity Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Growth</span>
                <p className="text-xl font-black text-emerald-600 mt-1">+18.4% YoY</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Compared to previous month</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Cancellation Rate</span>
                <p className="text-xl font-black text-blue-600 mt-1">1.2% Low</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Below 2.0% platform threshold</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Repeat Diner Rate</span>
                <p className="text-xl font-black text-purple-600 mt-1">84.2% High</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Campus loyalty retention</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER VIEW MODE 3: CANTEENS DIRECTORY LIST
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-[1700px] mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[9999] bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-slate-950 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Section Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Enterprise Canteen Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control vendor onboarding, geofenced campus nodes, settlement engines, and commission rules.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-emerald-600" /> Filter Drawer
          </button>

          <button
            onClick={() => handleExport()}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={() => setViewMode('register')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Register New Canteen
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Total Canteens</span>
          <p className="text-2xl font-black text-slate-950 dark:text-white mt-2">{stats.total}</p>
          <span className="text-[10px] text-slate-400 mt-1">Across all campuses</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Verified</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.verified}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">100% Compliant</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Pending Review</span>
          <p className="text-2xl font-black text-amber-500 mt-2">{stats.pending}</p>
          <span className="text-[10px] text-amber-600 font-bold mt-1">Action Required</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Rejected</span>
          <p className="text-2xl font-black text-red-500 mt-2">{stats.rejected}</p>
          <span className="text-[10px] text-slate-400 mt-1">Audit Failed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Today's Revenue</span>
          <p className="text-xl font-black text-emerald-600 mt-2">₹{stats.todayRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 mt-1">Live Aggregate</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Monthly Revenue</span>
          <p className="text-xl font-black text-purple-600 mt-2">₹{(stats.monthlyRevenue / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-purple-600 font-bold mt-1">30-day Volume</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="text-slate-400 w-4 h-4 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search canteens by name, owner, phone, or college..."
          className="w-full bg-transparent border-none text-xs font-medium focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>

      {/* Filter Drawer Slide-Over Panel */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[9990] flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-500" /> Filter Canteens Drawer
                </h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">College Campus</label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Campuses</option>
                    <option value="SRM Institute of Science & Tech">SRM Institute of Science & Tech</option>
                    <option value="Anna University Main Campus">Anna University Main Campus</option>
                    <option value="IIT Madras Campus">IIT Madras Campus</option>
                    <option value="Crescent Institute of Tech">Crescent Institute of Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Verification Status</label>
                  <select
                    value={selectedVerificationStatus}
                    onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Verification Statuses</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Settlement Cycle</label>
                  <select
                    value={selectedSettlementType}
                    onChange={(e) => setSelectedSettlementType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Cycles</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Account Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sort By</label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="todaySales">Today's Revenue (High to Low)</option>
                    <option value="monthlySales">Monthly Sales (High to Low)</option>
                    <option value="totalOrders">Total Orders</option>
                    <option value="name">Canteen Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedCollege('All');
                  setSelectedVerificationStatus('All');
                  setSelectedSettlementType('All');
                  setSelectedStatus('All');
                  setSortField('todaySales');
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canteens Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Logo & Outlet Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">College Node</th>
                <th className="p-4 text-right">Today's Sales</th>
                <th className="p-4 text-right">Monthly Sales</th>
                <th className="p-4 text-center">Orders</th>
                <th className="p-4">Settlement</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCanteens.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <Store className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No canteens match your query</p>
                  </td>
                </tr>
              ) : (
                filteredCanteens.map((cnt) => (
                  <tr
                    key={cnt.id}
                    onClick={() => {
                      setSelectedCanteen(cnt);
                      setViewMode('detail');
                      setDetailTab('dashboard');
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors font-medium"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={cnt.logo} alt={cnt.name} className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200 dark:border-slate-700" />
                        <div>
                          <p className="font-bold text-slate-950 dark:text-white text-xs">{cnt.name}</p>
                          <span className="text-[10px] text-emerald-600 font-bold">★ {cnt.rating}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {cnt.owner}
                    </td>

                    <td className="p-4 text-slate-500 max-w-[150px] truncate">
                      {cnt.college}
                    </td>

                    <td className="p-4 text-right font-black text-emerald-600 text-xs">
                      ₹{cnt.todaySales.toLocaleString()}
                    </td>

                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white text-xs">
                      ₹{cnt.monthlySales.toLocaleString()}
                    </td>

                    <td className="p-4 text-center font-extrabold text-slate-700 dark:text-slate-300">
                      {cnt.totalOrders}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {cnt.settlementType}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        cnt.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                        cnt.verificationStatus === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' :
                        'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                      }`}>
                        {cnt.verificationStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                        cnt.status === 'Active' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cnt.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {cnt.status}
                      </span>
                    </td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedCanteen(cnt);
                          setViewMode('detail');
                          setDetailTab('dashboard');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                      >
                        View Full Detail →
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
  );
};
