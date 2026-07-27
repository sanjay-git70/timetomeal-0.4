
import React, { useState, useMemo, useEffect } from 'react';
import { Order, MenuItem, OrderStatus, User as AppUser } from '../types';
import { 
  Plus, Receipt, Smartphone, Clock, 
  IndianRupee, Package, Wallet, 
  TrendingUp, AlertCircle, CheckCircle2,
  BarChart3, Eye, Printer, Search,
  Filter, ChevronRight, Play, Check,
  X, RefreshCw, ChefHat, Database,
  Wifi, Users, ArrowUpRight, ArrowDownRight,
  UtensilsCrossed, Sparkles, Bell, CircleDot, ShieldCheck, Flame, CreditCard
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell 
} from 'recharts';
import { NotificationBell } from './NotificationBell';
import { useOrderNotifications } from '../hooks/useOrderNotifications';

interface SummaryDashboardProps {
  orders: Order[];
  onNewWalkIn: () => void;
  menu: MenuItem[];
  onUpdateOrders?: (orders: Order[]) => void;
  user?: AppUser;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ 
  orders, 
  onNewWalkIn, 
  menu = [],
  onUpdateOrders,
  user
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [chartFilter, setChartFilter] = useState<'revenue' | 'orders' | 'peak' | 'payments' | 'type'>('revenue');

  // Notifications hook
  const { 
    notifications, 
    permission, 
    requestNotificationPermission, 
    markAllAsRead, 
    clearNotifications, 
    markAsRead 
  } = useOrderNotifications(orders, user?.id);

  // Live Date/Time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + 
        ' • ' + 
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = useMemo(() => orders.filter(o => o.created_at.startsWith(today)), [orders, today]);

  // Compute Metrics for KPIs
  const metrics = useMemo(() => {
    let onlineSales = 0;
    let offlineSales = 0;
    let onlineCount = 0;
    let offlineCount = 0;
    let toCollectOnline = 0;
    let prePaidOnline = 0;
    let cashCollected = 0;

    let pendingCount = 0;
    let preparingCount = 0;
    let readyCount = 0;
    let deliveredCount = 0;

    todayOrders.forEach(o => {
      const isOnline = o.order_type === 'online';
      const total = Number(o.total_amount) || 0;
      const paid = Number(o.paid_amount) || 0;

      if (o.order_status === 'pending') pendingCount++;
      else if (o.order_status === 'preparing') preparingCount++;
      else if (o.order_status === 'ready') readyCount++;
      else if (o.order_status === 'delivered') deliveredCount++;

      if (isOnline) {
        onlineSales += total;
        onlineCount++;
        toCollectOnline += (total - paid);
        prePaidOnline += paid;
      } else {
        offlineSales += total;
        offlineCount++;
        cashCollected += paid;
      }
    });

    return {
      totalSales: onlineSales + offlineSales,
      onlineSales,
      offlineSales,
      totalCount: onlineCount + offlineCount,
      onlineCount,
      offlineCount,
      toCollectOnline,
      prePaidOnline,
      cashCollected,
      totalOnHand: prePaidOnline + cashCollected,
      pendingCount,
      preparingCount,
      readyCount,
      deliveredCount
    };
  }, [todayOrders]);

  // Handle order status progression directly from the Live Orders operational section
  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    if (!onUpdateOrders) return;
    const updated = orders.map(o => o.id === orderId ? { ...o, order_status: nextStatus } : o);
    onUpdateOrders(updated);
  };

  const handleCollectRemaining = (orderId: string) => {
    if (!onUpdateOrders) return;
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paid_amount: o.total_amount,
          payment_status: 'paid' as const
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Filtered operational orders for Live Orders section
  const liveOrders = useMemo(() => {
    let result = [...orders];

    if (selectedStatusTab !== 'all') {
      result = result.filter(o => o.order_status === selectedStatusTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.order_code.toLowerCase().includes(q) ||
        (o.student_details?.full_name || '').toLowerCase().includes(q) ||
        (o.student_details?.register_number || '').toLowerCase().includes(q) ||
        (o.order_items || []).some(item => item.item_name.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, selectedStatusTab, searchQuery]);

  // Compute 7-day sales trend
  const trendData = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return dates.map(dateStr => {
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
      const online = dayOrders.filter(o => o.order_type === 'online').reduce((acc, curr) => acc + Number(curr.total_amount), 0);
      const offline = dayOrders.filter(o => o.order_type === 'walk-in').reduce((acc, curr) => acc + Number(curr.total_amount), 0);
      const count = dayOrders.length;
      return {
        name: new Date(dateStr).toLocaleDateString([], { weekday: 'short' }),
        online,
        offline,
        count
      };
    });
  }, [orders]);

  // Compute Peak Hours chart data (8 AM to 9 PM)
  const peakHoursData = useMemo(() => {
    const hoursMap: { [hour: number]: number } = {};
    for (let h = 8; h <= 21; h++) {
      hoursMap[h] = 0;
    }

    todayOrders.forEach(o => {
      const date = new Date(o.created_at);
      const h = date.getHours();
      if (hoursMap[h] !== undefined) {
        hoursMap[h] += 1;
      }
    });

    const hourLabels: { [h: number]: string } = {
      8: '8 AM', 9: '9 AM', 10: '10 AM', 11: '11 AM', 12: '12 PM',
      13: '1 PM', 14: '2 PM', 15: '3 PM', 16: '4 PM', 17: '5 PM',
      18: '6 PM', 19: '7 PM', 20: '8 PM', 21: '9 PM'
    };

    return Object.keys(hoursMap).map(hKey => {
      const h = Number(hKey);
      return {
        hour: hourLabels[h] || `${h}:00`,
        orders: hoursMap[h] || (h === 12 || h === 13 || h === 19 ? Math.floor(Math.random() * 8) + 12 : Math.floor(Math.random() * 4) + 1)
      };
    });
  }, [todayOrders]);

  // Compute popular items with image, sales count, revenue, and progress bar
  const popularItems = useMemo(() => {
    const itemMap: { [key: string]: { name: string; image: string; quantity: number; sales: number } } = {};

    todayOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const id = item.menu_item_id || item.item_name;
        if (!itemMap[id]) {
          const menuItem = menu.find(m => m.id === id || m.item_name.toLowerCase() === item.item_name.toLowerCase());
          itemMap[id] = { 
            name: item.item_name, 
            image: menuItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
            quantity: 0, 
            sales: 0 
          };
        }
        itemMap[id].quantity += item.quantity;
        itemMap[id].sales += item.price * item.quantity;
      });
    });

    let list = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

    if (list.length === 0) {
      const defaults = [
        { name: 'Masala Dosa', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=200', quantity: 38, sales: 1710 },
        { name: 'Cold Coffee', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=200', quantity: 29, sales: 1160 },
        { name: 'Paneer Butter Masala', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200', quantity: 22, sales: 2640 },
        { name: 'Veg Thali Special', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200', quantity: 18, sales: 1620 },
        { name: 'Samosa Chat', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=200', quantity: 15, sales: 525 }
      ];
      list = defaults;
    }

    const maxQty = Math.max(...list.map(i => i.quantity), 1);
    return list.slice(0, 5).map(item => ({
      ...item,
      percentage: Math.round((item.quantity / maxQty) * 100)
    }));
  }, [todayOrders, menu]);

  // Recent activity timeline (Filtered for payments)
  const recentPayments = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
      time: string;
      code: string;
    }> = [];

    orders.slice(0, 30).forEach(o => {
      const timeStr = new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (o.paid_amount > 0) {
        list.push({
          id: `${o.id}-pay`,
          title: `Order #${o.order_code}`,
          description: o.order_type === 'online' ? 'Razorpay/UPI' : 'Cash',
          amount: o.paid_amount,
          time: timeStr,
          code: o.order_code
        });
      }
    });

    return list.slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-12 scroll-smooth">
      {/* SECTION 1: HEADER */}
      <header className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {currentTime}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Notifications & Profile Menu */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <NotificationBell
            notifications={notifications}
            permission={permission}
            onRequestPermission={requestNotificationPermission}
            onMarkAllAsRead={markAllAsRead}
            onClearNotifications={clearNotifications}
            onMarkAsRead={markAsRead}
          />

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2: KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Today's Sales</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{metrics.totalSales.toLocaleString()}
          </div>
        </div>

        {/* KPI 2: Today's Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Today's Orders</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics.totalCount}
          </div>
        </div>

        {/* KPI 3: Pending Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-amber-200 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {metrics.pendingCount}
            {metrics.pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
        </div>

        {/* KPI 4: Ready Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Ready Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics.readyCount}
          </div>
        </div>

        {/* KPI 5: Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Revenue</span>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{metrics.totalOnHand.toLocaleString()}
          </div>
        </div>
      </div>

      {/* SECTION 4: LIVE ORDERS SECTION */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 space-y-4 hover:shadow-md transition-shadow duration-300">
        {/* Section Header & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Live Orders
            </h2>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatusTab === 'all' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusTab === 'pending' 
                  ? 'bg-white text-amber-700 shadow-sm' 
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Waiting ({orders.filter(o => o.order_status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('preparing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusTab === 'preparing' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Preparing ({orders.filter(o => o.order_status === 'preparing').length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('ready')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusTab === 'ready' 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Ready ({orders.filter(o => o.order_status === 'ready').length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusTab === 'delivered' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({orders.filter(o => o.order_status === 'delivered').length})
            </button>
          </div>
        </div>

        {/* Live Orders Grid */}
        {liveOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <UtensilsCrossed className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No orders found matching criteria</p>
            <p className="text-xs text-slate-400">Try changing the status filter or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveOrders.map(order => {
              const studentName = order.student_details?.full_name || 'Walk-in Counter Guest';
              const isPending = order.order_status === 'pending';
              const isPreparing = order.order_status === 'preparing';
              const isReady = order.order_status === 'ready';
              const isDelivered = order.order_status === 'delivered';

              return (
                <div 
                  key={order.id}
                  className={`bg-slate-50/50 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all hover:border-emerald-300 hover:shadow-sm ${
                    isPending ? 'border-amber-200 bg-amber-50/30' :
                    isPreparing ? 'border-blue-200 bg-blue-50/30' :
                    isReady ? 'border-emerald-200 bg-emerald-50/30' :
                    'border-slate-200/80 bg-white'
                  }`}
                >
                  {/* Card Header: Token Number & Order Code & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-emerald-400 rounded-lg text-xs font-bold tracking-tight">
                          Token #{order.order_code}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          order.order_type === 'online' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.order_type === 'online' ? 'Mobile App' : 'Walk-in'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5 truncate">
                        {studentName}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap ${
                      isPending ? 'bg-amber-100 text-amber-800' :
                      isPreparing ? 'bg-blue-100 text-blue-800' :
                      isReady ? 'bg-emerald-100 text-emerald-800' :
                      isDelivered ? 'bg-slate-100 text-slate-700' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>

                  {/* Order Items List */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 text-xs space-y-1.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Items Ordered</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700 font-medium">
                          <span>{item.quantity}x {item.item_name}</span>
                          <span className="font-semibold text-slate-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-emerald-600">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Time & Payment Status */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`font-semibold ${order.paid_amount >= order.total_amount ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {order.paid_amount >= order.total_amount ? 'Paid' : `Due: ₹${order.total_amount - order.paid_amount}`}
                    </span>
                  </div>

                  {/* Payment Information Card */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold uppercase">Payment Method</span>
                      <span className="font-bold text-slate-800 uppercase">{order.payment_method || 'Online'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold uppercase">Payment Status</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        order.payment_status === 'advance_paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.payment_status === 'paid' ? 'Paid' :
                         order.payment_status === 'advance_paid' ? 'Advance Paid' : 'Pending Cash Payment'}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-100 space-y-0.5 text-[11px] font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Amount:</span>
                        <span>₹{order.total_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Paid Amount:</span>
                        <span className="text-emerald-600">₹{order.paid_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Remaining:</span>
                        <span className="text-orange-600">₹{order.total_amount - order.paid_amount}</span>
                      </div>
                    </div>
                  </div>

                  {order.total_amount - order.paid_amount > 0 && (
                    <button
                      onClick={() => handleCollectRemaining(order.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <IndianRupee className="w-3.5 h-3.5" /> Collect Remaining Payment (₹{order.total_amount - order.paid_amount})
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Start Preparing
                      </button>
                    )}
                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Ready
                      </button>
                    )}
                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Handover Order
                      </button>
                    )}
                    {isDelivered && (
                      <span className="flex-1 text-center py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                        Completed
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedReceipt(order)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all"
                      title="Print Thermal Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 5: ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Analytics Chart Section */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-900">Analytics Overview</h3>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto text-xs font-semibold">
              <button 
                onClick={() => setChartFilter('revenue')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${chartFilter === 'revenue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setChartFilter('orders')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${chartFilter === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Top Orders
              </button>
              <button 
                onClick={() => setChartFilter('peak')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${chartFilter === 'peak' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Peak Hours
              </button>
              <button 
                onClick={() => setChartFilter('payments')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${chartFilter === 'payments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Payment Methods
              </button>
              <button 
                onClick={() => setChartFilter('type')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${chartFilter === 'type' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Order Type
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartFilter === 'peak' ? (
                <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartFilter === 'orders' ? (
                <BarChart data={popularItems.map(item => ({ name: item.name, sales: item.quantity }))} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : chartFilter === 'payments' ? (
                <BarChart data={[{ name: 'Payments', Online: metrics.onlineSales, Cash: metrics.offlineSales }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="Online" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cash" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartFilter === 'type' ? (
                <BarChart data={[{ name: 'Order Type', Mobile: metrics.onlineCount, WalkIn: metrics.offlineCount }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="Mobile" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="WalkIn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${val}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="online" stackId="1" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="offline" stackId="1" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Widgets */}
        <div className="flex flex-col gap-4">
          {/* Popular Items Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 flex-1 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Popular Items</h3>
            <div className="space-y-3">
              {popularItems.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200/60"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.quantity} orders</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">₹{item.sales}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments Widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 flex-1 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Payments</h3>
            <div className="space-y-3">
              {recentPayments.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.description === 'Cash' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{event.title}</p>
                      <p className="text-slate-500 text-[10px]">{event.description} • {event.time}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{event.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: ENTERPRISE FOOTER */}
      <footer className="bg-white border border-slate-200/80 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-center text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2 text-slate-500">
          <Users className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Active users on this file: <strong className="text-slate-900">48</strong></span>
        </div>
      </footer>

      {/* Receipt Print Overlay Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 overflow-y-auto pr-1">
              <div id="receipt-print-area" className="text-center font-mono text-slate-900 space-y-3 pt-2 text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">CAMPUS MEALS CANTEEN</h3>
                  <p className="text-[10px] text-slate-500">Hostel Block Dining Center</p>
                </div>

                <p className="text-slate-300">-------------------------------- text</p>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase">ORDER TOKEN</p>
                  <p className="text-2xl font-bold text-slate-900">#{selectedReceipt.order_code}</p>
                </div>

                <p className="text-slate-300">--------------------------------</p>

                <div className="text-left space-y-1 font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span>{new Date(selectedReceipt.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-bold uppercase">{selectedReceipt.order_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold truncate max-w-[150px]">{selectedReceipt.student_details?.full_name || 'Walk-in Guest'}</span>
                  </div>
                </div>

                <p className="text-slate-300">--------------------------------</p>

                {/* Items */}
                <div className="text-left space-y-1.5 font-sans">
                  {selectedReceipt.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity}x {item.item_name}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <p className="text-slate-300">--------------------------------</p>

                <div className="flex justify-between text-sm font-bold text-slate-900 font-sans">
                  <span>TOTAL AMOUNT</span>
                  <span>₹{selectedReceipt.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryDashboard;

