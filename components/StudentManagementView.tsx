import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, AlertTriangle, XCircle, TrendingUp, 
  ShoppingBag, CheckCircle2, Clock, Plus, Eye, Edit, Trash2, Ban, Check, X,
  MapPin, Phone, Mail, Building2, User, FileText, Download, DollarSign,
  CreditCard, Sliders, Settings, BarChart3, ChevronRight, RefreshCw, Sparkles,
  ArrowUpRight, ExternalLink, Calendar, Compass, Navigation, Award,
  FileSpreadsheet, FileCode, Printer, Layers, Shield, AlertCircle, ArrowLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

export interface StudentRecord {
  id: string;
  name: string;
  photo: string;
  rollNumber: string;
  department: string;
  year: string;
  college: string;
  collegeEmail: string;
  phone: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  favoriteCanteen: string;
  status: 'Active' | 'Blocked' | 'Inactive';
  registrationDate: string;
  locationPermissionGranted: boolean;
  currentGps: { lat: number; lng: number };
  campusCanteenRadiusMeters: number;
  distanceFromCanteenMeters: number;
  isWithinGeofence: boolean;
}

const INITIAL_STUDENTS_DATA: StudentRecord[] = [
  {
    id: 'std-101',
    name: 'Aarav Sharma',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    rollNumber: '2024SRM101',
    department: 'Computer Science & Eng',
    year: '3rd Year',
    college: 'SRM Institute of Science & Tech',
    collegeEmail: 'as101@srmist.edu.in',
    phone: '+91 98765 11111',
    totalOrders: 34,
    completedOrders: 32,
    cancelledOrders: 1,
    pendingOrders: 1,
    totalSpent: 4850,
    avgOrderValue: 142,
    favoriteCanteen: 'Tech Park Central Food Court',
    status: 'Active',
    registrationDate: '10 Aug 2024',
    locationPermissionGranted: true,
    currentGps: { lat: 12.8233, lng: 80.0445 },
    campusCanteenRadiusMeters: 250,
    distanceFromCanteenMeters: 85,
    isWithinGeofence: true
  },
  {
    id: 'std-102',
    name: 'Priya Sundaram',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rollNumber: '2024AU205',
    department: 'Information Technology',
    year: '2nd Year',
    college: 'Anna University Main Campus',
    collegeEmail: 'priya.s@student.annauniv.edu',
    phone: '+91 98765 22222',
    totalOrders: 28,
    completedOrders: 27,
    cancelledOrders: 1,
    pendingOrders: 0,
    totalSpent: 3920,
    avgOrderValue: 140,
    favoriteCanteen: 'Hostel Block B Night Canteen',
    status: 'Active',
    registrationDate: '15 Sep 2024',
    locationPermissionGranted: true,
    currentGps: { lat: 13.0105, lng: 80.2350 },
    campusCanteenRadiusMeters: 200,
    distanceFromCanteenMeters: 120,
    isWithinGeofence: true
  },
  {
    id: 'std-103',
    name: 'Rohan Gupta',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rollNumber: '2024IITM88',
    department: 'Electrical Engineering',
    year: '4th Year',
    college: 'IIT Madras Campus',
    collegeEmail: 'rohan.g@smail.iitm.ac.in',
    phone: '+91 98765 33333',
    totalOrders: 42,
    completedOrders: 41,
    cancelledOrders: 1,
    pendingOrders: 0,
    totalSpent: 6890,
    avgOrderValue: 164,
    favoriteCanteen: 'Gourmet Campus Diner',
    status: 'Active',
    registrationDate: '01 Aug 2024',
    locationPermissionGranted: true,
    currentGps: { lat: 12.9920, lng: 80.2340 },
    campusCanteenRadiusMeters: 300,
    distanceFromCanteenMeters: 60,
    isWithinGeofence: true
  },
  {
    id: 'std-104',
    name: 'Kavya Reddy',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rollNumber: '2024BSAC12',
    department: 'Mechanical Engineering',
    year: '1st Year',
    college: 'Crescent Institute of Tech',
    collegeEmail: 'kavya.r@crescent.student',
    phone: '+91 98765 44444',
    totalOrders: 14,
    completedOrders: 12,
    cancelledOrders: 2,
    pendingOrders: 0,
    totalSpent: 1680,
    avgOrderValue: 120,
    favoriteCanteen: 'Valley Snack Corner',
    status: 'Active',
    registrationDate: '10 Oct 2024',
    locationPermissionGranted: true,
    currentGps: { lat: 12.8795, lng: 80.0835 },
    campusCanteenRadiusMeters: 180,
    distanceFromCanteenMeters: 90,
    isWithinGeofence: true
  },
  {
    id: 'std-105',
    name: 'Vikram Singh',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rollNumber: '2024SRM309',
    department: 'Civil Engineering',
    year: '2nd Year',
    college: 'SRM Institute of Science & Tech',
    collegeEmail: 'vs309@srmist.edu.in',
    phone: '+91 98765 55555',
    totalOrders: 3,
    completedOrders: 2,
    cancelledOrders: 1,
    pendingOrders: 0,
    totalSpent: 390,
    avgOrderValue: 130,
    favoriteCanteen: 'Tech Park Central Food Court',
    status: 'Blocked',
    registrationDate: '12 Nov 2024',
    locationPermissionGranted: false,
    currentGps: { lat: 12.8000, lng: 80.0100 },
    campusCanteenRadiusMeters: 250,
    distanceFromCanteenMeters: 2400,
    isWithinGeofence: false
  }
];

export const StudentManagementView: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Navigation State
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'dashboard' | 'orders' | 'reports' | 'profile' | 'activity' | 'location' | 'payments'>('dashboard');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery);

      const matchCollege = selectedCollege === 'All' || s.college === selectedCollege;
      const matchDept = selectedDept === 'All' || s.department === selectedDept;
      const matchYear = selectedYear === 'All' || s.year === selectedYear;
      const matchStatus = selectedStatus === 'All' || s.status === selectedStatus;

      return matchSearch && matchCollege && matchDept && matchYear && matchStatus;
    });
  }, [students, searchQuery, selectedCollege, selectedDept, selectedYear, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const blocked = students.filter(s => s.status === 'Blocked').length;
    const todayOrders = students.reduce((acc, s) => acc + (s.totalOrders > 30 ? 4 : 2), 0);
    const highestSpender = [...students].sort((a, b) => b.totalSpent - a.totalSpent)[0];

    return { total, active, blocked, todayOrders, highestSpender };
  }, [students]);

  const handleToggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Blocked' : 'Active' } : s));
    showToast('Student account status updated');
  };

  // ==========================================
  // RENDER VIEW MODE 1: FULL PAGE DETAIL VIEW (NOT MODAL)
  // ==========================================
  if (viewMode === 'detail' && selectedStudent) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-[1700px] mx-auto">
        {/* Breadcrumb & Navigation Topbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Students Directory
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-xs font-bold flex items-center gap-2">
              <span className="text-slate-400">Students</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-950 dark:text-white font-black">{selectedStudent.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              selectedStudent.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-800'
            }`}>
              {selectedStudent.status}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              Reg No: {selectedStudent.rollNumber}
            </span>
          </div>
        </div>

        {/* Hero Student Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
            <div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">{selectedStudent.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedStudent.college} • <strong className="text-slate-900 dark:text-slate-200">{selectedStudent.department} ({selectedStudent.year})</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedStudent.collegeEmail} • {selectedStudent.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleToggleStatus(selectedStudent.id);
                setSelectedStudent({ ...selectedStudent, status: selectedStudent.status === 'Active' ? 'Blocked' : 'Active' });
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedStudent.status === 'Active' ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-emerald-600 text-white'
              }`}
            >
              {selectedStudent.status === 'Active' ? 'Suspend Student' : 'Reactivate Student'}
            </button>
          </div>
        </div>

        {/* Full Page Student Tabs */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'orders', label: 'Order History', icon: ShoppingBag },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'activity', label: 'Activity Timeline', icon: Clock },
            { id: 'location', label: 'Location Access', icon: MapPin },
            { id: 'payments', label: 'Payment History', icon: CreditCard },
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
          <div className="space-y-6 text-xs">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-1">{selectedStudent.totalOrders}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{selectedStudent.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg Order Value</span>
                <p className="text-2xl font-black text-blue-600 mt-1">₹{selectedStudent.avgOrderValue}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Favourite Canteen</span>
                <p className="text-xs font-bold text-slate-950 dark:text-white mt-2 truncate">{selectedStudent.favoriteCanteen}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-950 dark:text-white">Recent Student Transactions</h3>
              <div className="space-y-2">
                {[
                  { id: 'TM-8821', canteen: selectedStudent.favoriteCanteen, amount: 180, date: 'Today, 08:30 AM', status: 'Delivered' },
                  { id: 'TM-8740', canteen: selectedStudent.favoriteCanteen, amount: 240, date: 'Yesterday, 01:15 PM', status: 'Delivered' },
                  { id: 'TM-8692', canteen: 'Main Campus Food Court', amount: 120, date: '25 Jul 2026', status: 'Delivered' },
                ].map((txn) => (
                  <div key={txn.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between font-medium">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">#{txn.id} • {txn.canteen}</p>
                      <p className="text-[10px] text-slate-400">{txn.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600">₹{txn.amount}</p>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{txn.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {detailTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-black text-slate-950 dark:text-white">Complete Order Log for {selectedStudent.name}</h3>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Canteen</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="font-medium">
                  <td className="p-3 font-mono font-bold text-slate-950 dark:text-white">#TM-8821</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{selectedStudent.favoriteCanteen}</td>
                  <td className="p-3 text-right font-black text-emerald-600">₹180</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span></td>
                </tr>
                <tr className="font-medium">
                  <td className="p-3 font-mono font-bold text-slate-950 dark:text-white">#TM-8740</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{selectedStudent.favoriteCanteen}</td>
                  <td className="p-3 text-right font-black text-emerald-600">₹240</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REPORTS */}
        {detailTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Individual Student Activity Report</h3>
            <p className="text-slate-500">Download formatted PDF/Excel spreadsheets containing full order history and spend logs.</p>
            <div className="flex gap-3">
              <button onClick={() => showToast('Exporting student activity...')} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Download Excel
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {detailTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Academic Profile & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p><strong className="text-slate-950 dark:text-white">College Node:</strong> {selectedStudent.college}</p>
                <p><strong className="text-slate-950 dark:text-white">Department:</strong> {selectedStudent.department}</p>
                <p><strong className="text-slate-950 dark:text-white">Year:</strong> {selectedStudent.year}</p>
                <p><strong className="text-slate-950 dark:text-white">Reg Date:</strong> {selectedStudent.registrationDate}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p><strong className="text-slate-950 dark:text-white">Email:</strong> {selectedStudent.collegeEmail}</p>
                <p><strong className="text-slate-950 dark:text-white">Phone:</strong> {selectedStudent.phone}</p>
                <p><strong className="text-slate-950 dark:text-white">Status:</strong> <span className="font-bold text-emerald-600">{selectedStudent.status}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVITY TIMELINE */}
        {detailTab === 'activity' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Student Event & Activity Timeline</h3>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6 py-2">
              {[
                { time: 'Today, 08:30 AM', title: 'Placed Food Order #TM-8821', desc: 'Ordered Breakfast Combo at Gourmet Campus Diner' },
                { time: 'Today, 08:29 AM', title: 'Geofence Validation Passed', desc: 'GPS verified within 60m of campus canteen' },
                { time: 'Yesterday, 01:15 PM', title: 'Placed Food Order #TM-8740', desc: 'Ordered Special Veg Thali' },
                { time: selectedStudent.registrationDate, title: 'Registered Account', desc: `Student registered under ${selectedStudent.college}` },
              ].map((ev, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <p className="font-bold text-slate-950 dark:text-white">{ev.title}</p>
                  <p className="text-slate-500 mt-0.5">{ev.desc}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LOCATION ACCESS */}
        {detailTab === 'location' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Location Access & Geofence Status
                </h3>
                <p className="text-slate-500">Real-time GPS proximity validation for campus food ordering.</p>
              </div>

              {/* GREEN BADGE OR RED BADGE */}
              <span className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                selectedStudent.isWithinGeofence ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
              }`}>
                {selectedStudent.isWithinGeofence ? '● Inside Campus (Green Badge)' : '● Outside Campus (Red Badge)'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned College</span>
                <p className="text-xs font-bold text-slate-950 dark:text-white mt-1 truncate">{selectedStudent.college}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current GPS</span>
                <p className="text-xs font-mono font-bold text-slate-950 dark:text-white mt-1">
                  {selectedStudent.currentGps.lat.toFixed(4)}, {selectedStudent.currentGps.lng.toFixed(4)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Distance to Canteen</span>
                <p className="text-xs font-black text-blue-600 mt-1">{selectedStudent.distanceFromCanteenMeters} meters</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Allowed Radius</span>
                <p className="text-xs font-black text-slate-950 dark:text-white mt-1">{selectedStudent.campusCanteenRadiusMeters} meters</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENT HISTORY */}
        {detailTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-sm text-slate-950 dark:text-white">UPI & Payment Gateway Receipts</h3>
            <div className="space-y-3">
              {[
                { id: 'PAY-901', method: 'Razorpay UPI (GPay)', amount: 180, ref: 'UPI/40921092109', date: 'Today, 08:30 AM', status: 'SUCCESS' },
                { id: 'PAY-854', method: 'Razorpay UPI (PhonePe)', amount: 240, ref: 'UPI/40919019208', date: 'Yesterday, 01:15 PM', status: 'SUCCESS' },
              ].map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">{p.method}</p>
                    <p className="text-[10px] font-mono text-slate-400">{p.ref} • {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600">₹{p.amount}</p>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER VIEW MODE 2: STUDENTS DIRECTORY LIST
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

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Registered Student Diners</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage student profiles, geofence permissions, order history, and account statuses.</p>
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
            onClick={() => showToast('Exporting student directory...')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Top Statistics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Total Students</span>
          <p className="text-2xl font-black text-slate-950 dark:text-white mt-2">{stats.total}</p>
          <span className="text-[10px] text-slate-400 mt-1">Across partner colleges</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Active Diners</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.active}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">Ordering Allowed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Suspended / Blocked</span>
          <p className="text-2xl font-black text-red-500 mt-2">{stats.blocked}</p>
          <span className="text-[10px] text-slate-400 mt-1">Access Restricted</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Today's Orders</span>
          <p className="text-2xl font-black text-blue-600 mt-2">{stats.todayOrders}</p>
          <span className="text-[10px] text-slate-400 mt-1">Active Tickets</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Highest Spending</span>
          <p className="text-lg font-black text-purple-600 mt-2 truncate">₹{stats.highestSpender?.totalSpent || 0}</p>
          <span className="text-[10px] text-purple-600 font-bold truncate mt-1">{stats.highestSpender?.name || 'N/A'}</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="text-slate-400 w-4 h-4 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student by name, register number, department, or college..."
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
                  <Filter className="w-4 h-4 text-emerald-500" /> Filter Student Drawer
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science & Eng">Computer Science & Eng</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Year of Study</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedCollege('All');
                  setSelectedDept('All');
                  setSelectedYear('All');
                  setSelectedStatus('All');
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

      {/* Main Student Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Register Number</th>
                <th className="p-4">Department & Year</th>
                <th className="p-4">College Node</th>
                <th className="p-4 text-center">Total Orders</th>
                <th className="p-4 text-right">Total Spent</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No students match your query</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr
                    key={std.id}
                    onClick={() => {
                      setSelectedStudent(std);
                      setViewMode('detail');
                      setDetailTab('dashboard');
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors font-medium"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={std.photo} alt={std.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs" />
                        <div>
                          <p className="font-bold text-slate-950 dark:text-white text-xs">{std.name}</p>
                          <p className="text-[10px] text-slate-400">{std.collegeEmail}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {std.rollNumber}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {std.department} <span className="text-[10px] text-slate-400">({std.year})</span>
                    </td>

                    <td className="p-4 text-slate-500 max-w-[150px] truncate">
                      {std.college}
                    </td>

                    <td className="p-4 text-center font-extrabold text-slate-800 dark:text-slate-200">
                      {std.totalOrders}
                    </td>

                    <td className="p-4 text-right font-black text-emerald-600 text-xs">
                      ₹{std.totalSpent.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        std.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-800'
                      }`}>
                        {std.status}
                      </span>
                    </td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(std);
                            setViewMode('detail');
                            setDetailTab('dashboard');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          View Profile →
                        </button>
                        <button
                          onClick={() => handleToggleStatus(std.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                            std.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {std.status === 'Active' ? 'Suspend' : 'Activate'}
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
  );
};
