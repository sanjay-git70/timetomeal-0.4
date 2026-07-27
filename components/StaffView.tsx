
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Order, OrderStatus, User as AppUser, MenuItem, CanteenProfile } from '../types';
import SummaryDashboard from './SummaryDashboard';
import WalkInOrderView from './WalkInOrderView';
import ReportsAnalysisView from './ReportsAnalysisView';
import TVDashboard from './TVDashboard';
import MenuCatalogView from './MenuCatalogView';
import { 
  Check, Play, Printer, Plus, Search, Trash2, 
  Package, UtensilsCrossed, Settings, 
  LogOut, LayoutDashboard,
  Edit2, ShoppingCart, ArrowLeft, RotateCw, X as XIcon, User as UserIcon,
  BarChart3, Store, Phone, Mail, Save, ToggleLeft as Toggle,
  Clock as ClockIcon, CreditCard, Monitor, AlertCircle, ChevronRight, CheckCircle2,
  Tv2, Bell, Sun, Moon, Shield, Lock, ChevronLeft, PanelLeft, PanelLeftClose,
  FileText, HelpCircle, Terminal, TrendingUp
} from 'lucide-react';

import CanteenSettingsView from './CanteenSettingsView';
import NotificationCenter from './NotificationCenter';

interface StaffViewProps {
  user: AppUser;
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateMenu: (menu: MenuItem[]) => void;
  onLogout: () => void;
}

type StaffTab = 'summary' | 'orders' | 'inventory' | 'reports' | 'profile' | 'walk-in-order' | 'tv-view';

const StaffView: React.FC<StaffViewProps> = ({ user, orders, menu, onUpdateOrders, onUpdateMenu, onLogout }) => {
  const [activeTab, setActiveTab] = useState<StaffTab>('walk-in-order');
  const [tabHistory, setTabHistory] = useState<StaffTab[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Inventory Edit State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    item_name: '',
    price: 0,
    category: 'breakfast',
    availability: true,
    is_veg: true,
    stock_offline: 100,
    stock_online: 50,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
  });

  const canteenProfile = user.profile as CanteenProfile;

  const navigateTo = useCallback((tab: StaffTab) => {
    if (tab === activeTab) return;
    setTabHistory(prev => [...prev, activeTab]);
    setActiveTab(tab);
  }, [activeTab]);

  const goBack = useCallback(() => {
    if (tabHistory.length === 0) return;
    const previous = tabHistory[tabHistory.length - 1];
    setTabHistory(prev => prev.slice(0, -1));
    setActiveTab(previous);
  }, [tabHistory]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === 'Tab') { e.preventDefault(); navigateTo('walk-in-order'); }
      if (e.key === 'Escape') { e.preventDefault(); goBack(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); setIsSidebarOpen(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, navigateTo]);

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, order_status: status } : o);
    onUpdateOrders(updated);
  };

  const toggleAvailability = (itemId: string) => {
    const updated = menu.map(m => m.id === itemId ? { ...m, availability: !m.availability } : m);
    onUpdateMenu(updated);
  };

  const deleteMenuItem = (itemId: string) => {
    if (confirm('Permanently delete this item?')) {
      onUpdateMenu(menu.filter(m => m.id !== itemId));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const createdItem: MenuItem = {
      ...newItem,
      id: Math.random().toString(36).substr(2, 9),
      canteen_id: 's1', 
      low_stock_threshold: 10
    } as MenuItem;
    onUpdateMenu([...menu, createdItem]);
    setIsAddingItem(false);
    setNewItem({ item_name: '', price: 0, category: 'breakfast', availability: true, is_veg: true, stock_offline: 100, stock_online: 50, imageUrl: newItem.imageUrl, description: '' });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.student_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const filteredInventory = useMemo(() => {
    return menu.filter(m => m.item_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [menu, searchTerm]);

  if (activeTab === 'tv-view') {
    return <TVDashboard orders={orders} onBack={goBack} />;
  }

  const navItems = [
    { id: 'summary', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'walk-in-order', icon: FileText, label: 'New Bill' },
    { id: 'orders', icon: ClockIcon, label: 'Live Queue' },
    { id: 'inventory', icon: UtensilsCrossed, label: 'Menu Catalog' },
    { id: 'reports', icon: BarChart3, label: 'Financials' },
    { id: 'profile', icon: Settings, label: 'Configuration' }
  ];

  return (
    <div key={refreshKey} className={`h-screen max-h-screen w-full overflow-hidden flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 z-[200] bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" /> {showToast}
        </div>
      )}

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Dark Emerald Fixed Sidebar with Smooth Collapsible Open/Close Mechanism */}
      <aside 
        className={`bg-[#031B15] text-slate-200 border-r border-[#0A3328] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-40 fixed top-0 bottom-0 left-0 h-screen overflow-y-auto overflow-x-hidden ${
          isSidebarOpen 
            ? 'w-64 translate-x-0 shadow-2xl' 
            : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className={`p-4 border-b border-[#0A3328]/80 flex items-center overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'gap-3' : 'justify-center p-2'}`}>
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-[#031B15] font-black flex items-center justify-center text-lg shrink-0 shadow-lg shadow-emerald-500/20">
              T
            </div>
            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 hidden lg:hidden'}`}>
              <span className="font-extrabold text-base tracking-tight text-white leading-none">TimeToMeal</span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">ADMIN PORTAL</span>
            </div>
          </div>

          {/* Main Navigation Items */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id as StaffTab);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all group cursor-pointer ${
                    isActive 
                      ? 'bg-[#009E60] text-white shadow-lg shadow-[#009E60]/25' 
                      : 'text-slate-400 hover:text-white hover:bg-[#072c22]'
                  } ${!isSidebarOpen ? 'lg:justify-center lg:px-0' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  <span className={`truncate whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 hidden lg:hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions Section */}
          <div className="px-3 pt-6">
            <p className={`px-3 text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-2 transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-h-6' : 'opacity-0 max-h-0 hidden lg:hidden'}`}>
              QUICK ACTIONS
            </p>
            <div className="space-y-1">
              {[
                { label: 'Launch TV Panel', icon: Tv2, action: () => navigateTo('tv-view') },
                { label: 'Print Test', icon: Printer, action: () => triggerToast("Printing Diagnostic Hardware Test Slip...") },
                { label: 'System Logs', icon: Terminal, action: () => triggerToast("All hardware ports & services active (COM4 115200 Baud)") },
                { label: 'Help & Support', icon: HelpCircle, action: () => triggerToast("TimeToMeal Support Hotline: +91 98765 43210") },
              ].map((actionItem, i) => {
                const ActionIcon = actionItem.icon;
                return (
                  <button 
                    key={i}
                    onClick={() => {
                      actionItem.action();
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    title={!isSidebarOpen ? actionItem.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-[#072c22] transition-all cursor-pointer ${!isSidebarOpen ? 'lg:justify-center lg:px-0' : ''}`}
                  >
                    <ActionIcon className="w-4 h-4 text-emerald-400/80 shrink-0" />
                    <span className={`truncate whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 hidden lg:hidden'}`}>
                      {actionItem.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Staff Account Info at Bottom */}
        <div className="p-3 border-t border-[#0A3328]/80">
          <div className={`p-2.5 bg-[#05261d] rounded-2xl flex items-center justify-between border border-[#0B3A2E] transition-all duration-300 ${!isSidebarOpen ? 'lg:justify-center lg:p-2' : ''}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                S
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-[130px]' : 'opacity-0 max-w-0 hidden lg:hidden'}`}>
                <p className="font-extrabold text-xs text-white truncate leading-tight">Staff Account</p>
                <p className="text-[10px] text-emerald-400/80 truncate">{user.email}</p>
              </div>
            </div>
            {isSidebarOpen && (
              <button onClick={onLogout} title="Sign Out" className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all shrink-0 cursor-pointer">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Right Content Panel */}
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        
        {/* Top Header Navigation Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Open/Close Sidebar Toggle button for mobile / desktop */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Toggle Sidebar Menu"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {tabHistory.length > 0 && (
              <button 
                onClick={goBack} 
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {activeTab === 'walk-in-order' ? 'Counter Fast Billing' : 
                 activeTab === 'summary' ? 'Dashboard' : 
                 activeTab === 'orders' ? 'Live Queue' : 
                 activeTab === 'inventory' ? 'Menu Catalog' : 
                 activeTab === 'reports' ? 'Financial Reports' : 
                 activeTab === 'profile' ? 'Canteen Settings' : 'Admin Panel'}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {canteenProfile?.canteen_name || 'Hostel Canteen'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOnlineStatus(!isOnlineStatus)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                isOnlineStatus 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' 
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
              }`}
              title="Toggle Online/Offline Status"
            >
              <span className={`w-2 h-2 rounded-full ${isOnlineStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isOnlineStatus ? 'Taking Orders' : 'Not Taking Orders'}
            </button>

            <button 
              onClick={() => setIsNotificationCenterOpen(true)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                3
              </span>
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Views */}
        <main key={activeTab} className="p-4 lg:p-5 space-y-4 flex-1 animate-in fade-in duration-200 ease-out">
          {activeTab === 'summary' && <SummaryDashboard orders={orders} onNewWalkIn={() => navigateTo('walk-in-order')} menu={menu} />}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold"
                    placeholder="Search Token ID or Name..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
                    <Package className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-xs">No active orders found in queue</p>
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-2 bg-slate-950 text-emerald-400 rounded-2xl font-black text-xl">
                            #{order.order_code}
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white">{order.student_details?.full_name || 'Walk-in Counter Guest'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                              <ClockIcon className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-2 border border-slate-100 dark:border-slate-800">
                          {order.order_items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-bold py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                              <span className="text-slate-700 dark:text-slate-300">{item.quantity}x {item.item_name}</span>
                              <span className="text-slate-400">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Billable</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white">₹{order.total_amount}</p>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            order.order_status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>

                        <div className="flex gap-2 w-full justify-end">
                          {order.order_status === 'pending' && (
                            <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                              <Play className="w-4 h-4 fill-current" /> Prepare
                            </button>
                          )}
                          {order.order_status === 'preparing' && (
                            <button onClick={() => updateOrderStatus(order.id, 'ready')} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all">
                              <Check className="w-4 h-4" /> Mark Ready
                            </button>
                          )}
                          {order.order_status === 'ready' && (
                            <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all">
                              <Package className="w-4 h-4" /> Handover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <MenuCatalogView 
              menu={menu} 
              orders={orders} 
              onUpdateMenu={onUpdateMenu} 
            />
          )}

          {activeTab === 'reports' && <ReportsAnalysisView orders={orders} menu={menu} onNewWalkIn={() => navigateTo('walk-in-order')} />}
          {activeTab === 'walk-in-order' && <WalkInOrderView user={user} menu={menu} onBack={goBack} onPlaceOrder={(o) => onUpdateOrders([o, ...orders])} />}
          {/* CANTEEN SETTINGS PAGE */}
          {activeTab === 'profile' && (
             <CanteenSettingsView user={user} onLogout={onLogout} />
          )}
        </main>
      </div>

      {/* Add New Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Add New Menu Item</h3>
                  <p className="text-xs text-slate-400 font-medium">Add a new dish to Canteen Menu Catalog</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingItem(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dish Name</label>
                <input 
                  type="text" 
                  required 
                  value={newItem.item_name || ''} 
                  onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                  placeholder="e.g. Masala Dosa, Paneer Butter Masala..." 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={newItem.price || ''} 
                    onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    placeholder="75" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</label>
                  <select 
                    value={newItem.category || 'breakfast'} 
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="beverage">Beverages</option>
                    <option value="snacks">Snacks & Fast Food</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Counter Stock</label>
                  <input 
                    type="number" 
                    value={newItem.stock_offline || 100} 
                    onChange={e => setNewItem({ ...newItem, stock_offline: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Online Stock</label>
                  <input 
                    type="number" 
                    value={newItem.stock_online || 50} 
                    onChange={e => setNewItem({ ...newItem, stock_online: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dish Image URL</label>
                <input 
                  type="url" 
                  value={newItem.imageUrl || ''} 
                  onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..." 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" 
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={newItem.is_veg !== false} 
                    onChange={e => setNewItem({ ...newItem, is_veg: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" 
                  />
                  Vegetarian Dish
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddingItem(false)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Save Item to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationCenter isOpen={isNotificationCenterOpen} onClose={() => setIsNotificationCenterOpen(false)} />
    </div>
  );
};

export default StaffView;

