import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CanteenManagementView } from './CanteenManagementView';
import { StudentManagementView } from './StudentManagementView';
import { 
  Order, MenuItem, User as AppUser, CanteenProfile, AdminProfile, OrderStatus 
} from '../types';
import { 
  LayoutDashboard, Store, Users, ShoppingBag, CreditCard, BarChart3, 
  Building2, Settings, ShieldCheck, LogOut, Search, Bell, Sun, Moon, 
  Plus, Check, X, Filter, ArrowUpRight, ArrowDownRight, Sparkles, RefreshCw, 
  Clock, ChevronRight, ChevronDown, Download, AlertTriangle, FileText, 
  CheckCircle2, XCircle, Printer, Eye, Flame, TrendingUp, Wallet, 
  IndianRupee, Package, HelpCircle, Menu, Sliders, Send, Layers, HelpCircle as InfoIcon,
  PieChart as PieChartIcon, UserCheck, ShieldAlert, CheckSquare, Sparkle, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface AdminViewProps {
  user: AppUser;
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrders: (orders: Order[]) => void;
  onLogout: () => void;
}

type SidebarTab = 
  | 'dashboard' 
  | 'canteens' 
  | 'students' 
  | 'orders' 
  | 'payments' 
  | 'reports' 
  | 'colleges' 
  | 'settings' 
  | 'audit_logs';

type QuickActionType = 
  | 'verify_canteen' 
  | 'approve_payment' 
  | 'create_college' 
  | 'export_reports' 
  | 'create_announcement' 
  | null;

// Initial Mock Colleges Data
const INITIAL_COLLEGES = [
  { id: 'col-1', name: 'SRM Institute of Science & Tech', code: 'SRM-KTR', canteensCount: 6, studentsCount: 420, activeOrders: 84, status: 'Active' },
  { id: 'col-2', name: 'Anna University Main Campus', code: 'AU-CEG', canteensCount: 4, studentsCount: 290, activeOrders: 42, status: 'Active' },
  { id: 'col-3', name: 'IIT Madras Campus', code: 'IIT-M', canteensCount: 5, studentsCount: 310, activeOrders: 56, status: 'Active' },
  { id: 'col-4', name: 'Crescent Institute of Tech', code: 'BSACIST', canteensCount: 3, studentsCount: 180, activeOrders: 18, status: 'Active' },
];

// Initial Mock Canteens
const INITIAL_CANTEENS: Array<{
  id: string;
  name: string;
  college: string;
  owner: string;
  contact: string;
  rating: number;
  ordersToday: number;
  revenueToday: number;
  status: 'Verified' | 'Pending Verification' | 'Inactive';
  image: string;
}> = [
  { id: 'cnt-1', name: 'Tech Park Central Food Court', college: 'SRM Institute of Science & Tech', owner: 'Ramesh Kumar', contact: '+91 98765 43210', rating: 4.8, ordersToday: 142, revenueToday: 18450, status: 'Verified', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200' },
  { id: 'cnt-2', name: 'Hostel Block B Night Canteen', college: 'Anna University Main Campus', owner: 'Suresh V', contact: '+91 98123 45678', rating: 4.6, ordersToday: 98, revenueToday: 11200, status: 'Verified', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200' },
  { id: 'cnt-3', name: 'Gourmet Campus Diner', college: 'IIT Madras Campus', owner: 'Anitha Sharma', contact: '+91 99887 76655', rating: 4.9, ordersToday: 165, revenueToday: 24300, status: 'Verified', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200' },
  { id: 'cnt-4', name: 'Valley Snack Corner', college: 'Crescent Institute of Tech', owner: 'Praveen Raj', contact: '+91 97654 32109', rating: 4.2, ordersToday: 45, revenueToday: 4800, status: 'Pending Verification', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=200' },
  { id: 'cnt-5', name: 'Mechanical Block Juice & Cafe', college: 'SRM Institute of Science & Tech', owner: 'Karthik N', contact: '+91 95432 10987', rating: 4.5, ordersToday: 32, revenueToday: 3200, status: 'Pending Verification', image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=200' },
];

// Mock Registered Students
const INITIAL_STUDENTS = [
  { id: 'std-1', registerNo: '2024SRM101', name: 'Aarav Sharma', college: 'SRM Institute', hostel: 'MSR Hostel', room: '304', phone: '+91 98765 11111', totalOrders: 28, totalSpent: 3420, status: 'Active' },
  { id: 'std-2', registerNo: '2024AU205', name: 'Priya Sundaram', college: 'Anna University', hostel: 'Kaveri Hostel', room: '112', phone: '+91 98765 22222', totalOrders: 19, totalSpent: 2150, status: 'Active' },
  { id: 'std-3', registerNo: '2024IITM88', name: 'Rohan Gupta', college: 'IIT Madras', hostel: 'Mandakini Hostel', room: '408', phone: '+91 98765 33333', totalOrders: 42, totalSpent: 5890, status: 'Active' },
  { id: 'std-4', registerNo: '2024BSAC12', name: 'Kavya Reddy', college: 'Crescent Institute', hostel: 'Girls Hostel A', room: '201', phone: '+91 98765 44444', totalOrders: 14, totalSpent: 1680, status: 'Active' },
  { id: 'std-5', registerNo: '2024SRM309', name: 'Vikram Singh', college: 'SRM Institute', hostel: 'Adhiyaman Hostel', room: '512', phone: '+91 98765 55555', totalOrders: 3, totalSpent: 390, status: 'Suspended' },
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-07-28 08:30:12', user: 'SuperAdmin', action: 'Approved Canteen Payout', details: 'Released ₹18,450 to Tech Park Central', category: 'Payment', severity: 'Info' },
  { id: 'log-2', timestamp: '2026-07-28 08:15:44', user: 'System', action: 'Commission Calculation', details: 'Calculated 5% platform fee (₹922.50)', category: 'System', severity: 'Info' },
  { id: 'log-3', timestamp: '2026-07-28 07:45:00', user: 'Aarav Sharma', action: 'Order Placed (#TM-8821)', details: 'Total ₹180 via UPI Razorpay', category: 'Order', severity: 'Info' },
  { id: 'log-4', timestamp: '2026-07-28 07:12:30', user: 'SuperAdmin', action: 'Verified Canteen', details: 'Approved Gourmet Campus Diner', category: 'Canteen', severity: 'Success' },
  { id: 'log-5', timestamp: '2026-07-27 22:04:10', user: 'SuperAdmin', action: 'Password Changed', details: 'Admin roll verification success', category: 'Security', severity: 'Warning' },
];

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  orders,
  menu,
  onUpdateOrders,
  onLogout
}) => {
  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentTime, setCurrentTime] = useState('');
  
  // Interactive UI States
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [isLoadingSkeletons, setIsLoadingSkeletons] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [quickActionModal, setQuickActionModal] = useState<QuickActionType>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entities Data State
  const [canteens, setCanteens] = useState(INITIAL_CANTEENS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [colleges, setColleges] = useState(INITIAL_COLLEGES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Form Inputs for Modals
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('all');
  const [selectedCanteenToVerify, setSelectedCanteenToVerify] = useState<string | null>(null);

  // System Settings State
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [autoVerifyCanteens, setAutoVerifyCanteens] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Password Reset State
  const [rollInput, setRollInput] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passFeedback, setPassFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const adminProfile = user.profile as AdminProfile;

  // Live Ticking Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
        ' • ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast Trigger Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard Shortcuts (Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOverlayOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOverlayOpen(false);
        setQuickActionModal(null);
        setSelectedReceiptOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculations for KPI Cards
  const kpiData = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0) + 184500;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrdersArr = orders.filter(o => o.created_at.startsWith(todayStr));
    const todayRev = todayOrdersArr.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0) + 14250;
    const monthRev = totalRev * 0.42;
    const commission = (totalRev * (commissionRate / 100));

    const totalOrd = orders.length + 1420;
    const completedOrd = orders.filter(o => o.order_status === 'delivered').length + 1380;
    const pendingOrd = orders.filter(o => o.order_status === 'pending' || o.order_status === 'preparing').length + 24;
    const cancelledOrd = orders.filter(o => o.order_status === 'cancelled').length + 16;

    const totalStd = students.length + 845;
    const activeStd = students.filter(s => s.status === 'Active').length + 716;

    const totalCnt = canteens.length + 13;
    const verifiedCnt = canteens.filter(c => c.status === 'Verified').length + 12;
    const pendingCnt = canteens.filter(c => c.status === 'Pending Verification').length + 1;

    return {
      totalRev,
      todayRev,
      monthRev,
      commission,
      totalOrd,
      completedOrd,
      pendingOrd,
      cancelledOrd,
      totalStd,
      activeStd,
      totalCnt,
      verifiedCnt,
      pendingCnt
    };
  }, [orders, canteens, students, commissionRate]);

  // Chart Data: Revenue Analytics
  const revenueChartData = useMemo(() => {
    if (revenueFilter === 'today') {
      return [
        { time: '08 AM', revenue: 1200, orders: 15 },
        { time: '10 AM', revenue: 3400, orders: 42 },
        { time: '12 PM', revenue: 8900, orders: 98 },
        { time: '02 PM', revenue: 5200, orders: 58 },
        { time: '04 PM', revenue: 4100, orders: 48 },
        { time: '06 PM', revenue: 7800, orders: 85 },
        { time: '08 PM', revenue: 6300, orders: 72 },
      ];
    }
    if (revenueFilter === 'month') {
      return [
        { time: 'Week 1', revenue: 38000, orders: 340 },
        { time: 'Week 2', revenue: 45000, orders: 410 },
        { time: 'Week 3', revenue: 52000, orders: 490 },
        { time: 'Week 4', revenue: 49500, orders: 460 },
      ];
    }
    if (revenueFilter === 'year') {
      return [
        { time: 'Jan', revenue: 120000, orders: 1200 },
        { time: 'Feb', revenue: 145000, orders: 1380 },
        { time: 'Mar', revenue: 168000, orders: 1550 },
        { time: 'Apr', revenue: 184500, orders: 1720 },
      ];
    }
    // Default 'week'
    return [
      { time: 'Mon', revenue: 18200, orders: 180 },
      { time: 'Tue', revenue: 22400, orders: 210 },
      { time: 'Wed', revenue: 19800, orders: 195 },
      { time: 'Thu', revenue: 26500, orders: 245 },
      { time: 'Fri', revenue: 31000, orders: 290 },
      { time: 'Sat', revenue: 28400, orders: 260 },
      { time: 'Sun', revenue: 24200, orders: 220 },
    ];
  }, [revenueFilter]);

  // Chart Data: Sales by College
  const collegeSalesData = [
    { name: 'SRM Institute', value: 48, color: '#10b981' },
    { name: 'IIT Madras', value: 28, color: '#3b82f6' },
    { name: 'Anna Univ', value: 16, color: '#8b5cf6' },
    { name: 'Crescent', value: 8, color: '#f59e0b' },
  ];

  // Chart Data: Most Ordered Foods
  const topFoodsData = [
    { name: 'Masala Dosa', sales: 480 },
    { name: 'Cold Coffee', sales: 390 },
    { name: 'Paneer Butter Masala', sales: 310 },
    { name: 'Veg Thali Special', sales: 260 },
    { name: 'Samosa Chat', sales: 210 },
  ];

  // Chart Data: Settlement Overview (Stacked Bar)
  const settlementChartData = [
    { name: 'Mon', CanteenPayout: 17290, Commission: 910, Pending: 500 },
    { name: 'Tue', CanteenPayout: 21280, Commission: 1120, Pending: 0 },
    { name: 'Wed', CanteenPayout: 18810, Commission: 990, Pending: 350 },
    { name: 'Thu', CanteenPayout: 25175, Commission: 1325, Pending: 200 },
    { name: 'Fri', CanteenPayout: 29450, Commission: 1550, Pending: 800 },
  ];

  // Actions
  const handleVerifyCanteen = (id: string) => {
    setCanteens(prev => prev.map(c => c.id === id ? { ...c, status: 'Verified' as const } : c));
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'SuperAdmin',
        action: 'Canteen Verified',
        details: `Verified Canteen ID: ${id}`,
        category: 'Canteen',
        severity: 'Success'
      },
      ...prev
    ]);
    triggerToast('Canteen verification approved successfully!');
    setQuickActionModal(null);
  };

  const handleCreateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName) return;
    const newCol = {
      id: `col-${Date.now()}`,
      name: newCollegeName,
      code: newCollegeCode || newCollegeName.substring(0, 4).toUpperCase(),
      canteensCount: 0,
      studentsCount: 0,
      activeOrders: 0,
      status: 'Active'
    };
    setColleges(prev => [newCol, ...prev]);
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'SuperAdmin',
        action: 'College Created',
        details: `Added new campus node: ${newCollegeName}`,
        category: 'System',
        severity: 'Info'
      },
      ...prev
    ]);
    setNewCollegeName('');
    setNewCollegeCode('');
    setQuickActionModal(null);
    triggerToast(`College "${newCol.name}" onboarded successfully!`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle) return;
    triggerToast(`Announcement broadcasted to ${announcementTarget.toUpperCase()} successfully!`);
    setAnnouncementTitle('');
    setAnnouncementMsg('');
    setQuickActionModal(null);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);
    if (rollInput !== adminProfile?.roll_number) {
      setPassFeedback({ type: 'error', text: 'Roll number verification failed. Check admin credentials.' });
      return;
    }
    if (newPass.length < 6) {
      setPassFeedback({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    setPassFeedback({ type: 'success', text: 'Admin master password updated successfully!' });
    setRollInput('');
    setNewPass('');
  };

  return (
    <div className={`h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white overflow-hidden`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-3 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-slate-950 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1 h-full w-full relative overflow-hidden">
        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
          />
        )}

        {/* =========================================
            SIDEBAR NAVIGATION
           ========================================= */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 h-screen overflow-y-auto
          bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
          flex flex-col justify-between transition-all duration-250 ease-in-out shadow-xl lg:shadow-none
          ${isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div>
            {/* Brand Logo & Header */}
            <div className={`p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 ${isSidebarCollapsed ? 'px-2 justify-center' : ''}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center font-black shadow-md shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-slate-950 dark:text-white text-base leading-none tracking-tight truncate">Time To Meal</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mt-1 truncate">Super Admin</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 transition-all shrink-0"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="p-3 space-y-1.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'canteens', label: 'Canteens', icon: Store, badge: canteens.filter(c => c.status === 'Pending Verification').length },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter(o => o.order_status === 'pending').length },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'reports', label: 'Reports', icon: BarChart3 },
                { id: 'colleges', label: 'Colleges', icon: Building2 },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as SidebarTab);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all relative group
                      ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                      ${isActive 
                        ? 'bg-slate-950 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 shadow-md' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'}
                    `}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400 dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {!isSidebarCollapsed && item.badge ? (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    ) : null}
                    {isSidebarCollapsed && item.badge ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={`${item.badge} pending`} />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer / User Logout */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {!isSidebarCollapsed ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                  SA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{adminProfile?.full_name || 'Super Admin'}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center p-1" title={adminProfile?.full_name || 'Super Admin'}>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  SA
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className={`
                w-full flex items-center justify-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all
                bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400
                ${isSidebarCollapsed ? 'px-0' : ''}
              `}
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content View Container */}
        <div className={`
          flex-1 flex flex-col min-w-0 h-full overflow-y-auto transition-all duration-250 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}>
          {/* =========================================
              TOP NAVBAR
             ========================================= */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-6 py-2.5 sticky top-0 z-30 shadow-xs flex items-center justify-between gap-3">
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">Super Admin</span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
                <span className="text-slate-900 dark:text-white capitalize">{activeTab.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="relative flex-1 max-w-sm mx-1 sm:mx-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => setSearchOverlayOpen(true)}
                placeholder="Search canteen, student, order #..."
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-200/80 dark:bg-slate-700 rounded">
                ⌘K
              </kbd>
            </div>

            {/* Right Controls: Skeleton Toggle, Theme, Notifications, Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Skeleton Demo Toggle */}
              <button
                onClick={() => {
                  setIsLoadingSkeletons(true);
                  setTimeout(() => setIsLoadingSkeletons(false), 1200);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all"
                title="Simulate Skeleton Loading State"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSkeletons ? 'animate-spin' : ''}`} />
              </button>

              {/* Theme Switcher */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                title="Switch Theme"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => triggerToast('No unread critical system alerts')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-all"
                  title="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </button>
              </div>

              {/* Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-slate-950 text-emerald-400 font-bold flex items-center justify-center text-[11px] shadow-xs">
                  SA
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Master Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* =========================================
              TAB CONTENTS
             ========================================= */}
          <main className="p-4 md:p-6 space-y-6 flex-1">
            {/* SKELETON LOADER STATE */}
            {isLoadingSkeletons ? (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  ))}
                </div>
                <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
            ) : (
              <>
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Header Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div>
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">System Master Dashboard</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time overview across all partner colleges, canteens, and student transactions.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setQuickActionModal('verify_canteen')}
                          className="px-4 py-2.5 bg-slate-950 hover:bg-black text-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" /> Verify Canteen
                        </button>
                        <button 
                          onClick={() => setQuickActionModal('create_college')}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add College
                        </button>
                        <button 
                          onClick={() => setQuickActionModal('export_reports')}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Export Data
                        </button>
                      </div>
                    </div>

                    {/* =========================================
                        13 KPI CARDS GRID
                       ========================================= */}
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Key Performance Indicators</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[
                          { title: 'Total Revenue', value: `₹${kpiData.totalRev.toLocaleString()}`, trend: '+14.2%', icon: IndianRupee, color: 'emerald' },
                          { title: "Today's Revenue", value: `₹${kpiData.todayRev.toLocaleString()}`, trend: '+8.5%', icon: TrendingUp, color: 'emerald' },
                          { title: 'Monthly Revenue', value: `₹${Math.round(kpiData.monthRev).toLocaleString()}`, trend: '+12.1%', icon: Wallet, color: 'blue' },
                          { title: 'Platform Commission (5%)', value: `₹${Math.round(kpiData.commission).toLocaleString()}`, trend: '+15.0%', icon: Sparkles, color: 'purple' },
                          { title: 'Total Orders', value: kpiData.totalOrd.toLocaleString(), trend: '+18.4%', icon: ShoppingBag, color: 'blue' },
                          { title: 'Completed Orders', value: kpiData.completedOrd.toLocaleString(), trend: '+16.8%', icon: CheckCircle2, color: 'emerald' },
                          { title: 'Pending Orders', value: kpiData.pendingOrd.toString(), trend: '-4.2%', icon: Clock, color: 'amber' },
                          { title: 'Cancelled Orders', value: kpiData.cancelledOrd.toString(), trend: '-1.1%', icon: XCircle, color: 'red' },
                          { title: 'Total Students', value: kpiData.totalStd.toLocaleString(), trend: '+9.3%', icon: Users, color: 'indigo' },
                          { title: 'Active Students', value: kpiData.activeStd.toLocaleString(), trend: '+11.0%', icon: UserCheck, color: 'emerald' },
                          { title: 'Total Canteens', value: kpiData.totalCnt.toString(), trend: '+2 new', icon: Store, color: 'blue' },
                          { title: 'Verified Canteens', value: kpiData.verifiedCnt.toString(), trend: '100%', icon: ShieldCheck, color: 'emerald' },
                          { title: 'Pending Verification', value: kpiData.pendingCnt.toString(), trend: 'Needs Review', icon: AlertTriangle, color: 'amber' },
                        ].map((card, idx) => {
                          const Icon = card.icon;
                          const isPositive = !card.trend.includes('-');
                          return (
                            <div 
                              key={idx}
                              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{card.title}</span>
                                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>

                              <div>
                                <div className="text-xl font-black text-slate-950 dark:text-white tracking-tight">{card.value}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                                    isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                  }`}>
                                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {card.trend}
                                  </span>
                                  <span className="text-[9px] text-slate-400">vs prev period</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* =========================================
                        CHARTS SECTION
                       ========================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Revenue Analytics Line Chart */}
                      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-950 dark:text-white">Revenue Analytics</h3>
                            <p className="text-xs text-slate-400">Financial flow tracking with platform fee breakdown.</p>
                          </div>
                          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                            {(['today', 'week', 'month', 'year'] as const).map(t => (
                              <button
                                key={t}
                                onClick={() => setRevenueFilter(t)}
                                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${revenueFilter === t ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRevGrad)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Sales by College Pie Chart */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-950 dark:text-white">Sales by College Node</h3>
                          <p className="text-xs text-slate-400">Order share distribution across campuses.</p>
                        </div>

                        <div className="h-56 w-full relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={collegeSalesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4}>
                                {collegeSalesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                          {collegeSalesData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                              <span className="ml-auto font-black text-slate-950 dark:text-white">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Settlement Overview Stacked Bar Chart */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-slate-950 dark:text-white">Settlement Overview (Payouts vs Fee)</h3>
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={settlementChartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                              <Bar dataKey="CanteenPayout" stackId="a" fill="#10b981" />
                              <Bar dataKey="Commission" stackId="a" fill="#8b5cf6" />
                              <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Most Ordered Foods Horizontal Bar Chart */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-slate-950 dark:text-white">Most Ordered Campus Foods</h3>
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topFoodsData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={110} />
                              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                              <Bar dataKey="sales" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* =========================================
                        LEADERBOARDS & RECENT ACTIVITY
                       ========================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Top Selling Canteens Leaderboard */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-bold text-slate-950 dark:text-white">Top Selling Canteens</h3>
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">Live Leaderboard</span>
                        </div>
                        <div className="space-y-3">
                          {canteens.slice(0, 4).map((cnt, idx) => (
                            <div key={cnt.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                                #{idx + 1}
                              </span>
                              <img src={cnt.image} alt={cnt.name} className="w-9 h-9 rounded-xl object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{cnt.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{cnt.college}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{cnt.revenueToday}</p>
                                <p className="text-[10px] text-slate-400">{cnt.ordersToday} orders</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Students Leaderboard */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-bold text-slate-950 dark:text-white">Top Student Diners</h3>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md">High Volume</span>
                        </div>
                        <div className="space-y-3">
                          {students.slice(0, 4).map((std, idx) => (
                            <div key={std.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                              <div className="w-8 h-8 rounded-xl bg-slate-950 text-emerald-400 font-bold flex items-center justify-center text-xs">
                                {std.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{std.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{std.registerNo} • {std.hostel}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-slate-950 dark:text-white">₹{std.totalSpent}</p>
                                <p className="text-[10px] text-slate-400">{std.totalOrders} orders</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pending Verification Quick Action Stream */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-bold text-slate-950 dark:text-white">Pending Canteen Verifications</h3>
                          <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md">Action Required</span>
                        </div>
                        {canteens.filter(c => c.status === 'Pending Verification').length === 0 ? (
                          <div className="py-12 text-center text-slate-400 space-y-1">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">All canteens verified!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {canteens.filter(c => c.status === 'Pending Verification').map((cnt) => (
                              <div key={cnt.id} className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-xs font-bold text-slate-950 dark:text-white">{cnt.name}</p>
                                    <p className="text-[10px] text-slate-500">{cnt.owner} • {cnt.contact}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleVerifyCanteen(cnt.id)}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> Approve & Verify
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CANTEENS TAB */}
                {activeTab === 'canteens' && <CanteenManagementView />}

                {/* 3. STUDENTS TAB */}
                {activeTab === 'students' && <StudentManagementView />}

                {/* 4. ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">Master Order Pipeline</h2>
                        <p className="text-xs text-slate-500">Track and manage live food orders across all campus canteens.</p>
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        Total Live Tickets: <strong className="text-slate-950 dark:text-white">{orders.length}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {orders.map((ord) => (
                        <div key={ord.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2.5 py-1 bg-slate-950 text-emerald-400 font-black text-xs rounded-lg">
                                #{ord.order_code}
                              </span>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{ord.student_details?.full_name || 'Walk-in Guest'}</h4>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold capitalize">
                              {ord.order_status}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between text-slate-400"><span>Items:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{ord.order_items?.length || 0} items</span></div>
                            <div className="flex justify-between text-slate-400"><span>Total:</span> <span className="font-black text-emerald-600">₹{ord.total_amount}</span></div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" /> Thermal Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. PAYMENTS TAB */}
                {activeTab === 'payments' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">Platform Payment Settlements</h2>
                      <p className="text-xs text-slate-500">Automated 5% commission retention and vendor payout queue.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <p className="text-xs font-bold text-slate-400 uppercase">Gross Payment Volume</p>
                        <p className="text-2xl font-black text-slate-950 dark:text-white mt-2">₹1,98,750</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <p className="text-xs font-bold text-slate-400 uppercase">Platform Fee Earned (5%)</p>
                        <p className="text-2xl font-black text-purple-600 mt-2">₹9,937.50</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <p className="text-xs font-bold text-slate-400 uppercase">Vendor Payout Pool</p>
                        <p className="text-2xl font-black text-emerald-600 mt-2">₹1,88,812.50</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. REPORTS TAB */}
                {activeTab === 'reports' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">Reports & Financial Analytics</h2>
                        <p className="text-xs text-slate-500">Download audit reports and operational metrics.</p>
                      </div>
                      <button 
                        onClick={() => setQuickActionModal('export_reports')}
                        className="px-5 py-3 bg-slate-950 text-emerald-400 hover:bg-black font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Report (CSV)
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. COLLEGES TAB */}
                {activeTab === 'colleges' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">Campus College Nodes</h2>
                        <p className="text-xs text-slate-500">Manage onboarded educational institutions and canteens.</p>
                      </div>
                      <button 
                        onClick={() => setQuickActionModal('create_college')}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Create College
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {colleges.map((col) => (
                        <div key={col.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                                <Building2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-950 dark:text-white text-base">{col.name}</h3>
                                <p className="text-xs font-mono text-slate-400">{col.code}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              {col.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-xs">
                            <div><p className="text-slate-400 text-[10px]">Canteens</p><p className="font-black text-slate-900 dark:text-white">{col.canteensCount}</p></div>
                            <div><p className="text-slate-400 text-[10px]">Students</p><p className="font-black text-slate-900 dark:text-white">{col.studentsCount}</p></div>
                            <div><p className="text-slate-400 text-[10px]">Active Orders</p><p className="font-black text-emerald-600">{col.activeOrders}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">Super Admin Settings</h2>
                      <p className="text-xs text-slate-500">Configure global platform rules and credentials.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <h3 className="font-bold text-slate-950 dark:text-white text-sm">Platform Rules</h3>
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-500 font-bold mb-1">Commission Rate (%)</label>
                            <input 
                              type="number" 
                              step="0.5" 
                              value={commissionRate} 
                              onChange={(e) => setCommissionRate(Number(e.target.value))}
                              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Auto-verify Vendor Applications</span>
                            <input 
                              type="checkbox" 
                              checked={autoVerifyCanteens} 
                              onChange={(e) => setAutoVerifyCanteens(e.target.checked)}
                              className="w-4 h-4 accent-emerald-600"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="font-bold text-slate-700 dark:text-slate-200">System Maintenance Mode</span>
                            <input 
                              type="checkbox" 
                              checked={maintenanceMode} 
                              onChange={(e) => setMaintenanceMode(e.target.checked)}
                              className="w-4 h-4 accent-red-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Reset */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                        <h3 className="font-bold text-slate-950 dark:text-white text-sm">Reset Security Password</h3>
                        <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-500 font-bold mb-1">Admin Roll No Verification</label>
                            <input 
                              type="text" 
                              value={rollInput} 
                              onChange={(e) => setRollInput(e.target.value)}
                              placeholder="Enter Roll Number" 
                              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 font-bold mb-1">New Secret Password</label>
                            <input 
                              type="password" 
                              value={newPass} 
                              onChange={(e) => setNewPass(e.target.value)}
                              placeholder="••••••••" 
                              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                            />
                          </div>

                          {passFeedback && (
                            <p className={`text-[10px] font-bold ${passFeedback.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                              {passFeedback.text}
                            </p>
                          )}

                          <button type="submit" className="w-full py-3 bg-slate-950 text-emerald-400 hover:bg-black font-bold text-xs rounded-xl shadow-xs">
                            Update Master Password
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. AUDIT LOGS TAB */}
                {activeTab === 'audit_logs' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">Security & Audit Logs</h2>
                      <p className="text-xs text-slate-500">Immutable chronological record of administrative actions.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="p-4 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                              <td className="p-4 font-bold">{log.user}</td>
                              <td className="p-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                              <td className="p-4 text-slate-500">{log.details}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.severity === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                                  log.severity === 'Warning' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {log.severity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* =========================================
          QUICK ACTION MODALS
         ========================================= */}
      {/* 1. Add / Verify Canteen Modal */}
      {quickActionModal === 'verify_canteen' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-950 dark:text-white text-base">Verify Canteen Vendor</h3>
              <button onClick={() => setQuickActionModal(null)} className="p-1 text-slate-400 hover:text-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">Select a canteen application to approve for live ordering.</p>
            <div className="space-y-2">
              {canteens.filter(c => c.status === 'Pending Verification').map(cnt => (
                <div key={cnt.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">{cnt.name}</p>
                    <p className="text-[10px] text-slate-400">{cnt.owner}</p>
                  </div>
                  <button onClick={() => handleVerifyCanteen(cnt.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Approve</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Create College Modal */}
      {quickActionModal === 'create_college' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-950 dark:text-white text-base">Onboard New College Node</h3>
              <button onClick={() => setQuickActionModal(null)} className="p-1 text-slate-400 hover:text-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCollege} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">College Name</label>
                <input required value={newCollegeName} onChange={(e) => setNewCollegeName(e.target.value)} placeholder="e.g. Loyola College" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Campus Code</label>
                <input value={newCollegeCode} onChange={(e) => setNewCollegeCode(e.target.value)} placeholder="e.g. LCY-CHE" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border font-bold" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setQuickActionModal(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-xs">Onboard Campus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Export Reports Modal */}
      {quickActionModal === 'export_reports' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-950 dark:text-white text-base">Export Financial Audit Data</h3>
              <button onClick={() => setQuickActionModal(null)} className="p-1 text-slate-400 hover:text-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">Download formatted sales and settlement statements in CSV format.</p>
            <button 
              onClick={() => {
                triggerToast('Downloading CSV report statement...');
                setQuickActionModal(null);
              }}
              className="w-full py-3 bg-slate-950 text-emerald-400 hover:bg-black font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Trigger CSV Export
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal Overlay */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
            <button onClick={() => setSelectedReceiptOrder(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 overflow-y-auto pr-1">
              <div id="receipt-print-area" className="text-center font-mono text-slate-900 space-y-3 pt-2 text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">TIME TO MEAL CAMPUS</h3>
                  <p className="text-[10px] text-slate-500">Super Admin Master Receipt</p>
                </div>
                <p className="text-slate-300">--------------------------------</p>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">ORDER TOKEN</p>
                  <p className="text-2xl font-bold text-slate-900">#{selectedReceiptOrder.order_code}</p>
                </div>
                <p className="text-slate-300">--------------------------------</p>
                <div className="text-left space-y-1 font-sans">
                  <div className="flex justify-between"><span className="text-slate-500">Customer:</span><span className="font-bold">{selectedReceiptOrder.student_details?.full_name || 'Walk-in'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Total:</span><span className="font-bold text-emerald-600">₹{selectedReceiptOrder.total_amount}</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={() => setSelectedReceiptOrder(null)} className="py-2.5 px-4 bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
